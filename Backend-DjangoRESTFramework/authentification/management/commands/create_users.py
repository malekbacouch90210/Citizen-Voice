from django.core.management.base import BaseCommand
from authentification.models import User

class Command(BaseCommand):
    help = 'Creates 3 users in the database'

    def handle(self, *args, **kwargs):
        # Create 3 users
        user1 = User.objects.create_user(email="admin@voixcitoyen.tn", password="test123")
        user2 = User.objects.create_user(email="governor@voixcitoyen.tn", password="test123")
        user3 = User.objects.create_user(email="nabeul@voixcitoyen.tn", password="test123")

        # Optional: Print user details to confirm creation
        self.stdout.write(self.style.SUCCESS(f'User created: {user1}'))
        self.stdout.write(self.style.SUCCESS(f'User created: {user2}'))
        self.stdout.write(self.style.SUCCESS(f'User created: {user3}'))
