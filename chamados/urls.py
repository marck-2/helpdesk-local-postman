from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ChamadoViewSet, ClienteViewSet, InteracaoViewSet

router = DefaultRouter()
router.register(r"chamados", ChamadoViewSet, basename="chamado")
router.register(r"clientes", ClienteViewSet, basename="cliente")
router.register(r"interacoes", InteracaoViewSet, basename="interacao")

urlpatterns = [
    path("", include(router.urls)),
]
