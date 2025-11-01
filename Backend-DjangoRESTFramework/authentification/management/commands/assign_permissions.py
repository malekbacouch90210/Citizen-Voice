from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from authentification.models import User
from demande.models import Municipalite


class Command(BaseCommand):
    help = 'Assigns permissions to groups and users programmatically'

    def handle(self, *args, **kwargs):
        # Step 1: Define groups
        superadmin_group, created = Group.objects.get_or_create(name="superadmin")
        if created:
            self.stdout.write(self.style.SUCCESS('Superadmin group created'))
        else:
            self.stdout.write(self.style.SUCCESS('Superadmin group already exists'))

        admin_group, created = Group.objects.get_or_create(name="admin")
        if created:
            self.stdout.write(self.style.SUCCESS('Admin group created'))
        else:
            self.stdout.write(self.style.SUCCESS('Admin group already exists'))

        # Step 2: Assign permissions to groups
        municipalite_ct = ContentType.objects.get_for_model(Municipalite)

        # Superadmin: Full permissions (add, change, delete, view)
        superadmin_permissions = Permission.objects.filter(content_type=municipalite_ct)
        superadmin_group.permissions.set(superadmin_permissions)

        # Admin: Only view permission
        view_permission = Permission.objects.get(codename="view_municipalite", content_type=municipalite_ct)
        admin_group.permissions.set([view_permission])

        self.stdout.write(self.style.SUCCESS('Permissions assigned to groups'))

        # Step 3: Assign users to groups
        emails_superadmin = ["admin@voixcitoyen.tn", "governor@voixcitoyen.tn", "nabeul@voixcitoyen.tn"]
        emails_admin = ["responsable@voixcitoyen.tn", "malek@voixcitoyen.tn"]  # Example admin emails

        # Add users to superadmin group
        for email in emails_superadmin:
            try:
                user = User.objects.get(email=email)
                user.groups.add(superadmin_group)
                self.stdout.write(self.style.SUCCESS(f'User {email} added to superadmin group'))
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'User with email {email} does not exist'))

        # Add users to admin group
        for email in emails_admin:
            try:
                user = User.objects.get(email=email)
                user.groups.add(admin_group)
                self.stdout.write(self.style.SUCCESS(f'User {email} added to admin group'))
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'User with email {email} does not exist'))
