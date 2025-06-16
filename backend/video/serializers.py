from rest_framework import serializers
from .models import Video
import os
from django.conf import settings
from video.utils import generate_hls

class VideoUploadSerializer(serializers.ModelSerializer):
    file = serializers.FileField(write_only=True)  # Nhận file video từ request

    class Meta:
        model = Video
        fields = ['file', 'original_video_path', 'hls_path', 'id']
    
    def create(self, validated_data):
        video_file = validated_data.pop('file')  # Lấy file từ request
        video_instance = Video.objects.create(original_video_path="")  # Tạo instance trước để có ID

        # Create video storage directory: /media/videos/video_{instance_id}/
        upload_dir = os.path.join(settings.MEDIA_ROOT, f'videos/video_{video_instance.id}')
        os.makedirs(upload_dir, exist_ok=True)

        # File name format: /media/videos/video_{instance_id}/file_name.mp4
        file_path = os.path.join(upload_dir, video_file.name)

        # Lưu file vào đường dẫn
        with open(file_path, 'wb+') as destination:
            for chunk in video_file.chunks():
                destination.write(chunk)

        # Cập nhật đường dẫn file vào database
        video_instance.original_video_path = file_path.replace(f"{settings.MEDIA_ROOT}/", settings.MEDIA_URL)
        generate_hls(file_path, video_instance)
        video_instance.hls_path = f"{settings.MEDIA_URL}videos/video_{video_instance.id}/index.m3u8"
        video_instance.save()

        return video_instance

class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ['id', 'original_video_path', 'hls_path']

