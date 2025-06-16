from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from video.serializers import VideoUploadSerializer, VideoSerializer

class VideoUploadAPIView(APIView):
    """ API View to upload an MP4 file and convert it to HLS. """
    
    parser_classes = (MultiPartParser, FormParser)

    @swagger_auto_schema(
        operation_description="Upload an MP4 video file and convert it to HLS format.",
        manual_parameters=[
            openapi.Parameter(
                name="video_file",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_FILE,
                required=True,
                description="MP4 file to upload"
            )
        ],
        responses={201: VideoSerializer(), 400: "Bad Request"}
    )
    def post(self, request, *args, **kwargs):
        """ Handles video upload and HLS conversion. """
        video_file = request.FILES.get('video_file')
        if not video_file:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
        serializer = VideoUploadSerializer(data={'file': video_file})
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        video = serializer.save()  # Save video and trigger HLS conversion
        return Response(VideoSerializer(video).data, status=status.HTTP_201_CREATED)
