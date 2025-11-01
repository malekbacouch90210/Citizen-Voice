from django.core.management.base import BaseCommand
from demande.models import Municipalite, Demande

class Command(BaseCommand):
    help = 'Insérer des données dans les tables Municipalite et Demande'

    def handle(self, *args, **kwargs):
        # Insérer une municipalité
        municipalite, created = Municipalite.objects.get_or_create(
            name_francais='Dar Chaâbene',
            name_arabe='دار شعبان'
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('Municipalité créée avec succès.'))
        else:
            self.stdout.write(self.style.SUCCESS('Municipalité déjà existante.'))

        # Insérer une demande liée à la municipalité
        demande = Demande.objects.create(
            nom_complet='Ahmed Ben Ali',
            email='ahmed@example.com',
            telephone='123456789',
            adresse='Avenue Habib Bourguiba, Tunis',
            request_type='Reclamation',
            domaine='Transport',
            municipalite=municipalite,
            titre='Problème de transport',
            description='Il y a un problème avec les transports publics.',
            piece_jointe=None  # Vous pouvez ajouter un fichier ici si vous le souhaitez
        )

        self.stdout.write(self.style.SUCCESS(f'Demande créée : {demande.titre}'))
