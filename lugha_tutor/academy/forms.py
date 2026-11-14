from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm

from .models import Lesson, LiveSession

User = get_user_model()


class StudentRegistrationForm(UserCreationForm):
    """
    Public registration form strictly locked to student accounts (is_staff=False).
    """

    first_name = forms.CharField(max_length=80, required=True)
    last_name = forms.CharField(max_length=80, required=True)
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ("username", "first_name", "last_name", "email", "password1", "password2")

    def clean_email(self):
        email = self.cleaned_data["email"].strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise forms.ValidationError("An account with this email already exists.")
        return email

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data["email"]
        user.first_name = self.cleaned_data["first_name"].strip()
        user.last_name = self.cleaned_data["last_name"].strip()
        # Strict role enforcement: registration can NEVER create staff/tutor/superuser
        user.is_staff = False
        user.is_superuser = False
        if commit:
            user.save()
        return user


class LessonUploadForm(forms.ModelForm):
    class Meta:
        model = Lesson
        fields = ("course", "order", "title", "summary", "duration_minutes", "audio_file", "pdf_notes")
        widgets = {
            "summary": forms.Textarea(attrs={"rows": 3}),
        }


class LiveSessionForm(forms.ModelForm):
    class Meta:
        model = LiveSession
        fields = ("course", "title", "platform", "meeting_url", "scheduled_at", "is_live_now", "notes")
        widgets = {
            "scheduled_at": forms.DateTimeInput(attrs={"type": "datetime-local"}),
            "notes": forms.Textarea(attrs={"rows": 2}),
        }
