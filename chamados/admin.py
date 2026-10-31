from django.contrib import admin

from .models import Chamado, Cliente, Interacao


@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ("id", "nome", "empresa", "email", "ativo")
    list_filter = ("ativo",)
    search_fields = ("nome", "empresa", "email")


@admin.register(Chamado)
class ChamadoAdmin(admin.ModelAdmin):
    list_display = ("id", "titulo", "cliente", "status", "prioridade", "data_abertura")
    list_filter = ("status", "prioridade")
    search_fields = ("titulo", "descricao")


@admin.register(Interacao)
class InteracaoAdmin(admin.ModelAdmin):
    list_display = ("id", "chamado", "tipo", "autor", "data_criacao")
    list_filter = ("tipo",)
