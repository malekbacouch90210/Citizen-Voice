from django.db import models
import uuid
from django.utils.crypto import get_random_string

# Model Municipalite
class Municipalite(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name_francais = models.CharField(max_length=255)

    def __str__(self):
        return self.name_francais

# Model Demande
class Demande(models.Model):
    REQUETE_CHOICES = [
        ('Reclamation', 'Reclamation'),
        ('Suggestion', 'Suggestion')
    ]

    DOMAINE_CHOICES = [
        ('Infrastructure', 'Infrastructure'),
        ('Santé', 'Santé'),
        ('Education', 'Education'),
        ('Propriété', 'Propriété'),
        ('Transport', 'Transport'),
        ('Eclairage public', 'Eclairage public'),
        ('Autre', 'Autre')
    ]

    STATUT_CHOICES = [
        ('non traité', 'Non traité'),
        ('en cours', 'En cours'),
        ('traité', 'Traité'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nom_complet = models.CharField(max_length=255)
    email = models.EmailField()
    telephone = models.CharField(max_length=15)
    adresse = models.TextField()
    request_type = models.CharField(max_length=15, choices=REQUETE_CHOICES)
    domaine = models.CharField(max_length=50, choices=DOMAINE_CHOICES)
    municipalite = models.ForeignKey(Municipalite, on_delete=models.CASCADE, related_name='demandes')
    titre = models.CharField(max_length=255)
    description = models.TextField()
    piece_jointe = models.FileField(upload_to='pieces_jointes/', blank=True, null=True)
    key = models.CharField(max_length=6, unique=True, editable=False, null=True, blank=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='non traité')

    def __str__(self):
        return self.titre
    
    def save(self, *args, **kwargs):
        if not self.key:  # Generate key only if it doesn't already exist
            self.key = get_random_string(6).upper()  # Generate a random 6-character string
        super().save(*args, **kwargs)  # Call the parent save method
