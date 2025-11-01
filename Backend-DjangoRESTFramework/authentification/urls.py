from django.urls import path
from .views import DeleteUserView, LoginView, ModifyUserView, RegisterView , PasswordResetRequestView, PasswordResetView ,PasswordResetConfirmView,GetUsersView,LogoutView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.views import TokenBlacklistView


urlpatterns = [
    path('authentification/users/login/', LoginView.as_view(), name='login'),
    path('authentification/users/affiche/', GetUsersView.as_view(), name='affiche'),
    path('authentification/users/register/', RegisterView.as_view(), name='register'),
    path('authentification/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('authentification/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('authentification/reset-password/request/', PasswordResetRequestView.as_view(), name='reset_password_request'),
    path('authentification/reset-password/', PasswordResetView.as_view(), name='reset_password'),
    path('reset-password/<token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('authentification/users/logout/', LogoutView.as_view(), name='logout'),
    path('authentification/token/blacklist/', TokenBlacklistView.as_view(), name='token_blacklist'),
    path('authentification/users/delete/<str:pk>/', DeleteUserView.as_view(), name='delete_user'),
    path('authentification/users/modifier/<str:pk>/', ModifyUserView.as_view(), name='modifier_user'),
    path('authentification/users/affiche/<str:pk>/', GetUsersView.as_view(), name='affiche_id'),
]
