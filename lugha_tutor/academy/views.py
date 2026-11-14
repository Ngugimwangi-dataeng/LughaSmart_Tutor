import json
import mimetypes
import os
import re

from django.contrib import messages
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied
from django.http import FileResponse, Http404, HttpResponse, JsonResponse, StreamingHttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from .decorators import tutor_required
from .forms import LessonUploadForm, LiveSessionForm, StudentRegistrationForm
from .models import Course, Enrollment, Lesson, LiveSession, PaymentTransaction
from .services import (
    PaystackError,
    confirm_payment_and_enroll,
    initialize_paystack_transaction,
    verify_paystack_transaction,
    verify_paystack_webhook_signature,
)


def _user_has_course_access(user, course: Course) -> bool:
    if not user.is_authenticated:
        return False
    if user.is_staff:
        return True
    return Enrollment.objects.filter(
        student=user,
        course=course,
        payment_status=Enrollment.STATUS_COMPLETED,
    ).exists()


def home(request):
    courses = Course.objects.filter(is_published=True).select_related("tutor")
    enrolled_course_ids = set()
    if request.user.is_authenticated:
        enrolled_course_ids = set(
            Enrollment.objects.filter(
                student=request.user,
                payment_status=Enrollment.STATUS_COMPLETED,
            ).values_list("course_id", flat=True)
        )
    live_now_sessions = LiveSession.objects.filter(is_live_now=True).select_related("course")
    return render(
        request,
        "academy/home.html",
        {
            "courses": courses,
            "enrolled_course_ids": enrolled_course_ids,
            "live_now_sessions": live_now_sessions,
        },
    )


def register_student(request):
    if request.user.is_authenticated:
        return redirect("academy:home")

    if request.method == "POST":
        form = StudentRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, "Student account created. Welcome to LughaSmart!")
            return redirect("academy:home")
    else:
        form = StudentRegistrationForm()

    return render(request, "registration/register.html", {"form": form})


def course_detail(request, slug: str):
    course = get_object_or_404(Course.objects.select_related("tutor"), slug=slug, is_published=True)
    lessons = course.lessons.all()
    live_sessions = course.live_sessions.all()
    enrollment = None
    has_access = False

    if request.user.is_authenticated:
        enrollment = Enrollment.objects.filter(student=request.user, course=course).first()
        has_access = request.user.is_staff or (
            enrollment is not None and enrollment.payment_status == Enrollment.STATUS_COMPLETED
        )

    return render(
        request,
        "academy/course_detail.html",
        {
            "course": course,
            "lessons": lessons,
            "live_sessions": live_sessions,
            "enrollment": enrollment,
            "has_access": has_access,
        },
    )


@login_required
def lesson_view(request, slug: str, lesson_id: int):
    course = get_object_or_404(Course, slug=slug, is_published=True)
    lesson = get_object_or_404(Lesson, id=lesson_id, course=course)

    if not _user_has_course_access(request.user, course):
        raise PermissionDenied("Active paid enrollment is required to access lesson materials.")

    all_lessons = course.lessons.all()
    return render(
        request,
        "academy/lesson_view.html",
        {
            "course": course,
            "lesson": lesson,
            "all_lessons": all_lessons,
        },
    )


@login_required
@require_POST
def toggle_ready_for_class(request, slug: str):
    course = get_object_or_404(Course, slug=slug)
    enrollment = get_object_or_404(
        Enrollment,
        student=request.user,
        course=course,
        payment_status=Enrollment.STATUS_COMPLETED,
    )
    enrollment.is_ready_for_class = not enrollment.is_ready_for_class
    enrollment.save(update_fields=["is_ready_for_class"])
    state_label = "Ready for Class" if enrollment.is_ready_for_class else "Paused / Standby"
    messages.info(request, f"Live attendance status updated: {state_label}.")
    return redirect("academy:course_detail", slug=course.slug)


@login_required
@require_POST
def initiate_checkout(request, slug: str):
    course = get_object_or_404(Course, slug=slug, is_published=True)

    if _user_has_course_access(request.user, course):
        messages.info(request, "You already have active access to this course.")
        return redirect("academy:course_detail", slug=course.slug)

    callback_url = request.build_absolute_uri(reverse("academy:paystack_callback"))
    try:
        tx_init = initialize_paystack_transaction(
            student=request.user,
            course=course,
            callback_url=callback_url,
        )
    except PaystackError as exc:
        messages.error(request, f"Checkout could not start: {exc}")
        return redirect("academy:course_detail", slug=course.slug)

    return redirect(tx_init["authorization_url"])


@login_required
def paystack_callback(request):
    reference = request.GET.get("reference") or request.GET.get("trxref")
    if not reference:
        messages.error(request, "Missing Paystack transaction reference.")
        return redirect("academy:home")

    try:
        gateway_data = verify_paystack_transaction(reference)
        enrollment = confirm_payment_and_enroll(
            reference=reference,
            gateway_data=gateway_data,
            verified_via="callback",
        )
    except (PaystackError, PaymentTransaction.DoesNotExist) as exc:
        messages.error(request, f"Payment verification failed: {exc}")
        return redirect("academy:home")

    messages.success(
        request,
        f"Payment confirmed! You are now enrolled in {enrollment.course.title}.",
    )
    return redirect("academy:course_detail", slug=enrollment.course.slug)


@csrf_exempt
@require_POST
def paystack_webhook(request):
    signature = request.META.get("HTTP_X_PAYSTACK_SIGNATURE", "")
    if not verify_paystack_webhook_signature(request.body, signature):
        return JsonResponse({"error": "Invalid Paystack signature"}, status=401)

    try:
        event = json.loads(request.body.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return JsonResponse({"error": "Malformed JSON payload"}, status=400)

    if event.get("event") == "charge.success":
        data = event.get("data") or {}
        reference = data.get("reference")
        if reference:
            try:
                confirm_payment_and_enroll(
                    reference=reference,
                    gateway_data=data,
                    verified_via="webhook",
                )
            except (PaystackError, PaymentTransaction.DoesNotExist) as exc:
                return JsonResponse({"status": "ignored", "reason": str(exc)}, status=200)

    return JsonResponse({"status": "ok"}, status=200)


def _file_chunk_iterator(file_path: str, offset: int, length: int, chunk_size: int = 8192):
    with open(file_path, "rb") as f:
        f.seek(offset)
        remaining = length
        while remaining > 0:
            data = f.read(min(chunk_size, remaining))
            if not data:
                break
            remaining -= len(data)
            yield data


@login_required
def serve_protected_media(request, lesson_id: int, asset_type: str):
    """
    Streams piracy-protected audio (MP3/WAV) and PDF notes from private_media/
    only after verifying an active Enrollment in PostgreSQL (or staff/tutor role).
    Supports HTTP Range requests for HTML5 audio seeking without exposing public URLs.
    """
    lesson = get_object_or_404(Lesson.objects.select_related("course"), id=lesson_id)

    if not _user_has_course_access(request.user, lesson.course):
        raise PermissionDenied("403 Forbidden: Payment and enrollment required to stream this resource.")

    if asset_type == "audio":
        field = lesson.audio_file
    elif asset_type == "pdf":
        field = lesson.pdf_notes
    else:
        raise Http404("Unsupported protected asset type.")

    if not field or not field.name:
        raise Http404("Requested lesson asset has not been uploaded yet.")

    file_path = field.storage.path(field.name)
    if not os.path.isfile(file_path):
        raise Http404("Media file not found on storage.")

    file_size = os.path.getsize(file_path)
    content_type, _ = mimetypes.guess_type(file_path)
    content_type = content_type or (
        "application/pdf" if asset_type == "pdf" else "audio/mpeg"
    )
    filename = os.path.basename(file_path)

    range_header = request.META.get("HTTP_RANGE", "").strip()
    range_match = re.match(r"bytes=(\d+)-(\d*)", range_header)

    if range_match:
        start = int(range_match.group(1))
        end = int(range_match.group(2)) if range_match.group(2) else file_size - 1
        end = min(end, file_size - 1)
        if start >= file_size or start > end:
            return HttpResponse(status=416)
        length = (end - start) + 1
        response = StreamingHttpResponse(
            _file_chunk_iterator(file_path, start, length),
            status=206,
            content_type=content_type,
        )
        response["Content-Range"] = f"bytes {start}-{end}/{file_size}"
        response["Content-Length"] = str(length)
    else:
        response = FileResponse(open(file_path, "rb"), content_type=content_type)
        response["Content-Length"] = str(file_size)

    response["Accept-Ranges"] = "bytes"
    response["Content-Disposition"] = f'inline; filename="{filename}"'
    response["Cache-Control"] = "private, no-store, max-age=0"
    response["X-Content-Type-Options"] = "nosniff"
    return response


@tutor_required
def tutor_dashboard(request):
    """
    Protected Tutor Portal. Non-staff students receive HTTP 403 Forbidden.
    Allows uploading catch-up audio/PDF lessons, scheduling live classes,
    toggling Live Now switches, and inspecting paid/ready students.
    """
    lesson_form = LessonUploadForm(prefix="lesson")
    session_form = LiveSessionForm(prefix="session")

    if request.method == "POST":
        action = request.POST.get("action")
        if action == "upload_lesson":
            lesson_form = LessonUploadForm(request.POST, request.FILES, prefix="lesson")
            if lesson_form.is_valid():
                lesson = lesson_form.save()
                messages.success(request, f"Lesson '{lesson.title}' uploaded to private storage.")
                return redirect("academy:tutor_dashboard")
        elif action == "create_session":
            session_form = LiveSessionForm(request.POST, prefix="session")
            if session_form.is_valid():
                session = session_form.save()
                messages.success(request, f"Live session '{session.title}' scheduled.")
                return redirect("academy:tutor_dashboard")

    courses = Course.objects.select_related("tutor").prefetch_related("lessons", "live_sessions")
    sessions = LiveSession.objects.select_related("course").all()
    active_enrollments = (
        Enrollment.objects.filter(payment_status=Enrollment.STATUS_COMPLETED)
        .select_related("student", "course")
        .order_by("-is_ready_for_class", "-paid_at")
    )

    return render(
        request,
        "academy/tutor_dashboard.html",
        {
            "lesson_form": lesson_form,
            "session_form": session_form,
            "courses": courses,
            "sessions": sessions,
            "active_enrollments": active_enrollments,
        },
    )


@tutor_required
@require_POST
def toggle_live_session(request, session_id: int):
    session = get_object_or_404(LiveSession, id=session_id)
    session.is_live_now = not session.is_live_now
    session.save(update_fields=["is_live_now", "updated_at"])
    status_text = "LIVE NOW" if session.is_live_now else "OFFLINE / SCHEDULED"
    messages.success(request, f"'{session.title}' is now {status_text}.")
    return redirect("academy:tutor_dashboard")
