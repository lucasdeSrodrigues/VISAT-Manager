import { useNavigate } from 'react-router-dom'

import { useDemandas } from '../context/DemandasContext.jsx'
import {
  obterAlertaPrazo,
} from '../utils/prioridade.js'

import './CentralAlertas.css'

function formatarData(data) {
  if (!data) {
    return '-'
  }

  const [ano, mes, dia] = data.split('-')

  return `${dia}/${mes}/${ano}`
}

function CentralAlertas({
  aberta,
  onFechar,
  onDispensar,
}) {
  const navigate = useNavigate()
  const { demandas } = useDemandas()

  const demandasComPrazoProximo = demandas
    .map((demanda) => {
      const alerta = obterAlertaPrazo(
        demanda.prazoResposta,
      )

      if (!alerta) {
        return null
      }

      return {
        ...demanda,
        alerta,
      }
    })
    .filter(Boolean)
    .sort(
      (demandaA, demandaB) =>
        demandaA.alerta.diasRestantes -
        demandaB.alerta.diasRestantes,
    )

  if (!aberta) {
    return null
  }

  function abrirDetalhes(id) {
    onFechar()
    navigate(`/demandas/${id}`)
  }

  function verDemandas() {
    onFechar()
    navigate('/demandas')
  }

  function tratarCliqueFora(evento) {
    if (evento.target === evento.currentTarget) {
      onFechar()
    }
  }

  function tratarTeclaDemanda(evento, id) {
    if (
      evento.key === 'Enter' ||
      evento.key === ' '
    ) {
      evento.preventDefault()
      abrirDetalhes(id)
    }
  }

  const quantidadeAlertas =
    demandasComPrazoProximo.length

  return (
    <div
      className="central-alertas-overlay"
      role="presentation"
      onMouseDown={tratarCliqueFora}
    >
      <section
        className="central-alertas-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="central-alertas-titulo"
        aria-describedby="central-alertas-descricao"
      >
        <div className="central-alertas-header">
          <div>
            <span className="central-alertas-label">
              Central de alertas
            </span>

            <h2 id="central-alertas-titulo">
              Alertas de prazo
            </h2>

            <p id="central-alertas-descricao">
              {quantidadeAlertas === 0
                ? 'Não há demandas próximas do vencimento.'
                : quantidadeAlertas === 1
                  ? '1 demanda está próxima do vencimento.'
                  : `${quantidadeAlertas} demandas estão próximas do vencimento.`}
            </p>
          </div>

          <button
            className="central-alertas-fechar"
            type="button"
            aria-label="Fechar Central de Alertas"
            onClick={onFechar}
          >
            ×
          </button>
        </div>

        {quantidadeAlertas === 0 ? (
          <div className="central-alertas-vazia">
            <div
              className="central-alertas-vazia-icone"
              aria-hidden="true"
            >
              ✓
            </div>

            <h3>Nenhum prazo próximo</h3>

            <p>
              No momento, nenhuma demanda vence hoje ou
              nos próximos três dias.
            </p>
          </div>
        ) : (
          <div className="central-alertas-conteudo">
            <div className="central-alertas-resumo">
              <strong>
                Demandas que precisam de atenção
              </strong>

              <p>
                A lista está ordenada do prazo mais
                urgente para o menos urgente.
              </p>
            </div>

            <div className="central-alertas-lista">
              {demandasComPrazoProximo.map(
                (demanda) => (
                  <article
                    className="central-alerta-item"
                    key={demanda.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Abrir detalhes da demanda de ${demanda.orgaoSolicitante}`}
                    onClick={() =>
                      abrirDetalhes(demanda.id)
                    }
                    onKeyDown={(evento) =>
                      tratarTeclaDemanda(
                        evento,
                        demanda.id,
                      )
                    }
                  >
                    <div className="central-alerta-principal">
                      <div className="central-alerta-titulo">
                        <strong>
                          {demanda.orgaoSolicitante}
                        </strong>

                        <span
                          className={`central-alerta-prazo central-alerta-dias-${demanda.alerta.diasRestantes}`}
                        >
                          {demanda.alerta.mensagem}
                        </span>
                      </div>

                      <p>
                        {demanda.tipoOcorrencia}
                      </p>

                      <div className="central-alerta-informacoes">
                        <span>
                          <strong>Local:</strong>{' '}
                          {demanda.municipio}
                          {demanda.bairro
                            ? ` - ${demanda.bairro}`
                            : ''}
                        </span>

                        <span>
                          <strong>Prazo:</strong>{' '}
                          {formatarData(
                            demanda.prazoResposta,
                          )}
                        </span>
                      </div>
                    </div>

                    <span
                      className="central-alerta-seta"
                      aria-hidden="true"
                    >
                      ›
                    </span>
                  </article>
                ),
              )}
            </div>
          </div>
        )}

        <div className="central-alertas-acoes">
          {quantidadeAlertas > 0 && (
            <button
              className="central-alertas-dispensar"
              type="button"
              onClick={onDispensar}
            >
              Dispensar
            </button>
          )}

          <button
            className="central-alertas-ver-demandas"
            type="button"
            onClick={
              quantidadeAlertas > 0
                ? verDemandas
                : onFechar
            }
          >
            {quantidadeAlertas > 0
              ? 'Ver demandas'
              : 'Fechar'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default CentralAlertas