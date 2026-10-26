import { useNavigate } from 'react-router-dom'

import { useDemandas } from '../context/DemandasContext.jsx'
import {
  calcularDiasRestantes,
  calcularPrioridade,
  obterAlertaPrazo,
} from '../utils/prioridade.js'

import './Dashboard.css'

function formatarData(data) {
  if (!data) {
    return '-'
  }

  const [ano, mes, dia] = data.split('-')

  return `${dia}/${mes}/${ano}`
}

function criarClassePrioridade(prioridade) {
  return prioridade
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
}

function Dashboard() {
  const navigate = useNavigate()
  const { demandas } = useDemandas()

  const demandasComInformacoes = demandas.map((demanda) => {
    const prioridade =
      demanda.prioridadeManual ||
      calcularPrioridade(demanda.prazoResposta)

    const diasRestantes = calcularDiasRestantes(
      demanda.prazoResposta,
    )

    const alertaPrazo = obterAlertaPrazo(
      demanda.prazoResposta,
    )

    return {
      ...demanda,
      prioridade,
      diasRestantes,
      alertaPrazo,
    }
  })

  const demandasAtivas = demandasComInformacoes.filter(
    (demanda) => demanda.status !== 'Finalizada',
  )

  const totalDemandas = demandasAtivas.length

  const totalPrioridadeAlta = demandasAtivas.filter(
    (demanda) => demanda.prioridade === 'Alta',
  ).length

  const totalPrioridadeMedia = demandasAtivas.filter(
    (demanda) => demanda.prioridade === 'Média',
  ).length

  const totalPrioridadeBaixa = demandasAtivas.filter(
    (demanda) => demanda.prioridade === 'Baixa',
  ).length

  const totalPrazosProximos = demandasAtivas.filter(
    (demanda) => demanda.alertaPrazo !== null,
  ).length

  const totalEmAndamento = demandasAtivas.filter(
    (demanda) => demanda.status === 'Em andamento',
  ).length

  const totalEmRevisao = demandasComInformacoes.filter(
    (demanda) => demanda.status === 'Em revisão',
  ).length

  const totalFinalizadas = demandasComInformacoes.filter(
    (demanda) => demanda.status === 'Finalizada',
  ).length

  const demandasMaisUrgentes = [...demandasAtivas]
    .sort((demandaA, demandaB) => {
      const diasA =
        demandaA.diasRestantes === null
          ? Number.POSITIVE_INFINITY
          : demandaA.diasRestantes

      const diasB =
        demandaB.diasRestantes === null
          ? Number.POSITIVE_INFINITY
          : demandaB.diasRestantes

      return diasA - diasB
    })
    .slice(0, 5)

  function abrirDetalhes(id) {
    navigate(`/demandas/${id}`)
  }

  function abrirDetalhesComTeclado(evento, id) {
    if (evento.key === 'Enter' || evento.key === ' ') {
      evento.preventDefault()
      abrirDetalhes(id)
    }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <div>
          <h1>Dashboard</h1>

          <p>
            Visão geral das demandas cadastradas no VISAT Manager.
          </p>
        </div>

        <div className="dashboard-header-actions">
          <button
            className="dashboard-secondary-button"
            type="button"
            onClick={() => navigate('/demandas')}
          >
            Ver demandas
          </button>

          <button
            className="dashboard-primary-button"
            type="button"
            onClick={() => navigate('/cadastro')}
          >
            Nova demanda
          </button>
        </div>
      </div>

      <section
        className="dashboard-cards"
        aria-label="Indicadores das demandas"
      >
        <article className="dashboard-card dashboard-card-total">
          <div className="dashboard-card-header">
            <span>Total de demandas</span>

            <span
              className="dashboard-card-icon"
              aria-hidden="true"
            >
              D
            </span>
          </div>

          <strong>{totalDemandas}</strong>

          <p>Demandas registradas na plataforma</p>
        </article>

        <article className="dashboard-card dashboard-card-alta">
          <div className="dashboard-card-header">
            <span>Prioridade alta</span>

            <span
              className="dashboard-card-icon"
              aria-hidden="true"
            >
              !
            </span>
          </div>

          <strong>{totalPrioridadeAlta}</strong>

          <p>Demandas que exigem maior atenção</p>
        </article>

        <article className="dashboard-card dashboard-card-prazo">
          <div className="dashboard-card-header">
            <span>Prazos próximos</span>

            <span
              className="dashboard-card-icon"
              aria-hidden="true"
            >
              P
            </span>
          </div>

          <strong>{totalPrazosProximos}</strong>

          <p>Vencem hoje ou nos próximos 3 dias</p>
        </article>

        <article className="dashboard-card dashboard-card-andamento">
          <div className="dashboard-card-header">
            <span>Em andamento</span>

            <span
              className="dashboard-card-icon"
              aria-hidden="true"
            >
              A
            </span>
          </div>

          <strong>{totalEmAndamento}</strong>

          <p>Demandas com acompanhamento ativo</p>
        </article>
      </section>

      <div className="dashboard-content-grid">
        <section className="dashboard-panel dashboard-urgentes">
          <div className="dashboard-panel-header">
            <div>
              <h2>Demandas mais urgentes</h2>

              <p>
                Registros organizados pelo prazo de resposta mais próximo.
              </p>
            </div>

            {totalDemandas > 0 && (
              <button
                type="button"
                onClick={() => navigate('/demandas')}
              >
                Ver todas
              </button>
            )}
          </div>

          {demandasMaisUrgentes.length === 0 ? (
            <div className="dashboard-empty-state">
              <h3>Nenhuma demanda cadastrada</h3>

              <p>
                Cadastre a primeira demanda para começar o acompanhamento.
              </p>

              <button
                type="button"
                onClick={() => navigate('/cadastro')}
              >
                Cadastrar demanda
              </button>
            </div>
          ) : (
            <div className="dashboard-demandas-list">
              {demandasMaisUrgentes.map((demanda) => {
                const classePrioridade =
                  criarClassePrioridade(
                    demanda.prioridade,
                  )

                return (
                  <article
                    className="dashboard-demanda-item"
                    key={demanda.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Abrir detalhes da demanda de ${demanda.orgaoSolicitante}`}
                    onClick={() =>
                      abrirDetalhes(demanda.id)
                    }
                    onKeyDown={(evento) =>
                      abrirDetalhesComTeclado(
                        evento,
                        demanda.id,
                      )
                    }
                  >
                    <div className="dashboard-demanda-main">
                      <strong>
                        {demanda.orgaoSolicitante}
                      </strong>

                      <span>
                        {demanda.tipoOcorrencia}
                      </span>
                    </div>

                    <div className="dashboard-demanda-prazo">
                      <span>
                        {formatarData(
                          demanda.prazoResposta,
                        )}
                      </span>

                      {demanda.alertaPrazo && (
                        <small>
                          {demanda.alertaPrazo.mensagem}
                        </small>
                      )}
                    </div>

                    <span
                      className={`dashboard-prioridade prioridade-${classePrioridade}`}
                    >
                      {demanda.prioridade}
                    </span>

                    <span
                      className="dashboard-demanda-seta"
                      aria-hidden="true"
                    >
                      ›
                    </span>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <section className="dashboard-panel dashboard-prioridades">
          <div className="dashboard-panel-header">
            <div>
              <h2>Demandas por prioridade</h2>

              <p>Distribuição atual dos registros.</p>
            </div>
          </div>

          <div className="prioridades-resumo">
            <div className="prioridade-resumo-item">
              <div>
                <span className="prioridade-dot prioridade-dot-alta" />

                <strong>Alta</strong>
              </div>

              <span>{totalPrioridadeAlta}</span>
            </div>

            <div className="prioridade-resumo-item">
              <div>
                <span className="prioridade-dot prioridade-dot-media" />

                <strong>Média</strong>
              </div>

              <span>{totalPrioridadeMedia}</span>
            </div>

            <div className="prioridade-resumo-item">
              <div>
                <span className="prioridade-dot prioridade-dot-baixa" />

                <strong>Baixa</strong>
              </div>

              <span>{totalPrioridadeBaixa}</span>
            </div>
          </div>

          <div className="dashboard-status-resumo">
  <h3>Status das demandas</h3>

  <div className="prioridades-resumo">
    <div className="prioridade-resumo-item">
      <div>
        <strong>Em andamento</strong>
      </div>

      <span>{totalEmAndamento}</span>
    </div>

    <div className="prioridade-resumo-item">
      <div>
        <strong>Em revisão</strong>
      </div>

      <span>{totalEmRevisao}</span>
    </div>

    <div className="prioridade-resumo-item">
      <div>
        <strong>Finalizadas</strong>
      </div>

      <span>{totalFinalizadas}</span>
    </div>
  </div>
</div>

          <div className="dashboard-atalho">
            <h3>Acesso rápido</h3>

            <p>
              Consulte a lista completa ou registre uma nova demanda.
            </p>

            <div className="dashboard-atalho-buttons">
              <button
                type="button"
                onClick={() => navigate('/demandas')}
              >
                Abrir demandas
              </button>

              <button
                type="button"
                onClick={() => navigate('/cadastro')}
              >
                Cadastrar
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Dashboard