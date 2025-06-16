from django.shortcuts import render
from django.core.cache import cache
from django.db.models import Q, Count, Prefetch
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from film.models import *
from drf_yasg.utils import swagger_auto_schema
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.decorators import action
from drf_yasg import openapi
from video.serializers import VideoUploadSerializer, VideoSerializer
from film.serializers import (
    GenreSerializer, TagSerializer, NationSerializer, PersonSerializer,
    ContentSerializer, MovieSerializer, SeriesSerializer, SeasonSerializer,
    EpisodeSerializer, ContentGenreSerializer, ContentTagSerializer,
    ContentNationSerializer, ContentPersonSerializer, CreateMovieSerializer,
    MovieGeneralInfoSerializer, MovieDetailSerializer, SeriesDetailSerializer,
    CreateSeasonSerializer, SeasonGeneralInfoSerializer, SeasonDetailSerializer, 
    CreateEpisodeSerializer, CareerPersonSerializer, ContentDetailSerializer,
    UpdateViewDurationSerializer
)
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import MultiPartParser, FormParser
import os
import shutil
from django.conf import settings
from film.utils import save_img, ensure_list_int
from film.enums import CareerEnum
import json
from django.db import transaction
from django.db.models import Q
from collections import defaultdict
from core.permissions import IsAdminUser, IsStaffUser  # Import admin permissions back
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
# from search.search_indexes import MovieIndex, SeasonIndex
from django.conf import settings
from django.db.models import Q
from collections import defaultdict

class TagListCreateAPIView(APIView):
    def get_permissions(self):
        """
        Public read access, admin-only write access
        """
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminUser(), IsAuthenticated()]
        
    @swagger_auto_schema(
        operation_summary="Retrieve all tags",
        operation_description="Fetches a list of all available tags. Public access.",
        responses={
            200: openapi.Response(
                description="List of tags", 
                schema=TagSerializer(many=True)
            ),
        }
    )
    def get(self, request):
        tags = Tag.objects.all()
        serializer = TagSerializer(tags, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        operation_summary="Create a new tag (Admin Only)",
        operation_description="Creates a new tag. Requires an admin account to be logged in. If the tag already exists, an error will be returned.",
        request_body=TagSerializer,
        responses={
            201: openapi.Response(
                description="Tag created successfully",
                schema=TagSerializer()
            ),
            400: openapi.Response(
                description="Bad request - validation error",
                examples={"application/json": {"error": "Tag already exists."}}
            ),
            403: openapi.Response(description="Permission denied"),
        }
    )
    def post(self, request):
        serializer = TagSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                raise ValidationError({"error": str(e)})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GenreListCreateAPIView(APIView):
    permission_classes = [AllowAny]
    @swagger_auto_schema(
        operation_summary="Retrieve all genres (Admin Only)",
        operation_description="Fetches a list of all available genres. Requires an admin account to be logged in.",
        responses={
            200: openapi.Response(
                description="List of genres",
                schema=GenreSerializer(many=True)
            ),
            403: openapi.Response(description="Permission denied"),
        }
    )
    def get(self, request):
        genres = Genre.objects.all()
        serializer = GenreSerializer(genres, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        operation_summary="Create a new genre (Admin Only)",
        operation_description="Creates a new genre. Requires an admin account to be logged in. If the genre already exists, an error will be returned.",
        request_body=GenreSerializer,
        responses={
            201: openapi.Response(
                description="Genre created successfully",
                schema=GenreSerializer()
            ),
            400: openapi.Response(
                description="Bad request - validation error",
                examples={"application/json": {"error": "Genre already exists."}}
            ),
            403: openapi.Response(description="Permission denied"),
        }
    )
    def post(self, request):
        serializer = GenreSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                raise ValidationError({"error": str(e)})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class NationListCreateAPIView(APIView):
    permission_classes = [AllowAny]
    @swagger_auto_schema(
        operation_summary="Retrieve all nations (Admin Only)",
        operation_description="Fetches a list of all available nations. Requires an admin account to be logged in.",
        responses={
            200: openapi.Response(
                description="List of nations",
                schema=NationSerializer(many=True)
            ),
            403: openapi.Response(description="Permission denied"),
        }
    )
    def get(self, request):
        nations = Nation.objects.all()
        serializer = NationSerializer(nations, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        operation_summary="Create a new nation (Admin Only)",
        operation_description="Creates a new nation. Requires an admin account to be logged in. If the nation already exists, an error will be returned.",
        request_body=NationSerializer,
        responses={
            201: openapi.Response(
                description="Nation created successfully",
                schema=NationSerializer()
            ),
            400: openapi.Response(
                description="Bad request - validation error",
                examples={"application/json": {"error": "Nation already exists."}}
            ),
            403: openapi.Response(description="Permission denied"),
        }
    )
    def post(self, request):
        serializer = NationSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                raise ValidationError({"error": str(e)})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MovieListCreateAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    
    def get_permissions(self):
        """
        Public read access, admin-only write access
        """
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminUser(), IsAuthenticated()]

    @swagger_auto_schema(
        operation_summary="Create a new movie",
        operation_description="Create a new movie with video file and banner image. Content-Type: multipart/form-data",
        manual_parameters=[
            openapi.Parameter(
                name="video_file",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_FILE,
                required=True,
                description="MP4 file to upload"
            ),
            openapi.Parameter(
                name="banner_img",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_FILE,
                required=True,
                description="Banner image for the movie"
            ),
            openapi.Parameter(
                name="movie_name",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                required=True,
                description="Name of the movie"
            ),
            openapi.Parameter(
                name="age_rank",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                required=True,
                description="Age rank"
            ),
            openapi.Parameter(
                name="release_date",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                format="date",
                required=True,
                description="Release date (YYYY-MM-DD)"
            ),
            openapi.Parameter(
                name="intro_duration",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_NUMBER,
                format="float",
                required=False,
                description="Duration of the intro"
            ),
            openapi.Parameter(
                name="start_intro_time",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_NUMBER,
                format="float",
                required=False,
                description="Start time of the intro"
            ),
            openapi.Parameter(
                name="description",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                required=True,
                description="Movie description"
            ),

            openapi.Parameter(
                name="status",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                enum=["on_going", "completed"],
                required=True,
                description="Movie status"
            ),
            openapi.Parameter(
                name="genres",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                # items=openapi.Items(type=openapi.TYPE_INTEGER),
                required=True,
                description="List of genre IDs (comma-separated) (e.g., [1, 2, 3])"

            ),
            openapi.Parameter(
                name="nations",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                required=True,
                description="List of nation IDs (comma-separated) (e.g., [1, 2, 3])"
            ),
            openapi.Parameter(
                name="tags",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                required=True,
                description="List of tag IDs (comma-separated) (e.g., [1, 2, 3])"
            ),
            openapi.Parameter(
                name="careers",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                required=True,
                description=(
                    "List of careers for the movie. Each career should contain a valid `career_name` and a list of `people`.<br>"
                    f"**Valid values for `career_name`**: `{[e.value for e in CareerEnum]}`.<br>"
                    "Example:<br>"
                    "```json\n"
                    "[\n"
                    "  {\"career_name\": \"Actor\", \"people\": [{\"id\": 1, \"name\": \"John Doe\"}]},\n"
                    "  {\"career_name\": \"Director\", \"people\": [{\"id\": 2, \"name\": \"Jane Smith\"}]}\n"
                    "]\n"
                    "```"
                )
            ),
        
        ],
        # consumes=["multipart/form-data"],
        responses={201: MovieGeneralInfoSerializer(), 400: "Bad Request", 403: openapi.Response(description="Permission denied"),}
    )
    def post(self, request, *args, **kwargs):
        banner_img_path = None  # Lưu đường dẫn ảnh để rollback nếu lỗi
        video_instance = None  # Lưu instance video để xóa nếu lỗi

        try:
            with transaction.atomic():  # Bắt đầu transaction
                banner_img = request.FILES.get('banner_img')
                if banner_img:
                    banner_img_path = save_img(banner_img)
                    request.data['banner_img_url'] = banner_img_path
                else:
                    request.data['banner_img_url'] = os.path.join(settings.MEDIA_URL, 'banner/default.jpg')

                video_file = request.FILES.get('video_file')
                if not video_file:
                    return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
                
                video_serializer = VideoUploadSerializer(data={'file': video_file})
                if not video_serializer.is_valid():
                    return Response(video_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
                video_instance = video_serializer.save()
                request.data['video_id'] = video_instance.id

                try:
                    request.data['genres'] = ensure_list_int(request.data.get('genres', '[]'))
                    request.data['nations'] = ensure_list_int(request.data.get('nations', '[]'))
                    request.data['tags'] = ensure_list_int(request.data.get('tags', '[]'))
                    request.data['careers'] = json.loads(request.data.get('careers'))
                except json.JSONDecodeError as e:
                    raise ValueError(f"Invalid JSON format: {str(e)}")
                movie_data = {key: value for key, value in request.data.items()}

                # Giữ lại các trường có giá trị hợp lệ
                filtered_movie_data = {k: v for k, v in movie_data.items() if v not in [None, "", []]}

                movie_serializer = CreateMovieSerializer(data=filtered_movie_data)
                if movie_serializer.is_valid():
                    movie_serializer.save()
                    # Thêm vào Elasticsearch
                    # try:
                    #     add = MovieIndex(
                    #         movie_name=movie_serializer.data['movie_name'],
                    #         movie_id=movie_serializer.data['id']
                    #     )
                    #     add.save()
                    # except Exception as e:
                    return Response(movie_serializer.data, status=status.HTTP_201_CREATED)
                
                raise ValueError(movie_serializer.errors)

        except Exception as e:
            banner_img_path = banner_img_path.lstrip("/")
            banner_img_path = os.path.join(settings.BASE_DIR, banner_img_path)
            if banner_img_path and os.path.exists(banner_img_path):

                os.remove(banner_img_path)

            # Xóa record video nếu đã tạo nhưng bị lỗi
            if video_instance:
                # video_folder = os.path.dirname(video_instance.original_video_path)
                # video_folder = video_folder.lstrip("/")
                # video_folder = os.path.join(settings.BASE_DIR, video_folder)

                # if os.path.exists(video_folder) and os.path.isdir(video_folder):
                #     shutil.rmtree(video_folder)
                video_instance.delete()

            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)   

    @swagger_auto_schema(
        operation_summary="Get all movies",
        operation_description="Get all movies in the database with filtering, search, and pagination support",
        manual_parameters=[
            openapi.Parameter('search', openapi.IN_QUERY, description="Search movies by title or description", type=openapi.TYPE_STRING),
            openapi.Parameter('limit', openapi.IN_QUERY, description="Number of movies to return", type=openapi.TYPE_INTEGER),
            openapi.Parameter('offset', openapi.IN_QUERY, description="Offset for pagination", type=openapi.TYPE_INTEGER),
            openapi.Parameter('ordering', openapi.IN_QUERY, description="Order by field (e.g., -views, -release_date)", type=openapi.TYPE_STRING),
            openapi.Parameter('genre', openapi.IN_QUERY, description="Filter by genre ID", type=openapi.TYPE_INTEGER),
        ],
        responses={200: MovieGeneralInfoSerializer(many=True), 403: openapi.Response(description="Permission denied"),}
    )
    def get(self, request):
        try:
            queryset = Movie.objects.select_related('content').all()
            
            # Apply search filtering
            search = request.query_params.get('search')
            if search:
                queryset = queryset.filter(
                    Q(content__title__icontains=search) |
                    Q(content__description__icontains=search)
                )
            
            # Apply genre filtering
            genre = request.query_params.get('genre')
            if genre:
                queryset = queryset.filter(content__content_genres__genre__id=genre)
            
            # Apply ordering
            ordering = request.query_params.get('ordering')
            if ordering:
                if ordering.startswith('-'):
                    field = ordering[1:]
                    queryset = queryset.order_by(f'-content__{field}' if field in ['views', 'rating', 'release_date', 'created_at', 'updated_at'] else ordering)
                else:
                    queryset = queryset.order_by(f'content__{ordering}' if ordering in ['views', 'rating', 'release_date', 'created_at', 'updated_at'] else ordering)
            
            # Count total results for pagination
            total_count = queryset.count()
            
            # Apply offset and limit for pagination
            offset = request.query_params.get('offset', 0)
            limit = request.query_params.get('limit')
            
            try:
                offset = int(offset)
                if limit:
                    limit = int(limit)
                    queryset = queryset[offset:offset+limit]
                else:
                    queryset = queryset[offset:]
            except (ValueError, TypeError):
                pass
            
            # Get the actual results
            results = list(queryset)
            
            # Prepare response data
            serializer = MovieGeneralInfoSerializer(results, many=True, context={'request': request})
            
            # Always return paginated response format for consistency
            response_data = {
                'count': total_count,
                'results': serializer.data
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Internal Server Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 

class SeasonCreateAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [AllowAny]

    @swagger_auto_schema(
        operation_summary="Create a new season",
        operation_description="Create a new season",
        manual_parameters=[
            openapi.Parameter(
                name="series_id",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_INTEGER,
                required=False,
                description="ID of the series this season belongs to (optional)"
            ),
            openapi.Parameter(
                name="banner_img",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_FILE,
                required=True,
                description="Banner image for the season"
            ),
            openapi.Parameter(
                name="season_name",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                required=True,
                description="Name of the season"
            ),
            openapi.Parameter(
                name='age_rank',
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                required=True,
                description="Age rank"
            ),
            openapi.Parameter(
                name="num_episodes",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_INTEGER,
                required=True,
                description="Nums of episodes"
            ),
            openapi.Parameter(
                name="release_date",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                format="date",
                required=True,
                description="Release date (YYYY-MM-DD)"
            ),
            openapi.Parameter(
                name="description",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                required=True,
                description="Movie description"
            ),
            openapi.Parameter(
                name="status",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                enum=["on_going", "completed"],
                required=True,
                description="season status"
            ),
            openapi.Parameter(
                name="genres",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                # items=openapi.Items(type=openapi.TYPE_INTEGER),
                required=True,
                description="List of genre IDs (comma-separated) (e.g., [1, 2, 3])"

            ),
            openapi.Parameter(
                name="nations",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                required=True,
                description="List of nation IDs (comma-separated) (e.g., [1, 2, 3])"
            ),
            openapi.Parameter(
                name="tags",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                required=True,
                description="List of tag IDs (comma-separated) (e.g., [1, 2, 3])"
            ),
            openapi.Parameter(
                name="careers",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,

                required=True,
                description=(
                    "List of careers for the movie. Each career should contain a valid `career_name` and a list of `people`.<br>"
                    f"**Valid values for `career_name`**: `{[e.value for e in CareerEnum]}`.<br>"
                    "Example:<br>"
                    "```json\n"
                    "[\n"
                    "  {\"career_name\": \"Actor\", \"people\": [{\"id\": 1, \"name\": \"John Doe\"}]},\n"
                    "  {\"career_name\": \"Director\", \"people\": [{\"id\": 2, \"name\": \"Jane Smith\"}]}\n"
                    "]\n"
                    "```"
                )
            ),
        
        ],
        # consumes=["multipart/form-data"],
        responses={201: SeasonGeneralInfoSerializer(), 400: "Bad Request", 403: openapi.Response(description="Permission denied"),}
    )
    def post(self, request, *args, **kwargs):
        banner_img_path = None # Save image path to rollback if error occurs

        try:
            with transaction.atomic():  
                banner_img = request.FILES.get('banner_img')
                if banner_img:
                    banner_img_path = save_img(banner_img)
                    request.data['banner_img_url'] = banner_img_path
                else:
                    request.data['banner_img_url'] = os.path.join(settings.MEDIA_URL, 'banner/default.jpg')

                try:
                    request.data['genres'] = ensure_list_int(request.data.get('genres', '[]'))
                    request.data['nations'] = ensure_list_int(request.data.get('nations', '[]'))
                    request.data['tags'] = ensure_list_int(request.data.get('tags', '[]'))
                    request.data['careers'] = json.loads(request.data.get('careers'))
                except json.JSONDecodeError as e:
                    raise ValueError(f"Invalid JSON format: {str(e)}")
                
                series_id = request.data.get('series_id', None)
                if series_id:
                    series = Series.objects.get(pk=series_id)
                    if not series:
                        raise ValueError(f"Series not found with ID: {series_id}")
                else:
                    series = Series.objects.create(
                        title=request.data.get('season_name'),
                        release_date=request.data.get('release_date'),
                        description=request.data.get('description')
                    )
                    request.data['series_id'] = series.id
                
                order = request.data.get('order', None)
                if not order:
                    last_season = Season.objects.filter(series_id=series_id).order_by('-order').first()
                    order = (last_season.order + 1) if last_season else 1
                    request.data['order'] = order    

                movie_data = {key: value for key, value in request.data.items()}

                filtered_movie_data = {k: v for k, v in movie_data.items() if v not in [None, "", []]}

                season_serializer = CreateSeasonSerializer(data=filtered_movie_data)
                if season_serializer.is_valid():
                    season_serializer.save()
                    # Add to Elasticsearch
                    # try:
                    #     add = SeasonIndex(
                    #         season_name=season_serializer.data['season_name'],
                    #         season_id=season_serializer.data['id']
                    #     )
                    #     add.save()
                    # except Exception as e:
                    return Response(season_serializer.data, status=status.HTTP_201_CREATED)
                
                raise ValueError(season_serializer.errors)

        except Exception as e:
            banner_img_path = banner_img_path.lstrip("/")
            banner_img_path = os.path.join(settings.BASE_DIR, banner_img_path)
            if banner_img_path and os.path.exists(banner_img_path):
                os.remove(banner_img_path)

            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    @swagger_auto_schema(
        operation_summary="Get all seasons",
        operation_description="Get all seasons in the database",
        manual_parameters=[
            openapi.Parameter(
                name="series_id",
                in_=openapi.IN_QUERY,
                type=openapi.TYPE_INTEGER,
                required=True,
                description="ID of the series to get seasons"
            ),
        ],
        responses={200: SeasonGeneralInfoSerializer(many=True), 403: openapi.Response(description="Permission denied"),}
    )
    def get(self, request):
        try:
            series_id = request.query_params.get('series_id')
            seasons = Season.objects.filter(series_id=series_id)
            serializer = SeasonGeneralInfoSerializer(seasons, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except:
            return Response(serializer.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
class CareerAPIView(APIView):
    permission_classes = [AllowAny]
    @swagger_auto_schema(
        operation_summary="Get all careers (Admin Only)",
        operation_description="Retrieves all careers in the database. Requires an admin account to be logged in.",
        responses={
            200: openapi.Response(
                description="List of careers",
                schema=CareerPersonSerializer(many=True)
            ),
            403: openapi.Response(description="Permission denied"),
        }
    )
    def post(self, request):
        serializer = CareerPersonSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MovieRetrieveUpdateAPIView(APIView):
    def get_permissions(self):
        if self.request.method in ["PATCH", "DELETE"]:
            return [AllowAny()]  # Chỉ PATCH & DELETE yêu cầu xác thực
        return [AllowAny()]  # Các method khác không cần quyền
        

    @swagger_auto_schema(
        operation_summary="Get movie detail",
        operation_description="Get movie by slug",
        responses={200: MovieDetailSerializer}
    )
    def get(self, request, slug):
        try:
            # Get movie through content slug
            content = get_object_or_404(Content, slug=slug, content_type='movie')
            movie = get_object_or_404(Movie, content=content)
            serializer = MovieDetailSerializer(movie, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"Internal Server Error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        
    # @swagger_auto_schema(
    # operation_summary="Update movie details",
    # operation_description="Partially update a movie by ID",
    # request_body=MovieDetailSerializer(partial=True),
    # responses={
    #     200: MovieDetailSerializer(),
    #     400: "Invalid data",
    #     404: "Movie not found",
    #     500: "Internal server error"
    # }
    # )
    @swagger_auto_schema(
        operation_summary="Update movie details (Admin only)",
        operation_description="Partially update a movie by ID. Requires admin authentication.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "title": openapi.Schema(type=openapi.TYPE_STRING, description="Movie title"),
                "description": openapi.Schema(type=openapi.TYPE_STRING, description="Movie description"),
                "release_date": openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATE, description="Release date (YYYY-MM-DD)"),
                "duration": openapi.Schema(type=openapi.TYPE_INTEGER, description="Duration in minutes"),
                "genre": openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Schema(type=openapi.TYPE_STRING), description="List of genres"),
            },
            required=[],
        ),
        responses={
            200: openapi.Response(
                description="Movie updated successfully",
                schema=MovieDetailSerializer()
            ),
            400: openapi.Response(
                description="Invalid data",
                examples={"application/json": {"error": "Invalid request data"}}
            ),
            404: openapi.Response(
                description="Movie not found",
                examples={"application/json": {"error": "Movie not found"}}
            ),
            500: openapi.Response(
                description="Internal server error",
                examples={"application/json": {"error": "Something went wrong"}}
            ),
        },
    )
    def patch(self, request, slug):
        try:
            # Get movie through content slug
            content = get_object_or_404(Content, slug=slug, content_type='movie')
            movie = get_object_or_404(Movie, content=content)
            serializer = MovieDetailSerializer(movie, data=request.data, partial=True, context={'request': request})

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": f"Internal Server Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        operation_summary="Delete movie (Admin only)",
        operation_description="Deletes a movie by its slug. Requires admin authentication.",
        responses={
            204: openapi.Response(
                description="Movie deleted successfully"
            ),
            404: openapi.Response(
                description="Movie not found",
                examples={"application/json": {"error": "Movie not found"}}
            ),
            500: openapi.Response(
                description="Internal server error",
                examples={"application/json": {"error": "Something went wrong"}}
            ),
        },
    )
    def delete(self, request, slug):
        try:
            # Get movie through content slug
            content = get_object_or_404(Content, slug=slug, content_type='movie')
            movie = get_object_or_404(Movie, content=content)
            movie.delete()
            return Response({"message": "Movie deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

        except Exception as e:
            return Response({"error": f"Internal Server Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SeriesViewSet(viewsets.ModelViewSet):
    queryset = Series.objects.select_related('content').all()
    serializer_class = SeriesSerializer
    lookup_field = 'content__slug'  # Use slug for lookup instead of ID
    
    def get_permissions(self):
        """
        Public read access, admin-only write access
        """
        if self.action in ['list', 'retrieve', 'recently_updated', 'episodes']:
            return [AllowAny()]
        return [IsAdminUser(), IsAuthenticated()]

    @swagger_auto_schema(
        operation_summary="Retrieve all series",
        operation_description="Fetches a list of all available series with filtering, search, and pagination support.",
        manual_parameters=[
            openapi.Parameter('search', openapi.IN_QUERY, description="Search series by title or description", type=openapi.TYPE_STRING),
            openapi.Parameter('limit', openapi.IN_QUERY, description="Number of series to return", type=openapi.TYPE_INTEGER),
            openapi.Parameter('offset', openapi.IN_QUERY, description="Offset for pagination", type=openapi.TYPE_INTEGER),
            openapi.Parameter('ordering', openapi.IN_QUERY, description="Order by field (e.g., -views, -release_date)", type=openapi.TYPE_STRING),
            openapi.Parameter('genre', openapi.IN_QUERY, description="Filter by genre ID", type=openapi.TYPE_INTEGER),
        ],
        responses={
            200: openapi.Response(
                description="List of series",
                schema=SeriesSerializer(many=True)
            )
        }
    )
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        # Apply search filtering
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(content__title__icontains=search) |
                Q(content__description__icontains=search)
            )
        
        # Apply genre filtering
        genre = request.query_params.get('genre')
        if genre:
            queryset = queryset.filter(content__content_genres__genre__id=genre)
        
        # Apply ordering
        ordering = request.query_params.get('ordering')
        if ordering:
            if ordering.startswith('-'):
                field = ordering[1:]
                queryset = queryset.order_by(f'-content__{field}' if field in ['views', 'rating', 'release_date', 'created_at', 'updated_at'] else ordering)
            else:
                queryset = queryset.order_by(f'content__{ordering}' if ordering in ['views', 'rating', 'release_date', 'created_at', 'updated_at'] else ordering)
        
        # Count total results for pagination
        total_count = queryset.count()
        
        # Apply offset and limit for pagination
        offset = request.query_params.get('offset', 0)
        limit = request.query_params.get('limit')
        
        try:
            offset = int(offset)
            if limit:
                limit = int(limit)
                queryset = queryset[offset:offset+limit]
            else:
                queryset = queryset[offset:]
        except (ValueError, TypeError):
            pass
        
        # Get the actual results
        results = list(queryset)
        
        # Prepare response data
        serializer = self.get_serializer(results, many=True)
        
        # Always return paginated response format for consistency
        response_data = {
            'count': total_count,
            'results': serializer.data
        }
        
        return Response(response_data, status=status.HTTP_200_OK)

    # @swagger_auto_schema(
    #     operation_summary="Create a new series",
    #     operation_description="Creates a new series. Only admin users are allowed to perform this action.",
    #     request_body=SeriesSerializer,
    #     responses={
    #         201: openapi.Response(
    #             description="Series successfully created",
    #             schema=SeriesSerializer()
    #         ),
    #         400: "Bad request - Invalid data",
    #         403: "Forbidden - You do not have permission to create a series"
    #     },
    # )
    # def create(self, request, *args, **kwargs):
    #     return super().create(request, *args, **kwargs)
    @swagger_auto_schema(auto_schema=None)  # Ẩn khỏi Swagger
    def create(self, request, *args, **kwargs):
            return Response({"detail": "Method POST is not allowed."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    @swagger_auto_schema(
        operation_summary="Update an existing series",
        operation_description="Updates the details of a series using the PUT method. Only admin users are allowed to perform this action.",
        request_body=SeriesSerializer,
        responses={
            200: openapi.Response(
                description="Series successfully updated",
                schema=SeriesSerializer()
            ),
            400: "Bad request - Invalid data",
            404: "Not found - Series does not exist",
            403: "Forbidden - You do not have permission to update this series"
        },
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_summary="Delete a series",
        operation_description="Deletes a series by ID. Only admin users are allowed to perform this action.",
        responses={
            204: "Series successfully deleted",
            404: "Not found - Series does not exist",
            403: "Forbidden - You do not have permission to delete this series"
        },
    )
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()  # Lấy series cần xóa
        seasons = instance.seasons.all()  # Lấy tất cả season liên quan

        for season in seasons:
            season.delete()  # Gọi delete() để xóa season và các episode của nó

        instance.delete()  # Cuối cùng mới xóa series

        return Response(status=status.HTTP_204_NO_CONTENT)

    @swagger_auto_schema(
        operation_summary="Retrieve a specific series",
        operation_description="Fetches details of a specific series by ID.",
        responses={
            200: openapi.Response(
                description="Series details",
                schema=SeriesSerializer()
            ),
            404: "Not found - Series does not exist"
        }
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_summary="Retrieve a series by slug",
        operation_description="Fetches detailed information of a series using its slug.",
        responses={
            200: openapi.Response(
                description="Series details",
                schema=SeriesSerializer()
            ),
            404: "Series not found"
        }
    )
    def retrieve(self, request, content__slug=None):
        try:
            series = get_object_or_404(Series, content__slug=content__slug)
            serializer = self.get_serializer(series)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Series not found: {str(e)}"}, status=status.HTTP_404_NOT_FOUND)

    @swagger_auto_schema(
        operation_summary="Partially update a series",
        operation_description="Partially updates the details of a series using the PATCH method. Only admin users are allowed to perform this action.",
        request_body=SeriesSerializer(partial=True),
        responses={
            200: openapi.Response(
                description="Series successfully updated",
                schema=SeriesSerializer()
            ),
            400: "Bad request - Invalid data",
            404: "Not found - Series does not exist",
            403: "Forbidden - You do not have permission to update this series"
        },
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_summary="Get recently updated series",
        operation_description="Fetches a list of series that have been recently updated, ordered by update time.",
        manual_parameters=[
            openapi.Parameter('limit', openapi.IN_QUERY, description="Number of series to return", type=openapi.TYPE_INTEGER)
        ],
        responses={
            200: openapi.Response(
                description="List of recently updated series",
                schema=SeriesSerializer(many=True)
            )
        }
    )
    @action(detail=False, methods=['get'], url_path='recently-updated')
    def recently_updated(self, request):
        """Get recently updated series"""
        limit = request.query_params.get('limit', 10)
        try:
            limit = int(limit)
        except (ValueError, TypeError):
            limit = 10
        
        # Get series ordered by content update time (most recent first)
        series = Series.objects.select_related('content').order_by('-content__updated_at')[:limit]
        serializer = self.get_serializer(series, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        operation_summary="Get all episodes of a series",
        operation_description="Fetches all episodes from all seasons of a specific series, ordered by season and episode number.",
        responses={
            200: openapi.Response(
                description="List of episodes",
                schema=EpisodeSerializer(many=True)
            ),
            404: "Series not found"
        }
    )
    @action(detail=True, methods=['get'], url_path='episodes')
    def episodes(self, request, content__slug=None):
        """Get all episodes of a series"""
        try:
            series = self.get_object()
            all_episodes = []
            
            # Get all seasons of this series ordered by season order
            seasons = series.seasons.all().order_by('order')
            
            for season in seasons:
                # Get all episodes of this season ordered by episode order
                episodes = season.episodes.all().order_by('order')
                for episode in episodes:
                    episode_data = EpisodeSerializer(episode, context={'request': request}).data
                    episode_data['season_number'] = season.order
                    episode_data['season_name'] = season.season_name
                    all_episodes.append(episode_data)
            
            return Response(all_episodes, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": f"Failed to get episodes: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class SeasonRetrieveUpdateAPIView(APIView):
    @swagger_auto_schema(
        operation_summary="Get season detail",
        operation_description="Get season by ID",
        responses={
            200: SeasonDetailSerializer(),
            400: "Invalid season ID",
            404: "Season not found",
            500: "Internal server error"
        },
    )
    def get(self, request, pk):
        try:
            if not str(pk).isdigit():
                return Response(
                    {"error": "Invalid season ID. Must be an integer."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            season = get_object_or_404(Season, pk=pk)
            serializer = SeasonDetailSerializer(season, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"Internal Server Error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @swagger_auto_schema(
        operation_summary="Update season",
        operation_description="Update season by ID",
        request_body=SeasonDetailSerializer,
        responses={
            200: SeasonDetailSerializer(),
            400: "Invalid data",
            404: "Season not found",
            500: "Internal server error"
        }
    )
    def patch(self, request, pk):
        season = get_object_or_404(Season, pk=pk)
        serializer = SeasonDetailSerializer(season, data=request.data, partial=True, context={'request': request})

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_summary="Delete season",
        operation_description="Delete season by ID",
        responses={
            204: "Season deleted successfully",
            404: "Season not found",
            500: "Internal server error"
        }
    )
    def delete(self, request, pk):
        season = get_object_or_404(Season, pk=pk)
        season.delete()
        return Response({"message": "Season deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

class EpisodeCreateAPIView(APIView):
    permission_classes = [AllowAny]
    parser_classes = (MultiPartParser, FormParser)

    @swagger_auto_schema(
        operation_summary="Create a new episode",
        operation_description="Create a new episode",
        manual_parameters=[
            openapi.Parameter(
                name="season_id",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_INTEGER,
                required=True,
                description="ID of the season this episode belongs to"
            ),
            openapi.Parameter(
                name="banner_img",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_FILE,
                required=True,
                description="Name of the episode"
            ),
            openapi.Parameter(
                name="video_file",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_FILE,
                required=True,
                description="MP4 file to upload"
            ),
            openapi.Parameter(
                name="description",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_STRING,
                required=True,
                description="Episode description"
            ),
        ],
        responses={201: EpisodeSerializer(), 400: "Bad Request"}
    )
    def post(self, request, *args, **kwargs):
        banner_img_path = None
        video_instance = None
        
        try:
            with transaction.atomic():  
                banner_img = request.FILES.get('banner_img')
                if banner_img:
                    banner_img_path = save_img(banner_img)
                    request.data['banner_img_url'] = banner_img_path
                else:
                    request.data['banner_img_url'] = os.path.join(settings.MEDIA_URL, 'banner/default.jpg')
                video_file = request.FILES.get('video_file')
                if not video_file:
                    return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
                video_serializer = VideoUploadSerializer(data={'file': video_file})
                if not video_serializer.is_valid():
                    return Response(video_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                video_instance = video_serializer.save()
                episode_count = Episode.objects.filter(season_id=request.data['season_id']).count()
                episode_data = {
                    'season_id': request.data['season_id'],
                    'description': request.data['description'],
                    'banner_img_url': request.data['banner_img_url'],
                    'video_id': video_instance.id,
                    'order': episode_count + 1
                }

                episode_serializer = CreateEpisodeSerializer(data=episode_data)
                if episode_serializer.is_valid():
                    episode_serializer.save()
                    return Response(episode_serializer.data, status=status.HTTP_201_CREATED)
                return Response(episode_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            banner_img_path = banner_img_path.lstrip("/")
            banner_img_path = os.path.join(settings.BASE_DIR, banner_img_path)
            if banner_img_path and os.path.exists(banner_img_path):
                os.remove(banner_img_path)
            if video_instance:
                # video_folder = os.path.dirname(video_instance.original_video_path)
                # video_folder = video_folder.lstrip("/")
                # video_folder = os.path.join(settings.BASE_DIR, video_folder)
                # if os.path.exists(video_folder) and os.path.isdir(video_folder):
                #     shutil.rmtree(video_folder)
                video_instance.delete()

            # return Response({} ,status=status.HTTP_400_BAD_REQUEST)
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    @swagger_auto_schema(
        operation_summary='Get episode with season_id',
        operation_description='Get episode with season_id',
        manual_parameters=[            
            openapi.Parameter(
                name="season_id",
                in_=openapi.IN_QUERY,
                type=openapi.TYPE_INTEGER,
                required=True,
                description="ID of the season to get episode"
            ),
        ],
        responses={200: EpisodeSerializer(many=True)}
    )
    def get(self, request):
        try:
            season_id = request.query_params.get('season_id')
            episodes = Episode.objects.filter(season_id=season_id)
            serializer = EpisodeSerializer(episodes, many=True, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR) 

class EpisodeRetrieveUpdateAPIView(APIView):

    @swagger_auto_schema(
        operation_summary="Get episode detail",
        operation_description="Get episode by ID",
        responses={
            200: EpisodeSerializer(),
            400: "Invalid episode ID",
            404: "Episode not found",
            500: "Internal server error"
        }
    )
    def get(self, request, pk):
        try:
            if not str(pk).isdigit():
                return Response(
                    {"error": "Invalid episode ID. Must be an integer."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            episode = get_object_or_404(Episode, pk=pk)
            serializer = EpisodeSerializer(episode, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"Internal Server Error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @swagger_auto_schema(
        operation_summary="Update episode",
        operation_description="Update episode by ID",
        request_body=EpisodeSerializer,
        responses={
            200: EpisodeSerializer(),
            400: "Invalid data",
            404: "Episode not found",
            500: "Internal server error"
        }
    )
    def patch(self, request, pk):
        episode = get_object_or_404(Episode, pk=pk)
        serializer = EpisodeSerializer(episode, data=request.data, partial=True, context={'request': request})

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_summary="Delete episode",
        operation_description="Delete episode by ID",
        responses={
            204: "Episode deleted successfully",
            404: "Episode not found",
            500: "Internal server error"
        }
    )
    def delete(self, request, pk):
        episode = get_object_or_404(Episode, pk=pk)
        episode.delete()
        return Response({"message": "Episode deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

class GenreViewSet(viewsets.ModelViewSet):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer

    @swagger_auto_schema(
        operation_summary="Get a list of movies",
        operation_description="Lấy danh sách thể loại phim"
        )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_summary="Create a new genre",
        operation_description="Tạo một thể loại phim mới"
        )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_summary="Update a genre",
        operation_description="Cập nhật thông tin một thể loại phim"
        )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_summary="Delete a genre",
        operation_description="Xóa một thể loại phim"
        )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_summary="Get a genre",
        operation_description="Lấy thông tin một thể loại phim"
        )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_summary="Partial update a genre",
        operation_description="Cập nhật một phần thông tin một thể loại phim"
        )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)
    
class BrowseMoviesByGenreView(APIView):
    @swagger_auto_schema(
        operation_summary="Get all movies by genre",
        operation_description="Get all movies by genre",
        manual_parameters=[
            openapi.Parameter(
                name="genre_id",
                in_=openapi.IN_QUERY,
                type=openapi.TYPE_INTEGER,
                required=False,
                description="ID of the genre to get movies"
            ),
        ],
        responses={200: openapi.Schema(
            type=openapi.TYPE_ARRAY,
            items=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    "genre": openapi.Schema(type=openapi.TYPE_OBJECT, properties={
                        "id": openapi.Schema(type=openapi.TYPE_INTEGER),
                        "name": openapi.Schema(type=openapi.TYPE_STRING),
                    }),
                    "movies": openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Schema(type=openapi.TYPE_OBJECT)),
                }
            )
        )}
    )
    def get(self, request):
        genre_id = request.query_params.get('genre_id')

        if genre_id:
            genres = Genre.objects.filter(id=genre_id).prefetch_related('movie_genres')
        else:
            genres = Genre.objects.filter(movie_genres__isnull=False).distinct()

        result = []
        for genre in genres:
            movies = Movie.objects.filter(movie_genres__genre=genre)
            result.append({
                "genre": {"id": genre.id, "name": genre.name},
                "movies": MovieGeneralInfoSerializer(movies, many=True, context={'request': request}).data
            })

        return Response(result, status=status.HTTP_200_OK)

class ContentListAPIView(APIView):
    """API to get all content (movies and series combined)"""
    permission_classes = [AllowAny]
    
    @swagger_auto_schema(
        operation_summary="Get all content (movies and series)",
        operation_description="Fetches a list of all content including both movies and series with basic information.",
        manual_parameters=[
            openapi.Parameter(
                name="content_type",
                in_=openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                enum=["movie", "series"],
                required=False,
                description="Filter by content type (optional)"
            ),
            openapi.Parameter(
                name="status",
                in_=openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                enum=["on_going", "completed"],
                required=False,
                description="Filter by status (optional)"
            ),
            openapi.Parameter(
                name="limit",
                in_=openapi.IN_QUERY,
                type=openapi.TYPE_INTEGER,
                required=False,
                description="Limit number of results (optional)"
            ),
            openapi.Parameter(
                name="offset",
                in_=openapi.IN_QUERY,
                type=openapi.TYPE_INTEGER,
                required=False,
                description="Offset for pagination (optional)"
            ),
        ],
        responses={
            200: openapi.Response(
                description="List of content",
                schema=ContentSerializer(many=True)
            ),
            500: "Internal server error"
        }
    )
    def get(self, request):
        try:
            # Get query parameters
            content_type = request.query_params.get('content_type')
            status_filter = request.query_params.get('status')
            limit = request.query_params.get('limit')
            offset = request.query_params.get('offset', 0)
            
            # Build queryset
            queryset = Content.objects.all().order_by('-created_at')
            
            # Apply filters
            if content_type:
                queryset = queryset.filter(content_type=content_type)
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            
            # Apply pagination
            if offset:
                queryset = queryset[int(offset):]
            if limit:
                queryset = queryset[:int(limit)]
            
            # Serialize and return
            serializer = ContentSerializer(queryset, many=True, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": f"Internal Server Error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ContentDetailAPIView(APIView):
    """API to get detailed content by ID"""
    permission_classes = [AllowAny]
    
    @swagger_auto_schema(
        operation_summary="Get content detail by slug",
        operation_description="Fetches detailed information about a specific content (movie or series) using slug including related data like genres, tags, cast, etc.",
        responses={
            200: openapi.Response(
                description="Content details",
                schema=ContentDetailSerializer()
            ),
            404: "Content not found",
            500: "Internal server error"
        }
    )
    def get(self, request, slug):
        try:
            content = get_object_or_404(Content, slug=slug)
            serializer = ContentDetailSerializer(content, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": f"Internal Server Error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class MovieRecentlyUpdatedAPIView(APIView):
    permission_classes = [AllowAny]
    
    @swagger_auto_schema(
        operation_summary="Get recently updated movies",
        operation_description="Fetches a list of movies that have been recently updated, ordered by update time.",
        manual_parameters=[
            openapi.Parameter('limit', openapi.IN_QUERY, description="Number of movies to return", type=openapi.TYPE_INTEGER)
        ],
        responses={
            200: openapi.Response(
                description="List of recently updated movies",
                schema=MovieGeneralInfoSerializer(many=True)
            )
        }
    )
    def get(self, request):
        """Get recently updated movies"""
        limit = request.query_params.get('limit', 10)
        try:
            limit = int(limit)
        except (ValueError, TypeError):
            limit = 10
        
        try:
            # Get movies ordered by content update time (most recent first)
            movies = Movie.objects.select_related('content').order_by('-content__updated_at')[:limit]
            serializer = MovieGeneralInfoSerializer(movies, many=True, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Internal Server Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SimilarMoviesAPIView(APIView):
    """Optimized API to get similar movies with caching and better queries"""
    permission_classes = [AllowAny]
    
    @swagger_auto_schema(
        operation_summary="Get similar movies",
        operation_description="Fetches movies similar to the specified movie based on genres, studio, and popularity.",
        manual_parameters=[
            openapi.Parameter(
                name="movie_id",
                in_=openapi.IN_QUERY,
                type=openapi.TYPE_INTEGER,
                required=True,
                description="ID of the movie to find similar movies for"
            ),
            openapi.Parameter(
                name="limit",
                in_=openapi.IN_QUERY,
                type=openapi.TYPE_INTEGER,
                required=False,
                description="Maximum number of similar movies to return (default: 6)"
            ),
        ],
        responses={
            200: openapi.Response(
                description="List of similar movies",
                schema=MovieGeneralInfoSerializer(many=True)
            ),
            404: "Movie not found",
            500: "Internal server error"
        }
    )
    def get(self, request):
        try:
            movie_id = request.query_params.get('movie_id')
            limit = int(request.query_params.get('limit', 6))
            
            if not movie_id:
                return Response(
                    {"error": "movie_id parameter is required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check cache first
            cache_key = f"similar_movies_{movie_id}_{limit}"
            cached_result = cache.get(cache_key)
            if cached_result:
                return Response(cached_result, status=status.HTTP_200_OK)
            
            # Get the reference movie with optimized query
            try:
                reference_movie = Movie.objects.select_related('content', 'content__studio').prefetch_related(
                    'content__content_genres__genre',
                    'content__content_nations__nation'
                ).get(content_id=movie_id)
            except Movie.DoesNotExist:
                return Response(
                    {"error": "Movie not found"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            reference_content = reference_movie.content
            similar_movie_ids = []
            
            # Strategy 1: Same genre movies (faster approach)
            if reference_content.content_genres.exists():
                genre_ids = list(reference_content.content_genres.values_list('genre_id', flat=True))
                
                # Get movies with matching genres, ordered by number of matching genres and views
                genre_movies = Movie.objects.filter(
                    content__content_genres__genre_id__in=genre_ids
                ).exclude(content_id=movie_id).annotate(
                    matching_genres=Count('content__content_genres', 
                                        filter=Q(content__content_genres__genre_id__in=genre_ids))
                ).select_related('content').order_by(
                    '-matching_genres', '-content__views'
                )[:limit * 2]  # Get more to have options
                
                similar_movie_ids.extend([m.content_id for m in genre_movies[:limit]])
            
            # Strategy 2: Same studio movies (if we need more)
            if len(similar_movie_ids) < limit and reference_content.studio:
                studio_movies = Movie.objects.filter(
                    content__studio=reference_content.studio
                ).exclude(
                    content_id__in=[movie_id] + similar_movie_ids
                ).select_related('content').order_by('-content__views')[:limit - len(similar_movie_ids)]
                
                similar_movie_ids.extend([m.content_id for m in studio_movies])
            
            # Strategy 3: Fill remaining with trending movies in same genres
            if len(similar_movie_ids) < limit:
                remaining_count = limit - len(similar_movie_ids)
                if reference_content.content_genres.exists():
                    genre_ids = list(reference_content.content_genres.values_list('genre_id', flat=True))
                    trending_movies = Movie.objects.filter(
                        content__content_genres__genre_id__in=genre_ids
                    ).exclude(
                        content_id__in=[movie_id] + similar_movie_ids
                    ).select_related('content').order_by('-content__views')[:remaining_count]
                else:
                    # Fallback to most popular movies
                    trending_movies = Movie.objects.exclude(
                        content_id__in=[movie_id] + similar_movie_ids
                    ).select_related('content').order_by('-content__views')[:remaining_count]
                
                similar_movie_ids.extend([m.content_id for m in trending_movies])
            
            # Get final movies with optimized query
            similar_movies = Movie.objects.filter(
                content_id__in=similar_movie_ids[:limit]
            ).select_related('content').order_by('-content__views')
            
            # Serialize and cache result
            serializer = MovieGeneralInfoSerializer(similar_movies, many=True, context={'request': request})
            result_data = serializer.data
            
            # Cache for 30 minutes
            cache.set(cache_key, result_data, 30 * 60)
            
            return Response(result_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": f"Internal Server Error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class SimilarSeriesAPIView(APIView):
    """Optimized API to get similar series with caching and better queries"""
    permission_classes = [AllowAny]
    
    @swagger_auto_schema(
        operation_summary="Get similar series",
        operation_description="Fetches series similar to the specified series based on genres, studio, and popularity.",
        manual_parameters=[
            openapi.Parameter(
                name="series_id",
                in_=openapi.IN_QUERY,
                type=openapi.TYPE_INTEGER,
                required=True,
                description="ID of the series to find similar series for"
            ),
            openapi.Parameter(
                name="limit",
                in_=openapi.IN_QUERY,
                type=openapi.TYPE_INTEGER,
                required=False,
                description="Maximum number of similar series to return (default: 6)"
            ),
        ],
        responses={
            200: openapi.Response(
                description="List of similar series",
                schema=SeriesSerializer(many=True)
            ),
            404: "Series not found",
            500: "Internal server error"
        }
    )
    def get(self, request):
        try:
            series_id = request.query_params.get('series_id')
            limit = int(request.query_params.get('limit', 6))
            
            if not series_id:
                return Response(
                    {"error": "series_id parameter is required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check cache first
            cache_key = f"similar_series_{series_id}_{limit}"
            cached_result = cache.get(cache_key)
            if cached_result:
                return Response(cached_result, status=status.HTTP_200_OK)
            
            # Get the reference series with optimized query
            try:
                reference_series = Series.objects.select_related('content', 'content__studio').prefetch_related(
                    'content__content_genres__genre',
                    'content__content_nations__nation'
                ).get(content_id=series_id)
            except Series.DoesNotExist:
                return Response(
                    {"error": "Series not found"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            reference_content = reference_series.content
            similar_series_ids = []
            
            # Strategy 1: Same genre series (faster approach)
            if reference_content.content_genres.exists():
                genre_ids = list(reference_content.content_genres.values_list('genre_id', flat=True))
                
                # Get series with matching genres, ordered by number of matching genres and views
                genre_series = Series.objects.filter(
                    content__content_genres__genre_id__in=genre_ids
                ).exclude(content_id=series_id).annotate(
                    matching_genres=Count('content__content_genres', 
                                        filter=Q(content__content_genres__genre_id__in=genre_ids))
                ).select_related('content').order_by(
                    '-matching_genres', '-content__views'
                )[:limit * 2]  # Get more to have options
                
                similar_series_ids.extend([s.content_id for s in genre_series[:limit]])
            
            # Strategy 2: Same studio series (if we need more)
            if len(similar_series_ids) < limit and reference_content.studio:
                studio_series = Series.objects.filter(
                    content__studio=reference_content.studio
                ).exclude(
                    content_id__in=[series_id] + similar_series_ids
                ).select_related('content').order_by('-content__views')[:limit - len(similar_series_ids)]
                
                similar_series_ids.extend([s.content_id for s in studio_series])
            
            # Strategy 3: Fill remaining with trending series in same genres
            if len(similar_series_ids) < limit:
                remaining_count = limit - len(similar_series_ids)
                if reference_content.content_genres.exists():
                    genre_ids = list(reference_content.content_genres.values_list('genre_id', flat=True))
                    trending_series = Series.objects.filter(
                        content__content_genres__genre_id__in=genre_ids
                    ).exclude(
                        content_id__in=[series_id] + similar_series_ids
                    ).select_related('content').order_by('-content__views')[:remaining_count]
                else:
                    # Fallback to most popular series
                    trending_series = Series.objects.exclude(
                        content_id__in=[series_id] + similar_series_ids
                    ).select_related('content').order_by('-content__views')[:remaining_count]
                
                similar_series_ids.extend([s.content_id for s in trending_series])
            
            # Get final series with optimized query
            similar_series = Series.objects.filter(
                content_id__in=similar_series_ids[:limit]
            ).select_related('content').order_by('-content__views')
            
            # Serialize and cache result
            serializer = SeriesSerializer(similar_series, many=True, context={'request': request})
            result_data = serializer.data
            
            # Cache for 30 minutes
            cache.set(cache_key, result_data, 30 * 60)
            
            return Response(result_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": f"Internal Server Error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CombinedSearchAPIView(APIView):
    """API to search both movies and series at once"""
    permission_classes = [AllowAny]
    
    @swagger_auto_schema(
        operation_summary="Search both movies and series",
        operation_description="Searches both movies and series with a single query and returns combined results with pagination.",
        manual_parameters=[
            openapi.Parameter('search', openapi.IN_QUERY, description="Search query for both movies and series", type=openapi.TYPE_STRING, required=True),
            openapi.Parameter('limit', openapi.IN_QUERY, description="Number of results to return per page", type=openapi.TYPE_INTEGER),
            openapi.Parameter('offset', openapi.IN_QUERY, description="Offset for pagination", type=openapi.TYPE_INTEGER),
        ],
        responses={
            200: openapi.Response(
                description="Combined search results",
                examples={
                    "application/json": {
                        "count": 150,
                        "results": [
                            {"id": 1, "title": "Movie Title", "content_type": "movie"},
                            {"id": 2, "title": "Series Title", "content_type": "series"}
                        ]
                    }
                }
            ),
            400: "Bad request - missing search query"
        }
    )
    def get(self, request):
        search_query = request.query_params.get('search', '').strip()
        if not search_query:
            return Response(
                {"error": "Search query is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        limit = int(request.query_params.get('limit', 20))
        offset = int(request.query_params.get('offset', 0))
        
        try:
            # Search movies
            movie_queryset = Movie.objects.select_related('content').filter(
                Q(content__title__icontains=search_query) |
                Q(content__description__icontains=search_query)
            )
            
            # Search series  
            series_queryset = Series.objects.select_related('content').filter(
                Q(content__title__icontains=search_query) |
                Q(content__description__icontains=search_query)
            )
            
            # Get total counts
            total_movies = movie_queryset.count()
            total_series = series_queryset.count()
            total_count = total_movies + total_series
            
            # Combine and sort by relevance (title match first, then description)
            all_results = []
            
            # Add movies with content_type field
            for movie in movie_queryset:
                movie_data = MovieGeneralInfoSerializer(movie, context={'request': request}).data
                movie_data['content_type'] = 'movie'
                all_results.append(movie_data)
            
            # Add series with content_type field
            for series in series_queryset:
                series_data = SeriesSerializer(series, context={'request': request}).data
                series_data['content_type'] = 'series'
                all_results.append(series_data)
            
            # Sort by title relevance (exact matches first, then partial matches)
            def sort_key(item):
                title = item.get('content', {}).get('title', '').lower()
                search_lower = search_query.lower()
                if title == search_lower:
                    return 0  # Exact match
                elif title.startswith(search_lower):
                    return 1  # Starts with query
                else:
                    return 2  # Contains query
            
            all_results.sort(key=sort_key)
            
            # Apply pagination
            paginated_results = all_results[offset:offset + limit]
            
            return Response({
                'count': total_count,
                'results': paginated_results,
                'total_movies': total_movies,
                'total_series': total_series
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": f"Search failed: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class MovieVideoAPIView(APIView):
    """API to get video stream for a movie"""
    permission_classes = [AllowAny]
    
    @swagger_auto_schema(
        operation_summary="Get movie video stream",
        operation_description="Get HLS video stream URL for a specific movie",
        responses={
            200: openapi.Response(
                description="Video stream information",
                examples={
                    "application/json": {
                        "hls_url": "/media/videos/video_123/hls/index.m3u8",
                        "original_url": "/media/videos/video_123/demo_video.mp4",
                        "title": "Movie Title",
                        "duration": 1480
                    }
                }
            ),
            404: "Movie or video not found"
        }
    )
    def get(self, request, movie_id):
        try:
            movie = get_object_or_404(Movie, content_id=movie_id)
            
            # Build absolute URL
            base_url = f"{request.scheme}://{request.get_host()}"
            
            # Check if movie has video
            if movie.video:
                hls_url = movie.video.hls_path
                original_url = movie.video.original_video_path
                
                # Ensure absolute URLs
                if not hls_url.startswith('http'):
                    hls_url = f"{base_url}{hls_url}"
                if not original_url.startswith('http'):
                    original_url = f"{base_url}{original_url}"
                
                return Response({
                    'hls_url': hls_url,
                    'original_url': original_url,
                    'title': movie.content.title,
                    'duration': movie.duration
                }, status=status.HTTP_200_OK)
            else:
                # Return demo video if no video attached
                return Response({
                    'hls_url': f'{base_url}/media/videos/demo/hls/index.m3u8',
                    'original_url': f'{base_url}/media/videos/demo/demo_video.mp4',
                    'title': f'{movie.content.title} (Demo)',
                    'duration': 1480  # ~24 minutes
                }, status=status.HTTP_200_OK)
                
        except Movie.DoesNotExist:
            return Response({'error': 'Movie not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EpisodeVideoAPIView(APIView):
    """API to get video stream for a series episode"""
    permission_classes = [AllowAny]
    
    @swagger_auto_schema(
        operation_summary="Get episode video stream",
        operation_description="Get HLS video stream URL for a specific series episode",
        manual_parameters=[
            openapi.Parameter(
                name="content_id",
                in_=openapi.IN_PATH,
                type=openapi.TYPE_INTEGER,
                required=True,
                description="Content ID of the series"
            ),
            openapi.Parameter(
                name="season_number",
                in_=openapi.IN_PATH,
                type=openapi.TYPE_INTEGER,
                required=True,
                description="Season number (1-based)"
            ),
            openapi.Parameter(
                name="episode_number",
                in_=openapi.IN_PATH,
                type=openapi.TYPE_INTEGER,
                required=True,
                description="Episode number (1-based)"
            ),
        ],
        responses={
            200: openapi.Response(
                description="Video stream information",
                examples={
                    "application/json": {
                        "hls_url": "/media/videos/video_456/hls/index.m3u8",
                        "original_url": "/media/videos/video_456/episode_video.mp4",
                        "title": "Series Title - S1E1",
                        "duration": 1440
                    }
                }
            ),
            404: "Series, season, episode or video not found"
        }
    )
    def get(self, request, content_id, season_number, episode_number):
        try:
            # Get the specific episode
            episode = get_object_or_404(
                Episode,
                season__series__content_id=content_id,
                season__order=season_number,
                order=episode_number
            )
            
            # Build absolute URL
            base_url = f"{request.scheme}://{request.get_host()}"
            
            # Check if episode has video
            if episode.video:
                hls_url = episode.video.hls_path
                original_url = episode.video.original_video_path
                
                # Ensure absolute URLs
                if not hls_url.startswith('http'):
                    hls_url = f"{base_url}{hls_url}"
                if not original_url.startswith('http'):
                    original_url = f"{base_url}{original_url}"
                
                return Response({
                    'hls_url': hls_url,
                    'original_url': original_url,
                    'title': f'{episode.season.series.content.title} - S{season_number}E{episode_number}',
                    'duration': episode.duration
                }, status=status.HTTP_200_OK)
            else:
                # Return demo video if no video attached
                return Response({
                    'hls_url': f'{base_url}/media/videos/demo/hls/index.m3u8',
                    'original_url': f'{base_url}/media/videos/demo/demo_video.mp4',
                    'title': f'{episode.season.series.content.title} - S{season_number}E{episode_number} (Demo)',
                    'duration': 1480  # ~24 minutes
                }, status=status.HTTP_200_OK)
                
        except Episode.DoesNotExist:
            return Response({'error': 'Episode not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UpdateViewDurationAPIView(APIView):
    """API to update view duration and increment views if threshold is met"""
    permission_classes = [AllowAny]
    
    @swagger_auto_schema(
        operation_summary="Update view duration",
        operation_description="Update view duration for a video session. Views will be incremented after 60 seconds of watching.",
        request_body=UpdateViewDurationSerializer,
        responses={
            200: openapi.Response(
                description="View duration updated successfully",
                examples={
                    "application/json": {
                        "success": True,
                        "view_counted": True,
                        "message": "View counted"
                    }
                }
            ),
            400: "Bad request - validation error",
            404: "Content or episode not found"
        }
    )
    def post(self, request):
        serializer = UpdateViewDurationSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        data = serializer.validated_data
        session_id = data['session_id']
        duration_seconds = data['duration_seconds']
        content_id = data.get('content_id')
        episode_id = data.get('episode_id')
        
        try:
            # Get or create view session
            if content_id:
                content = get_object_or_404(Content, id=content_id)
                view_session, created = ViewSession.objects.get_or_create(
                    session_id=session_id,
                    content=content,
                    defaults={'watch_duration': 0}
                )
            else:
                # For episode, we need to find it by season and episode number from the request
                # But since we only have episode_id in serializer, let's modify this
                episode = get_object_or_404(Episode, id=episode_id)
                view_session, created = ViewSession.objects.get_or_create(
                    session_id=session_id,
                    episode=episode,
                    defaults={'watch_duration': 0}
                )
            
            # Update view duration and potentially increment views
            old_view_counted = view_session.view_counted
            view_session.update_view_duration(duration_seconds)
            
            return Response({
                'success': True,
                'view_counted': view_session.view_counted,
                'message': 'View counted' if not old_view_counted and view_session.view_counted else 'Duration updated'
            }, status=status.HTTP_200_OK)
            
        except (Content.DoesNotExist, Episode.DoesNotExist):
            return Response({'error': 'Content or episode not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TrackEpisodeViewAPIView(APIView):
    """API specifically for tracking episode views with series content info"""
    permission_classes = [AllowAny]
    
    @swagger_auto_schema(
        operation_summary="Track episode view duration",
        operation_description="Track view duration for a specific episode by series content ID, season and episode number",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'session_id': openapi.Schema(type=openapi.TYPE_STRING, description='Unique session identifier'),
                'duration_seconds': openapi.Schema(type=openapi.TYPE_INTEGER, description='Watch duration in seconds'),
                'content_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='Series content ID'),
                'season_number': openapi.Schema(type=openapi.TYPE_INTEGER, description='Season number'),
                'episode_number': openapi.Schema(type=openapi.TYPE_INTEGER, description='Episode number'),
            },
            required=['session_id', 'duration_seconds', 'content_id', 'season_number', 'episode_number']
        ),
        responses={
            200: openapi.Response(
                description="Episode view duration updated successfully",
                examples={
                    "application/json": {
                        "success": True,
                        "view_counted": True,
                        "message": "View counted for both episode and series"
                    }
                }
            ),
            400: "Bad request - validation error",
            404: "Episode not found"
        }
    )
    def post(self, request):
        session_id = request.data.get('session_id')
        duration_seconds = request.data.get('duration_seconds')
        content_id = request.data.get('content_id')
        season_number = request.data.get('season_number')
        episode_number = request.data.get('episode_number')
        
        # Validate required fields
        if not all([session_id, duration_seconds is not None, content_id, season_number, episode_number]):
            return Response({
                'error': 'session_id, duration_seconds, content_id, season_number, and episode_number are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get the specific episode
            episode = get_object_or_404(
                Episode,
                season__series__content_id=content_id,
                season__order=season_number,
                order=episode_number
            )
            
            # Get or create view session for this episode
            view_session, created = ViewSession.objects.get_or_create(
                session_id=session_id,
                episode=episode,
                defaults={'watch_duration': 0}
            )
            
            # Update view duration and potentially increment views
            old_view_counted = view_session.view_counted
            view_session.update_view_duration(duration_seconds)
            
            message = 'View counted for both episode and series' if not old_view_counted and view_session.view_counted else 'Duration updated'
            
            return Response({
                'success': True,
                'view_counted': view_session.view_counted,
                'message': message
            }, status=status.HTTP_200_OK)
            
        except Episode.DoesNotExist:
            return Response({'error': 'Episode not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
