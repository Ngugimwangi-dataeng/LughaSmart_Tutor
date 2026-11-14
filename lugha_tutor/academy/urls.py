from django.contrib.auth import views as auth_views
from django.urls import path

from . import views

app_name = "academy"

urlpatterns = [
    # Public & Student Authentication (registration creates students only)
    path("", views.home, name="home"),
    path("accounts/login/", auth_views.LoginView.as_view(template_name="registration/login.html"), name="login"),
    path("accounts/logout/", auth_views.LogoutView.as_view(), name="logout"),
    path("accounts/register/", views.register_student, name="register"),

    # Course Catalog, Enrollment & Lesson Access
    path("courses/<slug:slug>/", views.course_detail, name="course_detail"),
    path("courses/<slug:slug>/lessons/<int:lesson_id>/", views.lesson_view, name="lesson_view"),
    path("courses/<slug:slug>/ready-toggle/", views.toggle_ready_for_class, name="toggle_ready_for_class"),

    # Paystack Payment Gate (M-Pesa + Visa in KES)
    path("courses/<slug:slug>/checkout/", views.initiate_checkout, name="initiate_checkout"),
    path("payments/paystack/callback/", views.paystack_callback, name="paystack_callback"),
    path("payments/paystack/webhook/", views.paystack_webhook, name="paystack_webhook"),

    # Piracy-Protected Media Streaming (Authenticated + Enrolled/Staff check)
    path("media/protected/<int:lesson_id>/<str:asset_type>/", views.serve_protected_media, name="serve_protected_media"),

    # Strict Tutor Portal (is_staff=True required -> 403 Forbidden for students)
    path("tutor/dashboard/", views.tutor_dashboard, name="tutor_dashboard"),
    path("tutor/sessions/<int:session_id>/toggle-live/", views.toggle_live_session, name="toggle_live_session"),
]
