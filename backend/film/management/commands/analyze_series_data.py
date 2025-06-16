from django.core.management.base import BaseCommand
from film.models import Content, Series, Movie, Season, Episode, Status
from django.db.models import Count


class Command(BaseCommand):
    help = 'Analyze series data to identify potential movies misclassified as series'

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('Analyzing series data...')
        )

        # Get all series
        all_series = Series.objects.select_related('content').all()
        total_series = all_series.count()

        # Analyze by status
        completed_series = all_series.filter(content__status=Status.COMPLETED)
        ongoing_series = all_series.filter(content__status=Status.ON_GOING)

        self.stdout.write(f"Total series: {total_series}")
        self.stdout.write(f"  - Completed: {completed_series.count()}")
        self.stdout.write(f"  - Ongoing: {ongoing_series.count()}")

        # Find series with 0 episodes
        series_with_episodes = []
        series_without_episodes = []

        for series in all_series:
            episode_count = Episode.objects.filter(season__series=series).count()
            season_count = Season.objects.filter(series=series).count()
            
            series_data = {
                'series': series,
                'content': series.content,
                'episode_count': episode_count,
                'season_count': season_count,
                'status': series.content.status
            }
            
            if episode_count == 0:
                series_without_episodes.append(series_data)
            else:
                series_with_episodes.append(series_data)

        self.stdout.write("\n" + "="*60)
        self.stdout.write(
            self.style.WARNING(f"Series with 0 episodes: {len(series_without_episodes)}")
        )

        if series_without_episodes:
            self.stdout.write("\nSeries that have no episodes:")
            for data in series_without_episodes:
                content = data['content']
                status_display = data['status']
                if data['status'] == Status.COMPLETED:
                    status_color = self.style.SUCCESS(status_display)
                else:
                    status_color = self.style.WARNING(status_display)
                self.stdout.write(
                    f"  - ID: {content.id:3d} | Status: {status_color:9s} | "
                    f"Seasons: {data['season_count']:2d} | Title: '{content.title}'"
                )

            # Focus on completed series with 0 episodes
            completed_no_episodes = [
                data for data in series_without_episodes 
                if data['status'] == Status.COMPLETED
            ]

            if completed_no_episodes:
                self.stdout.write(
                    self.style.ERROR(
                        f"\n🎯 CANDIDATES FOR CONVERSION TO MOVIES: {len(completed_no_episodes)}"
                    )
                )
                self.stdout.write("These completed series have no episodes and should likely be movies:")
                for data in completed_no_episodes:
                    content = data['content']
                    self.stdout.write(
                        f"  ➤ ID: {content.id:3d} | '{content.title}' | Seasons: {data['season_count']}"
                    )

        self.stdout.write("\n" + "="*60)
        self.stdout.write(
            self.style.SUCCESS(f"Series with episodes: {len(series_with_episodes)}")
        )

        # Show episode distribution
        if series_with_episodes:
            episode_distribution = {}
            for data in series_with_episodes:
                count = data['episode_count']
                if count not in episode_distribution:
                    episode_distribution[count] = 0
                episode_distribution[count] += 1

            self.stdout.write("\nEpisode count distribution:")
            for episode_count in sorted(episode_distribution.keys()):
                series_count = episode_distribution[episode_count]
                self.stdout.write(f"  {episode_count:3d} episodes: {series_count:3d} series")

        # Summary and recommendations
        self.stdout.write("\n" + "="*60)
        self.stdout.write(self.style.SUCCESS("SUMMARY & RECOMMENDATIONS:"))
        
        if series_without_episodes:
            completed_no_episodes = [
                data for data in series_without_episodes 
                if data['status'] == Status.COMPLETED
            ]
            
            if completed_no_episodes:
                self.stdout.write(
                    self.style.WARNING(
                        f"• {len(completed_no_episodes)} completed series with 0 episodes "
                        "should be converted to movies"
                    )
                )
                self.stdout.write(
                    "  Run: python manage.py convert_series_to_movies --dry-run"
                )
            
            ongoing_no_episodes = [
                data for data in series_without_episodes 
                if data['status'] == Status.ON_GOING
            ]
            
            if ongoing_no_episodes:
                self.stdout.write(
                    self.style.WARNING(
                        f"• {len(ongoing_no_episodes)} ongoing series with 0 episodes "
                        "need episodes added or status changed"
                    )
                )
        else:
            self.stdout.write(self.style.SUCCESS("• All series have episodes - data looks good!"))

        self.stdout.write(f"• Total movies in database: {Movie.objects.count()}")
        self.stdout.write("• Review completed ✓")
