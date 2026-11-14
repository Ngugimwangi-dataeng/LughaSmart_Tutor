from django.conf import settings
from django.core.files.storage import FileSystemStorage


class PrivateMediaStorage(FileSystemStorage):
    """
    Stores piracy-protected audio (MP3/WAV) and PDF notes inside PRIVATE_MEDIA_ROOT
    outside static/ and public media directories.
    Setting base_url=None ensures Django never generates public direct file URLs.
    """

    def __init__(self, *args, **kwargs):
        kwargs.setdefault("location", settings.PRIVATE_MEDIA_ROOT)
        kwargs.setdefault("base_url", None)
        super().__init__(*args, **kwargs)
