import os
from django.http import FileResponse, Http404
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin

class HLSStreamingMiddleware(MiddlewareMixin):
    """
    Middleware to handle HLS streaming with proper headers
    """
    
    def process_response(self, request, response):
        # Check if this is an HLS file request
        if request.path.startswith('/media/videos/') and (
            request.path.endswith('.m3u8') or 
            request.path.endswith('.ts')
        ):
            # Add HLS-specific headers
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'
            response['Access-Control-Allow-Origin'] = '*'
            response['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Range, Content-Range, Content-Type'
            response['Access-Control-Expose-Headers'] = 'Content-Range, Content-Length, Accept-Ranges'
            response['Accept-Ranges'] = 'bytes'
            
            # Set proper MIME types
            if request.path.endswith('.m3u8'):
                response['Content-Type'] = 'application/vnd.apple.mpegurl'
            elif request.path.endswith('.ts'):
                response['Content-Type'] = 'video/mp2t'
            
            # Add debugging headers
            response['X-HLS-Debug'] = 'Django-HLS-Middleware'
            response['X-Served-By'] = 'ViberFilm-Backend'
            
        return response
