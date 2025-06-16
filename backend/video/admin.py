from django.contrib import admin
from video.models import Video

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ('original_video_path', 'hls_path', 'id')  # Hiển thị các trường này trong danh sách admin

