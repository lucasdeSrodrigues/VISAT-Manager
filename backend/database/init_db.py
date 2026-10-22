import sqlite3

conn = sqlite3.connect("database.db")

cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS demandas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_processo TEXT,
    orgao_solicitante TEXT,
    municipio TEXT,
    tipo_ocorrencia TEXT,
    data_entrada TEXT,
    prazo_resposta TEXT,
    prioridade_manual TEXT,
    responsavel TEXT,
    status TEXT,
    origem TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS historico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    demanda_id INTEGER,
    data_hora TEXT,
    acao TEXT,
    usuario TEXT,
    detalhes TEXT,
    FOREIGN KEY (demanda_id) REFERENCES demandas(id)
)
""")

conn.commit()
conn.close()

print("Banco criado com sucesso!")