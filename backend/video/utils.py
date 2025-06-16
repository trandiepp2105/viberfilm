import os
import subprocess
from django.conf import settings

def video_upload_path(instance, filename):
    """
    Generates a dynamic file path for uploading videos.

    Parameters:
    - instance (Video): The instance of the Video model that the file belongs to.
    - filename (str): The original name of the uploaded file.

    Returns:
    - str: The file path in the format 'videos/video_{id}/{filename}', 
           where {id} is the ID of the Video instance.

    Note:
    - This function assumes that the instance has already been saved to the database 
      and has a valid ID.
    - If the instance has not been saved yet, the ID will be None, which may cause issues.
    """
    return f"videos/video_{instance.id}/{filename}"

def generate_hls(video_path, video_instance):
    """
    Convert an uploaded MP4 video into HLS format (.m3u8 + .ts segments).

    Parameters:
    - video_instance (Video): The Video model instance.

    Returns:
    - str: The path to the generated HLS playlist file (m3u8).
    """
    output_dir = os.path.join(settings.MEDIA_ROOT, "videos", f"video_{video_instance.id}", "hls")

    os.makedirs(output_dir, exist_ok=True)  # Create directory if not exists

    output_m3u8 = os.path.join(output_dir, "index.m3u8")  # HLS playlist file

    # FFmpeg command to convert MP4 to HLS
    ffmpeg_cmd = [
        "ffmpeg", "-i", video_path,  # Input file
        "-codec:", "copy",  # No re-encoding, just split
        "-start_number", "0",
        "-hls_time", "10",  # Each segment is 10s long
        "-hls_list_size", "0",
        "-f", "hls", output_m3u8  # Output as .m3u8 playlist
    ]

    subprocess.run(ffmpeg_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)  # Run command

    return f"{settings.MEDIA_URL}videos/video_{video_instance.id}/index.m3u8"  # Return HLS path