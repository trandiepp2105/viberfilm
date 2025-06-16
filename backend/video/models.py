from django.db import models
import os
from video.utils import video_upload_path
from django.conf import settings
import shutil
class Video(models.Model):
    original_video_path = models.CharField(max_length=255, blank=True, help_text="Path to original video file")
    hls_path = models.CharField(max_length=255, blank=True, help_text="Path to file M3U8")

    def __str__(self):
        return os.path.basename(self.original_video_path)

    def delete(self, *args, **kwargs):
        original_video_path = self.original_video_path
        video_folder = os.path.dirname(original_video_path)
        video_folder = video_folder.lstrip("/")
        video_folder = os.path.join(settings.BASE_DIR, video_folder)
        if os.path.exists(video_folder) and os.path.isdir(video_folder):
            shutil.rmtree(video_folder)
        super().delete(*args, **kwargs)