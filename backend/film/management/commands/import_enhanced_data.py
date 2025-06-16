import json
import os
import shutil
from datetime import datetime
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from django.utils.text import slugify
from django.db import transaction
from film.models import (
    Content, Movie, Series, Season, Episode,
    Genre, Tag, Nation, Studio, Language, Person,
    ContentGenre, ContentTag, ContentNation, ContentLanguage, ContentPerson,
    Status, ContentTypeChoices
)

class Command(BaseCommand):
    help = 'Import crawled anime data with enhanced metadata into database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--movies-dir',
            type=str,
            default='crawled_data_movies',
            help='Directory containing movie data'
        )
        parser.add_argument(
            '--series-dir', 
            type=str,
            default='crawled_data_series',
            help='Directory containing series data'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run without making changes to database'
        )
        parser.add_argument(
            '--limit',
            type=int,
            help='Limit number of items to import (for testing)'
        )

    def handle(self, *args, **options):
        self.dry_run = options['dry_run']
        self.limit = options.get('limit')
        self.movies_dir = os.path.join(settings.BASE_DIR, options['movies_dir'])
        self.series_dir = os.path.join(settings.BASE_DIR, options['series_dir'])
        
        self.stdout.write(
            self.style.SUCCESS('Starting enhanced anime data import...')
        )
        
        if self.dry_run:
            self.stdout.write(
                self.style.WARNING('DRY RUN MODE - No changes will be made')
            )
        
        # Statistics
        self.stats = {
            'movies_processed': 0,
            'series_processed': 0,
            'seasons_created': 0,
            'episodes_created': 0,
            'errors': 0
        }
        
        try:
            with transaction.atomic():
                # Import movies
                if os.path.exists(self.movies_dir):
                    self.import_movies()
                
                # Import series
                if os.path.exists(self.series_dir):
                    self.import_series()
                
                if self.dry_run:
                    raise Exception("Dry run - rolling back transaction")
                    
        except Exception as e:
            if not self.dry_run:
                self.stdout.write(
                    self.style.ERROR(f'Import failed: {str(e)}')
                )
                return
        
        # Print statistics
        self.print_statistics()

    def import_movies(self):
        """Import movie data"""
        self.stdout.write('Importing movies...')
        
        movie_dirs = [d for d in os.listdir(self.movies_dir) 
                     if os.path.isdir(os.path.join(self.movies_dir, d))]
        
        if self.limit:
            movie_dirs = movie_dirs[:self.limit]
        
        for movie_dir in movie_dirs:
            try:
                movie_path = os.path.join(self.movies_dir, movie_dir)
                metadata_file = os.path.join(movie_path, 'metadata.txt')
                
                if not os.path.exists(metadata_file):
                    self.stdout.write(
                        self.style.WARNING(f'No metadata found for {movie_dir}')
                    )
                    continue
                
                with open(metadata_file, 'r', encoding='utf-8') as f:
                    metadata = json.load(f)
                
                self.create_movie(metadata, movie_path)
                self.stats['movies_processed'] += 1
                
                if self.stats['movies_processed'] % 10 == 0:
                    self.stdout.write(f'Processed {self.stats["movies_processed"]} movies...')
                    
            except Exception as e:
                self.stats['errors'] += 1
                self.stdout.write(
                    self.style.ERROR(f'Error processing movie {movie_dir}: {str(e)}')
                )

    def import_series(self):
        """Import series data"""
        self.stdout.write('Importing series...')
        
        series_dirs = [d for d in os.listdir(self.series_dir) 
                      if os.path.isdir(os.path.join(self.series_dir, d))]
        
        if self.limit:
            series_dirs = series_dirs[:self.limit]
        
        for series_dir in series_dirs:
            try:
                series_path = os.path.join(self.series_dir, series_dir)
                metadata_file = os.path.join(series_path, 'metadata.txt')
                
                if not os.path.exists(metadata_file):
                    self.stdout.write(
                        self.style.WARNING(f'No metadata found for {series_dir}')
                    )
                    continue
                
                with open(metadata_file, 'r', encoding='utf-8') as f:
                    metadata = json.load(f)
                
                self.create_series(metadata, series_path)
                self.stats['series_processed'] += 1
                
                if self.stats['series_processed'] % 10 == 0:
                    self.stdout.write(f'Processed {self.stats["series_processed"]} series...')
                    
            except Exception as e:
                self.stats['errors'] += 1
                self.stdout.write(
                    self.style.ERROR(f'Error processing series {series_dir}: {str(e)}')
                )

    def create_movie(self, metadata, movie_path):
        """Create movie content with enhanced metadata"""
        # Create base content
        content = self.create_base_content(metadata, ContentTypeChoices.MOVIE)
        
        # Get duration from metadata
        duration_str = metadata.get('movie_info', {}).get('duration', '90 phút')
        duration = self.parse_duration(duration_str)
        
        # Create movie record
        movie = Movie.objects.create(
            content=content,
            duration=duration,
            intro_duration=0.0,
            start_intro_time=0.0
        )
        
        # Process images
        self.process_content_images(content, movie_path)
        
        return movie

    def create_series(self, metadata, series_path):
        """Create series content with seasons and episodes"""
        # Create base content
        content = self.create_base_content(metadata, ContentTypeChoices.SERIES)
        
        # Create series record
        series = Series.objects.create(
            content=content,
            total_seasons=1,  # Will be updated based on actual seasons
            total_episodes=0  # Will be calculated
        )
        
        # Process seasons
        total_episodes = 0
        season_dirs = [d for d in os.listdir(series_path) 
                      if os.path.isdir(os.path.join(series_path, d)) and d.startswith('season_')]
        
        if season_dirs:
            series.total_seasons = len(season_dirs)
            
            for season_dir in sorted(season_dirs):
                season_path = os.path.join(series_path, season_dir)
                season_number = int(season_dir.split('_')[1])
                
                season = self.create_season(series, season_number, season_path, metadata)
                episodes_count = self.create_episodes_for_season(season, season_path, metadata)
                total_episodes += episodes_count
                
                self.stats['seasons_created'] += 1
        
        # Update series totals
        series.total_episodes = total_episodes
        series.save()
        
        # Process images
        self.process_content_images(content, series_path)
        
        return series

    def create_base_content(self, metadata, content_type):
        """Create base Content record with enhanced metadata"""
        title = metadata.get('title', 'Unknown Title')
        subtitle = metadata.get('subtitle', '')
        
        # Parse release date
        year = metadata.get('year', '2024')
        try:
            release_date = datetime(int(year), 1, 1).date()
        except (ValueError, TypeError):
            release_date = datetime(2024, 1, 1).date()
        
        # Create content
        content = Content.objects.create(
            title=title,
            original_title=subtitle if subtitle != title else '',
            content_type=content_type,
            release_date=release_date,
            description=metadata.get('description', ''),
            banner_img_url='',  # Will be set in process_content_images
            poster_img_url='',  # Will be set in process_content_images
            views=self.parse_views(metadata.get('view_count', '0')),
            rating=float(metadata.get('rating_score', 0)),
            status=self.parse_status(metadata.get('movie_info', {}).get('status', '')),
            age_rank=self.parse_age_rank(metadata.get('movie_info', {}).get('rating', 'all'))
        )
        
        # Add studio
        studio_name = metadata.get('movie_info', {}).get('studio')
        if studio_name:
            content.studio = self.get_or_create_studio(studio_name)
            content.save()
        
        # Add genres
        self.add_genres(content, metadata.get('movie_info', {}).get('genres', []))
        
        # Add countries
        self.add_countries(content, metadata.get('movie_info', {}).get('countries', []))
        
        # Add languages
        self.add_languages(content, metadata)
        
        # Add cast and crew
        self.add_cast_crew(content, metadata)
        
        return content

    def create_season(self, series, season_number, season_path, metadata):
        """Create season record"""
        season = Season.objects.create(
            series=series,
            order=season_number,
            season_name=f"Season {season_number}",
            release_date=series.content.release_date,
            description=f"Season {season_number} of {series.content.title}",
            banner_img_url='',  # Will be processed separately if needed
            rating=series.content.rating,
            status=series.content.status,
            num_episodes=0,  # Will be updated after episodes are created
            age_rank=series.content.age_rank
        )
        
        return season

    def create_episodes_for_season(self, season, season_path, metadata):
        """Create episodes for a season"""
        episodes_created = 0
        
        # Check for episode data in season directory
        episode_files = [f for f in os.listdir(season_path) 
                        if f.startswith('episode_') and f.endswith('.json')]
        
        if not episode_files:
            # Create default episodes based on latest_episodes in metadata
            latest_episodes = metadata.get('movie_info', {}).get('latest_episodes', [])
            for i, ep_data in enumerate(latest_episodes, 1):
                episode = Episode.objects.create(
                    season=season,
                    order=i,
                    title=ep_data.get('title', f'Episode {i}'),
                    description=f'Episode {i} of {season.series.content.title}',
                    banner_img_url='',
                    views=0,
                    duration=24,  # Default 24 minutes
                    intro_duration=90.0,
                    start_intro_time=0.0
                )
                episodes_created += 1
                self.stats['episodes_created'] += 1
        else:
            # Process individual episode files
            for episode_file in sorted(episode_files):
                episode_path = os.path.join(season_path, episode_file)
                with open(episode_path, 'r', encoding='utf-8') as f:
                    episode_data = json.load(f)
                
                episode_number = int(episode_file.split('_')[1].split('.')[0])
                
                episode = Episode.objects.create(
                    season=season,
                    order=episode_number,
                    title=episode_data.get('title', f'Episode {episode_number}'),
                    description=episode_data.get('description', ''),
                    banner_img_url='',
                    views=episode_data.get('views', 0),
                    duration=episode_data.get('duration', 24),
                    intro_duration=90.0,
                    start_intro_time=0.0
                )
                episodes_created += 1
                self.stats['episodes_created'] += 1
        
        # Update season episode count
        season.num_episodes = episodes_created
        season.save()
        
        return episodes_created

    def get_or_create_studio(self, studio_name):
        """Get or create studio"""
        studio, created = Studio.objects.get_or_create(
            name=studio_name,
            defaults={
                'slug': slugify(studio_name)
            }
        )
        return studio

    def add_genres(self, content, genres_list):
        """Add genres to content"""
        for genre_name in genres_list:
            genre, created = Genre.objects.get_or_create(
                name=genre_name,
                defaults={'slug': slugify(genre_name)}
            )
            ContentGenre.objects.get_or_create(content=content, genre=genre)

    def add_countries(self, content, countries_list):
        """Add countries to content"""
        for country_data in countries_list:
            if isinstance(country_data, dict):
                country_name = country_data.get('name', '')
            else:
                country_name = str(country_data)
            
            if country_name:
                # Map Vietnamese country names to codes
                country_code = self.get_country_code(country_name)
                
                nation, created = Nation.objects.get_or_create(
                    name=country_name,
                    defaults={'code': country_code}
                )
                ContentNation.objects.get_or_create(content=content, nation=nation)

    def add_languages(self, content, metadata):
        """Add languages to content"""
        # Default languages based on content
        language_info = metadata.get('movie_info', {}).get('language', 'VietSub')
        
        # Add Vietnamese subtitle by default
        vi_lang, created = Language.objects.get_or_create(
            code='vi',
            defaults={
                'name': 'Vietnamese',
                'native_name': 'Tiếng Việt'
            }
        )
        ContentLanguage.objects.get_or_create(
            content=content,
            language=vi_lang,
            language_type='subtitle'
        )
        
        # Add Japanese audio by default (anime)
        ja_lang, created = Language.objects.get_or_create(
            code='ja',
            defaults={
                'name': 'Japanese',
                'native_name': '日本語'
            }
        )
        ContentLanguage.objects.get_or_create(
            content=content,
            language=ja_lang,
            language_type='audio'
        )

    def add_cast_crew(self, content, metadata):
        """Add cast and crew to content"""
        # Add director
        director_name = metadata.get('movie_info', {}).get('director')
        if director_name:
            person, created = Person.objects.get_or_create(
                name=director_name
            )
            ContentPerson.objects.get_or_create(
                content=content,
                person=person,
                role='director',
                order=1
            )
        
        # Add cast members
        cast_info = metadata.get('cast_info', [])
        for i, cast_member in enumerate(cast_info, 2):
            character_name = cast_member.get('name', '')
            if character_name:
                # For anime, cast members are usually characters, not voice actors
                # We'll treat them as characters for now
                person, created = Person.objects.get_or_create(
                    name=f"Character: {character_name}",
                    defaults={
                        'bio': f'Character from {content.title}'
                    }
                )
                ContentPerson.objects.get_or_create(
                    content=content,
                    person=person,
                    role='voice_actor',
                    character_name=character_name,
                    order=i
                )

    def process_content_images(self, content, source_path):
        """Process and copy content images"""
        media_root = settings.MEDIA_ROOT
        content_media_dir = os.path.join(media_root, 'content', str(content.id))
        
        # Create directory if it doesn't exist
        os.makedirs(content_media_dir, exist_ok=True)
        
        # Process poster
        poster_src = os.path.join(source_path, 'poster.jpg')
        if os.path.exists(poster_src):
            poster_dst = os.path.join(content_media_dir, 'poster.jpg')
            shutil.copy2(poster_src, poster_dst)
            content.poster_img_url = f'/media/content/{content.id}/poster.jpg'
        
        # Process background/banner
        bg_src = os.path.join(source_path, 'background.jpg')
        if os.path.exists(bg_src):
            bg_dst = os.path.join(content_media_dir, 'background.jpg')
            shutil.copy2(bg_src, bg_dst)
            content.banner_img_url = f'/media/content/{content.id}/background.jpg'
        
        content.save()

    # Utility methods
    def parse_duration(self, duration_str):
        """Parse duration string to minutes"""
        if not duration_str:
            return 90
        
        # Extract numbers from string like "90 phút" or "2h 30m"
        import re
        numbers = re.findall(r'\d+', duration_str)
        if numbers:
            if 'h' in duration_str.lower() or 'giờ' in duration_str.lower():
                hours = int(numbers[0]) if numbers else 0
                minutes = int(numbers[1]) if len(numbers) > 1 else 0
                return hours * 60 + minutes
            else:
                return int(numbers[0])
        return 90

    def parse_views(self, views_str):
        """Parse view count string"""
        if not views_str:
            return 0
        
        # Remove commas and convert to int
        views_clean = views_str.replace(',', '').replace('.', '')
        try:
            return int(''.join(filter(str.isdigit, views_clean)))
        except (ValueError, TypeError):
            return 0

    def parse_status(self, status_str):
        """Parse status string to Status enum"""
        if not status_str:
            return Status.ON_GOING
        
        status_lower = status_str.lower()
        if 'full' in status_lower or 'trọn bộ' in status_lower or 'completed' in status_lower:
            return Status.COMPLETED
        return Status.ON_GOING

    def parse_age_rank(self, rating_str):
        """Parse age rating"""
        if not rating_str:
            return 'all'
        
        rating_lower = rating_str.lower()
        if 'pg-13' in rating_lower or '13' in rating_str:
            return 'pg-13'
        elif 'pg' in rating_lower:
            return 'pg'
        elif '18' in rating_str or 'r' in rating_lower:
            return '18+'
        return 'all'

    def get_country_code(self, country_name):
        """Get country code from country name"""
        country_mapping = {
            'Nhật Bản': 'JP',
            'Japan': 'JP',
            'Việt Nam': 'VN',
            'Vietnam': 'VN',
            'Hàn Quốc': 'KR',
            'Korea': 'KR',
            'South Korea': 'KR',
            'Trung Quốc': 'CN',
            'China': 'CN',
            'Mỹ': 'US',
            'United States': 'US',
            'USA': 'US'
        }
        return country_mapping.get(country_name, 'JP')  # Default to Japan for anime

    def print_statistics(self):
        """Print import statistics"""
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('IMPORT COMPLETED'))
        self.stdout.write('='*50)
        self.stdout.write(f'Movies processed: {self.stats["movies_processed"]}')
        self.stdout.write(f'Series processed: {self.stats["series_processed"]}')
        self.stdout.write(f'Seasons created: {self.stats["seasons_created"]}')
        self.stdout.write(f'Episodes created: {self.stats["episodes_created"]}')
        if self.stats['errors'] > 0:
            self.stdout.write(
                self.style.ERROR(f'Errors encountered: {self.stats["errors"]}')
            )
        self.stdout.write('='*50)
