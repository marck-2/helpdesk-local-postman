from django.db.models import Count, ProtectedError, Q
from rest_framework import status as http
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Chamado, Cliente, Interacao
from .serializers import ChamadoSerializer, ClienteSerializer, InteracaoSerializer


class ClienteViewSet(viewsets.ModelViewSet):
    """
    CRUD de clientes.

    Filtros opcionais: ?busca= (nome, empresa ou e-mail) e ?ativo=true|false
    """

    serializer_class = ClienteSerializer

    def get_queryset(self):
        qs = Cliente.objects.all()
        busca = self.request.query_params.get("busca")
        ativo = self.request.query_params.get("ativo")
        if busca:
            qs = qs.filter(
                Q(nome__icontains=busca) | Q(empresa__icontains=busca) | Q(email__icontains=busca)
            )
        if ativo and ativo.lower() in ("true", "false"):
            qs = qs.filter(ativo=ativo.lower() == "true")
        return qs

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {
                    "detail": "Este cliente possui chamados vinculados e não pode ser excluído. "
                    "Marque-o como inativo ou exclua os chamados antes."
                },
                status=http.HTTP_409_CONFLICT,
            )


class ChamadoViewSet(viewsets.ModelViewSet):
    """
    CRUD de chamados.

    Filtros opcionais na listagem (GET /api/chamados/):
      ?status=Aberto
      ?prioridade=Alta
      ?cliente=3        (id do cliente)
      ?busca=servidor   (procura no título e na descrição)
    """

    serializer_class = ChamadoSerializer

    def get_queryset(self):
        qs = Chamado.objects.all()
        params = self.request.query_params

        status = params.get("status")
        prioridade = params.get("prioridade")
        cliente = params.get("cliente")
        busca = params.get("busca")

        if status:
            qs = qs.filter(status__iexact=status)
        if prioridade:
            qs = qs.filter(prioridade__iexact=prioridade)
        if cliente and cliente.isdigit():
            qs = qs.filter(cliente_id=int(cliente))
        if busca:
            qs = qs.filter(Q(titulo__icontains=busca) | Q(descricao__icontains=busca))
        return qs

    @action(detail=False, methods=["get"])
    def resumo(self, request):
        """GET /api/chamados/resumo/ - totais por status e prioridade."""
        total = Chamado.objects.count()
        por_status = {s: 0 for s, _ in Chamado.STATUS_CHOICES}
        por_prioridade = {p: 0 for p, _ in Chamado.PRIORIDADE_CHOICES}
        for row in Chamado.objects.values("status").annotate(n=Count("id")):
            por_status[row["status"]] = row["n"]
        for row in Chamado.objects.values("prioridade").annotate(n=Count("id")):
            por_prioridade[row["prioridade"]] = row["n"]
        return Response({"total": total, "por_status": por_status, "por_prioridade": por_prioridade})


class InteracaoViewSet(viewsets.ModelViewSet):
    """
    Histórico de atendimento dos chamados.

    Sem PUT de propósito: uma interação é registrada (POST), corrigida (PATCH) ou removida (DELETE).
    Filtros opcionais: ?chamado=ID e ?tipo=Atendimento
    """

    serializer_class = InteracaoSerializer
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        qs = Interacao.objects.all()
        chamado = self.request.query_params.get("chamado")
        tipo = self.request.query_params.get("tipo")
        if chamado and chamado.isdigit():
            qs = qs.filter(chamado_id=int(chamado))
        if tipo:
            qs = qs.filter(tipo__iexact=tipo)
        return qs
