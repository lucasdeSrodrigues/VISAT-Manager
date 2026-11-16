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

const ABAS_STATUS = [
  {
    valor: 'Em andamento',
    rotulo: 'Em andamento',
  },
  {
    valor: 'Em revisão',
    rotulo: 'Em revisão',
  },
  {
    valor: 'Finalizada',
    rotulo: 'Finalizadas',
  },
]

function formatarData(data) {
  if (!data) {
    return '-'
  }

  const [ano, mes, dia] = data.split('-')

  return `${dia}/${mes}/${ano}`
}

function normalizarTexto(texto) {
  return (texto || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function criarClassePrioridade(prioridade) {
  return normalizarTexto(prioridade)
    .replace(/\s+/g, '-')
}

function criarClasseStatus(status) {
  return normalizarTexto(status)
    .replace(/\s+/g, '-')
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

function obterValorData(data) {
  if (!data) {
    return Number.POSITIVE_INFINITY
  }

  const [ano, mes, dia] =
    data.split('-').map(Number)

  if (!ano || !mes || !dia) {
    return Number.POSITIVE_INFINITY
  }

  return new Date(
    ano,
    mes - 1,
    dia,
  ).getTime()
}

function obterPrioridadeAtual(demanda) {
  return (
    demanda.prioridadeManual ||
    calcularPrioridade(
      demanda.prazoResposta,
    )
  )
}

function Demandas() {
  const navigate = useNavigate()
  const { demandas } = useDemandas()

  const [
    criterioOrdenacao,
    setCriterioOrdenacao,
  ] = useState('prazo')

  const [buscaArea, setBuscaArea] =
    useState('')

  const [
    filtroResponsavel,
    setFiltroResponsavel,
  ] = useState('todos')

  const [abaStatus, setAbaStatus] =
    useState('Em andamento')

  function abrirDemanda(id) {
    navigate(`/demandas/${id}`)
  }

  function abrirDemandaComTeclado(
    evento,
    id,
  ) {
    if (
      evento.key === 'Enter' ||
      evento.key === ' '
    ) {
      evento.preventDefault()
      abrirDemanda(id)
    }
  }

  function limparFiltros() {
    setBuscaArea('')
    setFiltroResponsavel('todos')
  }

  function contarDemandasPorStatus(status) {
    return demandas.filter(
      (demanda) =>
        demanda.status === status,
    ).length
  }

  const buscaAreaNormalizada =
    normalizarTexto(buscaArea)

  const responsaveis = [
    ...new Set(
      demandas
        .map(
          (demanda) =>
            demanda.responsavel,
        )
        .filter(Boolean),
    ),
  ].sort((responsavelA, responsavelB) =>
    responsavelA.localeCompare(
      responsavelB,
      'pt-BR',
    ),
  )

  const demandasDaAba = demandas.filter(
    (demanda) =>
      demanda.status === abaStatus,
  )

  const demandasFiltradas =
    demandasDaAba.filter((demanda) => {
      const municipioNormalizado =
        normalizarTexto(
          demanda.municipio,
        )

      const bairroNormalizado =
        normalizarTexto(
          demanda.bairro,
        )

      const correspondeArea =
        !buscaAreaNormalizada ||
        municipioNormalizado.includes(
          buscaAreaNormalizada,
        ) ||
        bairroNormalizado.includes(
          buscaAreaNormalizada,
        )

      const correspondeResponsavel =
        filtroResponsavel === 'todos' ||
        (
          filtroResponsavel ===
          'sem-responsavel'
            ? !demanda.responsavel
            : demanda.responsavel ===
              filtroResponsavel
        )

      return (
        correspondeArea &&
        correspondeResponsavel
      )
    })

  const demandasOrdenadas = [
    ...demandasFiltradas,
  ].sort((demandaA, demandaB) => {
    const prazoA = obterValorData(
      demandaA.prazoResposta,
    )

    const prazoB = obterValorData(
      demandaB.prazoResposta,
    )

    if (
      criterioOrdenacao ===
      'prioridade'
    ) {
      const prioridadeA =
        obterPrioridadeAtual(demandaA)

      const prioridadeB =
        obterPrioridadeAtual(demandaB)

      const pesoA =
        PESO_PRIORIDADE[prioridadeA] ??
        PESO_PRIORIDADE[
          'Não definida'
        ]

      const pesoB =
        PESO_PRIORIDADE[prioridadeB] ??
        PESO_PRIORIDADE[
          'Não definida'
        ]

      if (pesoA !== pesoB) {
        return pesoA - pesoB
      }
    }

    return prazoA - prazoB
  })

  const possuiFiltroAtivo =
    Boolean(buscaArea) ||
    filtroResponsavel !== 'todos'

  return (
    <div className="demandas-page">
      <div className="demandas-page-header">
        <div>
          <h1>Demandas</h1>

          <p>
            Visualize e acompanhe as
            demandas cadastradas no VISAT
            Manager.
          </p>
        </div>

        <button
          className="nova-demanda-button"
          type="button"
          onClick={() =>
            navigate('/cadastro')
          }
        >
          Nova demanda
        </button>
      </div>

      <nav
        className="demandas-status-tabs"
        aria-label="Demandas por status"
      >
        {ABAS_STATUS.map((aba) => {
          const abaAtiva =
            abaStatus === aba.valor

          const quantidade =
            contarDemandasPorStatus(
              aba.valor,
            )

          return (
            <button
              key={aba.valor}
              className={
                abaAtiva
                  ? 'demandas-status-tab demandas-status-tab-ativa'
                  : 'demandas-status-tab'
              }
              type="button"
              aria-current={
                abaAtiva
                  ? 'page'
                  : undefined
              }
              onClick={() =>
                setAbaStatus(aba.valor)
              }
            >
              <span>{aba.rotulo}</span>

              <span
                className={`demandas-status-contador status-contador-${criarClasseStatus(
                  aba.valor,
                )}`}
              >
                {quantidade}
              </span>
            </button>
          )
        })}
      </nav>

      <section className="demandas-card">
        <div className="demandas-card-header">
          <div>
            <h2>
              Demandas {abaStatus.toLowerCase()}
            </h2>

            <p>
              {demandasDaAba.length === 1
                ? '1 demanda nesta etapa'
                : `${demandasDaAba.length} demandas nesta etapa`}
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
                  setCriterioOrdenacao(
                    evento.target.value,
                  )
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

        {demandas.length > 0 && (
          <div className="demandas-filtros">
            <div className="demandas-filtros-campos">
              <div className="demandas-filtro-campo">
                <label htmlFor="buscaArea">
                  Buscar por bairro ou área
                </label>

                <input
                  id="buscaArea"
                  type="search"
                  placeholder="Ex.: Graças, Boa Viagem ou Recife"
                  value={buscaArea}
                  onChange={(evento) =>
                    setBuscaArea(
                      evento.target.value,
                    )
                  }
                />
              </div>

              <div className="demandas-filtro-campo demandas-filtro-responsavel">
                <label htmlFor="filtroResponsavel">
                  Filtrar por responsável
                </label>

                <select
                  id="filtroResponsavel"
                  value={filtroResponsavel}
                  onChange={(evento) =>
                    setFiltroResponsavel(
                      evento.target.value,
                    )
                  }
                >
                  <option value="todos">
                    Todos os responsáveis
                  </option>

                  <option value="sem-responsavel">
                    Sem responsável
                  </option>

                  {responsaveis.map(
                    (responsavel) => (
                      <option
                        key={responsavel}
                        value={responsavel}
                      >
                        {responsavel}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>

            <div className="demandas-filtros-resumo">
              {possuiFiltroAtivo && (
                <>
                  <p className="demandas-filtro-resultado">
                    {demandasFiltradas.length ===
                    1
                      ? '1 demanda encontrada'
                      : `${demandasFiltradas.length} demandas encontradas`}
                  </p>

                  <button
                    className="limpar-busca-button"
                    type="button"
                    onClick={limparFiltros}
                  >
                    Limpar filtros
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {demandas.length === 0 ? (
          <div className="demandas-empty">
            <h3>
              Nenhuma demanda cadastrada
            </h3>

            <p>
              Cadastre a primeira demanda
              manualmente para começar o
              acompanhamento.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate('/cadastro')
              }
            >
              Cadastrar primeira demanda
            </button>
          </div>
        ) : demandasDaAba.length === 0 ? (
          <div className="demandas-empty">
            <h3>
              Nenhuma demanda{' '}
              {abaStatus.toLowerCase()}
            </h3>

            <p>
              Não existem demandas nesta
              etapa do fluxo de trabalho.
            </p>
          </div>
        ) : demandasFiltradas.length ===
          0 ? (
          <div className="demandas-empty">
            <h3>
              Nenhuma demanda encontrada
            </h3>

            <p>
              Não existem demandas
              correspondentes aos filtros
              selecionados nesta etapa.
            </p>

            <button
              type="button"
              onClick={limparFiltros}
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="demandas-table-container">
            <table className="demandas-table">
              <thead>
                <tr>
                  <th>
                    Órgão solicitante
                  </th>

                  <th>Local</th>

                  <th>
                    Tipo de ocorrência
                  </th>

                  <th>Prioridade</th>

                  <th>Responsável</th>

                  <th>
                    Data de entrada
                  </th>

                  <th>Prazo</th>

                  <th>Status</th>

                  <th>Origem</th>

                  <th>
                    <span className="sr-only">
                      Abrir detalhes
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {demandasOrdenadas.map(
                  (demanda) => {
                    const prioridade =
                      obterPrioridadeAtual(
                        demanda,
                      )

                    const classePrioridade =
                      criarClassePrioridade(
                        prioridade,
                      )

                    const classeStatus =
                      criarClasseStatus(
                        demanda.status,
                      )

                    const diasAtraso =
                      demanda.status !==
                        'Finalizada' &&
                      !demanda.arquivada
                        ? calcularDiasAtraso(
                            demanda.prazoResposta,
                          )
                        : 0

                    const estaAtrasada =
                      diasAtraso > 0

                    const alertaPrazo =
                      estaAtrasada
                        ? null
                        : obterAlertaPrazo(
                            demanda.prazoResposta,
                          )

                    const prioridadeFoiAjustada =
                      Boolean(
                        demanda.prioridadeManual,
                      )

                    const classeLinha =
                      estaAtrasada
                        ? (
                          'demanda-row ' +
                          'demanda-row-atrasada'
                        )
                        : 'demanda-row'

                    return (
                      <tr
                        className={classeLinha}
                        key={demanda.id}
                        role="button"
                        tabIndex={0}
                        aria-label={
                          estaAtrasada
                            ? (
                              `Abrir detalhes da demanda atrasada de ${demanda.orgaoSolicitante}`
                            )
                            : (
                              `Abrir detalhes da demanda de ${demanda.orgaoSolicitante}`
                            )
                        }
                        onClick={() =>
                          abrirDemanda(
                            demanda.id,
                          )
                        }
                        onKeyDown={(evento) =>
                          abrirDemandaComTeclado(
                            evento,
                            demanda.id,
                          )
                        }
                      >
                        <td>
                          <div className="orgao-cell">
                            <strong>
                              {
                                demanda.orgaoSolicitante
                              }
                            </strong>

                            {estaAtrasada && (
                              <span className="demanda-atrasada-label">
                                Prazo vencido
                              </span>
                            )}
                          </div>
                        </td>

                        <td>
                          <span>
                            {demanda.municipio}
                          </span>

                          <small>
                            {demanda.bairro}
                          </small>
                        </td>

                        <td>
                          {
                            demanda.tipoOcorrencia
                          }
                        </td>

                        <td>
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

                        <td>
                          {demanda.responsavel ? (
                            <span className="responsavel-badge">
                              {
                                demanda.responsavel
                              }
                            </span>
                          ) : (
                            <span className="sem-responsavel-label">
                              Sem responsável
                            </span>
                          )}
                        </td>

                        <td>
                          {formatarData(
                            demanda.dataEntrada,
                          )}
                        </td>

                        <td>
                          <div className="prazo-cell">
                            <span>
                              {formatarData(
                                demanda.prazoResposta,
                              )}
                            </span>

                            {estaAtrasada ? (
                              <span className="prazo-atrasado-badge">
                                {criarMensagemAtraso(
                                  diasAtraso,
                                )}
                              </span>
                            ) : (
                              alertaPrazo && (
                                <span
                                  className={`prazo-proximo-badge prazo-proximo-dias-${alertaPrazo.diasRestantes}`}
                                >
                                  {
                                    alertaPrazo.mensagem
                                  }
                                </span>
                              )
                            )}
                          </div>
                        </td>

                        <td>
                          <span
                            className={`status-badge status-${classeStatus}`}
                          >
                            {demanda.status}
                          </span>
                        </td>

                        <td>
                          <span className="manual-badge">
                            {demanda.origem}
                          </span>
                        </td>

                        <td
                          className="detalhes-indicator"
                          aria-hidden="true"
                        >
                          <span>›</span>
                        </td>
                      </tr>
                    )
                  },
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default Demandas