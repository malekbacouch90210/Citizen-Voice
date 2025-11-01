from rest_framework import serializers
from .models import Municipalite, Demande

class MunicipaliteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Municipalite
        fields = '__all__'

class DemandeSerializer(serializers.ModelSerializer):
    municipalite = serializers.CharField()  

    class Meta:
        model = Demande
        fields = '__all__'
        read_only_fields = ['key'] 

    def validate_municipalite(self, value):
        # Find the Municipalite based on the 'name_francais'
        try:
            municipalite = Municipalite.objects.get(name_francais=value)
        except Municipalite.DoesNotExist:
            raise serializers.ValidationError("Municipalite with this name does not exist.")
        return municipalite

    def create(self, validated_data):
        municipalite_name = validated_data.pop('municipalite')
        municipalite = self.validate_municipalite(municipalite_name)  # Get the municipalite object

        demande = Demande.objects.create(municipalite=municipalite, **validated_data)
        return demande

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        municipalite = instance.municipalite
        # Include the full municipalite details in the 'municipalite' field
        representation['municipalite'] = {
            'id': str(municipalite.id),
            'name_francais': municipalite.name_francais
        }
        return representation


class DemandeStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Demande
        fields = ['titre', 'key', 'statut'] 
    