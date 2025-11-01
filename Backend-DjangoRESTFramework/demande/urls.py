from django.urls import path
from .views import DemandeTotaleView, MunicipaliteView, DemandeView, TauxTraitementView, TraiteTotaleView

urlpatterns = [
    path('municipalites/', MunicipaliteView.as_view(), name='municipalites-list'),
    path('municipalites/<str:pk>/', MunicipaliteView.as_view(), name='municipalites-detail'),  # Add pk path
    path('demandes/', DemandeView.as_view(), name='demandes-list'),
    path('demandes/total/', DemandeTotaleView.as_view(), name='demande-total'),
    path('demandes/traite/', TraiteTotaleView.as_view(), name='demande-traite'),
    path('demandes/taux-traitement/', TauxTraitementView.as_view(), name='taux-traitement'),
    path('demandes/<str:pk>/', DemandeView.as_view(), name='demandes-detail'),
    
]