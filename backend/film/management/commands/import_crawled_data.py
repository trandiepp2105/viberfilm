#!/usr/bin/env python3
"""
Django management command to import crawled anime data with automatic episode completion
Automatically creates missing episodes based on existing episodes
"""

import os
import json
import logging
import shutil
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify
from django.conf import settings
from film.models import (
    Content, ContentTypeChoices, Movie, Series, Season, Episode,
    Genre, Nation, Person, Studio, Language,
    ContentGenre, ContentNation, ContentPerson
)
from django.utils.dateparse import parse_date
from django.core.files.base import ContentFile
import requests
from urllib.parse import urlparse
import re

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Import crawled anime data with automatic episode completion into database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--data-dir',
            type=str,
            default='craw-data',
            help='Directory containing crawled data'
        )
        parser.add_argument(
            '--limit',
            type=int,
            help='Limit number of items to import (for testing)'
        )
        parser.add_argument(
            '--movies-only',
            action='store_true',
            help='Import only movies'
        )
        parser.add_argument(
            '--series-only',
            action='store_true',
            help='Import only series'
        )
        parser.add_argument(
            '--complete-episodes',
            action='store_true',
            default=True,
            help='Automatically complete missing episodes'
        )

    def handle(self, *args, **options):
        self.data_dir = options['data_dir']
        self.limit = options.get('limit')
        self.movies_only = options['movies_only']
        self.series_only = options['series_only']
        self.complete_episodes = options['complete_episodes']
        
        self.movies_dir = os.path.join(self.data_dir, 'movies')
        self.series_dir = os.path.join(self.data_dir, 'series')
        
        self.stats = {
            'movies_processed': 0,
            'series_processed': 0,
            'seasons_created': 0,
            'episodes_created': 0,
            'episodes_faked': 0,
            'errors': 0
        }
        
        self.stdout.write(
            self.style.SUCCESS(
                f'🎬 Starting import from: {self.data_dir}'
            )
        )
        
        try:
            if not self.series_only:
                self.import_movies()
            
            if not self.movies_only:
                self.import_series()
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Import failed: {str(e)}')
            )
            logger.error(f"Import error: {str(e)}", exc_info=True)
        
        # Final statistics
        self.print_final_stats()

    def import_movies(self):
        """Import movies data"""
        if not os.path.exists(self.movies_dir):
            self.stdout.write(self.style.WARNING('Movies directory not found'))
            return
            
        self.stdout.write('🎭 Importing movies...')
        
        movie_dirs = [d for d in os.listdir(self.movies_dir) 
                     if os.path.isdir(os.path.join(self.movies_dir, d))]
        
        if self.limit:
            movie_dirs = movie_dirs[:self.limit]
        
        for movie_dir in movie_dirs:
            try:
                movie_path = os.path.join(self.movies_dir, movie_dir)
                metadata_file = os.path.join(movie_path, 'metadata.json')
                
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
                    self.stdout.write(f'✅ Processed {self.stats["movies_processed"]} movies')
                    
            except Exception as e:
                self.stats['errors'] += 1
                self.stdout.write(
                    self.style.ERROR(f'Error processing movie {movie_dir}: {str(e)}')
                )

    def import_series(self):
        """Import series data"""
        if not os.path.exists(self.series_dir):
            self.stdout.write(self.style.WARNING('Series directory not found'))
            return
            
        self.stdout.write('📺 Importing series...')
        
        series_dirs = [d for d in os.listdir(self.series_dir) 
                      if os.path.isdir(os.path.join(self.series_dir, d))]
        
        if self.limit:
            series_dirs = series_dirs[:self.limit]
        
        for series_dir in series_dirs:
            try:
                series_path = os.path.join(self.series_dir, series_dir)
                metadata_file = os.path.join(series_path, 'metadata.json')
                
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
                    self.stdout.write(f'✅ Processed {self.stats["series_processed"]} series')
                    
            except Exception as e:
                self.stats['errors'] += 1
                self.stdout.write(
                    self.style.ERROR(f'Error processing series {series_dir}: {str(e)}')
                )

    def create_movie(self, metadata, movie_path):
        """Create movie content"""
        # Create base content
        content = self.create_base_content(metadata, ContentTypeChoices.MOVIE)
        
        # Extract duration from metadata, default to 120 minutes if not found
        duration = 120  # Default 2 hours
        if 'duration' in metadata:
            try:
                duration = int(metadata['duration'])
            except (ValueError, TypeError):
                pass
        
        # Create movie record
        movie = Movie.objects.create(
            content=content,
            duration=duration
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
        """Create base Content record"""
        
        # Clean up title
        title = metadata.get('title', 'Unknown Title').strip()
        if not title:
            title = 'Unknown Title'
        
        # Parse release date with fallback to default
        release_date = None
        year = metadata.get('year') or metadata.get('năm')
        if year:
            try:
                if isinstance(year, str):
                    year = year.strip()
                    if year.isdigit():
                        release_date = parse_date(f"{year}-01-01")
                elif isinstance(year, int):
                    release_date = parse_date(f"{year}-01-01")
            except:
                pass
        
        # Default to current year if no valid date found
        if not release_date:
            from datetime import date
            release_date = parse_date("2024-01-01")
        
        # Create content
        content = Content.objects.create(
            title=title,
            description=metadata.get('description', '')[:1000],  # Limit description length
            content_type=content_type,
            release_date=release_date,
            banner_img_url='',  # Default empty banner image URL
            status='completed'  # Default status
        )
        
        # Handle genres
        genres = metadata.get('genres', [])
        if isinstance(genres, str):
            genres = [genres]
        
        for genre_name in genres[:5]:  # Limit to 5 genres
            if genre_name and len(genre_name.strip()) > 0:
                genre_name_clean = genre_name.strip()[:50]
                genre_slug = slugify(genre_name_clean)
                
                genre, created = Genre.objects.get_or_create(
                    name=genre_name_clean,
                    defaults={'slug': genre_slug}
                )
                ContentGenre.objects.get_or_create(
                    content=content,
                    genre=genre
                )
        
        # Handle nations/countries
        countries = metadata.get('countries') or metadata.get('nations', [])
        if isinstance(countries, str):
            countries = [countries]
            
        for country_name in countries[:3]:  # Limit to 3 countries
            if country_name and len(country_name.strip()) > 0:
                country_name_clean = country_name.strip()[:50]
                # Generate country code from name (first 2 characters, uppercase)
                country_code = country_name_clean[:2].upper()
                
                nation, created = Nation.objects.get_or_create(
                    name=country_name_clean,
                    defaults={'code': country_code}
                )
                ContentNation.objects.get_or_create(
                    content=content,
                    nation=nation
                )
        
        return content

    def create_season(self, series, season_number, season_path, metadata):
        """Create season record"""
        season_metadata_file = os.path.join(season_path, 'metadata.json')
        season_metadata = {}
        
        if os.path.exists(season_metadata_file):
            try:
                with open(season_metadata_file, 'r', encoding='utf-8') as f:
                    season_metadata = json.load(f)
            except:
                pass
        
        season = Season.objects.create(
            series=series,
            order=season_number,  # Season model uses 'order' field
            season_name=season_metadata.get('title', f"{series.content.title} - Season {season_number}"),
            description=season_metadata.get('description', metadata.get('description', ''))[:1000],
            release_date=series.content.release_date,
            banner_img_url='',  # Add default empty value
            num_episodes=0  # Will be updated later
        )
        
        return season

    def create_episodes_for_season(self, season, season_path, metadata):
        """Create episodes for a season with auto-completion"""
        episode_dirs = [d for d in os.listdir(season_path) 
                       if os.path.isdir(os.path.join(season_path, d)) and d.startswith('episode_')]
        
        if not episode_dirs:
            return 0
        
        # Get existing episode numbers
        existing_episodes = []
        episode_metadata_template = None
        
        for episode_dir in episode_dirs:
            episode_path = os.path.join(season_path, episode_dir)
            episode_metadata_file = os.path.join(episode_path, 'metadata.json')
            
            if os.path.exists(episode_metadata_file):
                try:
                    with open(episode_metadata_file, 'r', encoding='utf-8') as f:
                        episode_metadata = json.load(f)
                    
                    episode_number = int(episode_metadata.get('episode_number', episode_dir.split('_')[1]))
                    existing_episodes.append(episode_number)
                    
                    # Use first episode as template for missing episodes
                    if episode_metadata_template is None:
                        episode_metadata_template = episode_metadata.copy()
                        
                except Exception as e:
                    logger.warning(f"Error reading episode metadata {episode_metadata_file}: {e}")
                    continue
        
        if not existing_episodes:
            return 0
        
        existing_episodes.sort()
        min_episode = min(existing_episodes)
        max_episode = max(existing_episodes)
        
        # Create missing episodes if auto-completion is enabled
        if self.complete_episodes and episode_metadata_template:
            all_episodes_to_create = list(range(1, max_episode + 1))
            
            for ep_num in all_episodes_to_create:
                if ep_num not in existing_episodes:
                    # Create fake episode based on template
                    self.create_fake_episode(season, ep_num, episode_metadata_template)
                    self.stats['episodes_faked'] += 1
                else:
                    # Create real episode
                    episode_dir = f"episode_{ep_num}"
                    episode_path = os.path.join(season_path, episode_dir)
                    self.create_real_episode(season, episode_path)
                    
                self.stats['episodes_created'] += 1
        else:
            # Only create existing episodes
            for episode_dir in episode_dirs:
                episode_path = os.path.join(season_path, episode_dir)
                self.create_real_episode(season, episode_path)
                self.stats['episodes_created'] += 1
        
        return len(existing_episodes) + (self.stats['episodes_faked'] if self.complete_episodes else 0)

    def create_real_episode(self, season, episode_path):
        """Create episode from real metadata"""
        episode_metadata_file = os.path.join(episode_path, 'metadata.json')
        
        if not os.path.exists(episode_metadata_file):
            return None
        
        try:
            with open(episode_metadata_file, 'r', encoding='utf-8') as f:
                episode_metadata = json.load(f)
        except:
            return None
        
        episode_number = int(episode_metadata.get('episode_number', 1))
        episode_title = episode_metadata.get('title', f'Episode {episode_number}')
        
        # Clean episode title - if it's just a number, make it more descriptive
        if episode_title.isdigit() or episode_title == str(episode_number):
            episode_title = f"Tập {episode_number}"
        
        episode = Episode.objects.create(
            season=season,
            order=episode_number,
            title=episode_title,
            description=f"Tập {episode_number} của {season.series.content.title}",
            banner_img_url='',  # Default empty banner image URL
            duration=30,  # Default 30 minutes
        )
        
        return episode

    def create_fake_episode(self, season, episode_number, template_metadata):
        """Create fake episode based on template"""
        episode_title = f"Tập {episode_number}"
        
        episode = Episode.objects.create(
            season=season,
            order=episode_number,
            title=episode_title,
            description=f"Tập {episode_number} của {season.series.content.title}",
            banner_img_url='',  # Default empty banner image URL
            duration=30,  # Default 30 minutes
        )
        
        logger.info(f"Created fake episode {episode_number} for {season.series.content.title}")
        return episode

    def process_content_images(self, content, content_path):
        """Process and save content images"""
        # Ensure media directories exist
        media_root = settings.MEDIA_ROOT
        assets_dir = os.path.join(media_root, 'assets')
        os.makedirs(assets_dir, exist_ok=True)
        
        # Handle poster image
        poster_path = os.path.join(content_path, 'poster.jpg')
        if os.path.exists(poster_path):
            try:
                poster_filename = f"content_{content.id}_poster.jpg"
                poster_dest = os.path.join(assets_dir, poster_filename)
                shutil.copy2(poster_path, poster_dest)
                content.poster_img_url = f"media/assets/{poster_filename}"
            except Exception as e:
                logger.warning(f"Failed to save poster for {content.title}: {e}")
        
        # Handle background image
        background_path = os.path.join(content_path, 'background.jpg')
        if os.path.exists(background_path):
            try:
                background_filename = f"content_{content.id}_background.jpg"
                background_dest = os.path.join(assets_dir, background_filename)
                shutil.copy2(background_path, background_dest)
                content.banner_img_url = f"media/assets/{background_filename}"
            except Exception as e:
                logger.warning(f"Failed to save background for {content.title}: {e}")
        
        content.save()

    def print_final_stats(self):
        """Print final import statistics"""
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('🎉 IMPORT COMPLETED'))
        self.stdout.write('='*50)
        self.stdout.write(f"🎭 Movies processed: {self.stats['movies_processed']}")
        self.stdout.write(f"📺 Series processed: {self.stats['series_processed']}")
        self.stdout.write(f"📁 Seasons created: {self.stats['seasons_created']}")
        self.stdout.write(f"🎞️  Episodes created: {self.stats['episodes_created']}")
        self.stdout.write(f"🎭 Episodes faked: {self.stats['episodes_faked']}")
        self.stdout.write(f"❌ Errors: {self.stats['errors']}")
        
        total_content = self.stats['movies_processed'] + self.stats['series_processed']
        if total_content > 0:
            success_rate = ((total_content - self.stats['errors']) / total_content) * 100
            self.stdout.write(f"📈 Success rate: {success_rate:.1f}%")
        
        self.stdout.write(self.style.SUCCESS('\n✅ Import process finished!'))
