from urllib import request
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.permissions import IsAuthenticated
from django.core.mail import send_mail
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Municipalite, Demande
from .serializers import MunicipaliteSerializer, DemandeSerializer , DemandeStatusSerializer
from rest_framework.permissions import AllowAny



class PublicPermission(permissions.BasePermission):
    """
    Permission personnalisée pour les API publiques (GET Municipalite, GET Demande, POST Demande).
    """
    def has_permission(self, request, view):
        return request.method in ['GET', 'POST']


class IsSuperAdmin(permissions.BasePermission):
    """
    Custom permission for superadmin users, allowing full access (POST, PUT, DELETE).
    """
    def has_permission(self, request, view):
        return request.user.groups.filter(name='superadmin').exists()


class IsAdmin(permissions.BasePermission):
    """
    Custom permission for admin users, allowing partial access (POST, PUT, DELETE for certain views).
    """
    def has_permission(self, request, view):
        return request.user.groups.filter(name='admin').exists()


class MunicipaliteView(APIView):
    def get_permissions(self):
        """Allow GET requests to be public, but require authentication for other methods."""
        if self.request.method == 'GET':
            return [permissions.AllowAny()]  # Public access
        return [permissions.IsAuthenticated()]  # Authentication required

    def get(self, request, pk=None):
        if pk:
            try:
                municipalite = Municipalite.objects.get(pk=pk)
                serializer = MunicipaliteSerializer(municipalite)
                return Response(serializer.data)
            except Municipalite.DoesNotExist:
                return Response({'error': 'Municipalite not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            municipalites = Municipalite.objects.all()
            serializer = MunicipaliteSerializer(municipalites, many=True)
            return Response(serializer.data)

    def post(self, request):
        if not request.user.groups.filter(name='superadmin').exists():
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        serializer = MunicipaliteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        if not request.user.groups.filter(name='superadmin').exists():
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        try:
            municipalite = Municipalite.objects.get(pk=pk)
        except Municipalite.DoesNotExist:
            return Response({'error': 'Municipalite not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = MunicipaliteSerializer(municipalite, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        if not request.user.groups.filter(name='superadmin').exists():
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        try:
            municipalite = Municipalite.objects.get(pk=pk)
            municipalite.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Municipalite.DoesNotExist:
            return Response({'error': 'Municipalite not found'}, status=status.HTTP_404_NOT_FOUND)

class DemandeView(APIView):

    def get_permissions(self):
        # Define permissions based on the request method
        if self.request.method in ['POST']:
            return [AllowAny()]  # Public access
        elif 'key' in self.kwargs and self.request.method == 'GET':
            return [AllowAny()]
        elif self.request.method in ['GET', 'PUT', 'DELETE']:
            return [IsAuthenticated()]  # Private access
        return super().get_permissions()

    def get(self, request, key=None):
        if key:  # Si une clé est fournie
            try:
                demande = Demande.objects.get(key=key)  # Recherche par clé
                serializer = DemandeStatusSerializer(demande)  # Utilisation de DemandeStatusSerializer
                return Response(serializer.data)
            except Demande.DoesNotExist:
                return Response({'error': 'Demande not found'}, status=status.HTTP_404_NOT_FOUND)
        else:  # Si aucune clé n'est fournie
            demandes = Demande.objects.all()  # Récupère toutes les demandes
            serializer = DemandeSerializer(demandes, many=True)  # Utilisation de DemandeSerializer
            return Response(serializer.data)

    def post(self, request):
        serializer = DemandeSerializer(data=request.data)
        if serializer.is_valid():
            demande = serializer.save()  # Save the new Demande

            # Prepare emails
            user_email = demande.email
            admin_email = 'admin@example.com'  # Replace with the actual admin email
            key = demande.key

            # Email for the user
            user_message = (
                f"Bonjour {demande.nom_complet},\n\n"
                f"Votre demande a été soumise avec succès.\n"
                f"Clé unique : {key}\n"
                f"URL pour suivre votre demande : http://localhost:4200/suivdemande\n\n"
                f"Cordialement,\nL'équipe"
            )
            send_mail(
                subject="Confirmation de votre demande",
                message=user_message,
                from_email='malekhichri2003@gmail.com',
                recipient_list=[user_email],
            )

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            demande = Demande.objects.get(pk=pk)
            demande.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Demande.DoesNotExist:
            return Response({'error': 'Demande not found'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            demande = Demande.objects.get(pk=pk)
        except Demande.DoesNotExist:
            return Response({'error': 'Demande not found'}, status=status.HTTP_404_NOT_FOUND)

    # Vérifier si le statut est présent et valide
        if 'statut' in request.data:
            new_statut = request.data['statut']
            if new_statut not in dict(Demande.STATUT_CHOICES):
                return Response({'error': 'Invalid statut choice'}, status=status.HTTP_400_BAD_REQUEST)
        demande.statut = new_statut

    # Mettre à jour les autres champs
        serializer = DemandeSerializer(demande, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class DemandeTotaleView(APIView):
    """
    Retourne le nombre total de demandes enregistrées.
    """
    permission_classes = [IsAuthenticated]  # Vérifier l'authentification

    def get(self, request):
        try:
            total_demandes = Demande.objects.count()
            return Response({'total_demandes': total_demandes})
        except Exception as e:
            return Response({'error': str(e)}, status=500) 


class TraiteTotaleView(APIView):
    """
    Retourne le nombre total de demandes ayant le statut "traité".
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_traite = Demande.objects.filter(statut='traité').count()
        return Response({'total_demandes_traitees': total_traite})


class TauxTraitementView(APIView):
    """
    Retourne le pourcentage de demandes traitées.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_demandes = Demande.objects.count()
        total_traite = Demande.objects.filter(statut='traité').count()
        
        if total_demandes == 0:
            taux_traitement = 0  # Eviter une division par zéro
        else:
            taux_traitement = (total_traite / total_demandes) * 100
        
        return Response({'taux_traitement': round(taux_traitement, 2)})

