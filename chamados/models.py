from django.db import models


class Cliente(models.Model):
    nome = models.CharField(max_length=150)
    email = models.EmailField(blank=True)
    telefone = models.CharField(max_length=30, blank=True)
    empresa = models.CharField(max_length=150, blank=True)
    ativo = models.BooleanField(default=True)
    data_cadastro = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["nome"]

    def __str__(self):
        return self.nome


class Chamado(models.Model):
    STATUS_CHOICES = [
        ("Aberto", "Aberto"),
        ("Em andamento", "Em andamento"),
        ("Pendente", "Pendente"),
        ("Resolvido", "Resolvido"),
    ]
    PRIORIDADE_CHOICES = [
        ("Baixa", "Baixa"),
        ("Média", "Média"),
        ("Alta", "Alta"),
    ]

    titulo = models.CharField(max_length=150)
    descricao = models.TextField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="Aberto")
    prioridade = models.CharField(max_length=10, choices=PRIORIDADE_CHOICES, default="Média")
    # Opcional: chamados antigos e requisições do Postman continuam válidos sem cliente.
    # PROTECT impede apagar um cliente que ainda tenha chamados (integridade).
    cliente = models.ForeignKey(
        Cliente,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="chamados",
    )
    data_abertura = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-data_abertura"]

    def __str__(self):
        return f"#{self.pk} {self.titulo} - {self.status}"


class Interacao(models.Model):
    TIPO_CHOICES = [
        ("Observação", "Observação"),
        ("Atendimento", "Atendimento"),
        ("Alteração de status", "Alteração de status"),
        ("Solução", "Solução"),
    ]

    # Apagar um chamado apaga o histórico dele (CASCADE).
    chamado = models.ForeignKey(Chamado, on_delete=models.CASCADE, related_name="interacoes")
    mensagem = models.TextField()
    tipo = models.CharField(max_length=30, choices=TIPO_CHOICES, default="Observação")
    # Texto simples por enquanto, pois o projeto ainda não tem autenticação.
    # No futuro deve virar um relacionamento com o usuário autenticado.
    autor = models.CharField(max_length=100, blank=True)
    data_criacao = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["data_criacao", "id"]
        verbose_name = "interação"
        verbose_name_plural = "interações"

    def __str__(self):
        return f"#{self.chamado_id} - {self.tipo}"
