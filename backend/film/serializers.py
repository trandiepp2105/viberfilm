from rest_framework import serializers
from film.models import *

# Basic Model Serializers
class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = '__all__'

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'

class NationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nation
        fields = '__all__'

class StudioSerializer(serializers.ModelSerializer):
    country = NationSerializer(read_only=True)
    
    class Meta:
        model = Studio
        fields = '__all__'

class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = '__all__'

class PersonSerializer(serializers.ModelSerializer):
    nationality = NationSerializer(read_only=True)
    photo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Person
        fields = '__all__'
    
    def get_photo_url(self, obj):
        if not obj.photo_url:
            return None
        if obj.photo_url.startswith('http'):
            return obj.photo_url
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri('/' + obj.photo_url.lstrip('/'))
        return f"http://127.0.0.1:8000/{obj.photo_url.lstrip('/')}"

# Basic Content Serializer
class ContentSerializer(serializers.ModelSerializer):
    banner_img_url = serializers.SerializerMethodField()
    poster_img_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Content
        fields = '__all__'
    
    def get_banner_img_url(self, obj):
        if not obj.banner_img_url:
            return None
        if obj.banner_img_url.startswith('http'):
            return obj.banner_img_url
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri('/' + obj.banner_img_url.lstrip('/'))
        return f"http://127.0.0.1:8000/{obj.banner_img_url.lstrip('/')}"
    
    def get_poster_img_url(self, obj):
        if not obj.poster_img_url:
            return None
        if obj.poster_img_url.startswith('http'):
            return obj.poster_img_url
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri('/' + obj.poster_img_url.lstrip('/'))
        return f"http://127.0.0.1:8000/{obj.poster_img_url.lstrip('/')}"

# Relationship Serializers
class ContentGenreDetailSerializer(serializers.ModelSerializer):
    genre = GenreSerializer(read_only=True)
    
    class Meta:
        model = ContentGenre
        fields = ['genre']

class ContentTagDetailSerializer(serializers.ModelSerializer):
    tag = TagSerializer(read_only=True)
    
    class Meta:
        model = ContentTag
        fields = ['tag']

class ContentNationDetailSerializer(serializers.ModelSerializer):
    nation = NationSerializer(read_only=True)
    
    class Meta:
        model = ContentNation
        fields = ['nation']

class ContentLanguageDetailSerializer(serializers.ModelSerializer):
    language = LanguageSerializer(read_only=True)
    
    class Meta:
        model = ContentLanguage
        fields = ['language', 'language_type']

class ContentPersonDetailSerializer(serializers.ModelSerializer):
    person = PersonSerializer(read_only=True)
    
    class Meta:
        model = ContentPerson
        fields = ['person', 'role', 'character_name', 'order']

# Enhanced Content Serializer with full details
class ContentDetailSerializer(serializers.ModelSerializer):
    """Detailed Content serializer that includes all related metadata"""
    studio = StudioSerializer(read_only=True)
    banner_img_url = serializers.SerializerMethodField()
    poster_img_url = serializers.SerializerMethodField()
    movie_details = serializers.SerializerMethodField()
    series_details = serializers.SerializerMethodField()
    genres = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    nations = serializers.SerializerMethodField()
    languages = serializers.SerializerMethodField()
    cast_crew = serializers.SerializerMethodField()
    
    class Meta:
        model = Content
        fields = '__all__'
    
    def get_banner_img_url(self, obj):
        if not obj.banner_img_url:
            return None
        if obj.banner_img_url.startswith('http'):
            return obj.banner_img_url
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri('/' + obj.banner_img_url.lstrip('/'))
        return f"http://127.0.0.1:8000/{obj.banner_img_url.lstrip('/')}"
    
    def get_poster_img_url(self, obj):
        if not obj.poster_img_url:
            return None
        if obj.poster_img_url.startswith('http'):
            return obj.poster_img_url
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri('/' + obj.poster_img_url.lstrip('/'))
        return f"http://127.0.0.1:8000/{obj.poster_img_url.lstrip('/')}"
    
    def get_movie_details(self, obj):
        """Get movie specific details if content is a movie"""
        if obj.is_movie():
            try:
                movie = obj.movie
                return {
                    'duration': movie.duration,
                    'intro_duration': movie.intro_duration,
                    'start_intro_time': movie.start_intro_time,
                    'video_id': movie.video.id if movie.video else None
                }
            except Movie.DoesNotExist:
                return None
        return None
    
    def get_series_details(self, obj):
        """Get series specific details if content is a series"""
        if obj.is_series():
            try:
                series = obj.series
                return {
                    'total_seasons': series.total_seasons,
                    'total_episodes': series.total_episodes
                }
            except Series.DoesNotExist:
                return None
        return None
    
    def get_genres(self, obj):
        """Get genres for this content"""
        genres = [cg.genre for cg in obj.content_genres.select_related('genre')]
        return GenreSerializer(genres, many=True).data
    
    def get_tags(self, obj):
        """Get tags for this content"""
        tags = [ct.tag for ct in obj.content_tags.select_related('tag')]
        return TagSerializer(tags, many=True).data
    
    def get_nations(self, obj):
        """Get nations for this content"""
        nations = [cn.nation for cn in obj.content_nations.select_related('nation')]
        return NationSerializer(nations, many=True).data
    
    def get_languages(self, obj):
        """Get languages grouped by type (audio/subtitle)"""
        languages_data = {'audio': [], 'subtitle': []}
        for cl in obj.content_languages.select_related('language'):
            lang_data = LanguageSerializer(cl.language).data
            languages_data[cl.language_type].append(lang_data)
        return languages_data
    
    def get_cast_crew(self, obj):
        """Get cast and crew for this content"""
        cast_crew = obj.cast_crew.select_related('person', 'person__nationality').order_by('order', 'role')
        return ContentPersonDetailSerializer(cast_crew, many=True, context=self.context).data

# Movie Serializers
class MovieSerializer(serializers.ModelSerializer):
    content = ContentSerializer(read_only=True)  # Include full content object
    
    class Meta:
        model = Movie
        fields = '__all__'

class CreateMovieSerializer(serializers.ModelSerializer):
    """Serializer for creating new movies"""
    class Meta:
        model = Movie
        fields = '__all__'

class MovieGeneralInfoSerializer(serializers.ModelSerializer):
    """Serializer for movie list view with general info"""
    content = ContentSerializer(read_only=True)
    
    class Meta:
        model = Movie
        fields = ['content', 'duration']

class MovieDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed movie view with full metadata"""
    content = ContentDetailSerializer(read_only=True)
    
    class Meta:
        model = Movie
        fields = '__all__'

# Series Serializers
class SeriesSerializer(serializers.ModelSerializer):
    content = ContentSerializer(read_only=True)  # Include full content object
    
    class Meta:
        model = Series
        fields = '__all__'

class SeasonSerializer(serializers.ModelSerializer):
    banner_img_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Season
        fields = '__all__'
    
    def get_banner_img_url(self, obj):
        if not obj.banner_img_url:
            return None
        if obj.banner_img_url.startswith('http'):
            return obj.banner_img_url
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri('/' + obj.banner_img_url.lstrip('/'))
        return f"http://127.0.0.1:8000/{obj.banner_img_url.lstrip('/')}"

class CreateSeasonSerializer(serializers.ModelSerializer):
    """Serializer for creating new seasons"""
    class Meta:
        model = Season
        fields = '__all__'

class SeasonGeneralInfoSerializer(serializers.ModelSerializer):
    """Serializer for season list view with general info"""
    series = SeriesSerializer(read_only=True)
    
    class Meta:
        model = Season
        fields = ['id', 'series', 'order', 'season_name', 'release_date', 'rating', 'status']

class EpisodeSerializer(serializers.ModelSerializer):
    banner_img_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Episode
        fields = '__all__'
    
    def get_banner_img_url(self, obj):
        if not obj.banner_img_url:
            return None
        if obj.banner_img_url.startswith('http'):
            return obj.banner_img_url
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri('/' + obj.banner_img_url.lstrip('/'))
        return f"http://127.0.0.1:8000/{obj.banner_img_url.lstrip('/')}"

class CreateEpisodeSerializer(serializers.ModelSerializer):
    """Serializer for creating new episodes"""
    class Meta:
        model = Episode
        fields = '__all__'

class SeasonDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed season view"""
    series = SeriesSerializer(read_only=True)
    episodes = EpisodeSerializer(many=True, read_only=True)
    
    class Meta:
        model = Season
        fields = '__all__'

# Relationship Serializers
class ContentGenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentGenre
        fields = '__all__'

class ContentTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentTag
        fields = '__all__'

class ContentNationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentNation
        fields = '__all__'

class ContentPersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentPerson
        fields = '__all__'

class CareerPersonSerializer(serializers.ModelSerializer):
    """Serializer for people careers - mapped to ContentPerson"""
    class Meta:
        model = ContentPerson
        fields = '__all__'

# Duplicate class removed - using the enhanced ContentDetailSerializer above

class SeriesDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed series view with full metadata"""
    content = ContentDetailSerializer(read_only=True)
    seasons = SeasonDetailSerializer(many=True, read_only=True)
    episodes = serializers.SerializerMethodField()
    
    class Meta:
        model = Series
        fields = '__all__'
    
    def get_episodes(self, obj):
        """Get all episodes from all seasons of this series"""
        all_episodes = []
        for season in obj.seasons.all():
            episodes = season.episodes.all().order_by('order')
            for episode in episodes:
                episode_data = EpisodeSerializer(episode, context=self.context).data
                episode_data['season_number'] = season.order
                episode_data['season_name'] = season.season_name
                all_episodes.append(episode_data)
        return all_episodes

class ViewSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ViewSession
        fields = ['session_id', 'watch_duration', 'view_counted']
        read_only_fields = ['view_counted']

class UpdateViewDurationSerializer(serializers.Serializer):
    session_id = serializers.CharField(max_length=255)
    duration_seconds = serializers.IntegerField(min_value=0)
    content_id = serializers.IntegerField(required=False)
    episode_id = serializers.IntegerField(required=False)
    
    def validate(self, data):
        if not data.get('content_id') and not data.get('episode_id'):
            raise serializers.ValidationError("Either content_id or episode_id must be provided")
        if data.get('content_id') and data.get('episode_id'):
            raise serializers.ValidationError("Cannot provide both content_id and episode_id")
        return data

