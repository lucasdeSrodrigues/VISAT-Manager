import { useEffect, useState } from 'react'
import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import HistoricoDemanda from '../components/HistoricoDemanda.jsx'
import { useDemandas } from '../context/DemandasContext.jsx'
import { calcularPrioridade } from '../utils/prioridade.js'
import './DetalhesDemanda.css'

const RESPONSAVEIS = [
  'Integrante 1',
  'Integrante 2',
  'Integrante 3',
  'Integrante 4',
  'Integrante 5',
]

const STATUS = [
  'Em andamento',
  'Em revisão',
  'Finalizada',
]

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

function criarClasseStatus(status) {
  return (status || '')
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
    atribuirResponsavel,
    alterarStatus,
  } = useDemandas()

  const [confirmacaoAberta, setConfirmacaoAberta] =
    useState(false)

  const [
    modalPrioridadeAberto,
    setModalPrioridadeAberto,
  ] = useState(false)

  const [novaPrioridade, setNovaPrioridade] =
    useState('')

  const [
    justificativaPrioridade,
    setJustificativaPrioridade,
  ] = useState('')

  const [erroPrioridade, setErroPrioridade] =
    useState('')

  const [
    responsavelSelecionado,
    setResponsavelSelecionado,
  ] = useState('')

  const [
    mensagemResponsavel,
    setMensagemResponsavel,
  ] = useState('')

  const [statusSelecionado, setStatusSelecionado] =
    useState('Em andamento')

  const [mensagemStatus, setMensagemStatus] =
    useState('')

  const demanda = buscarDemandaPorId(id)

  useEffect(() => {
    if (!demanda) {
      return
    }

    setResponsavelSelecionado(
      demanda.responsavel || '',
    )

    setStatusSelecionado(
      demanda.status || 'Em andamento',
    )
  }, [demanda])

  function abrirConfirmacao() {
    setConfirmacaoAberta(true)
  }

  function fecharConfirmacao() {
    setConfirmacaoAberta(false)
  }

  async function confirmarExclusao() {
    try {
      const demandaExcluida =
        await excluirDemanda(id)

      if (!demandaExcluida) {
        window.alert(
          'Não foi possível encontrar a demanda para exclusão.',
        )
        return
      }

      navigate('/demandas')
    } catch (erro) {
      console.error(
        'Erro ao excluir demanda:',
        erro,
      )

      window.alert(
        'Não foi possível excluir a demanda. Verifique se o backend está funcionando.',
      )
    }
  }

  function abrirModalPrioridade() {
    if (!demanda) {
      return
    }

    const prioridadeAutomatica =
      calcularPrioridade(
        demanda.prazoResposta,
      )

    setNovaPrioridade(
      demanda.prioridadeManual ||
        prioridadeAutomatica,
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

  async function salvarPrioridadeManual(evento) {
    evento.preventDefault()

    if (!novaPrioridade) {
      setErroPrioridade(
        'Selecione a nova prioridade da demanda.',
      )
      return
    }

    try {
      const prioridadeAlterada =
        await alterarPrioridade(
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
    } catch (erro) {
      console.error(
        'Erro ao alterar prioridade:',
        erro,
      )

      setErroPrioridade(
        'Não foi possível salvar a prioridade. Verifique se o backend está funcionando.',
      )
    }
  }

  async function restaurarPrioridade() {
    try {
      const prioridadeRestaurada =
        await restaurarPrioridadeAutomatica(id)

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
    } catch (erro) {
      console.error(
        'Erro ao restaurar prioridade automática:',
        erro,
      )

      setErroPrioridade(
        'Não foi possível restaurar a prioridade. Verifique se o backend está funcionando.',
      )
    }
  }

  async function salvarResponsavel(evento) {
    evento.preventDefault()

    try {
      const responsavelAtualizado =
        await atribuirResponsavel(
          id,
          responsavelSelecionado,
        )

      if (!responsavelAtualizado) {
        setMensagemResponsavel(
          'Não foi possível atualizar o responsável.',
        )
        return
      }

      setMensagemResponsavel(
        responsavelSelecionado
          ? 'Responsável atribuído com sucesso.'
          : 'Responsável removido da demanda.',
      )
    } catch (erro) {
      console.error(
        'Erro ao atualizar responsável:',
        erro,
      )

      setMensagemResponsavel(
        'Não foi possível salvar o responsável. Verifique se o backend está funcionando.',
      )
    }
  }

  async function salvarStatus(evento) {
    evento.preventDefault()

    if (
      statusSelecionado === demanda.status
    ) {
      setMensagemStatus(
        'A demanda já está com este status.',
      )
      return
    }

    try {
      const statusAtualizado =
        await alterarStatus(
          id,
          statusSelecionado,
        )

      if (!statusAtualizado) {
        setMensagemStatus(
          'Não foi possível atualizar o status.',
        )
        return
      }

      setMensagemStatus(
        'Status atualizado com sucesso.',
      )
    } catch (erro) {
      console.error(
        'Erro ao atualizar status:',
        erro,
      )

      setMensagemStatus(
        'Não foi possível salvar o status. Verifique se o backend está funcionando.',
      )
    }
  }

  if (!demanda) {
    return (
      <div className="detalhes-page">
        <div className="demanda-nao-encontrada">
          <h1>Demanda não encontrada</h1>

          <p>
            O registro solicitado não existe ou não está
            mais disponível.
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

  const prioridadeAutomatica =
    calcularPrioridade(
      demanda.prazoResposta,
    )

  const prioridadeAtual =
    demanda.prioridadeManual ||
    prioridadeAutomatica

  const prioridadeFoiAjustada =
    Boolean(demanda.prioridadeManual)

  const classePrioridade =
    criarClassePrioridade(
      prioridadeAtual,
    )

  const classePrioridadeAutomatica =
    criarClassePrioridade(
      prioridadeAutomatica,
    )

  const classeStatus =
    criarClasseStatus(demanda.status)

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

        <strong>
          {demanda.orgaoSolicitante}
        </strong>
      </nav>

      <div className="detalhes-page-header">
        <div>
          <span className="demanda-selecionada-label">
            Demanda selecionada
          </span>

          <h1>
            {demanda.orgaoSolicitante}
          </h1>

          <p>
            Consulte as informações registradas para esta
            demanda.
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

      <section className="detalhes-card responsavel-card">
        <div className="detalhes-card-header responsavel-card-header">
          <div className="responsavel-card-texto">
            <h2>Responsável pela demanda</h2>

            <p>
              Atribua a demanda a um integrante da equipe
              para acompanhar a distribuição do trabalho.
            </p>
          </div>

          <div className="responsavel-atual-resumo">
            <span>Responsável atual</span>

            <strong>
              {demanda.responsavel ||
                'Sem responsável'}
            </strong>
          </div>
        </div>

        <form
          className="responsavel-form"
          onSubmit={salvarResponsavel}
        >
          <div className="responsavel-form-field">
            <label htmlFor="responsavelDemanda">
              Integrante responsável
            </label>

            <select
              id="responsavelDemanda"
              value={responsavelSelecionado}
              onChange={(evento) => {
                setResponsavelSelecionado(
                  evento.target.value,
                )

                setMensagemResponsavel('')
              }}
            >
              <option value="">
                Sem responsável
              </option>

              {RESPONSAVEIS.map(
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

          <button
            className="salvar-responsavel-button"
            type="submit"
          >
            Salvar responsável
          </button>
        </form>

        {mensagemResponsavel && (
          <p
            className="responsavel-mensagem"
            role="status"
          >
            {mensagemResponsavel}
          </p>
        )}
      </section>

      <section className="detalhes-card status-card">
        <div className="detalhes-card-header status-card-header">
          <div className="status-card-texto">
            <h2>Status da demanda</h2>

            <p>
              Registre a etapa atual da demanda para manter
              o acompanhamento do processo atualizado.
            </p>
          </div>

          <div className="status-atual-resumo">
            <span>Status atual</span>

            <strong
              className={`status-atual-badge status-${classeStatus}`}
            >
              {demanda.status}
            </strong>
          </div>
        </div>

        <form
          className="status-form"
          onSubmit={salvarStatus}
        >
          <div className="status-form-field">
            <label htmlFor="statusDemanda">
              Novo status
            </label>

            <select
              id="statusDemanda"
              value={statusSelecionado}
              onChange={(evento) => {
                setStatusSelecionado(
                  evento.target.value,
                )

                setMensagemStatus('')
              }}
            >
              {STATUS.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              ))}
            </select>
          </div>

          <button
            className="salvar-status-button"
            type="submit"
          >
            Salvar status
          </button>
        </form>

        {mensagemStatus && (
          <p
            className="status-mensagem"
            role="status"
          >
            {mensagemStatus}
          </p>
        )}
      </section>

      <section className="detalhes-card prioridade-card">
        <div className="detalhes-card-header prioridade-card-header">
          <div>
            <h2>Classificação de prioridade</h2>

            <p>
              A prioridade inicial é calculada
              automaticamente pelo prazo e pode ser ajustada
              conforme a complexidade da demanda.
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
                <small>
                  Ajustada manualmente
                </small>
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

              <p>
                {demanda.justificativaPrioridade ||
                  'Nenhuma justificativa informada.'}
              </p>
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
          <div>
            <h2>Informações da demanda</h2>

            <p>
              Dados registrados no cadastro manual.
            </p>
          </div>
        </div>

        <div className="detalhes-grid">
          <div className="detalhes-campo">
            <span>Órgão solicitante</span>

            <strong>
              {demanda.orgaoSolicitante}
            </strong>
          </div>

          <div className="detalhes-campo">
            <span>Tipo de ocorrência</span>

            <strong>
              {demanda.tipoOcorrencia}
            </strong>
          </div>

          <div className="detalhes-campo">
            <span>Data de entrada</span>

            <strong>
              {formatarData(
                demanda.dataEntrada,
              )}
            </strong>
          </div>

          <div className="detalhes-campo">
            <span>Prazo de resposta</span>

            <strong>
              {formatarData(
                demanda.prazoResposta,
              )}
            </strong>
          </div>

          <div className="detalhes-campo">
            <span>Município</span>

            <strong>
              {demanda.municipio}
            </strong>
          </div>

          <div className="detalhes-campo">
            <span>Bairro ou área</span>

            <strong>
              {demanda.bairro}
            </strong>
          </div>

          <div className="detalhes-campo detalhes-campo-completo">
            <span>Descrição da demanda</span>

            <p>{demanda.descricao}</p>
          </div>
        </div>
      </section>

      <section className="detalhes-card">
        <div className="detalhes-card-header">
          <div>
            <h2>Documentos e anexos</h2>

            <p>
              Espaço reservado para os documentos vinculados
              à demanda.
            </p>
          </div>
        </div>

        <div className="funcionalidade-futura">
          <strong>
            Nenhum documento disponível
          </strong>

          <p>
            A anexação de documentos será implementada em
            uma etapa futura.
          </p>
        </div>
      </section>

      <HistoricoDemanda
        historico={demanda.historico || []}
      />

      <section className="acoes-perigosas">
        <div className="acoes-perigosas-texto">
          <h2>Excluir demanda</h2>

          <p>
            Esta ação removerá a demanda da lista e não
            poderá ser desfeita.
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
                  Ajuste a prioridade conforme a complexidade
                  e a necessidade de trabalho da demanda.
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
                <span>
                  Sugestão automática pelo prazo
                </span>

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
                    setNovaPrioridade(
                      evento.target.value,
                    )
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
                  Justificativa{' '}
                  <small>(opcional)</small>
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