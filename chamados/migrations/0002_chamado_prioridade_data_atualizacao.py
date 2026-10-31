import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("chamados", "0001_initial"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="chamado",
            options={"ordering": ["-data_abertura"]},
        ),
        migrations.AddField(
            model_name="chamado",
            name="prioridade",
            field=models.CharField(
                choices=[("Baixa", "Baixa"), ("Média", "Média"), ("Alta", "Alta")],
                default="Média",
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name="chamado",
            name="data_atualizacao",
            field=models.DateTimeField(auto_now=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name="chamado",
            name="status",
            field=models.CharField(
                choices=[
                    ("Aberto", "Aberto"),
                    ("Em andamento", "Em andamento"),
                    ("Pendente", "Pendente"),
                    ("Resolvido", "Resolvido"),
                ],
                default="Aberto",
                max_length=50,
            ),
        ),
    ]
