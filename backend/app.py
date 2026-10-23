from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return {"mensagem": "VISAT Manager Backend funcionando!"}


@app.route("/api/health")
def health():
    return {"status": "ok"}


@app.route("/api/demandas", methods=["GET"])
def listar_demandas():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row

    cursor = conn.cursor()
    cursor.execute("SELECT * FROM demandas")

    demandas = [dict(row) for row in cursor.fetchall()]

    conn.close()

    return jsonify(demandas)


@app.route("/api/demandas", methods=["POST"])
def criar_demanda():
    dados = request.json

    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO demandas (
            numero_processo,
            orgao_solicitante,
            municipio,
            bairro,
            tipo_ocorrencia,
            data_entrada,
            prazo_resposta,
            descricao,
            prioridade_manual,
            justificativa_prioridade,
            data_alteracao_prioridade,
            responsavel,
            status,
            origem,
            data_cadastro
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        dados.get("numero_processo"),
        dados.get("orgao_solicitante"),
        dados.get("municipio"),
        dados.get("bairro"),
        dados.get("tipo_ocorrencia"),
        dados.get("data_entrada"),
        dados.get("prazo_resposta"),
        dados.get("descricao"),
        dados.get("prioridade_manual"),
        dados.get("justificativa_prioridade"),
        dados.get("data_alteracao_prioridade"),
        dados.get("responsavel"),
        dados.get("status"),
        dados.get("origem"),
        dados.get("data_cadastro")
    ))

    demanda_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return {
        "mensagem": "Demanda cadastrada com sucesso!",
        "id": demanda_id
    }, 201

@app.route("/api/teste")
def criar_demanda_teste():

    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO demandas (
            numero_processo,
            orgao_solicitante,
            municipio,
            tipo_ocorrencia,
            data_entrada,
            prazo_resposta,
            prioridade_manual,
            responsavel,
            status,
            origem
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "123456",
        "Prefeitura",
        "Recife",
        "Inspeção",
        "2026-10-22",
        "2026-10-25",
        "Alta",
        "Lucas",
        "Em andamento",
        "Manual"
    ))

    conn.commit()
    conn.close()

    return {
        "mensagem": "Demanda teste criada!"
    }

@app.route("/api/demandas/<int:id>", methods=["DELETE"])
def excluir_demanda(id):

    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM demandas WHERE id = ?",
        (id,)
    )

    conn.commit()
    conn.close()

    return {
        "mensagem": "Demanda removida com sucesso!"
    }


@app.route("/api/demandas/<int:id>", methods=["PUT"])
def atualizar_demanda(id):
    dados = request.json

    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE demandas
        SET
            prioridade_manual = ?,
            justificativa_prioridade = ?,
            data_alteracao_prioridade = ?
        WHERE id = ?
    """, (
        dados.get("prioridade_manual"),
        dados.get("justificativa_prioridade"),
        dados.get("data_alteracao_prioridade"),
        id
    ))

    if cursor.rowcount == 0:
        conn.close()

        return {
            "mensagem": "Demanda não encontrada."
        }, 404

    conn.commit()
    conn.close()

    return {
        "mensagem": "Demanda atualizada com sucesso!"
    }

if __name__ == "__main__":
    app.run(debug=True)