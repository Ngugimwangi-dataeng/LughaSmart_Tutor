from django.contrib import admin
from .models import Course, Enrollment, Lesson, LiveSession, PaymentTransaction


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("title", "language_name", "price_kes", "level", "tutor", "is_published")
    list_filter = ("language_name", "level", "is_published")
    prepopulated_fields = {"slug": ("title",)}
    search_fields = ("title", "language_name")


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ("title", "course", "order", "duration_minutes", "created_at")
    list_filter = ("course",)
    ordering = ("course", "order")


@admin.register(LiveSession)
class LiveSessionAdmin(admin.ModelAdmin):
    list_display = ("title", "course", "platform", "scheduled_at", "is_live_now")
    list_filter = ("platform", "is_live_now", "course")


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "course",
        "payment_status",
        "amount_paid_kes",
        "payment_channel",
        "is_ready_for_class",
        "paid_at",
    )
    list_filter = ("payment_status", "is_ready_for_class", "payment_channel")
    search_fields = ("student__username", "student__email", "paystack_reference")


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ("reference", "student", "course", "amount_kes", "channel", "status", "verified_via", "created_at")
    list_filter = ("status", "channel", "verified_via")
    search_fields = ("reference", "student__email")
    readonly_fields = ("raw_gateway_payload", "created_at", "verified_at")
