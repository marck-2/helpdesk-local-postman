from rest_framework import serializers

from .models import Chamado, Cliente, Interacao


class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = "__all__"
        read_only_fields = ("id", "data_cadastro")

    def validate_nome(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("O nome precisa ter pelo menos 2 caracteres.")
        return value


class ChamadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chamado
        fields = "__all__"
        read_only_fields = ("id", "data_abertura", "data_atualizacao")

    def validate_titulo(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("O título precisa ter pelo menos 3 caracteres.")
        return value


class InteracaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interacao
        fields = "__all__"
        read_only_fields = ("id", "data_criacao")

    def validate_mensagem(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("A mensagem não pode ficar em branco.")
        return value

    def validate(self, attrs):
        # Uma interação pertence sempre ao mesmo chamado.
        if self.instance and "chamado" in attrs and attrs["chamado"].pk != self.instance.chamado_id:
            raise serializers.ValidationError(
                {"chamado": "Não é possível mover a interação para outro chamado."}
            )
        return attrs
