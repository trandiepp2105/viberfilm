#!/usr/bin/env python3
"""
Django management command to clean old data and media files
"""
import os
import shutil
from django.core.management.base import BaseCommand
from django.db import transaction
from django.conf import settings
from film.models import *
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Clean all old data and media files'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirm deletion without prompting'
        )
        parser.add_argument(
            '--keep-users',
            action='store_true',
            help='Keep user accounts and auth data'
        )

    def handle(self, *args, **options):
        self.confirm = options['confirm']
        self.keep_users = options['keep_users']
        
        if not self.confirm:
            self.stdout.write(
                self.style.WARNING(
                    '⚠️  This will DELETE ALL film data and media files!'
                )
            )
            response = input("Are you sure you want to continue? (yes/no): ")
            if response.lower() != 'yes':
                self.stdout.write("Operation cancelled.")
                return

        self.stdout.write(
            self.style.SUCCESS('🧹 Starting cleanup...')
        )

        try:
            # Step 1: Clean database
            self.clean_database()
            
            # Step 2: Clean media files
            self.clean_media_files()
            
            self.stdout.write(
                self.style.SUCCESS('✅ Cleanup completed successfully!')
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Cleanup failed: {str(e)}')
            )
            raise

    def clean_database(self):
        """Clean all film-related data from database"""
        self.stdout.write('🗃️  Cleaning database...')
        
        with transaction.atomic():
            # Delete in correct order to avoid foreign key constraints
            
            # Episodes first
            episode_count = Episode.objects.count()
            Episode.objects.all().delete()
            self.stdout.write(f'  Deleted {episode_count} episodes')
            
            # Seasons
            season_count = Season.objects.count()
            Season.objects.all().delete()
            self.stdout.write(f'  Deleted {season_count} seasons')
            
            # Series and Movies
            series_count = Series.objects.count()
            Series.objects.all().delete()
            self.stdout.write(f'  Deleted {series_count} series')
            
            movie_count = Movie.objects.count()
            Movie.objects.all().delete()
            self.stdout.write(f'  Deleted {movie_count} movies')
            
            # Content relationships
            ContentGenre.objects.all().delete()
            ContentNation.objects.all().delete()
            ContentPerson.objects.all().delete()
            
            # Content
            content_count = Content.objects.count()
            Content.objects.all().delete()
            self.stdout.write(f'  Deleted {content_count} content items')
            
            # Reference data (optional - keep for reuse)
            genre_count = Genre.objects.count()
            Genre.objects.all().delete()
            self.stdout.write(f'  Deleted {genre_count} genres')
            
            nation_count = Nation.objects.count()
            Nation.objects.all().delete()
            self.stdout.write(f'  Deleted {nation_count} nations')
            
            person_count = Person.objects.count()
            Person.objects.all().delete()
            self.stdout.write(f'  Deleted {person_count} persons')
            
            studio_count = Studio.objects.count()
            Studio.objects.all().delete()
            self.stdout.write(f'  Deleted {studio_count} studios')
            
            tag_count = Tag.objects.count()
            Tag.objects.all().delete()
            self.stdout.write(f'  Deleted {tag_count} tags')

            # Clean video data
            from video.models import Video
            video_count = Video.objects.count()
            Video.objects.all().delete()
            self.stdout.write(f'  Deleted {video_count} videos')

    def clean_media_files(self):
        """Clean all media files"""
        self.stdout.write('📁 Cleaning media files...')
        
        media_root = settings.MEDIA_ROOT
        if not os.path.exists(media_root):
            self.stdout.write('  Media directory does not exist')
            return
        
        # Directories to clean
        dirs_to_clean = [
            'posters',
            'banners', 
            'backgrounds',
            'videos',
            'thumbnails',
            'images'
        ]
        
        total_deleted = 0
        
        for dir_name in dirs_to_clean:
            dir_path = os.path.join(media_root, dir_name)
            if os.path.exists(dir_path):
                # Count files first
                file_count = 0
                for root, dirs, files in os.walk(dir_path):
                    file_count += len(files)
                
                # Delete directory
                shutil.rmtree(dir_path)
                self.stdout.write(f'  Deleted {file_count} files from {dir_name}/')
                total_deleted += file_count
                
                # Recreate empty directory
                os.makedirs(dir_path, exist_ok=True)
        
        # Clean any remaining files in media root
        for item in os.listdir(media_root):
            item_path = os.path.join(media_root, item)
            if os.path.isfile(item_path):
                os.remove(item_path)
                total_deleted += 1
        
        self.stdout.write(f'  Total files deleted: {total_deleted}')
