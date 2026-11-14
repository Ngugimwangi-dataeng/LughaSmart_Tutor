from decimal import Decimal
from django.conf import settings
from django.core.validators import FileExtensionValidator
from django.db import models

from .storage import PrivateMediaStorage

private_storage = PrivateMediaStorage()


def lesson_audio_upload_path(instance, filename):
    return f"courses/{instance.course_id}/lessons/audio/{filename}"


def lesson_pdf_upload_path(instance, filename):
    return f"courses/{instance.course_id}/lessons/notes/{filename}"


class Course(models.Model):
    LEVEL_CHOICES = [
        ("beginner", "Beginner"),
        ("intermediate", "Intermediate"),
        ("advanced", "Advanced"),
        ("field_guide", "Cultural & Field Guide"),
    ]

    title = models.CharField(max_length=160)
    slug = models.SlugField(max_length=180, unique=True)
    language_name = models.CharField(
        max_length=80,
        help_text="e.g., Kiswahili, Gĩkũyũ, Dholuo, Maa (Maasai), Kalenjin, Kikamba",
    )
    description = models.TextField()
    price_kes = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("4500.00"),
    )
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default="beginner")
    tutor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="taught_courses",
        limit_choices_to={"is_staff": True},
    )
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["language_name", "title"]

    def __str__(self):
        return f"{self.language_name} — {self.title}"


class Lesson(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="lessons",
    )
    order = models.PositiveIntegerField(default=1)
    title = models.CharField(max_length=180)
    summary = models.TextField(blank=True)
    audio_file = models.FileField(
        storage=private_storage,
        upload_to=lesson_audio_upload_path,
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=["mp3", "wav", "ogg", "m4a"])],
        help_text="MP3/WAV pronunciation & missed-class catch-up audio (stored privately).",
    )
    pdf_notes = models.FileField(
        storage=private_storage,
        upload_to=lesson_pdf_upload_path,
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=["pdf"])],
        help_text="PDF lesson notes & vocabulary sheet (stored privately).",
    )
    duration_minutes = models.PositiveIntegerField(default=30)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "id"]
        unique_together = [("course", "order")]

    def __str__(self):
        return f"{self.course.language_name} · Lesson {self.order}: {self.title}"


class LiveSession(models.Model):
    PLATFORM_CHOICES = [
        ("zoom", "Zoom"),
        ("meet", "Google Meet"),
        ("jitsi", "Jitsi Meet"),
    ]

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="live_sessions",
    )
    title = models.CharField(max_length=180)
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES, default="jitsi")
    meeting_url = models.URLField(max_length=500)
    scheduled_at = models.DateTimeField()
    is_live_now = models.BooleanField(
        default=False,
        help_text="One-click Live Now switch toggled by the Tutor.",
    )
    notes = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_live_now", "scheduled_at"]

    def __str__(self):
        status = "LIVE NOW" if self.is_live_now else self.scheduled_at.strftime("%Y-%m-%d %H:%M")
        return f"{self.course.title} · {self.title} ({status})"


class Enrollment(models.Model):
    STATUS_PENDING = "pending"
    STATUS_COMPLETED = "completed"
    STATUS_FAILED = "failed"

    PAYMENT_STATUS_CHOICES = [
        (STATUS_PENDING, "Pending Payment"),
        (STATUS_COMPLETED, "Completed (Active)"),
        (STATUS_FAILED, "Failed / Revoked"),
    ]

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="enrollments",
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="enrollments",
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default=STATUS_PENDING,
        db_index=True,
    )
    paystack_reference = models.CharField(max_length=120, blank=True, db_index=True)
    amount_paid_kes = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    payment_channel = models.CharField(max_length=40, blank=True)
    is_ready_for_class = models.BooleanField(default=False, db_index=True)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = [("student", "course")]
        indexes = [
            models.Index(fields=["student", "payment_status"]),
            models.Index(fields=["course", "payment_status", "is_ready_for_class"]),
        ]

    @property
    def is_active(self):
        return self.payment_status == self.STATUS_COMPLETED

    def __str__(self):
        return f"{self.student.username} -> {self.course.title} [{self.payment_status}]"


class PaymentTransaction(models.Model):
    reference = models.CharField(max_length=120, unique=True, db_index=True)
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="payment_transactions",
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="payment_transactions",
    )
    amount_kes = models.DecimalField(max_digits=10, decimal_places=2)
    channel = models.CharField(max_length=40, blank=True)
    status = models.CharField(max_length=30, default="initialized", db_index=True)
    verified_via = models.CharField(
        max_length=30,
        blank=True,
        help_text="callback | webhook",
    )
    raw_gateway_payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.reference} ({self.status} - KES {self.amount_kes})"
