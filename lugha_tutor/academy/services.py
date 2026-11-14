import hashlib
import hmac
import uuid
from decimal import Decimal

import requests
from django.conf import settings
from django.db import transaction
from django.utils import timezone

from .models import Course, Enrollment, PaymentTransaction

PAYSTACK_BASE_URL = "https://api.paystack.co"


class PaystackError(Exception):
    """Raised when Paystack initialization or verification fails."""


def generate_payment_reference(course_id: int, student_id: int) -> str:
    return f"LS-{course_id}-{student_id}-{uuid.uuid4().hex[:10].upper()}"


def verify_paystack_webhook_signature(raw_body: bytes, signature_header: str) -> bool:
    """
    Cryptographically validates the x-paystack-signature header using HMAC-SHA512
    against PAYSTACK_SECRET_KEY.
    """
    secret = (settings.PAYSTACK_SECRET_KEY or "").encode("utf-8")
    if not secret or not signature_header:
        return False
    expected = hmac.new(secret, raw_body, hashlib.sha512).hexdigest()
    return hmac.compare_digest(expected, signature_header.strip())


def initialize_paystack_transaction(
    student, course: Course, callback_url: str
) -> dict:
    """
    Initializes a Paystack checkout session in KES supporting both
    Visa/Mastercard ('card') and M-Pesa ('mobile_money').
    Creates a pending PaymentTransaction record before redirecting to Paystack.
    """
    if not settings.PAYSTACK_SECRET_KEY:
        raise PaystackError("PAYSTACK_SECRET_KEY is not configured in environment.")
    if not student.email:
        raise PaystackError("Student account must have an email address for checkout.")

    reference = generate_payment_reference(course.id, student.id)
    amount_subunits = int((course.price_kes * Decimal("100")).quantize(Decimal("1")))

    PaymentTransaction.objects.create(
        reference=reference,
        student=student,
        course=course,
        amount_kes=course.price_kes,
        status="initialized",
    )

    payload = {
        "email": student.email,
        "amount": amount_subunits,
        "currency": "KES",
        "reference": reference,
        "callback_url": callback_url,
        "channels": ["card", "mobile_money"],
        "metadata": {
            "student_id": student.id,
            "course_id": course.id,
            "course_title": course.title,
        },
    }
    headers = {
        "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
        "Content-Type": "application/json",
    }

    try:
        resp = requests.post(
            f"{PAYSTACK_BASE_URL}/transaction/initialize",
            json=payload,
            headers=headers,
            timeout=15,
        )
        data = resp.json()
    except (requests.RequestException, ValueError) as exc:
        raise PaystackError(f"Unable to reach Paystack gateway: {exc}") from exc

    if not resp.ok or not data.get("status"):
        raise PaystackError(data.get("message", "Paystack initialization rejected."))

    return {
        "reference": reference,
        "authorization_url": data["data"]["authorization_url"],
        "access_code": data["data"].get("access_code", ""),
    }


def verify_paystack_transaction(reference: str) -> dict:
    """Queries Paystack /transaction/verify/<reference> server-side."""
    if not settings.PAYSTACK_SECRET_KEY:
        raise PaystackError("PAYSTACK_SECRET_KEY is not configured.")

    headers = {
        "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
    }
    try:
        resp = requests.get(
            f"{PAYSTACK_BASE_URL}/transaction/verify/{reference}",
            headers=headers,
            timeout=15,
        )
        data = resp.json()
    except (requests.RequestException, ValueError) as exc:
        raise PaystackError(f"Paystack verification request failed: {exc}") from exc

    if not resp.ok or not data.get("status"):
        raise PaystackError(data.get("message", "Paystack verification failed."))

    return data["data"]


@transaction.atomic
def confirm_payment_and_enroll(
    reference: str,
    gateway_data: dict,
    verified_via: str,
) -> Enrollment:
    """
    Atomically locks the PaymentTransaction row, validates currency ('KES'),
    amount, and gateway status ('success'), then grants Enrollment access.
    Safe against duplicate callback + webhook races.
    """
    tx = (
        PaymentTransaction.objects.select_for_update()
        .select_related("student", "course")
        .get(reference=reference)
    )

    gateway_status = gateway_data.get("status")
    currency = (gateway_data.get("currency") or "").upper()
    paid_subunits = int(gateway_data.get("amount") or 0)
    expected_subunits = int((tx.course.price_kes * Decimal("100")).quantize(Decimal("1")))
    channel = gateway_data.get("channel", "")

    if gateway_status != "success":
        tx.status = gateway_status or "failed"
        tx.raw_gateway_payload = gateway_data
        tx.save(update_fields=["status", "raw_gateway_payload"])
        raise PaystackError(f"Transaction {reference} status is '{gateway_status}'.")

    if currency != "KES" or paid_subunits < expected_subunits:
        tx.status = "amount_mismatch"
        tx.raw_gateway_payload = gateway_data
        tx.save(update_fields=["status", "raw_gateway_payload"])
        raise PaystackError("Paid amount or currency does not match course price.")

    now = timezone.now()
    tx.status = "success"
    tx.channel = channel
    tx.verified_via = tx.verified_via or verified_via
    tx.verified_at = tx.verified_at or now
    tx.raw_gateway_payload = gateway_data
    tx.save()

    enrollment, _ = Enrollment.objects.select_for_update().get_or_create(
        student=tx.student,
        course=tx.course,
        defaults={
            "payment_status": Enrollment.STATUS_COMPLETED,
            "paystack_reference": tx.reference,
            "amount_paid_kes": Decimal(paid_subunits) / Decimal("100"),
            "payment_channel": channel,
            "paid_at": now,
        },
    )

    if enrollment.payment_status != Enrollment.STATUS_COMPLETED:
        enrollment.payment_status = Enrollment.STATUS_COMPLETED
        enrollment.paystack_reference = tx.reference
        enrollment.amount_paid_kes = Decimal(paid_subunits) / Decimal("100")
        enrollment.payment_channel = channel
        enrollment.paid_at = now
        enrollment.save()

    return enrollment
