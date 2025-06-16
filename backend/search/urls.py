from django.urls import path
from search.views import search_movies

urlpatterns = [
    path('movies/', search_movies, name='search_movies'),
]
