from django.contrib import admin
from film.models import *

# Inline classes for related models
class ContentGenreInline(admin.TabularInline):
    model = ContentGenre
    extra = 1

class ContentTagInline(admin.TabularInline):
    model = ContentTag
    extra = 1

class ContentNationInline(admin.TabularInline):
    model = ContentNation
    extra = 1

class ContentPersonInline(admin.TabularInline):
    model = ContentPerson
    extra = 1

class MovieInline(admin.StackedInline):
    model = Movie
    can_delete = False

class SeriesInline(admin.StackedInline):
    model = Series
    can_delete = False

# Base Content Admin
@admin.register(Content)
class ContentAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'content_type', 'release_date', 'views', 'rating', 'status')
    list_filter = ('content_type', 'status', 'release_date')
    search_fields = ('title', 'description')
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('created_at', 'updated_at')
    inlines = [ContentGenreInline, ContentTagInline, ContentNationInline, ContentPersonInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'content_type', 'release_date', 'description')
        }),
        ('Images', {
            'fields': ('banner_img_url', 'poster_img_url')
        }),
        ('Statistics', {
            'fields': ('views', 'rating', 'status', 'age_rank')
        }),
        ('SEO', {
            'fields': ('slug',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ('content', 'duration', 'video')
    search_fields = ('content__title',)
    list_filter = ('content__status', 'content__release_date')
    raw_id_fields = ('content', 'video')

@admin.register(Series)
class SeriesAdmin(admin.ModelAdmin):
    list_display = ('content', 'total_seasons', 'total_episodes')
    search_fields = ('content__title',)
    list_filter = ('content__status', 'content__release_date')
    raw_id_fields = ('content',)

@admin.register(Season)
class SeasonAdmin(admin.ModelAdmin):
    list_display = ('id', 'series', 'order', 'season_name', 'release_date', 'rating', 'status')
    list_filter = ('status', 'release_date')
    search_fields = ('season_name', 'series__content__title')
    raw_id_fields = ('series',)

@admin.register(Episode)
class EpisodeAdmin(admin.ModelAdmin):
    list_display = ('id', 'season', 'order', 'title', 'views', 'duration')
    list_filter = ('season__series__content__title',)
    search_fields = ('title', 'description', 'season__series__content__title')
    raw_id_fields = ('season', 'video')

@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'slug')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'slug')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Nation)
class NationAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'code')
    search_fields = ('name', 'code')

@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'birth_date', 'nationality')
    search_fields = ('name',)
    list_filter = ('nationality', 'birth_date')
    raw_id_fields = ('nationality',)

# Relationship Models
@admin.register(ContentGenre)
class ContentGenreAdmin(admin.ModelAdmin):
    list_display = ('content', 'genre')
    list_filter = ('genre',)
    raw_id_fields = ('content', 'genre')

@admin.register(ContentTag)
class ContentTagAdmin(admin.ModelAdmin):
    list_display = ('content', 'tag')
    list_filter = ('tag',)
    raw_id_fields = ('content', 'tag')

@admin.register(ContentNation)
class ContentNationAdmin(admin.ModelAdmin):
    list_display = ('content', 'nation')
    list_filter = ('nation',)
    raw_id_fields = ('content', 'nation')

@admin.register(ContentPerson)
class ContentPersonAdmin(admin.ModelAdmin):
    list_display = ('content', 'person', 'role', 'character_name')
    list_filter = ('role',)
    search_fields = ('person__name', 'content__title', 'character_name')
    raw_id_fields = ('content', 'person')