"""
Custom middleware for serving HLS video files with proper headers
"""
import os
from django.http import HttpResponse, Http404
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin


class HLSMiddleware(MiddlewareMixin):
    """
    Middleware to serve HLS files with proper headers to avoid caching issues
    """
    
    def process_request(self, request):
        """
        Intercept requests for HLS files and serve them with proper headers
        """
        # Only handle HLS files
        if not request.path.startswith('/media/videos/') or not (
            request.path.endswith('.m3u8') or request.path.endswith('.ts')
        ):
            return None
            
        # Remove /media/ prefix to get the file path
        file_path = request.path[7:]  # Remove '/media/' prefix
        full_path = os.path.join(settings.MEDIA_ROOT, file_path)
        
        # Check if file exists
        if not os.path.exists(full_path):
            raise Http404("File not found")
            
        try:
            # Read file content
            with open(full_path, 'rb') as f:
                content = f.read()
            
            # Determine content type
            if request.path.endswith('.m3u8'):
                content_type = 'application/vnd.apple.mpegurl'
            elif request.path.endswith('.ts'):
                content_type = 'video/mp2t'
            else:
                content_type = 'application/octet-stream'
            
            # Create response with proper headers
            response = HttpResponse(content, content_type=content_type)
            
            # Add headers to prevent caching issues
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'
            response['Access-Control-Allow-Origin'] = '*'
            response['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Range, Content-Range, Content-Length'
            response['Accept-Ranges'] = 'bytes'
            
            # Handle Range requests for video segments
            if 'HTTP_RANGE' in request.META:
                range_header = request.META['HTTP_RANGE']
                if range_header.startswith('bytes='):
                    range_spec = range_header[6:]
                    if '-' in range_spec:
                        start_str, end_str = range_spec.split('-', 1)
                        start = int(start_str) if start_str else 0
                        end = int(end_str) if end_str else len(content) - 1
                        
                        if start < len(content):
                            end = min(end, len(content) - 1)
                            partial_content = content[start:end + 1]
                            
                            response = HttpResponse(partial_content, content_type=content_type, status=206)
                            response['Content-Range'] = f'bytes {start}-{end}/{len(content)}'
                            response['Content-Length'] = str(len(partial_content))
                            response['Accept-Ranges'] = 'bytes'
                            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
                            response['Access-Control-Allow-Origin'] = '*'
            
            return response
            
        except Exception as e:
            raise Http404("Error serving file")
