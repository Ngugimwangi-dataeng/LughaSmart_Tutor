from functools import wraps
from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied


def tutor_required(view_func):
    """
    Strictly blocks non-staff users (students: is_staff=False) from accessing
    any Tutor Portal route, returning HTTP 403 Forbidden instead of redirecting.
    """

    @login_required
    @wraps(view_func)
    def _wrapped(request, *args, **kwargs):
        if not request.user.is_staff:
            raise PermissionDenied(
                "403 Forbidden: Tutor privileges (is_staff=True) required."
            )
        return view_func(request, *args, **kwargs)

    return _wrapped
