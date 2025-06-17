from django.urls import path, re_path, include
from film.views import *
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'series', SeriesViewSet, basename='series')

urlpatterns = [
    path('contents/', ContentListAPIView.as_view(), name='content_list'),
    path('contents/<slug:slug>/', ContentDetailAPIView.as_view(), name='content_detail'),
    path('movies/', MovieListCreateAPIView.as_view(), name='movie_create'),
    path('series/', SeriesListCreateAPIView.as_view(), name='series_list'),
    path('movies/recently-updated/', MovieRecentlyUpdatedAPIView.as_view(), name='movie_recently_updated'),
    path('movies/similar/', SimilarMoviesAPIView.as_view(), name='similar_movies'),
    path('movies/<slug:slug>/', MovieRetrieveUpdateAPIView.as_view(), name='movie_detail'),
    path('movies/<int:movie_id>/video/', MovieVideoAPIView.as_view(), name='movie_video'),
    path('seasons/', SeasonCreateAPIView.as_view(), name='season_browse'),
    path('seasons/<int:pk>/', SeasonRetrieveUpdateAPIView.as_view(), name='season_detail'), 
    path('episodes/', EpisodeCreateAPIView.as_view(), name='episode'),
    path('episodes/<int:pk>/', EpisodeRetrieveUpdateAPIView.as_view(), name='episode_detail'),
    path('series/<int:content_id>/seasons/<int:season_number>/episodes/<int:episode_number>/video/', EpisodeVideoAPIView.as_view(), name='episode_video'),
    path('track-view/', UpdateViewDurationAPIView.as_view(), name='track_view'),
    path('track-episode-view/', TrackEpisodeViewAPIView.as_view(), name='track_episode_view'),
    path('tags/', TagListCreateAPIView.as_view(), name='tag_browse'),
    path('nations/', NationListCreateAPIView.as_view(), name='nation_browse'),
    path('genres/', GenreListCreateAPIView.as_view(), name='genre_browse'),
    path('careers/', CareerAPIView.as_view(), name='career_browse'),
    path('movies/browse/genre/', BrowseMoviesByGenreView.as_view(), name='movie_browse'),
    path('series/similar/', SimilarSeriesAPIView.as_view(), name='similar_series'),
    path('search/combined/', CombinedSearchAPIView.as_view(), name='combined_search'),
    path('', include(router.urls)),
]
