import sqlite3

conn = sqlite3.connect("database.db")

cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS demandas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_processo TEXT,
    orgao_solicitante TEXT NOT NULL,
    municipio TEXT NOT NULL,
    bairro TEXT NOT NULL,
    tipo_ocorrencia TEXT NOT NULL,
    data_entrada TEXT NOT NULL,
    prazo_resposta TEXT NOT NULL,
    descricao TEXT NOT NULL,
    prioridade_manual TEXT,
    justificativa_prioridade TEXT,
    data_alteracao_prioridade TEXT,
    responsavel TEXT,
    status TEXT NOT NULL,
    origem TEXT NOT NULL,
    data_cadastro TEXT NOT NULL
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS historico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    demanda_id INTEGER NOT NULL,
    data_hora TEXT NOT NULL,
    acao TEXT NOT NULL,
    usuario TEXT,
    detalhes TEXT,
    status_anterior TEXT,
    status_posterior TEXT,
    FOREIGN KEY (demanda_id) REFERENCES demandas(id)
)
""")

conn.commit()
conn.close()

print("Banco criado com sucesso!")