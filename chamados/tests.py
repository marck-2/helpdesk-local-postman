from rest_framework.test import APITestCase

from .models import Chamado, Cliente, Interacao

CHAMADOS = "/api/chamados/"
CLIENTES = "/api/clientes/"
INTERACOES = "/api/interacoes/"


def novo_chamado(**extra):
    dados = {"titulo": "Computador não liga", "descricao": "Sem energia na recepção."}
    dados.update(extra)
    return Chamado.objects.create(**dados)


class ChamadoAPITests(APITestCase):
    def test_crud_completo(self):
        r = self.client.post(CHAMADOS, {"titulo": "Teste", "descricao": "Abc", "prioridade": "Alta"}, format="json")
        self.assertEqual(r.status_code, 201)
        pk = r.data["id"]
        self.assertEqual(r.data["status"], "Aberto")

        self.assertEqual(self.client.get(CHAMADOS).status_code, 200)
        self.assertEqual(self.client.get(f"{CHAMADOS}{pk}/").status_code, 200)

        r = self.client.patch(f"{CHAMADOS}{pk}/", {"status": "Resolvido"}, format="json")
        self.assertEqual((r.status_code, r.data["status"]), (200, "Resolvido"))

        r = self.client.put(
            f"{CHAMADOS}{pk}/",
            {"titulo": "Novo título", "descricao": "Nova", "status": "Pendente", "prioridade": "Baixa"},
            format="json",
        )
        self.assertEqual((r.status_code, r.data["titulo"]), (200, "Novo título"))

        self.assertEqual(self.client.delete(f"{CHAMADOS}{pk}/").status_code, 204)
        self.assertEqual(self.client.get(f"{CHAMADOS}{pk}/").status_code, 404)

    def test_validacoes_retornam_400(self):
        r = self.client.post(CHAMADOS, {"titulo": "ab", "descricao": "x", "status": "Qualquer"}, format="json")
        self.assertEqual(r.status_code, 400)
        self.assertIn("titulo", r.data)
        self.assertIn("status", r.data)

    def test_chamado_sem_cliente_continua_valido(self):
        r = self.client.post(CHAMADOS, {"titulo": "Sem cliente", "descricao": "ok"}, format="json")
        self.assertEqual(r.status_code, 201)
        self.assertIsNone(r.data["cliente"])

    def test_filtros(self):
        cliente = Cliente.objects.create(nome="Ana")
        novo_chamado(titulo="Servidor fora", prioridade="Alta", cliente=cliente)
        novo_chamado(titulo="Mouse quebrado", status="Pendente")
        self.assertEqual(len(self.client.get(CHAMADOS, {"busca": "servidor"}).data), 1)
        self.assertEqual(len(self.client.get(CHAMADOS, {"status": "Pendente"}).data), 1)
        self.assertEqual(len(self.client.get(CHAMADOS, {"prioridade": "Alta"}).data), 1)
        self.assertEqual(len(self.client.get(CHAMADOS, {"cliente": cliente.pk}).data), 1)

    def test_resumo(self):
        novo_chamado()
        novo_chamado(status="Resolvido")
        r = self.client.get(f"{CHAMADOS}resumo/")
        self.assertEqual(r.data["total"], 2)
        self.assertEqual(r.data["por_status"]["Resolvido"], 1)


class ClienteAPITests(APITestCase):
    def test_crud_completo(self):
        r = self.client.post(CLIENTES, {"nome": "Maria Souza"}, format="json")
        self.assertEqual(r.status_code, 201)
        pk = r.data["id"]
        self.assertTrue(r.data["ativo"])
        self.assertEqual((r.data["email"], r.data["telefone"], r.data["empresa"]), ("", "", ""))

        self.assertEqual(self.client.get(CLIENTES).status_code, 200)
        self.assertEqual(self.client.get(f"{CLIENTES}{pk}/").status_code, 200)

        r = self.client.patch(f"{CLIENTES}{pk}/", {"ativo": False}, format="json")
        self.assertFalse(r.data["ativo"])

        r = self.client.put(
            f"{CLIENTES}{pk}/",
            {"nome": "Maria S.", "email": "maria@exemplo.com", "telefone": "19 90000-0000", "empresa": "Acme", "ativo": True},
            format="json",
        )
        self.assertEqual((r.status_code, r.data["empresa"]), (200, "Acme"))

        self.assertEqual(self.client.delete(f"{CLIENTES}{pk}/").status_code, 204)
        self.assertEqual(self.client.get(f"{CLIENTES}{pk}/").status_code, 404)

    def test_nome_obrigatorio_e_email_valido(self):
        r = self.client.post(CLIENTES, {"email": "invalido"}, format="json")
        self.assertEqual(r.status_code, 400)
        self.assertIn("nome", r.data)
        self.assertIn("email", r.data)

    def test_busca_por_nome_ou_empresa(self):
        Cliente.objects.create(nome="Ana Lima", empresa="Padaria Sol")
        Cliente.objects.create(nome="Bruno", empresa="Oficina Lua")
        self.assertEqual(len(self.client.get(CLIENTES, {"busca": "ana"}).data), 1)
        self.assertEqual(len(self.client.get(CLIENTES, {"busca": "lua"}).data), 1)

    def test_nao_exclui_cliente_com_chamados(self):
        cliente = Cliente.objects.create(nome="Com chamado")
        novo_chamado(cliente=cliente)
        r = self.client.delete(f"{CLIENTES}{cliente.pk}/")
        self.assertEqual(r.status_code, 409)
        self.assertIn("detail", r.data)
        self.assertTrue(Cliente.objects.filter(pk=cliente.pk).exists())


class InteracaoAPITests(APITestCase):
    def setUp(self):
        self.chamado = novo_chamado()

    def corpo(self, **extra):
        dados = {"chamado": self.chamado.pk, "mensagem": "Primeiro contato realizado.", "tipo": "Atendimento", "autor": "Equipe de suporte"}
        dados.update(extra)
        return dados

    def test_criar_listar_consultar_corrigir_excluir(self):
        r = self.client.post(INTERACOES, self.corpo(), format="json")
        self.assertEqual(r.status_code, 201)
        pk = r.data["id"]

        self.assertEqual(len(self.client.get(INTERACOES, {"chamado": self.chamado.pk}).data), 1)
        self.assertEqual(self.client.get(f"{INTERACOES}{pk}/").status_code, 200)

        r = self.client.patch(f"{INTERACOES}{pk}/", {"mensagem": "Mensagem corrigida."}, format="json")
        self.assertEqual((r.status_code, r.data["mensagem"]), (200, "Mensagem corrigida."))

        self.assertEqual(self.client.delete(f"{INTERACOES}{pk}/").status_code, 204)
        self.assertEqual(self.client.get(f"{INTERACOES}{pk}/").status_code, 404)

    def test_autor_e_tipo_opcionais(self):
        r = self.client.post(INTERACOES, {"chamado": self.chamado.pk, "mensagem": "Nota."}, format="json")
        self.assertEqual(r.status_code, 201)
        self.assertEqual((r.data["tipo"], r.data["autor"]), ("Observação", ""))

    def test_validacoes(self):
        r = self.client.post(INTERACOES, self.corpo(tipo="Outro"), format="json")
        self.assertEqual((r.status_code, "tipo" in r.data), (400, True))
        r = self.client.post(INTERACOES, self.corpo(mensagem="   "), format="json")
        self.assertEqual((r.status_code, "mensagem" in r.data), (400, True))
        r = self.client.post(INTERACOES, self.corpo(chamado=99999), format="json")
        self.assertEqual((r.status_code, "chamado" in r.data), (400, True))
        r = self.client.post(INTERACOES, {"mensagem": "sem chamado"}, format="json")
        self.assertEqual((r.status_code, "chamado" in r.data), (400, True))

    def test_nao_move_interacao_para_outro_chamado(self):
        outro = novo_chamado(titulo="Outro chamado")
        pk = self.client.post(INTERACOES, self.corpo(), format="json").data["id"]
        r = self.client.patch(f"{INTERACOES}{pk}/", {"chamado": outro.pk}, format="json")
        self.assertEqual(r.status_code, 400)

    def test_put_nao_permitido(self):
        pk = self.client.post(INTERACOES, self.corpo(), format="json").data["id"]
        self.assertEqual(self.client.put(f"{INTERACOES}{pk}/", self.corpo(), format="json").status_code, 405)

    def test_excluir_chamado_remove_historico(self):
        self.client.post(INTERACOES, self.corpo(), format="json")
        self.assertEqual(Interacao.objects.count(), 1)
        self.client.delete(f"{CHAMADOS}{self.chamado.pk}/")
        self.assertEqual(Interacao.objects.count(), 0)
