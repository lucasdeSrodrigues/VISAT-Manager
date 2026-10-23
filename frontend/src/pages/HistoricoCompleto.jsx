import { useState } from 'react'
import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import { useDemandas } from '../context/DemandasContext.jsx'
import './HistoricoCompleto.css'

const LIMITE_EVENTOS_VISIVEIS = 3

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

function criarClasseStatus(status) {
  return (status || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
}

function HistoricoCompleto() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { buscarDemandaPorId } =
    useDemandas()

  const [
    historicoExpandido,
    setHistoricoExpandido,
  ] = useState(false)

  const demanda =
    buscarDemandaPorId(id)

  if (!demanda) {
    return (
      <div className="historico-page">
        <div className="historico-nao-encontrado">
          <h1>Demanda não encontrada</h1>

          <p>
            O registro solicitado não existe ou
            não está disponível.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate('/demandas')
            }
          >
            Voltar para demandas
          </button>
        </div>
      </div>
    )
  }

  const eventosOrdenados = [
    ...(demanda.historico || []),
  ].sort(
    (eventoA, eventoB) =>
      new Date(eventoB.dataHora).getTime() -
      new Date(eventoA.dataHora).getTime(),
  )

  const possuiEventosOcultos =
    eventosOrdenados.length >
    LIMITE_EVENTOS_VISIVEIS

  const eventosVisiveis =
    historicoExpandido
      ? eventosOrdenados
      : eventosOrdenados.slice(
          0,
          LIMITE_EVENTOS_VISIVEIS,
        )

  const quantidadeOculta =
    eventosOrdenados.length -
    LIMITE_EVENTOS_VISIVEIS

  const classeStatus =
    criarClasseStatus(demanda.status)

  return (
    <div className="historico-page">
      <nav
        className="historico-breadcrumb"
        aria-label="Localização atual"
      >
        <button
          type="button"
          onClick={() =>
            navigate('/demandas')
          }
        >
          Demandas
        </button>

        <span aria-hidden="true">›</span>

        <button
          type="button"
          onClick={() =>
            navigate(`/demandas/${id}`)
          }
        >
          {demanda.orgaoSolicitante}
        </button>

        <span aria-hidden="true">›</span>

        <strong>Histórico completo</strong>
      </nav>

      <div className="historico-page-header">
        <div>
          <span className="historico-page-label">
            UH15
          </span>

          <h1>Histórico completo da demanda</h1>

          <p>
            Consulte todas as movimentações,
            alterações e responsáveis associados à
            demanda.
          </p>
        </div>

        <button
          className="historico-voltar-button"
          type="button"
          onClick={() =>
            navigate(`/demandas/${id}`)
          }
        >
          Voltar aos detalhes
        </button>
      </div>

      <section className="historico-resumo-card">
        <div className="historico-resumo-principal">
          <span>Demanda</span>

          <strong>
            {demanda.orgaoSolicitante}
          </strong>

          <small>
            {demanda.tipoOcorrencia}
          </small>
        </div>

        <div>
          <span>Status atual</span>

          <strong
            className={`historico-status-badge status-${classeStatus}`}
          >
            {demanda.status}
          </strong>
        </div>

        <div>
          <span>Responsável atual</span>

          <strong>
            {demanda.responsavel ||
              'Sem responsável'}
          </strong>
        </div>

        <div>
          <span>Total de eventos</span>

          <strong>
            {eventosOrdenados.length}
          </strong>
        </div>
      </section>

      <section className="historico-completo-card">
        <div className="historico-completo-header">
          <div>
            <h2>Movimentações registradas</h2>

            <p>
              Os eventos mais recentes aparecem
              primeiro.
            </p>
          </div>

          {!historicoExpandido &&
            possuiEventosOcultos && (
              <span>
                Exibindo os 3 eventos mais recentes
              </span>
            )}
        </div>

        {eventosOrdenados.length === 0 ? (
          <div className="historico-completo-vazio">
            <strong>
              Nenhuma movimentação registrada
            </strong>

            <p>
              As ações realizadas na demanda serão
              exibidas nesta página.
            </p>
          </div>
        ) : (
          <>
            <div className="historico-completo-lista">
              {eventosVisiveis.map(
                (evento) => (
                  <article
                    className="historico-completo-evento"
                    key={evento.id}
                  >
                    <div className="historico-evento-topo">
                      <div>
                        <span className="historico-evento-tipo">
                          {evento.tipoAcao}
                        </span>

                        <h3>
                          {evento.descricao}
                        </h3>
                      </div>

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

                    <div className="historico-evento-informacoes">
                      <div>
                        <span>
                          Usuário responsável
                        </span>

                        <strong>
                          {evento.usuario}
                        </strong>
                      </div>

                      <div>
                        <span>Status anterior</span>

                        <strong>
                          {evento.statusAnterior ||
                            '-'}
                        </strong>
                      </div>

                      <div>
                        <span>Status posterior</span>

                        <strong>
                          {evento.statusPosterior ||
                            '-'}
                        </strong>
                      </div>
                    </div>
                  </article>
                ),
              )}
            </div>

            {possuiEventosOcultos && (
              <div className="historico-completo-expandir">
                <button
                  type="button"
                  aria-expanded={
                    historicoExpandido
                  }
                  onClick={() =>
                    setHistoricoExpandido(
                      (valorAtual) =>
                        !valorAtual,
                    )
                  }
                >
                  {historicoExpandido
                    ? 'Mostrar menos'
                    : `Ver histórico completo (+${quantidadeOculta})`}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}

export default HistoricoCompleto