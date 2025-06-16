from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from film.models import Content, Series, Movie, Season, Episode, ContentTypeChoices, Status
from django.utils import timezone


class Command(BaseCommand):
    help = 'Convert completed series with 0 episodes to movies'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be converted without actually converting',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force conversion without confirmation',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        force = options['force']

        self.stdout.write(
            self.style.SUCCESS('Starting conversion check for series to movies...')
        )

        # Find completed series with 0 episodes
        series_to_convert = []
        
        # Get all series that are completed
        completed_series = Series.objects.filter(
            content__status=Status.COMPLETED
        ).select_related('content')

        self.stdout.write(f"Found {completed_series.count()} completed series total")

        for series in completed_series:
            # Count total episodes across all seasons
            total_episodes = Episode.objects.filter(
                season__series=series
            ).count()

            if total_episodes == 0:
                series_to_convert.append({
                    'series': series,
                    'content': series.content,
                    'total_episodes': total_episodes,
                    'total_seasons': series.total_seasons,
                })

        if not series_to_convert:
            self.stdout.write(
                self.style.SUCCESS('No series found that need to be converted to movies')
            )
            return

        self.stdout.write(
            self.style.WARNING(f"Found {len(series_to_convert)} series that should be converted to movies:")
        )

        # Display series that will be converted
        for item in series_to_convert:
            series = item['series']
            content = item['content']
            self.stdout.write(
                f"  - ID: {content.id}, Title: '{content.title}', "
                f"Episodes: {item['total_episodes']}, Seasons: {item['total_seasons']}"
            )

        if dry_run:
            self.stdout.write(
                self.style.SUCCESS('DRY RUN: No changes were made. Use --force to actually convert.')
            )
            return

        # Ask for confirmation unless force is used
        if not force:
            confirm = input(
                f"\nAre you sure you want to convert {len(series_to_convert)} series to movies? "
                "This action cannot be undone easily. Type 'yes' to continue: "
            )
            if confirm.lower() != 'yes':
                self.stdout.write(self.style.ERROR('Conversion cancelled.'))
                return

        # Perform the conversion
        converted_count = 0
        failed_conversions = []

        for item in series_to_convert:
            series = item['series']
            content = item['content']
            
            try:
                with transaction.atomic():
                    # Update content type to movie
                    content.content_type = ContentTypeChoices.MOVIE
                    content.save()

                    # Create Movie instance
                    movie = Movie.objects.create(
                        content=content,
                        duration=120,  # Default 2 hours, can be updated later
                        intro_duration=0,
                        start_intro_time=0,
                        video=None  # Will be set later if needed
                    )

                    # Delete series-related data
                    # Delete all seasons (which will cascade delete episodes)
                    Season.objects.filter(series=series).delete()
                    
                    # Delete the series instance
                    series.delete()

                    converted_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"✓ Converted '{content.title}' (ID: {content.id}) from series to movie"
                        )
                    )

            except Exception as e:
                failed_conversions.append({
                    'content': content,
                    'error': str(e)
                })
                self.stdout.write(
                    self.style.ERROR(
                        f"✗ Failed to convert '{content.title}' (ID: {content.id}): {e}"
                    )
                )

        # Summary
        self.stdout.write("\n" + "="*50)
        self.stdout.write(
            self.style.SUCCESS(f"Conversion completed! {converted_count} series converted to movies.")
        )

        if failed_conversions:
            self.stdout.write(
                self.style.ERROR(f"{len(failed_conversions)} conversions failed:")
            )
            for failed in failed_conversions:
                self.stdout.write(f"  - {failed['content'].title}: {failed['error']}")

        self.stdout.write(
            self.style.SUCCESS("Recommendation: Review the converted movies and update their duration if needed.")
        )
