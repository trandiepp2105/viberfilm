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
    Genre, Tag, Nation, ContentGenre, ContentTag, ContentNation,
    Status, ContentTypeChoices
)

class Command(BaseCommand):
    help = 'Import crawled anime data into database'

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

    def handle(self, *args, **options):
        self.dry_run = options['dry_run']
        self.movies_dir = os.path.join(settings.BASE_DIR, options['movies_dir'])
        self.series_dir = os.path.join(settings.BASE_DIR, options['series_dir'])
        
        self.stdout.write(
            self.style.SUCCESS('Starting anime data import...')
        )
        
        if self.dry_run:
            self.stdout.write(
                self.style.WARNING('DRY RUN MODE - No changes will be made')
            )
        
        # Statistics
        self.stats = {
            'movies_imported': 0,
            'series_imported': 0,
            'seasons_imported': 0,
            'episodes_imported': 0,
            'genres_created': 0,
            'nations_created': 0,
            'images_moved': 0,
            'errors': 0
        }
        
        try:
            with transaction.atomic():
                if not self.dry_run:
                    self.create_media_directories()
                
                self.import_movies()
                self.import_series()
                
                if self.dry_run:
                    transaction.set_rollback(True)
                    
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error during import: {str(e)}')
            )
            raise CommandError(f'Import failed: {str(e)}')
        
        self.print_statistics()

    def create_media_directories(self):
        """Create necessary media directories"""
        assets_dir = os.path.join(settings.MEDIA_ROOT, 'assets')
        videos_dir = os.path.join(settings.MEDIA_ROOT, 'videos')
        
        os.makedirs(assets_dir, exist_ok=True)
        os.makedirs(videos_dir, exist_ok=True)
        
        self.stdout.write(f'Created media directories: {assets_dir}, {videos_dir}')

    def import_movies(self):
        """Import movie data"""
        if not os.path.exists(self.movies_dir):
            self.stdout.write(
                self.style.WARNING(f'Movies directory not found: {self.movies_dir}')
            )
            return
        
        movie_dirs = [d for d in os.listdir(self.movies_dir) 
                     if d.startswith('movie_') and 
                     os.path.isdir(os.path.join(self.movies_dir, d))]
        
        self.stdout.write(f'Found {len(movie_dirs)} movies to import')
        
        for movie_dir in sorted(movie_dirs):
            try:
                self.import_single_movie(movie_dir)
            except Exception as e:
                self.stats['errors'] += 1
                self.stdout.write(
                    self.style.ERROR(f'Error importing movie {movie_dir}: {str(e)}')
                )

    def import_single_movie(self, movie_dir):
        """Import a single movie"""
        movie_path = os.path.join(self.movies_dir, movie_dir)
        metadata_file = os.path.join(movie_path, 'metadata.txt')
        
        if not os.path.exists(metadata_file):
            raise Exception(f'Metadata file not found: {metadata_file}')
        
        with open(metadata_file, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
        
        # Create Content
        content_data = self.extract_content_data(metadata, ContentTypeChoices.MOVIE)
        
        if self.dry_run:
            self.stdout.write(f'Would create movie: {content_data["title"]}')
            self.stats['movies_imported'] += 1
            return
        
        content = Content.objects.create(**content_data)
        
        # Move images and update URLs
        self.move_images(movie_path, content)
        
        # Create Movie
        movie_data = self.extract_movie_data(metadata)
        Movie.objects.create(content=content, **movie_data)
        
        # Add relationships
        self.add_genres(content, metadata)
        self.add_nations(content, metadata)
        
        self.stats['movies_imported'] += 1
        self.stdout.write(f'Imported movie: {content.title}')

    def import_series(self):
        """Import series data"""
        if not os.path.exists(self.series_dir):
            self.stdout.write(
                self.style.WARNING(f'Series directory not found: {self.series_dir}')
            )
            return
        
        series_dirs = [d for d in os.listdir(self.series_dir) 
                      if d.startswith('series_') and 
                      os.path.isdir(os.path.join(self.series_dir, d))]
        
        self.stdout.write(f'Found {len(series_dirs)} series to import')
        
        for series_dir in sorted(series_dirs):
            try:
                self.import_single_series(series_dir)
            except Exception as e:
                self.stats['errors'] += 1
                self.stdout.write(
                    self.style.ERROR(f'Error importing series {series_dir}: {str(e)}')
                )

    def import_single_series(self, series_dir):
        """Import a single series"""
        series_path = os.path.join(self.series_dir, series_dir)
        metadata_file = os.path.join(series_path, 'metadata.txt')
        
        if not os.path.exists(metadata_file):
            raise Exception(f'Metadata file not found: {metadata_file}')
        
        with open(metadata_file, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
        
        # Create Content
        content_data = self.extract_content_data(metadata, ContentTypeChoices.SERIES)
        
        if self.dry_run:
            self.stdout.write(f'Would create series: {content_data["title"]}')
            self.stats['series_imported'] += 1
            return
        
        content = Content.objects.create(**content_data)
        
        # Move images and update URLs
        self.move_images(series_path, content)
        
        # Create Series
        series_data = self.extract_series_data(metadata)
        series = Series.objects.create(content=content, **series_data)
        
        # Create Season (default season 1)
        season_data = self.extract_season_data(metadata)
        season = Season.objects.create(series=series, **season_data)
        
        # Create Episodes
        self.create_episodes(season, metadata)
        
        # Add relationships
        self.add_genres(content, metadata)
        self.add_nations(content, metadata)
        
        self.stats['series_imported'] += 1
        self.stats['seasons_imported'] += 1
        self.stdout.write(f'Imported series: {content.title}')

    def extract_content_data(self, metadata, content_type):
        """Extract common content data"""
        title = metadata.get('title', '').strip()
        if not title:
            raise Exception('Title is required')
        
        # Create unique slug
        base_slug = slugify(title)[:250]  # Ensure max length for MySQL
        slug = base_slug
        counter = 1
        
        # Check for existing slug (skip if dry run)
        if not self.dry_run:
            while Content.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"[:250]
                counter += 1
        
        # Extract year from metadata with fallback
        year = metadata.get('year', '2023')
        try:
            year_int = int(str(year)[:4])  # Take first 4 digits
            if year_int < 1900 or year_int > 2030:
                year_int = 2023
            release_date = f"{year_int}-01-01"
        except (ValueError, TypeError):
            release_date = "2023-01-01"
        
        # Extract rating with better error handling
        rating_score = metadata.get('rating_score', '0')
        try:
            rating = float(str(rating_score).replace(',', '.'))
            rating = max(0, min(10, rating))  # Clamp between 0-10
        except (ValueError, TypeError):
            rating = 0
        
        # Extract view count with better parsing
        view_count_str = metadata.get('view_count', '0')
        try:
            # Remove commas and convert to int
            view_count = int(str(view_count_str).replace(',', '').replace('.', ''))
            view_count = max(0, view_count)  # Ensure non-negative
        except (ValueError, TypeError):
            view_count = 0
        
        return {
            'title': title[:255],  # Ensure max length
            'content_type': content_type,
            'slug': slug,
            'release_date': release_date,
            'description': metadata.get('description', '')[:1000],  # Limit description length
            'banner_img_url': '',  # Will be updated after moving images
            'poster_img_url': '',  # Will be updated after moving images
            'rating': rating,
            'views': view_count,
            'status': Status.COMPLETED,
            'age_rank': 'PG-13'
        }

    def extract_movie_data(self, metadata):
        """Extract movie-specific data"""
        # Extract duration from multiple possible sources
        duration_str = (
            metadata.get('episode_progress', '') or 
            metadata.get('movie_info', {}).get('duration', '') or
            metadata.get('duration', '')
        )
        duration = self.parse_duration(duration_str)
        
        return {
            'duration': duration,
            'intro_duration': 0,
            'start_intro_time': 0
        }

    def extract_series_data(self, metadata):
        """Extract series-specific data"""
        # Count episodes from latest_episodes
        latest_episodes = metadata.get('movie_info', {}).get('latest_episodes', [])
        total_episodes = len(latest_episodes)
        
        return {
            'total_seasons': 1,
            'total_episodes': total_episodes
        }

    def extract_season_data(self, metadata):
        """Extract season data for series"""
        title = metadata.get('title', '')
        
        # Extract year for release date
        year = metadata.get('year', '2023')
        try:
            year_int = int(str(year)[:4])
            if year_int < 1900 or year_int > 2030:
                year_int = 2023
            release_date = f"{year_int}-01-01"
        except (ValueError, TypeError):
            release_date = "2023-01-01"
        
        return {
            'order': 1,
            'season_name': f"Season 1",
            'release_date': release_date,
            'description': metadata.get('description', '')[:1000],  # Limit length
            'banner_img_url': '',  # Will be updated
            'rating': 0,
            'status': Status.COMPLETED,
            'num_episodes': len(metadata.get('movie_info', {}).get('latest_episodes', [])),
            'age_rank': 'PG-13'
        }

    def create_episodes(self, season, metadata):
        """Create episodes for a season"""
        latest_episodes = metadata.get('movie_info', {}).get('latest_episodes', [])
        
        for i, episode_data in enumerate(latest_episodes, 1):
            episode = Episode.objects.create(
                season=season,
                order=i,
                title=episode_data.get('title', f'Episode {i}'),
                description=f"Episode {i}",
                banner_img_url='',
                duration=24,  # Default 24 minutes
                views=0
            )
            self.stats['episodes_imported'] += 1

    def move_images(self, source_path, content):
        """Move images to media/assets and update content URLs"""
        assets_dir = os.path.join(settings.MEDIA_ROOT, 'assets')
        
        # Move poster
        poster_src = os.path.join(source_path, 'poster.jpg')
        if os.path.exists(poster_src):
            poster_filename = f"content_{content.id}_poster.jpg"
            poster_dst = os.path.join(assets_dir, poster_filename)
            if not self.dry_run:
                shutil.copy2(poster_src, poster_dst)
                content.poster_img_url = f"media/assets/{poster_filename}"
                self.stats['images_moved'] += 1
        
        # Move background
        background_src = os.path.join(source_path, 'background.jpg')
        if os.path.exists(background_src):
            background_filename = f"content_{content.id}_background.jpg"
            background_dst = os.path.join(assets_dir, background_filename)
            if not self.dry_run:
                shutil.copy2(background_src, background_dst)
                content.banner_img_url = f"media/assets/{background_filename}"
                self.stats['images_moved'] += 1
        
        if not self.dry_run:
            content.save()

    def add_genres(self, content, metadata):
        """Add genres to content"""
        genres = metadata.get('movie_info', {}).get('genres', [])
        
        for genre_name in genres:
            if not genre_name or genre_name.strip() == '':
                continue
                
            genre_name = genre_name.strip()
            slug = slugify(genre_name)
            
            if not self.dry_run:
                genre, created = Genre.objects.get_or_create(
                    name=genre_name,
                    defaults={'slug': slug}
                )
                if created:
                    self.stats['genres_created'] += 1
                
                ContentGenre.add(content.id, genre.id)

    def add_nations(self, content, metadata):
        """Add nations to content"""
        countries = metadata.get('movie_info', {}).get('countries', [])
        
        for country_data in countries:
            if isinstance(country_data, dict):
                country_name = country_data.get('name', '').strip()
            else:
                country_name = str(country_data).strip()
            
            if not country_name:
                continue
            
            # Map country names to codes
            country_code = self.get_country_code(country_name)
            
            if not self.dry_run:
                nation, created = Nation.objects.get_or_create(
                    name=country_name,
                    defaults={'code': country_code}
                )
                if created:
                    self.stats['nations_created'] += 1
                
                ContentNation.add(content.id, nation.id)

    def get_country_code(self, country_name):
        """Get country code from country name"""
        country_map = {
            'Nhật Bản': 'JP',
            'Hàn Quốc': 'KR', 
            'Trung Quốc': 'CN',
            'Mỹ': 'US',
            'Anh': 'GB',
            'Pháp': 'FR',
            'Đức': 'DE'
        }
        return country_map.get(country_name, 'JP')  # Default to Japan

    def parse_duration(self, duration_str):
        """Parse duration string to minutes"""
        if not duration_str:
            return 120  # Default 2 hours
        
        duration_str = duration_str.lower()
        
        if 'phút' in duration_str:
            try:
                return int(duration_str.replace('phút', '').strip())
            except:
                pass
        
        if 'giờ' in duration_str:
            try:
                hours = float(duration_str.replace('giờ', '').strip())
                return int(hours * 60)
            except:
                pass
        
        # Try to extract number
        import re
        numbers = re.findall(r'\d+', duration_str)
        if numbers:
            return int(numbers[0])
        
        return 120  # Default

    def print_statistics(self):
        """Print import statistics"""
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('IMPORT STATISTICS'))
        self.stdout.write('='*50)
        self.stdout.write(f'Movies imported: {self.stats["movies_imported"]}')
        self.stdout.write(f'Series imported: {self.stats["series_imported"]}') 
        self.stdout.write(f'Seasons created: {self.stats["seasons_imported"]}')
        self.stdout.write(f'Episodes created: {self.stats["episodes_imported"]}')
        self.stdout.write(f'Genres created: {self.stats["genres_created"]}')
        self.stdout.write(f'Nations created: {self.stats["nations_created"]}')
        self.stdout.write(f'Images moved: {self.stats["images_moved"]}')
        self.stdout.write(f'Errors: {self.stats["errors"]}')
        self.stdout.write('='*50)
