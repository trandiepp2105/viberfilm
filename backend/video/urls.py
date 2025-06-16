from django.urls import path
from video.views import VideoUploadAPIView

urlpatterns = [
    path('upload/', VideoUploadAPIView.as_view(), name='upload'),
]