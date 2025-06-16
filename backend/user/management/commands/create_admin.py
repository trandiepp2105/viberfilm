from django.conf import settings
from user.models import User

from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Create admin user'

    def handle(self, *args, **kwargs):
        if User.objects.filter(email=settings.ADMIN_EMAIL).exists():
            self.stdout.write(self.style.WARNING('Admin user already exists'))
            return

        User.objects.create_superuser(
            email=settings.ADMIN_EMAIL,
            username=settings.ADMIN_USERNAME,
            password=settings.ADMIN_PASSWORD
        )
        self.stdout.write(self.style.SUCCESS('Admin user created successfully'))