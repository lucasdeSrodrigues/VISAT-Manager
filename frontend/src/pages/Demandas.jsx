import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  calcularPrioridade,
  obterAlertaPrazo,
} from '../utils/prioridade.js'
import { useDemandas } from '../context/DemandasContext.jsx'
import './Demandas.css'

const PESO_PRIORIDADE = {
  Alta: 1,
  Média: 2,
  Baixa: 3,
  'Não definida': 4,
}

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

function obterValorData(data) {
  if (!data) {
    return Number.POSITIVE_INFINITY
  }

  const [ano, mes, dia] = data.split('-').map(Number)

  if (!ano || !mes || !dia) {
    return Number.POSITIVE_INFINITY
  }

  return new Date(ano, mes - 1, dia).getTime()
}

function obterPrioridadeAtual(demanda) {
  return (
    demanda.prioridadeManual ||
    calcularPrioridade(demanda.prazoResposta)
  )
}

function Demandas() {
  const navigate = useNavigate()
  const { demandas } = useDemandas()

  const [criterioOrdenacao, setCriterioOrdenacao] =
    useState('prazo')

  function abrirDemanda(id) {
    navigate(`/demandas/${id}`)
  }

  function abrirDemandaComTeclado(evento, id) {
    if (evento.key === 'Enter' || evento.key === ' ') {
      evento.preventDefault()
      abrirDemanda(id)
    }
  }

  const demandasOrdenadas = [...demandas].sort(
    (demandaA, demandaB) => {
      const prazoA = obterValorData(
        demandaA.prazoResposta,
      )

      const prazoB = obterValorData(
        demandaB.prazoResposta,
      )

      if (criterioOrdenacao === 'prioridade') {
        const prioridadeA =
          obterPrioridadeAtual(demandaA)

        const prioridadeB =
          obterPrioridadeAtual(demandaB)

        const pesoA =
          PESO_PRIORIDADE[prioridadeA] ??
          PESO_PRIORIDADE['Não definida']

        const pesoB =
          PESO_PRIORIDADE[prioridadeB] ??
          PESO_PRIORIDADE['Não definida']

        if (pesoA !== pesoB) {
          return pesoA - pesoB
        }
      }

      return prazoA - prazoB
    },
  )

  return (
    <div className="demandas-page">
      <div className="demandas-page-header">
        <div>
          <h1>Demandas</h1>

          <p>
            Visualize e acompanhe as demandas cadastradas no VISAT Manager.
          </p>
        </div>

        <button
          className="nova-demanda-button"
          type="button"
          onClick={() => navigate('/cadastro')}
        >
          Nova demanda
        </button>
      </div>

      <section className="demandas-card">
        <div className="demandas-card-header">
          <div>
            <h2>Painel central de demandas</h2>

            <p>
              {demandas.length === 1
                ? '1 demanda cadastrada'
                : `${demandas.length} demandas cadastradas`}
            </p>
          </div>

          {demandas.length > 0 && (
            <div className="demandas-order-control">
              <label htmlFor="criterioOrdenacao">
                Ordenar por
              </label>

              <select
                id="criterioOrdenacao"
                value={criterioOrdenacao}
                onChange={(evento) =>
                  setCriterioOrdenacao(evento.target.value)
                }
              >
                <option value="prazo">
                  Prazo mais próximo
                </option>

                <option value="prioridade">
                  Prioridade mais alta
                </option>
              </select>
            </div>
          )}
        </div>

        {demandas.length === 0 ? (
          <div className="demandas-empty">
            <h3>Nenhuma demanda cadastrada</h3>

            <p>
              Cadastre a primeira demanda manualmente para começar o
              acompanhamento.
            </p>

            <button
              type="button"
              onClick={() => navigate('/cadastro')}
            >
              Cadastrar primeira demanda
            </button>
          </div>
        ) : (
          <div className="demandas-table-container">
            <table className="demandas-table">
              <thead>
                <tr>
                  <th className="coluna-orgao">
                    Órgão solicitante
                  </th>

                  <th className="coluna-local">
                    Local
                  </th>

                  <th className="coluna-tipo">
                    Tipo de ocorrência
                  </th>

                  <th className="coluna-prioridade">
                    Prioridade
                  </th>

                  <th className="coluna-data-entrada">
                    Data de entrada
                  </th>

                  <th className="coluna-prazo">
                    Prazo
                  </th>

                  <th className="coluna-status">
                    Status
                  </th>

                  <th className="coluna-origem">
                    Origem
                  </th>

                  <th className="coluna-detalhes">
                    <span className="sr-only">
                      Abrir detalhes
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {demandasOrdenadas.map((demanda) => {
                  const prioridade =
                    obterPrioridadeAtual(demanda)

                  const classePrioridade =
                    criarClassePrioridade(prioridade)

                  const alertaPrazo = obterAlertaPrazo(
                    demanda.prazoResposta,
                  )

                  const prioridadeFoiAjustada =
                    Boolean(demanda.prioridadeManual)

                  return (
                    <tr
                      className="demanda-row"
                      key={demanda.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`Abrir detalhes da demanda de ${demanda.orgaoSolicitante}`}
                      onClick={() =>
                        abrirDemanda(demanda.id)
                      }
                      onKeyDown={(evento) =>
                        abrirDemandaComTeclado(
                          evento,
                          demanda.id,
                        )
                      }
                    >
                      <td className="coluna-orgao">
                        <strong>
                          {demanda.orgaoSolicitante}
                        </strong>
                      </td>

                      <td className="coluna-local">
                        <span>{demanda.municipio}</span>
                        <small>{demanda.bairro}</small>
                      </td>

                      <td className="coluna-tipo">
                        {demanda.tipoOcorrencia}
                      </td>

                      <td className="coluna-prioridade">
                        <div className="prioridade-cell">
                          <span
                            className={`prioridade-badge prioridade-${classePrioridade}`}
                          >
                            {prioridade}
                          </span>

                          {prioridadeFoiAjustada && (
                            <small className="prioridade-ajustada-label">
                              Ajustada
                            </small>
                          )}
                        </div>
                      </td>

                      <td className="coluna-data-entrada">
                        {formatarData(demanda.dataEntrada)}
                      </td>

                      <td className="coluna-prazo">
                        <div className="prazo-cell">
                          <span>
                            {formatarData(
                              demanda.prazoResposta,
                            )}
                          </span>

                          {alertaPrazo && (
                            <span
                              className={`prazo-proximo-badge prazo-proximo-dias-${alertaPrazo.diasRestantes}`}
                            >
                              {alertaPrazo.mensagem}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="coluna-status">
                        <span className="status-badge">
                          {demanda.status}
                        </span>
                      </td>

                      <td className="coluna-origem">
                        <span className="manual-badge">
                          {demanda.origem}
                        </span>
                      </td>

                      <td
                        className="coluna-detalhes detalhes-indicator"
                        aria-hidden="true"
                      >
                        <span>›</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default Demandas