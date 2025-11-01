from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.core.mail import send_mail
from Projet_de_stage import settings
from .serializers import UserSerializer,PasswordResetRequestSerializer,PasswordResetSerializer,CustomTokenObtainPairSerializer
from .models import User
from rest_framework import status
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth import get_user_model
from django.http import HttpResponse
from django.contrib.auth.tokens import default_token_generator
from .tokens import custom_token_generator
from django.contrib.auth.models import Group
from rest_framework_simplejwt.tokens import RefreshToken,AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from uuid import UUID

import logging

logger = logging.getLogger(__name__)

class LoginView(TokenObtainPairView):
    """
    Customized Login View to include additional user details like groups and permissions.
    """
    class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
        def validate(self, attrs):
            data = super().validate(attrs)
            user = self.user

            # Add user details
            groups = [group.name for group in user.groups.all()]
            permissions = list(user.get_all_permissions())

            data.update({
                "email": user.email,
                "groups": groups,
                "permissions": permissions,
            })
            return data
    serializer_class = CustomTokenObtainPairSerializer


class GetUsersView(APIView):
    """
    Retrieve a single user by their pk (primary key) or all users with their email, role, name, surname, and phone number.
    Requires JWT token for authentication.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        try:
            if pk:
                # Fetch the specific user by pk
                user = User.objects.get(id=pk)
                role = user.groups.first().name if user.groups.exists() else "No Role"

                # Return user data
                user_data = {
                    "id": user.id,
                    "email": user.email,
                    "nom": user.nom,
                    "prenom": user.prenom,
                    "numero_telephone": user.numero_telephone,
                    "role": role,
                }
                return Response({"user": user_data}, status=status.HTTP_200_OK)
            else:
                # Fetch all users
                users = User.objects.all()

                # Serialize user data
                users_data = []
                for user in users:
                    role = user.groups.first().name if user.groups.exists() else "No Role"
                    users_data.append({
                        "id": user.id,
                        "email": user.email,
                        "nom": user.nom,
                        "prenom": user.prenom,
                        "numero_telephone": user.numero_telephone,
                        "role": role,
                    })

                return Response({"users": users_data}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {"error": f"An error occurred while retrieving users: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class RegisterView(APIView):
    """
    Endpoint to return the details of the currently authenticated user and register a new user.
    Only superadmin can register new users.
    """
    def get_permissions(self):
        """
        Grant IsAuthenticated permission for GET and POST requests.
        """
        if self.request.method in ['POST', 'GET']:
            return [IsAuthenticated()]
        return []

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response({
            "user_details": serializer.data,
            "message": "Welcome! You are authenticated successfully."
        })
    
    def post(self, request):
        # Check if the user is authenticated and has the superadmin role
        if not request.user.groups.filter(name='superadmin').exists():
            return Response({'error': 'Permission denied. Only superadmin can register users.'}, status=status.HTTP_403_FORBIDDEN)

        # Retrieve the data from the request
        data = request.data
        email = data.get("email")
        password = data.get("password")
        nom = data.get("nom")
        prenom = data.get("prenom")
        numero_telephone = data.get("numero_telephone")
        role = data.get("role")

        # Ensure that the role is either "admin" or "superadmin"
        if role not in ["admin", "superadmin"]:
            return Response({"error": "Role must be 'admin' or 'superadmin'."}, status=status.HTTP_400_BAD_REQUEST)

        # Create user serializer with the provided data
        serializer = UserSerializer(data={
            "email": email,
            "password": password,
            "nom": nom,
            "prenom": prenom,
            "numero_telephone": numero_telephone
        })

        # Validate the serializer and create the user
        if serializer.is_valid():
            user = serializer.save()

            # Assign the user to the specified group (role)
            group, created = Group.objects.get_or_create(name=role)
            user.groups.add(group)

            # Create a new access token for the newly registered user
            refresh = AccessToken.for_user(user)

            # Send welcome email to the newly created user
            try:
                user_message = (
                    f"Bonjour {prenom},\n\n"
                    "Bienvenue dans notre plateforme ! Nous sommes ravis de vous accueillir.\n"
                    "Votre rôle est de répondre aux demandes et de traiter les voix de nos citoyens.\n\n"
                    "Voici les détails de votre compte :\n"
                    f"- **Email** : {email}\n"
                    f"- **Mot de passe** : {password}\n\n"
                    "Vous pouvez accéder à la page de connexion ici : http://localhost:4200/login\n\n"
                    "Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe après votre première connexion.\n\n"
                    "Cordialement,\nL'équipe de la plateforme"
                )
                send_mail(
                    subject="Bienvenue dans notre plateforme",
                    message=user_message,
                    from_email='malekhichri2003@gmail.com',
                    recipient_list=[email],
                )
                logger.info(f"Welcome email sent successfully to {email}")
            except Exception as e:
                logger.error(f"Failed to send welcome email to {email}: {str(e)}")
                return Response({
                    "message": "User created successfully, but failed to send welcome email.",
                    "error": str(e),
                    "user": {
                        "email": user.email,
                        "role": role,
                        "nom": user.nom,
                        "prenom": user.prenom,
                        "numero_telephone": user.numero_telephone,
                    },
                    "access_token": str(refresh)
                }, status=status.HTTP_201_CREATED)

            return Response({
                "message": "User created successfully. Welcome email sent.",
                "user": {
                    "email": user.email,
                    "role": role,
                    "nom": user.nom,
                    "prenom": user.prenom,
                    "numero_telephone": user.numero_telephone,
                },
                "access_token": str(refresh)
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Get the refresh token from the request
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"error": "Refresh token is required."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Blacklist the refresh token
            refresh = RefreshToken(refresh_token)

            try:
                refresh.blacklist()
            except TokenError as e:
                # Handle the case where the token is already blacklisted
                return Response(
                    {"error": "This token has already been blacklisted."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            return Response(
                {"message": "Logout successful."}, 
                status=status.HTTP_200_OK
            )

        except AttributeError:
            return Response(
                {"error": "Blacklist feature is not enabled."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PasswordResetRequestView(APIView):
    """Handle password reset requests."""

    def post(self, request):
        try:
            serializer = PasswordResetRequestSerializer(data=request.data)
            if serializer.is_valid():
                serializer.send_reset_email()
                return Response(
                    {"message": "Password reset email sent successfully."},
                    status=status.HTTP_200_OK,
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": f"An error occurred while processing your request: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class PasswordResetView(APIView):
    """Handle password reset confirmation and password update."""

    def post(self, request):
        try:
            # Initialize the serializer with request data
            serializer = PasswordResetSerializer(data=request.data)
            
            # Validate the serializer data
            if serializer.is_valid():
                # Save the new password
                serializer.save()
                return Response(
                    {"message": "Password reset successfully."},
                    status=status.HTTP_200_OK,
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": f"An error occurred while processing your request: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )



class PasswordResetConfirmView(APIView):
    def get(self, request, uidb64, token):
        try:
            # Decode the UID and fetch the user
            uid = urlsafe_base64_decode(uidb64).decode()
            user = get_user_model().objects.get(id=uid)
        except Exception:
            return HttpResponse("Invalid link or expired.")

        # Use the custom token generator to validate the token
        if custom_token_generator.check_token(user, token):
            return Response({"message": "Valid token, reset your password."})
        else:
            return HttpResponse("Invalid token or expired.")
        
class DeleteUserView(APIView):
    permission_classes = [IsAuthenticated]  

    def delete(self, request, pk):
        if not request.user.groups.filter(name='superadmin').exists():
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        try:
            user = User.objects.get(pk=pk)
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)



class ModifyUserView(APIView):
    permission_classes = [IsAuthenticated]  # Authentification requise

    def put(self, request, pk):
        # Vérifier si l'utilisateur est superadmin
        if not request.user.groups.filter(name='superadmin').exists():
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Récupérer les données de la requête
        data = request.data
        user.email = data.get('email', user.email)
        user.nom = data.get('nom', user.nom)
        user.prenom = data.get('prenom', user.prenom)
        user.numero_telephone = data.get('numero_telephone', user.numero_telephone)
        
        # Gestion du rôle (groupe)
        new_role = data.get('role')
        if new_role:
            if new_role not in ['admin', 'superadmin']:
                return Response({'error': "Role must be 'admin' or 'superadmin'."}, status=status.HTTP_400_BAD_REQUEST)
            
            # Supprimer l'ancien groupe et ajouter le nouveau
            user.groups.clear()
            group, created = Group.objects.get_or_create(name=new_role)
            user.groups.add(group)
        
        user.save()
        
        return Response({
            "message": "User updated successfully.",
            "user": {
                "email": user.email,
                "nom": user.nom,
                "prenom": user.prenom,
                "numero_telephone": user.numero_telephone,
                "role": new_role or user.groups.first().name,
            }
        }, status=status.HTTP_200_OK)



