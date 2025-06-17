from django.urls import include, path
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path('user/', include('user.urls')),  # Keep user endpoints for admin
    # path('comment/', include('comment.urls')),  # Removed comment endpoints
    path('film/', include('film.urls')),
    path('video/', include('video.urls')),
    # path('search/', include('search.urls')),  # Temporarily disabled
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),  # Keep token endpoint for admin
]