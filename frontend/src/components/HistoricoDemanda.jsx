import { useState } from 'react'
import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import './HistoricoDemanda.css'

const LIMITE_MARCOS_VISIVEIS = 3

function formatarDataHora(dataHora) {
  if (!dataHora) {
    return '-'
  }

  const data = new Date(dataHora)

  if (Number.isNaN(data.getTime())) {
    return '-'
  }

  return data.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function criarClasseEvento(tipoAcao) {
  return (tipoAcao || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
}

function HistoricoDemanda({
  historico = [],
}) {
  const navigate = useNavigate()
  const { id } = useParams()

  const [
    linhaTempoExpandida,
    setLinhaTempoExpandida,
  ] = useState(false)

  const eventosOrdenados = [
    ...historico,
  ].sort(
    (eventoA, eventoB) =>
      new Date(eventoA.dataHora).getTime() -
      new Date(eventoB.dataHora).getTime(),
  )

  const marcosLinhaTempo =
    eventosOrdenados.filter(
      (evento) =>
        evento.tipoAcao ===
          'Cadastro da demanda' ||
        evento.tipoAcao ===
          'Alteração de status',
    )

  const possuiMarcosOcultos =
    marcosLinhaTempo.length >
    LIMITE_MARCOS_VISIVEIS

  const marcosVisiveis =
    linhaTempoExpandida
      ? marcosLinhaTempo
      : marcosLinhaTempo.slice(
          0,
          LIMITE_MARCOS_VISIVEIS,
        )

  const quantidadeMarcosOcultos =
    marcosLinhaTempo.length -
    LIMITE_MARCOS_VISIVEIS

  return (
    <section className="detalhes-card">
      <div className="detalhes-card-header">
        <div>
          <h2>Linha do tempo</h2>

          <p>
            Acompanhe os principais marcos e as
            mudanças de etapa da demanda.
          </p>
        </div>

        <span className="historico-contador">
          {marcosLinhaTempo.length}{' '}
          {marcosLinhaTempo.length === 1
            ? 'marco'
            : 'marcos'}
        </span>
      </div>

      {marcosLinhaTempo.length === 0 ? (
        <div className="historico-vazio">
          <strong>
            Nenhum marco registrado
          </strong>

          <p>
            As mudanças de etapa da demanda
            aparecerão aqui.
          </p>
        </div>
      ) : (
        <>
          <ol className="linha-tempo">
            {marcosVisiveis.map(
              (evento) => (
                <li
                  className="linha-tempo-item"
                  key={evento.id}
                >
                  <div
                    className={`linha-tempo-marcador evento-${criarClasseEvento(
                      evento.tipoAcao,
                    )}`}
                    aria-hidden="true"
                  />

                  <div className="linha-tempo-conteudo">
                    <div className="linha-tempo-cabecalho">
                      <strong>
                        {evento.tipoAcao ===
                        'Alteração de status'
                          ? evento.statusPosterior
                          : evento.tipoAcao}
                      </strong>

                      <time
                        dateTime={
                          evento.dataHora
                        }
                      >
                        {formatarDataHora(
                          evento.dataHora,
                        )}
                      </time>
                    </div>

                    <p>
                      {evento.descricao}
                    </p>
                  </div>
                </li>
              ),
            )}
          </ol>

          {possuiMarcosOcultos && (
            <div className="historico-expandir-area">
              <button
                className="historico-expandir-button"
                type="button"
                aria-expanded={
                  linhaTempoExpandida
                }
                onClick={() =>
                  setLinhaTempoExpandida(
                    (valorAtual) =>
                      !valorAtual,
                  )
                }
              >
                {linhaTempoExpandida
                  ? 'Mostrar menos'
                  : `Ver todos os marcos (+${quantidadeMarcosOcultos})`}
              </button>
            </div>
          )}
        </>
      )}

      <div className="historico-completo-acesso">
        <div>
          <strong>
            Precisa consultar todas as ações?
          </strong>

          <p>
            Veja alterações de responsável,
            prioridade, status, data, horário e
            usuário responsável.
          </p>
        </div>

        <button
          className="consultar-historico-button"
          type="button"
          onClick={() =>
            navigate(
              `/demandas/${id}/historico`,
            )
          }
        >
          Consultar histórico completo
        </button>
      </div>
    </section>
  )
}

export default HistoricoDemanda