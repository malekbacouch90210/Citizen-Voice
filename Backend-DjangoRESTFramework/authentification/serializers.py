from datetime import timedelta
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User
from django.contrib.auth.hashers import make_password
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from django.utils.encoding import force_str, smart_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.exceptions import ValidationError
from django.utils.timezone import now
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
import logging

logger = logging.getLogger(__name__)

# Existing serializers
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'password', 'nom', 'prenom', 'numero_telephone']

    def create(self, validated_data):
        password = validated_data.pop('password')
        hashed_password = make_password(password)
        user = User.objects.create(password=hashed_password, **validated_data)
        return user
    
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User with this email does not exist.")
        return value

    def send_reset_email(self):
        try:
            email = self.validated_data['email']
            user = User.objects.get(email=email)
            token = default_token_generator.make_token(user)
            reset_link = f"http://127.0.0.1:8000/authentification/reset-password/{token}/"
            send_mail(
                subject="Password Reset Request",
                message=f"Click the link below to reset your password:\n\n{reset_link}",
                from_email="admin@yourdomain.com",
                recipient_list=[email],
            )
        except Exception as e:
            raise serializers.ValidationError(f"An error occurred while sending the email: {str(e)}")

class PasswordResetSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)

    TOKEN_EXPIRATION_TIME = timedelta(minutes=3)  # Token expiration time

    def validate(self, attrs):
        token = attrs.get("token")
        try:
            user = self.get_user_from_token(token)
            attrs["user"] = user
        except serializers.ValidationError as e:
            raise serializers.ValidationError({"non_field_errors": e.detail})
        except Exception as e:
            raise serializers.ValidationError({"non_field_errors": [str(e)]})
        return attrs

    def get_user_from_token(self, token):
        User = get_user_model()
        for user in User.objects.all():
            if default_token_generator.check_token(user, token):
                if self.is_token_expired(user):
                    raise serializers.ValidationError("Token has expired.")
                return user
        raise serializers.ValidationError("Invalid or expired token.")

    def is_token_expired(self, user):
        last_login = user.last_login or now()
        token_creation_time = last_login
        return now() > (token_creation_time + self.TOKEN_EXPIRATION_TIME)

    def save(self):
        user = self.validated_data['user']
        new_password = self.validated_data['new_password']
        user.set_password(new_password)
        user.save()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        try:
            token = RefreshToken.for_user(user)
            token['groups'] = [group.name for group in user.groups.all()] if user.groups.exists() else []
            token['email'] = user.email
            logger.debug(f"Customized access token payload: {dict(token.access_token)}")
            return token
        except Exception as e:
            logger.error(f"Error in get_token: {str(e)}")
            raise

    def validate(self, attrs):
        try:
            logger.debug(f"Validating attrs: {attrs}")
            data = super().validate(attrs)
            if not hasattr(self, 'user') or self.user is None:
                logger.error("User not set after validation")
                raise ValueError("User not authenticated")
            refresh = self.get_token(self.user)
            data = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                "email": self.user.email,
                "groups": [group.name for group in self.user.groups.all()] if self.user.groups.exists() else [],
                "permissions": list(self.user.get_all_permissions()),
            }
            logger.debug(f"Response data: {data}")
            return data
        except Exception as e:
            logger.error(f"Error in validate: {str(e)}")
            raise