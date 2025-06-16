from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.db import transaction
import os

class Status(models.TextChoices):
    ON_GOING = 'on_going'
    COMPLETED = 'completed'

class ContentTypeChoices(models.TextChoices):
    MOVIE = 'movie'
    SERIES = 'series'

# Additional models for metadata
class Studio(models.Model):
    """Animation/Production studios"""
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    founded_year = models.PositiveIntegerField(null=True, blank=True)
    country = models.ForeignKey('Nation', on_delete=models.SET_NULL, null=True, blank=True)
    website = models.URLField(blank=True)
    logo_url = models.CharField(max_length=500, blank=True)
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

class Language(models.Model):
    """Languages for audio/subtitle support"""
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)  # English, Japanese, etc.
    code = models.CharField(max_length=5, unique=True)  # en, ja, vi, etc.
    native_name = models.CharField(max_length=100, blank=True)  # 日本語, Tiếng Việt
    
    def __str__(self):
        return self.name

# Base Content Model - Chứa thuộc tính chung
class Content(models.Model):
    """Base model cho tất cả nội dung (Movie/Series)"""
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    original_title = models.CharField(max_length=255, blank=True)  # Tiêu đề gốc
    content_type = models.CharField(max_length=10, choices=ContentTypeChoices.choices)
    release_date = models.DateField()
    description = models.TextField()
    banner_img_url = models.CharField(max_length=500)
    poster_img_url = models.CharField(max_length=500, blank=True)
    views = models.PositiveIntegerField(default=0)
    rating = models.FloatField(default=0)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ON_GOING)
    age_rank = models.CharField(max_length=10, default='all')
    
    # Additional metadata fields
    studio = models.ForeignKey(Studio, on_delete=models.SET_NULL, null=True, blank=True, related_name='contents')
    
    # SEO & Metadata
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['content_type']),
            models.Index(fields=['status']),
            models.Index(fields=['rating']),
            models.Index(fields=['-views']),
            models.Index(fields=['slug']),  # Added index for slug
        ]
    
    def __str__(self):
        return f"{self.title} ({self.get_content_type_display()})"
    
    def is_movie(self):
        return self.content_type == ContentTypeChoices.MOVIE
    
    def is_series(self):
        return self.content_type == ContentTypeChoices.SERIES
    
    def save(self, *args, **kwargs):
        # Auto-generate slug if not provided
        if not self.slug:
            base_slug = slugify(self.title)
            unique_slug = base_slug
            counter = 1
            
            # Ensure slug is unique
            while Content.objects.filter(slug=unique_slug).exists():
                unique_slug = f"{base_slug}-{counter}"
                counter += 1
            
            self.slug = unique_slug
        
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        # Clean up image files
        for img_field in [self.banner_img_url, self.poster_img_url]:
            if img_field:
                img_path = img_field.lstrip("/")
                full_path = os.path.join(settings.BASE_DIR, img_path)
                if os.path.exists(full_path):
                    os.remove(full_path)
        super().delete(*args, **kwargs)

# Movie Model - Kế thừa từ Content
class Movie(models.Model):
    """Movie specific fields"""
    content = models.OneToOneField(Content, on_delete=models.CASCADE, primary_key=True)
    video = models.ForeignKey('video.Video', on_delete=models.CASCADE, null=True, blank=True, default=None)
    intro_duration = models.FloatField(default=0)
    start_intro_time = models.FloatField(default=0)
    duration = models.PositiveIntegerField(help_text="Duration in minutes")
    
    def __str__(self):
        return f"Movie: {self.content.title}"
    
    def delete(self, *args, **kwargs):
        # Delete associated video if exists
        if self.video:
            self.video.delete()
        super().delete(*args, **kwargs)

# Series Model - Kế thừa từ Content  
class Series(models.Model):
    """Series specific fields"""
    content = models.OneToOneField(Content, on_delete=models.CASCADE, primary_key=True)
    total_seasons = models.PositiveIntegerField(default=1)
    total_episodes = models.PositiveIntegerField(default=0)
    
    def __str__(self):
        return f"Series: {self.content.title}"

class Season(models.Model):
    id = models.AutoField(primary_key=True)
    series = models.ForeignKey(Series, on_delete=models.CASCADE, related_name='seasons')
    order = models.PositiveIntegerField()
    season_name = models.CharField(max_length=255)
    release_date = models.DateField()
    description = models.TextField()
    banner_img_url = models.CharField(max_length=500)
    rating = models.FloatField(default=0)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ON_GOING)
    num_episodes = models.PositiveIntegerField(default=0)
    age_rank = models.CharField(max_length=10, default='all')
    
    class Meta:
        unique_together = ('series', 'order')
        ordering = ['order']
    
    def __str__(self):
        return f"{self.series.content.title} - {self.season_name}"

    def delete(self, *args, **kwargs):
        if self.banner_img_url:
            banner_img_path = self.banner_img_url.lstrip("/")
            full_path = os.path.join(settings.BASE_DIR, banner_img_path)
            if os.path.exists(full_path):
                os.remove(full_path)
        super().delete(*args, **kwargs)

class Episode(models.Model):
    id = models.AutoField(primary_key=True)
    season = models.ForeignKey(Season, on_delete=models.CASCADE, related_name='episodes')
    video = models.ForeignKey('video.Video', on_delete=models.CASCADE, null=True, blank=True, default=None)
    order = models.PositiveIntegerField()
    title = models.CharField(max_length=255, blank=True)
    intro_duration = models.FloatField(default=0)
    start_intro_time = models.FloatField(default=0)
    description = models.TextField()
    banner_img_url = models.CharField(max_length=500)
    views = models.PositiveIntegerField(default=0)
    duration = models.PositiveIntegerField(help_text="Duration in minutes")
    
    class Meta:
        unique_together = ('season', 'order')
        ordering = ['order']
    
    def __str__(self):
        return f"{self.season.series.content.title} S{self.season.order}E{self.order}"

    def delete(self, *args, **kwargs):
        if self.banner_img_url:
            banner_img_path = self.banner_img_url.lstrip("/")
            full_path = os.path.join(settings.BASE_DIR, banner_img_path)
            if os.path.exists(full_path):
                os.remove(full_path)
        if self.video:
            self.video.delete()
        super().delete(*args, **kwargs)

# Unified Genre/Tag/Nation models using Generic Relations
class Genre(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True)
    
    def __str__(self):
        return self.name

class Tag(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True)
    
    def __str__(self):
        return self.name

class Nation(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=5, unique=True)  # VN, JP, US, etc.
    
    def __str__(self):
        return self.name

# Generic Relationship Models
class ContentGenre(models.Model):
    """Link Content (Movie/Series) to Genres"""
    content = models.ForeignKey(Content, on_delete=models.CASCADE, related_name='content_genres')
    genre = models.ForeignKey(Genre, on_delete=models.CASCADE, related_name='contents')
    
    class Meta:
        unique_together = ('content', 'genre')
    
    @classmethod
    def add(cls, content_id, genre_id):
        obj, created = cls.objects.get_or_create(content_id=content_id, genre_id=genre_id)
        return {
            "success": created,
            "message": "Created successfully" if created else "Already exists",
            "data": obj,
        }

class ContentTag(models.Model):
    """Link Content (Movie/Series) to Tags"""
    content = models.ForeignKey(Content, on_delete=models.CASCADE, related_name='content_tags')
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, related_name='contents')
    
    class Meta:
        unique_together = ('content', 'tag')
    
    @classmethod
    def add(cls, content_id, tag_id):
        obj, created = cls.objects.get_or_create(content_id=content_id, tag_id=tag_id)
        return {
            "success": created,
            "message": "Created successfully" if created else "Already exists",
            "data": obj,
        }

class ContentNation(models.Model):
    """Link Content (Movie/Series) to Nations"""
    content = models.ForeignKey(Content, on_delete=models.CASCADE, related_name='content_nations')
    nation = models.ForeignKey(Nation, on_delete=models.CASCADE, related_name='contents')
    
    class Meta:
        unique_together = ('content', 'nation')
    
    @classmethod
    def add(cls, content_id, nation_id):
        obj, created = cls.objects.get_or_create(content_id=content_id, nation_id=nation_id)
        return {
            "success": created,
            "message": "Created successfully" if created else "Already exists",
            "data": obj,
        }

class ContentLanguage(models.Model):
    """Link Content to Languages (for audio and subtitle support)"""
    LANGUAGE_TYPE_CHOICES = [
        ('audio', 'Audio'),
        ('subtitle', 'Subtitle'),
    ]
    
    content = models.ForeignKey(Content, on_delete=models.CASCADE, related_name='content_languages')
    language = models.ForeignKey(Language, on_delete=models.CASCADE, related_name='contents')
    language_type = models.CharField(max_length=10, choices=LANGUAGE_TYPE_CHOICES)
    
    class Meta:
        unique_together = ('content', 'language', 'language_type')
    
    @classmethod
    def add(cls, content_id, language_id, language_type):
        obj, created = cls.objects.get_or_create(
            content_id=content_id, 
            language_id=language_id, 
            language_type=language_type
        )
        return {
            "success": created,
            "message": "Created successfully" if created else "Already exists",
            "data": obj,
        }

# Optional: Cast and Crew models
class Person(models.Model):
    """People involved in content (actors, directors, etc.)"""
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    birth_date = models.DateField(null=True, blank=True)
    nationality = models.ForeignKey(Nation, on_delete=models.SET_NULL, null=True, blank=True)
    bio = models.TextField(blank=True)
    photo_url = models.CharField(max_length=500, blank=True)
    
    def __str__(self):
        return self.name

class ContentPerson(models.Model):
    """Link Content to People with roles"""
    ROLE_CHOICES = [
        ('actor', 'Actor'),
        ('voice_actor', 'Voice Actor'),
        ('director', 'Director'),
        ('producer', 'Producer'),
        ('writer', 'Writer'),
        ('screenwriter', 'Screenwriter'),
        ('animator', 'Animator'),
        ('character_designer', 'Character Designer'),
        ('music_composer', 'Music Composer'),
        ('sound_director', 'Sound Director'),
        ('art_director', 'Art Director'),
        ('executive_producer', 'Executive Producer'),
        ('original_creator', 'Original Creator'),
        ('screenplay', 'Screenplay'),
        ('series_composition', 'Series Composition'),
    ]
    
    content = models.ForeignKey(Content, on_delete=models.CASCADE, related_name='cast_crew')
    person = models.ForeignKey(Person, on_delete=models.CASCADE, related_name='works')
    role = models.CharField(max_length=30, choices=ROLE_CHOICES)
    character_name = models.CharField(max_length=255, blank=True)  # For actors/voice actors
    order = models.PositiveIntegerField(default=0)  # For sorting cast order
    
    class Meta:
        unique_together = ('content', 'person', 'role', 'character_name')
        ordering = ['order', 'role']
    
    def __str__(self):
        if self.character_name:
            return f"{self.person.name} as {self.character_name} ({self.role}) in {self.content.title}"
        return f"{self.person.name} - {self.role} in {self.content.title}"

class ViewSession(models.Model):
    """Track viewing sessions to increment views only after 1 minute of watching"""
    id = models.AutoField(primary_key=True)
    session_id = models.CharField(max_length=255, help_text="Unique session identifier")
    content = models.ForeignKey(Content, on_delete=models.CASCADE, null=True, blank=True)
    episode = models.ForeignKey('Episode', on_delete=models.CASCADE, null=True, blank=True)
    watch_duration = models.PositiveIntegerField(default=0, help_text="Watch duration in seconds")
    view_counted = models.BooleanField(default=False, help_text="Whether view has been counted")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('session_id', 'content', 'episode')
        indexes = [
            models.Index(fields=['session_id']),
            models.Index(fields=['view_counted']),
        ]
    
    def update_view_duration(self, duration_seconds):
        """Update watch duration and increment views if threshold is met"""
        self.watch_duration = max(self.watch_duration, duration_seconds)
        
        # If watched for more than 60 seconds and view not yet counted
        if duration_seconds >= 60 and not self.view_counted:
            with transaction.atomic():
                self.view_counted = True
                
                if self.content:
                    # For movies, increment content views directly
                    Content.objects.filter(id=self.content.id).update(
                        views=models.F('views') + 1
                    )
                elif self.episode:
                    # For episodes, increment both episode and series content views
                    Episode.objects.filter(id=self.episode.id).update(
                        views=models.F('views') + 1
                    )
                    # Also increment the series content views
                    Content.objects.filter(
                        id=self.episode.season.series.content.id
                    ).update(
                        views=models.F('views') + 1
                    )
                
                self.save()
    
    def __str__(self):
        if self.content:
            return f"ViewSession: {self.content.title} - {self.watch_duration}s"
        elif self.episode:
            return f"ViewSession: {self.episode} - {self.watch_duration}s"
        return f"ViewSession: {self.session_id}"
