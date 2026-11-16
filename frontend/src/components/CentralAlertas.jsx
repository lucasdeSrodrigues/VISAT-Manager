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

function converterDataLocal(data) {
  if (!data) {
    return null
  }

  const partes = data
    .split('-')
    .map(Number)

  if (
    partes.length !== 3 ||
    partes.some(Number.isNaN)
  ) {
    return null
  }

  const [ano, mes, dia] = partes

  const dataConvertida = new Date(
    ano,
    mes - 1,
    dia,
  )

  if (
    dataConvertida.getFullYear() !== ano ||
    dataConvertida.getMonth() !== mes - 1 ||
    dataConvertida.getDate() !== dia
  ) {
    return null
  }

  dataConvertida.setHours(
    0,
    0,
    0,
    0,
  )

  return dataConvertida
}

function calcularDiasAtraso(
  prazoResposta,
) {
  const prazo =
    converterDataLocal(
      prazoResposta,
    )

  if (!prazo) {
    return 0
  }

  const hoje = new Date()

  hoje.setHours(
    0,
    0,
    0,
    0,
  )

  if (prazo >= hoje) {
    return 0
  }

  const diferenca =
    hoje.getTime() -
    prazo.getTime()

  return Math.floor(
    diferenca /
      (1000 * 60 * 60 * 24),
  )
}

function criarMensagemAtraso(
  diasAtraso,
) {
  if (diasAtraso === 1) {
    return 'Atrasada há 1 dia'
  }

  return (
    `Atrasada há ${diasAtraso} dias`
  )
}

function CentralAlertas({
  aberta,
  onFechar,
  onDispensar,
}) {
  const navigate = useNavigate()
  const { demandas } = useDemandas()

  const demandasComAlerta = demandas
    .map((demanda) => {
      if (
        demanda.status ===
          'Finalizada' ||
        demanda.arquivada
      ) {
        return null
      }

      const diasAtraso =
        calcularDiasAtraso(
          demanda.prazoResposta,
        )

      if (diasAtraso > 0) {
        return {
          ...demanda,
          alerta: {
            tipo: 'atrasada',
            diasAtraso,
            diasRestantes:
              -diasAtraso,
            mensagem:
              criarMensagemAtraso(
                diasAtraso,
              ),
          },
        }
      }

      const alertaPrazo =
        obterAlertaPrazo(
          demanda.prazoResposta,
        )

      if (!alertaPrazo) {
        return null
      }

      return {
        ...demanda,
        alerta: {
          ...alertaPrazo,
          tipo: 'prazo-proximo',
          diasAtraso: 0,
        },
      }
    })
    .filter(Boolean)
    .sort(
      (demandaA, demandaB) => {
        const alertaA =
          demandaA.alerta

        const alertaB =
          demandaB.alerta

        if (
          alertaA.tipo ===
            'atrasada' &&
          alertaB.tipo !==
            'atrasada'
        ) {
          return -1
        }

        if (
          alertaA.tipo !==
            'atrasada' &&
          alertaB.tipo ===
            'atrasada'
        ) {
          return 1
        }

        if (
          alertaA.tipo ===
            'atrasada' &&
          alertaB.tipo ===
            'atrasada'
        ) {
          return (
            alertaB.diasAtraso -
            alertaA.diasAtraso
          )
        }

        return (
          alertaA.diasRestantes -
          alertaB.diasRestantes
        )
      },
    )

  const quantidadeAtrasadas =
    demandasComAlerta.filter(
      (demanda) =>
        demanda.alerta.tipo ===
        'atrasada',
    ).length

  const quantidadePrazoProximo =
    demandasComAlerta.filter(
      (demanda) =>
        demanda.alerta.tipo ===
        'prazo-proximo',
    ).length

  const quantidadeAlertas =
    demandasComAlerta.length

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
    if (
      evento.target ===
      evento.currentTarget
    ) {
      onFechar()
    }
  }

  function tratarTeclaDemanda(
    evento,
    id,
  ) {
    if (
      evento.key === 'Enter' ||
      evento.key === ' '
    ) {
      evento.preventDefault()
      abrirDetalhes(id)
    }
  }

  function criarResumoAlertas() {
    if (quantidadeAlertas === 0) {
      return (
        'Não há demandas atrasadas ' +
        'ou próximas do vencimento.'
      )
    }

    if (
      quantidadeAtrasadas > 0 &&
      quantidadePrazoProximo > 0
    ) {
      const textoAtrasadas =
        quantidadeAtrasadas === 1
          ? '1 demanda atrasada'
          : (
            `${quantidadeAtrasadas} ` +
            'demandas atrasadas'
          )

      const textoPrazoProximo =
        quantidadePrazoProximo === 1
          ? (
            '1 demanda próxima ' +
            'do vencimento'
          )
          : (
            `${quantidadePrazoProximo} ` +
            'demandas próximas ' +
            'do vencimento'
          )

      return (
        `${textoAtrasadas} e ` +
        `${textoPrazoProximo}.`
      )
    }

    if (quantidadeAtrasadas > 0) {
      return quantidadeAtrasadas === 1
        ? '1 demanda está atrasada.'
        : (
          `${quantidadeAtrasadas} ` +
          'demandas estão atrasadas.'
        )
    }

    return quantidadePrazoProximo === 1
      ? (
        '1 demanda está próxima ' +
        'do vencimento.'
      )
      : (
        `${quantidadePrazoProximo} ` +
        'demandas estão próximas ' +
        'do vencimento.'
      )
  }

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
              {criarResumoAlertas()}
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

            <h3>
              Nenhum alerta de prazo
            </h3>

            <p>
              No momento, nenhuma demanda está atrasada,
              vence hoje ou vence nos próximos três dias.
            </p>
          </div>
        ) : (
          <div className="central-alertas-conteudo">
            <div className="central-alertas-resumo">
              <strong>
                Demandas que precisam de atenção
              </strong>

              <p>
                As demandas atrasadas aparecem primeiro,
                seguidas pelos prazos mais próximos.
              </p>

              <div className="central-alertas-contadores">
                <span className="central-alertas-contador central-alertas-contador-atrasadas">
                  <strong>
                    {quantidadeAtrasadas}
                  </strong>

                  {quantidadeAtrasadas === 1
                    ? ' atrasada'
                    : ' atrasadas'}
                </span>

                <span className="central-alertas-contador central-alertas-contador-proximas">
                  <strong>
                    {quantidadePrazoProximo}
                  </strong>

                  {quantidadePrazoProximo === 1
                    ? ' próxima do prazo'
                    : ' próximas do prazo'}
                </span>
              </div>
            </div>

            <div className="central-alertas-lista">
              {demandasComAlerta.map(
                (demanda) => {
                  const estaAtrasada =
                    demanda.alerta.tipo ===
                    'atrasada'

                  const classeItem =
                    estaAtrasada
                      ? (
                        'central-alerta-item ' +
                        'central-alerta-item-atrasado'
                      )
                      : 'central-alerta-item'

                  const classePrazo =
                    estaAtrasada
                      ? (
                        'central-alerta-prazo ' +
                        'central-alerta-prazo-atrasado'
                      )
                      : (
                        'central-alerta-prazo ' +
                        `central-alerta-dias-${demanda.alerta.diasRestantes}`
                      )

                  return (
                    <article
                      className={classeItem}
                      key={demanda.id}
                      role="button"
                      tabIndex={0}
                      aria-label={
                        (
                          'Abrir detalhes da demanda de ' +
                          demanda.orgaoSolicitante
                        )
                      }
                      onClick={() =>
                        abrirDetalhes(
                          demanda.id,
                        )
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
                            className={
                              classePrazo
                            }
                          >
                            {demanda.alerta.mensagem}
                          </span>
                        </div>

                        <p>
                          {demanda.tipoOcorrencia}
                        </p>

                        <div className="central-alerta-informacoes">
                          <span>
                            <strong>
                              Local:
                            </strong>{' '}
                            {demanda.municipio}
                            {demanda.bairro
                              ? (
                                ` - ${demanda.bairro}`
                              )
                              : ''}
                          </span>

                          <span>
                            <strong>
                              Prazo:
                            </strong>{' '}
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
                  )
                },
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