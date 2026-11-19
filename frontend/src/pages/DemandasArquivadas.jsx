import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  useDemandas,
} from '../context/DemandasContext.jsx'

import './DemandasArquivadas.css'

function formatarDataHora(
  dataHora,
) {
  if (!dataHora) {
    return '-'
  }

  const data =
    new Date(dataHora)

  if (
    Number.isNaN(
      data.getTime(),
    )
  ) {
    return '-'
  }

  return data.toLocaleString(
    'pt-BR',
    {
      dateStyle: 'short',
      timeStyle: 'short',
    },
  )
}

function normalizarTexto(
  texto,
) {
  return String(
    texto || '',
  )
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .toLocaleLowerCase(
      'pt-BR',
    )
    .trim()
}

function obterDataOrdenacao(
  dataHora,
) {
  const data =
    new Date(dataHora)

  if (
    Number.isNaN(
      data.getTime(),
    )
  ) {
    return 0
  }

  return data.getTime()
}

function DemandasArquivadas() {
  const navigate =
    useNavigate()

  const {
    demandasArquivadas,
    carregandoArquivadas,
    erroAoCarregarArquivadas,
    carregarDemandasArquivadas,
  } = useDemandas()

  const [
    termoBusca,
    setTermoBusca,
  ] = useState('')

  const [
    filtroResponsavel,
    setFiltroResponsavel,
  ] = useState('todos')

  const [
    ordem,
    setOrdem,
  ] = useState(
    'arquivamento-recente',
  )

  useEffect(() => {
    carregarDemandasArquivadas()
      .catch((erro) => {
        console.error(
          'Erro ao carregar demandas arquivadas:',
          erro,
        )
      })
  }, [])

  const responsaveisArquivados =
    useMemo(() => {
      return [
        ...new Set(
          demandasArquivadas
            .map(
              (demanda) =>
                demanda
                  .responsavel
                  ?.trim(),
            )
            .filter(Boolean),
        ),
      ].sort(
        (
          responsavelA,
          responsavelB,
        ) =>
          responsavelA.localeCompare(
            responsavelB,
            'pt-BR',
          ),
      )
    }, [demandasArquivadas])

  const demandasFiltradas =
    useMemo(() => {
      const termoTratado =
        normalizarTexto(
          termoBusca,
        )

      return demandasArquivadas
        .filter((demanda) => {
          const conteudoBusca =
            [
              demanda
                .numeroProcesso,
              demanda
                .orgaoSolicitante,
              demanda.municipio,
              demanda.bairro,
              demanda
                .tipoOcorrencia,
              demanda.responsavel,
            ]
              .filter(Boolean)
              .join(' ')

          const correspondeBusca =
            !termoTratado ||
            normalizarTexto(
              conteudoBusca,
            ).includes(
              termoTratado,
            )

          const correspondeResponsavel =
            filtroResponsavel ===
              'todos' ||
            (
              filtroResponsavel ===
                'sem-responsavel'
                ? !demanda.responsavel
                : (
                  demanda.responsavel ===
                  filtroResponsavel
                )
            )

          return (
            correspondeBusca &&
            correspondeResponsavel
          )
        })
        .sort(
          (
            demandaA,
            demandaB,
          ) => {
            if (
              ordem ===
              'arquivamento-antigo'
            ) {
              return (
                obterDataOrdenacao(
                  demandaA
                    .dataArquivamento,
                ) -
                obterDataOrdenacao(
                  demandaB
                    .dataArquivamento,
                )
              )
            }

            if (
              ordem ===
              'orgao'
            ) {
              return (
                demandaA
                  .orgaoSolicitante
                  .localeCompare(
                    demandaB
                      .orgaoSolicitante,
                    'pt-BR',
                  )
              )
            }

            return (
              obterDataOrdenacao(
                demandaB
                  .dataArquivamento,
              ) -
              obterDataOrdenacao(
                demandaA
                  .dataArquivamento,
              )
            )
          },
        )
    }, [
      demandasArquivadas,
      filtroResponsavel,
      ordem,
      termoBusca,
    ])

  const filtrosAtivos =
    Boolean(
      termoBusca ||
      filtroResponsavel !==
        'todos',
    )

  function limparFiltros() {
    setTermoBusca('')

    setFiltroResponsavel(
      'todos',
    )
  }

  function abrirDetalhes(
    demandaId,
  ) {
    navigate(
      `/demandas/${demandaId}`,
    )
  }

  function abrirDetalhesComTeclado(
    evento,
    demandaId,
  ) {
    if (
      evento.key === 'Enter' ||
      evento.key === ' '
    ) {
      evento.preventDefault()

      abrirDetalhes(
        demandaId,
      )
    }
  }

  async function tentarNovamente() {
    try {
      await carregarDemandasArquivadas(
        true,
      )
    } catch (erro) {
      console.error(
        'Erro ao recarregar demandas arquivadas:',
        erro,
      )
    }
  }

  return (
    <div className="arquivadas-page">
      <nav
        className="arquivadas-breadcrumb"
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

        <span aria-hidden="true">
          ›
        </span>

        <strong>
          Demandas arquivadas
        </strong>
      </nav>

      <div className="arquivadas-page-header">
        <div>
          <span className="arquivadas-page-label">
            Arquivo de processos
          </span>

          <h1>
            Demandas arquivadas
          </h1>

          <p>
            Consulte processos finalizados
            sem misturá-los às demandas em
            andamento. Os registros
            arquivados permanecem
            disponíveis em modo somente
            leitura.
          </p>
        </div>

        <button
          className="arquivadas-voltar-button"
          type="button"
          onClick={() =>
            navigate('/demandas')
          }
        >
          Voltar para demandas
        </button>
      </div>

      <section
        className="arquivadas-resumo"
        aria-label="Resumo das demandas arquivadas"
      >
        <article>
          <span>
            Total arquivado
          </span>

          <strong>
            {
              demandasArquivadas
                .length
            }
          </strong>

          <p>
            Processos preservados para
            consulta
          </p>
        </article>

        <article>
          <span>
            Resultados exibidos
          </span>

          <strong>
            {
              demandasFiltradas
                .length
            }
          </strong>

          <p>
            Registros que correspondem
            aos filtros
          </p>
        </article>
      </section>

      <section className="arquivadas-card">
        <div className="arquivadas-card-header">
          <div>
            <h2>
              Arquivo de demandas
            </h2>

            <p>
              Pesquise e abra um registro
              para consultar todos os
              detalhes.
            </p>
          </div>

          <span className="arquivadas-somente-leitura">
            Somente leitura
          </span>
        </div>

        <div className="arquivadas-filtros">
          <div className="arquivadas-filtro-busca">
            <label htmlFor="buscaArquivadas">
              Pesquisar
            </label>

            <input
              id="buscaArquivadas"
              type="search"
              autoComplete="off"
              placeholder="Órgão, processo, ocorrência, local ou responsável"
              value={termoBusca}
              onChange={(evento) =>
                setTermoBusca(
                  evento.target.value,
                )
              }
            />
          </div>

          <div className="arquivadas-filtro-campo">
            <label htmlFor="responsavelArquivadas">
              Responsável
            </label>

            <select
              id="responsavelArquivadas"
              value={
                filtroResponsavel
              }
              onChange={(evento) =>
                setFiltroResponsavel(
                  evento.target.value,
                )
              }
            >
              <option value="todos">
                Todos
              </option>

              <option value="sem-responsavel">
                Sem responsável
              </option>

              {responsaveisArquivados.map(
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

          <div className="arquivadas-filtro-campo">
            <label htmlFor="ordemArquivadas">
              Ordenar por
            </label>

            <select
              id="ordemArquivadas"
              value={ordem}
              onChange={(evento) =>
                setOrdem(
                  evento.target.value,
                )
              }
            >
              <option value="arquivamento-recente">
                Arquivamento mais recente
              </option>

              <option value="arquivamento-antigo">
                Arquivamento mais antigo
              </option>

              <option value="orgao">
                Órgão solicitante
              </option>
            </select>
          </div>

          {filtrosAtivos && (
            <button
              className="arquivadas-limpar-button"
              type="button"
              onClick={limparFiltros}
            >
              Limpar filtros
            </button>
          )}
        </div>

        {carregandoArquivadas ? (
          <div
            className="arquivadas-estado"
            role="status"
            aria-live="polite"
          >
            <div
              className="arquivadas-carregando-icone"
              aria-hidden="true"
            />

            <h3>
              Carregando demandas
              arquivadas
            </h3>

            <p>
              Aguarde enquanto os
              processos são consultados.
            </p>
          </div>
        ) : erroAoCarregarArquivadas ? (
          <div
            className="arquivadas-estado arquivadas-estado-erro"
            role="alert"
          >
            <span aria-hidden="true">
              !
            </span>

            <h3>
              Não foi possível carregar
              o arquivo
            </h3>

            <p>
              {
                erroAoCarregarArquivadas
              }
            </p>

            <button
              type="button"
              onClick={
                tentarNovamente
              }
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          demandasFiltradas.length ===
          0
        ) ? (
          <div className="arquivadas-estado">
            <span aria-hidden="true">
              A
            </span>

            <h3>
              {
                demandasArquivadas
                  .length === 0
                  ? (
                    'Nenhuma demanda arquivada'
                  )
                  : (
                    'Nenhuma demanda encontrada'
                  )
              }
            </h3>

            <p>
              {
                demandasArquivadas
                  .length === 0
                  ? (
                    'As demandas finalizadas e arquivadas aparecerão nesta área.'
                  )
                  : (
                    'Altere ou limpe os filtros para tentar uma nova pesquisa.'
                  )
              }
            </p>

            {filtrosAtivos && (
              <button
                type="button"
                onClick={
                  limparFiltros
                }
              >
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="arquivadas-table-container">
            <table className="arquivadas-table">
              <thead>
                <tr>
                  <th>
                    Órgão solicitante
                  </th>

                  <th>
                    Ocorrência
                  </th>

                  <th>
                    Local
                  </th>

                  <th>
                    Responsável
                  </th>

                  <th>
                    Finalização
                  </th>

                  <th>
                    Arquivamento
                  </th>

                  <th>
                    <span className="sr-only">
                      Abrir detalhes
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {demandasFiltradas.map(
                  (demanda) => (
                    <tr
                      key={demanda.id}
                      tabIndex={0}
                      role="button"
                      aria-label={
                        (
                          'Consultar demanda ' +
                          'arquivada de ' +
                          demanda
                            .orgaoSolicitante
                        )
                      }
                      onClick={() =>
                        abrirDetalhes(
                          demanda.id,
                        )
                      }
                      onKeyDown={(
                        evento,
                      ) =>
                        abrirDetalhesComTeclado(
                          evento,
                          demanda.id,
                        )
                      }
                    >
                      <td>
                        <div className="arquivadas-orgao-cell">
                          <strong>
                            {
                              demanda
                                .orgaoSolicitante
                            }
                          </strong>

                          {demanda
                            .numeroProcesso ? (
                            <small>
                              Processo{' '}
                              {
                                demanda
                                  .numeroProcesso
                              }
                            </small>
                          ) : (
                            <small>
                              Sem número de
                              processo
                            </small>
                          )}
                        </div>
                      </td>

                      <td>
                        {
                          demanda
                            .tipoOcorrencia
                        }
                      </td>

                      <td>
                        <strong>
                          {
                            demanda
                              .municipio
                          }
                        </strong>

                        <small>
                          {
                            demanda
                              .bairro
                          }
                        </small>
                      </td>

                      <td>
                        {demanda
                          .responsavel ? (
                          <span className="arquivadas-responsavel-badge">
                            {
                              demanda
                                .responsavel
                            }
                          </span>
                        ) : (
                          <span className="arquivadas-sem-responsavel">
                            Sem responsável
                          </span>
                        )}
                      </td>

                      <td>
                        {formatarDataHora(
                          demanda
                            .dataFinalizacao,
                        )}
                      </td>

                      <td>
                        {formatarDataHora(
                          demanda
                            .dataArquivamento,
                        )}
                      </td>

                      <td>
                        <span
                          className="arquivadas-abrir-indicador"
                          aria-hidden="true"
                        >
                          ›
                        </span>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default DemandasArquivadas