import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useDemandas } from '../context/DemandasContext.jsx'
import { calcularPrioridade } from '../utils/prioridade.js'
import './DetalhesDemanda.css'

function formatarData(data) {
  if (!data) {
    return '-'
  }

  const [ano, mes, dia] = data.split('-')

  return `${dia}/${mes}/${ano}`
}

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

function criarClassePrioridade(prioridade) {
  return prioridade
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
}

function DetalhesDemanda() {
  const navigate = useNavigate()
  const { id } = useParams()

  const {
    buscarDemandaPorId,
    excluirDemanda,
    alterarPrioridade,
    restaurarPrioridadeAutomatica,
  } = useDemandas()

  const [confirmacaoAberta, setConfirmacaoAberta] =
    useState(false)

  const [modalPrioridadeAberto, setModalPrioridadeAberto] =
    useState(false)

  const [novaPrioridade, setNovaPrioridade] =
    useState('')

  const [justificativaPrioridade, setJustificativaPrioridade] =
    useState('')

  const [erroPrioridade, setErroPrioridade] =
    useState('')

  const demanda = buscarDemandaPorId(id)

  function abrirConfirmacao() {
    setConfirmacaoAberta(true)
  }

  function fecharConfirmacao() {
    setConfirmacaoAberta(false)
  }

  function confirmarExclusao() {
    excluirDemanda(id)
    navigate('/demandas')
  }

  function abrirModalPrioridade() {
    if (!demanda) {
      return
    }

    const prioridadeAutomatica = calcularPrioridade(
      demanda.prazoResposta,
    )

    setNovaPrioridade(
      demanda.prioridadeManual || prioridadeAutomatica,
    )

    setJustificativaPrioridade(
      demanda.justificativaPrioridade || '',
    )

    setErroPrioridade('')
    setModalPrioridadeAberto(true)
  }

  function fecharModalPrioridade() {
    setModalPrioridadeAberto(false)
    setErroPrioridade('')
  }

 function salvarPrioridadeManual(evento) {
  evento.preventDefault()

  if (!novaPrioridade) {
    setErroPrioridade(
      'Selecione a nova prioridade da demanda.',
    )
    return
  }

  const prioridadeAlterada = alterarPrioridade(
    id,
    novaPrioridade,
    justificativaPrioridade,
  )

  if (!prioridadeAlterada) {
    setErroPrioridade(
      'Não foi possível alterar a prioridade. Tente novamente.',
    )
    return
  }

  setModalPrioridadeAberto(false)
  setErroPrioridade('')
}

  function restaurarPrioridade() {
    const prioridadeRestaurada =
      restaurarPrioridadeAutomatica(id)

    if (!prioridadeRestaurada) {
      setErroPrioridade(
        'Não foi possível restaurar a prioridade automática.',
      )
      return
    }

    setModalPrioridadeAberto(false)
    setErroPrioridade('')
    setNovaPrioridade('')
    setJustificativaPrioridade('')
  }

  if (!demanda) {
    return (
      <div className="detalhes-page">
        <div className="demanda-nao-encontrada">
          <h1>Demanda não encontrada</h1>

          <p>
            O registro solicitado não existe ou não está mais disponível.
          </p>

          <button
            type="button"
            onClick={() => navigate('/demandas')}
          >
            Voltar para demandas
          </button>
        </div>
      </div>
    )
  }

  const prioridadeAutomatica = calcularPrioridade(
    demanda.prazoResposta,
  )

  const prioridadeAtual =
    demanda.prioridadeManual || prioridadeAutomatica

  const prioridadeFoiAjustada =
    Boolean(demanda.prioridadeManual)

  const classePrioridade =
    criarClassePrioridade(prioridadeAtual)

  const classePrioridadeAutomatica =
    criarClassePrioridade(prioridadeAutomatica)

  return (
    <div className="detalhes-page">
      <nav
        className="detalhes-breadcrumb"
        aria-label="Localização atual"
      >
        <button
          type="button"
          onClick={() => navigate('/demandas')}
        >
          Demandas
        </button>

        <span aria-hidden="true">›</span>

        <strong>{demanda.orgaoSolicitante}</strong>
      </nav>

      <div className="detalhes-page-header">
        <div>
          <span className="demanda-selecionada-label">
            Demanda selecionada
          </span>

          <h1>{demanda.orgaoSolicitante}</h1>

          <p>
            Consulte as informações registradas para esta demanda.
          </p>
        </div>

        <button
          className="voltar-button"
          type="button"
          onClick={() => navigate('/demandas')}
        >
          Voltar para a lista
        </button>
      </div>

      <section className="detalhes-resumo">
        <div className="resumo-item resumo-prioridade">
          <span>Prioridade atual</span>

          <div className="resumo-prioridade-conteudo">
            <span
              className={`detalhes-prioridade-badge prioridade-${classePrioridade}`}
            >
              {prioridadeAtual}
            </span>

            {prioridadeFoiAjustada && (
              <small className="prioridade-manual-label">
                Ajustada manualmente
              </small>
            )}
          </div>
        </div>

        <div className="resumo-item">
          <span>Status</span>

          <strong>{demanda.status}</strong>
        </div>

        <div className="resumo-item">
          <span>Prazo de resposta</span>

          <strong>
            {formatarData(demanda.prazoResposta)}
          </strong>
        </div>

        <div className="resumo-item">
          <span>Origem</span>

          <strong>{demanda.origem}</strong>
        </div>
      </section>

      <section className="detalhes-card prioridade-card">
        <div className="detalhes-card-header prioridade-card-header">
          <div>
            <h2>Classificação de prioridade</h2>

            <p>
              A prioridade inicial é calculada automaticamente pelo prazo
              e pode ser ajustada conforme a complexidade da demanda.
            </p>
          </div>

          <button
            className="alterar-prioridade-button"
            type="button"
            onClick={abrirModalPrioridade}
          >
            Alterar prioridade
          </button>
        </div>

        <div className="prioridade-comparacao">
          <div className="prioridade-comparacao-item">
            <span>Prioridade atual</span>

            <div>
              <span
                className={`detalhes-prioridade-badge prioridade-${classePrioridade}`}
              >
                {prioridadeAtual}
              </span>

              {prioridadeFoiAjustada && (
                <small>Ajustada manualmente</small>
              )}
            </div>
          </div>

          <div className="prioridade-comparacao-item">
            <span>Sugestão pelo prazo</span>

            <div>
              <span
                className={`detalhes-prioridade-badge prioridade-${classePrioridadeAutomatica}`}
              >
                {prioridadeAutomatica}
              </span>

              <small>
                Calculada pelo prazo de resposta
              </small>
            </div>
          </div>
        </div>

        {prioridadeFoiAjustada && (
          <div className="prioridade-justificativa">
            <div>
              <span>Justificativa do ajuste</span>

              <p>{demanda.justificativaPrioridade}</p>
            </div>

            <small>
              Alterada em{' '}
              {formatarDataHora(
                demanda.dataAlteracaoPrioridade,
              )}
            </small>
          </div>
        )}
      </section>

      <section className="detalhes-card">
        <div className="detalhes-card-header">
          <h2>Informações da demanda</h2>

          <p>Dados registrados no cadastro manual.</p>
        </div>

        <div className="detalhes-grid">
          <div className="detalhes-campo">
            <span>Órgão solicitante</span>
            <strong>{demanda.orgaoSolicitante}</strong>
          </div>

          <div className="detalhes-campo">
            <span>Tipo de ocorrência</span>
            <strong>{demanda.tipoOcorrencia}</strong>
          </div>

          <div className="detalhes-campo">
            <span>Data de entrada</span>
            <strong>
              {formatarData(demanda.dataEntrada)}
            </strong>
          </div>

          <div className="detalhes-campo">
            <span>Prazo de resposta</span>
            <strong>
              {formatarData(demanda.prazoResposta)}
            </strong>
          </div>

          <div className="detalhes-campo">
            <span>Município</span>
            <strong>{demanda.municipio}</strong>
          </div>

          <div className="detalhes-campo">
            <span>Bairro ou área</span>
            <strong>{demanda.bairro}</strong>
          </div>

          <div className="detalhes-campo detalhes-campo-completo">
            <span>Descrição da demanda</span>

            <p>{demanda.descricao}</p>
          </div>
        </div>
      </section>

      <section className="detalhes-card">
        <div className="detalhes-card-header">
          <h2>Documentos e anexos</h2>

          <p>
            Espaço reservado para os documentos vinculados à demanda.
          </p>
        </div>

        <div className="funcionalidade-futura">
          <strong>Nenhum documento disponível</strong>

          <p>
            A anexação de documentos será implementada em uma etapa futura.
          </p>
        </div>
      </section>

      <section className="detalhes-card">
        <div className="detalhes-card-header">
          <h2>Movimentações e histórico</h2>

          <p>
            Espaço reservado para o acompanhamento das ações realizadas.
          </p>
        </div>

        <div className="funcionalidade-futura">
          <strong>Nenhuma movimentação registrada</strong>

          <p>
            O histórico e a linha do tempo serão implementados em uma etapa
            futura.
          </p>
        </div>
      </section>

      <section className="acoes-perigosas">
        <div className="acoes-perigosas-texto">
          <h2>Excluir demanda</h2>

          <p>
            Esta ação removerá a demanda da lista e não poderá ser desfeita.
          </p>
        </div>

        <button
          className="excluir-demanda-button"
          type="button"
          onClick={abrirConfirmacao}
        >
          Excluir demanda
        </button>
      </section>

      {modalPrioridadeAberto && (
        <div
          className="prioridade-modal-overlay"
          role="presentation"
          onMouseDown={fecharModalPrioridade}
        >
          <section
            className="prioridade-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="prioridade-modal-titulo"
            aria-describedby="prioridade-modal-descricao"
            onMouseDown={(evento) =>
              evento.stopPropagation()
            }
          >
            <div className="prioridade-modal-header">
              <div>
                <span className="prioridade-modal-label">
                  Ajuste manual
                </span>

                <h2 id="prioridade-modal-titulo">
                  Alterar prioridade
                </h2>

                <p id="prioridade-modal-descricao">
                  Ajuste a prioridade conforme a complexidade e a
                  necessidade de trabalho da demanda.
                </p>
              </div>

              <button
                className="prioridade-modal-fechar"
                type="button"
                aria-label="Fechar janela de alteração de prioridade"
                onClick={fecharModalPrioridade}
              >
                ×
              </button>
            </div>

            <form
              className="prioridade-modal-form"
              onSubmit={salvarPrioridadeManual}
            >
              <div className="prioridade-sugestao">
                <span>Sugestão automática pelo prazo</span>

                <strong>
                  <span
                    className={`detalhes-prioridade-badge prioridade-${classePrioridadeAutomatica}`}
                  >
                    {prioridadeAutomatica}
                  </span>
                </strong>
              </div>

              {erroPrioridade && (
                <p
                  className="prioridade-modal-erro"
                  role="alert"
                >
                  {erroPrioridade}
                </p>
              )}

              <div className="prioridade-form-field">
                <label htmlFor="novaPrioridade">
                  Nova prioridade <span>*</span>
                </label>

                <select
                  id="novaPrioridade"
                  value={novaPrioridade}
                  onChange={(evento) =>
                    setNovaPrioridade(evento.target.value)
                  }
                >
                  <option value="">
                    Selecione uma prioridade
                  </option>

                  <option value="Baixa">
                    Baixa
                  </option>

                  <option value="Média">
                    Média
                  </option>

                  <option value="Alta">
                    Alta
                  </option>
                </select>
              </div>

              <div className="prioridade-form-field">
                <label htmlFor="justificativaPrioridade">
                  Justificativa <small>(opcional)</small>
                </label>

                <textarea
                  id="justificativaPrioridade"
                  rows="5"
                  placeholder="Explique por que a prioridade precisa ser ajustada"
                  value={justificativaPrioridade}
                  onChange={(evento) =>
                    setJustificativaPrioridade(
                      evento.target.value,
                    )
                  }
                />
              </div>

              <div className="prioridade-modal-acoes">
                {prioridadeFoiAjustada && (
                  <button
                    className="restaurar-prioridade-button"
                    type="button"
                    onClick={restaurarPrioridade}
                  >
                    Restaurar automática
                  </button>
                )}

                <div className="prioridade-modal-acoes-principais">
                  <button
                    className="cancelar-prioridade-button"
                    type="button"
                    onClick={fecharModalPrioridade}
                  >
                    Cancelar
                  </button>

                  <button
                    className="salvar-prioridade-button"
                    type="submit"
                  >
                    Salvar alteração
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>
      )}

      {confirmacaoAberta && (
        <div
          className="confirmacao-overlay"
          role="presentation"
          onMouseDown={fecharConfirmacao}
        >
          <section
            className="confirmacao-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmacao-titulo"
            aria-describedby="confirmacao-descricao"
            onMouseDown={(evento) =>
              evento.stopPropagation()
            }
          >
            <div
              className="confirmacao-icone"
              aria-hidden="true"
            >
              !
            </div>

            <h2 id="confirmacao-titulo">
              Excluir demanda?
            </h2>

            <p id="confirmacao-descricao">
              Você está prestes a excluir a demanda de{' '}
              <strong>
                {demanda.orgaoSolicitante}
              </strong>
              . Esta ação não poderá ser desfeita.
            </p>

            <div className="confirmacao-detalhes">
              <div>
                <span>Tipo de ocorrência</span>
                <strong>
                  {demanda.tipoOcorrencia}
                </strong>
              </div>

              <div>
                <span>Prazo de resposta</span>
                <strong>
                  {formatarData(
                    demanda.prazoResposta,
                  )}
                </strong>
              </div>
            </div>

            <div className="confirmacao-acoes">
              <button
                className="cancelar-exclusao-button"
                type="button"
                onClick={fecharConfirmacao}
              >
                Cancelar
              </button>

              <button
                className="confirmar-exclusao-button"
                type="button"
                onClick={confirmarExclusao}
              >
                Excluir demanda
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default DetalhesDemanda