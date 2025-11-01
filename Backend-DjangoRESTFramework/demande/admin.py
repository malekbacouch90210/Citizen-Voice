from django.contrib import admin
from .models import Demande, Municipalite
from django.contrib.auth.models import User, Group

class DemandeAdmin(admin.ModelAdmin):
    list_display = ('titre', 'nom_complet', 'email', 'request_type', 'domaine', 'municipalite', 'key')
    list_filter = ('request_type', 'domaine', 'municipalite')
    search_fields = ('titre', 'nom_complet', 'email')

class MunicipaliteAdmin(admin.ModelAdmin):
    list_display = ('id','name_francais')

# Only register once
admin.site.register(Demande, DemandeAdmin)
admin.site.register(Municipalite, MunicipaliteAdmin)  # If not already registered

# Add custom groups (superadmin and admin)
group, created = Group.objects.get_or_create(name='superadmin')
group, created = Group.objects.get_or_create(name='admin')
