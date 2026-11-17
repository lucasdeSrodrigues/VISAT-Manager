import {
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import HistoricoDemanda from '../components/HistoricoDemanda.jsx'
import { useDemandas } from '../context/DemandasContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { calcularPrioridade } from '../utils/prioridade.js'
import './DetalhesDemanda.css'

const STATUS = [
  'Em andamento',
  'Em revisão',
  'Finalizada',
]

const TIPOS_DOCUMENTO = [
  'Relatório',
  'Laudo',
  'Foto',
  'Ofício',
  'Planilha',
  'Outro',
]

function formatarData(data) {
  if (!data) {
    return '-'
  }

  const [ano, mes, dia] =
    data.split('-')

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

  return data.toLocaleString(
    'pt-BR',
    {
      dateStyle: 'short',
      timeStyle: 'short',
    },
  )
}

function formatarTamanho(bytes) {
  const tamanho =
    Number(bytes) || 0

  if (tamanho < 1024) {
    return `${tamanho} B`
  }

  if (
    tamanho <
    1024 * 1024
  ) {
    return (
      `${(
        tamanho / 1024
      ).toFixed(1)} KB`
    )
  }

  return (
    `${(
      tamanho /
      (1024 * 1024)
    ).toFixed(1)} MB`
  )
}

function criarClasse(texto) {
  return (texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .replace(/\s+/g, '-')
}

function DetalhesDemanda() {
  const navigate = useNavigate()
  const { id } = useParams()

  const arquivoInputRef =
    useRef(null)

  const {
    responsaveis,
    buscarDemandaPorId,
    excluirDemanda,
    alterarPrioridade,
    restaurarPrioridadeAutomatica,
    atribuirResponsavel,
    alterarStatus,
    editarDemanda,
    registrarGargalo,
    editarGargalo,
    resolverGargalo,
    reabrirGargalo,
    excluirGargalo,
    anexarDocumento,
    editarDocumento,
    abrirDocumento,
    baixarDocumento,
    excluirDocumento,
  } = useDemandas()

  const {
    usuarioEhGestor,
  } = useAuth()

  const demanda =
    buscarDemandaPorId(id)

  const [
    confirmacaoAberta,
    setConfirmacaoAberta,
  ] = useState(false)

  const [
    modalPrioridadeAberto,
    setModalPrioridadeAberto,
  ] = useState(false)

  const [
    novaPrioridade,
    setNovaPrioridade,
  ] = useState('')

  const [
    justificativaPrioridade,
    setJustificativaPrioridade,
  ] = useState('')

  const [
    erroPrioridade,
    setErroPrioridade,
  ] = useState('')

  const [
    responsavelSelecionado,
    setResponsavelSelecionado,
  ] = useState('')

  const [
    mensagemResponsavel,
    setMensagemResponsavel,
  ] = useState('')

  const [
    statusSelecionado,
    setStatusSelecionado,
  ] = useState(
    'Em andamento',
  )

  const [
    mensagemStatus,
    setMensagemStatus,
  ] = useState('')

  const [
    modoEdicao,
    setModoEdicao,
  ] = useState(false)

  const [
    mensagemEdicao,
    setMensagemEdicao,
  ] = useState('')

  const [
    dadosEdicao,
    setDadosEdicao,
  ] = useState({
    orgaoSolicitante: '',
    municipio: '',
    bairro: '',
    tipoOcorrencia: '',
    prazoResposta: '',
    descricao: '',
  })

  const [
    arquivoDocumento,
    setArquivoDocumento,
  ] = useState(null)

  const [
    tipoDocumento,
    setTipoDocumento,
  ] = useState('')

  const [
    descricaoDocumento,
    setDescricaoDocumento,
  ] = useState('')

  const [
    mensagemDocumento,
    setMensagemDocumento,
  ] = useState('')

  const [
    enviandoDocumento,
    setEnviandoDocumento,
  ] = useState(false)

  const [
    documentoEmProcessamento,
    setDocumentoEmProcessamento,
  ] = useState(null)

  const [
    documentoEmEdicao,
    setDocumentoEmEdicao,
  ] = useState(null)

  const [
    tipoDocumentoEdicao,
    setTipoDocumentoEdicao,
  ] = useState('')

  const [
    descricaoDocumentoEdicao,
    setDescricaoDocumentoEdicao,
  ] = useState('')

  const [
    descricaoGargalo,
    setDescricaoGargalo,
  ] = useState('')

  const [
    mensagemGargalo,
    setMensagemGargalo,
  ] = useState('')

  const [
    salvandoGargalo,
    setSalvandoGargalo,
  ] = useState(false)

  const [
    gargaloEmEdicao,
    setGargaloEmEdicao,
  ] = useState(null)

  const [
    descricaoGargaloEdicao,
    setDescricaoGargaloEdicao,
  ] = useState('')

  const [
    gargaloEmProcessamento,
    setGargaloEmProcessamento,
  ] = useState(null)

  const [
    exibirTodosGargalos,
    setExibirTodosGargalos,
  ] = useState(false)

  useEffect(() => {
    if (!demanda) {
      return
    }

    setResponsavelSelecionado(
      demanda.responsavel || '',
    )

    setStatusSelecionado(
      demanda.status ||
        'Em andamento',
    )

    setDadosEdicao({
      orgaoSolicitante:
        demanda.orgaoSolicitante ||
        '',
      municipio:
        demanda.municipio || '',
      bairro:
        demanda.bairro || '',
      tipoOcorrencia:
        demanda.tipoOcorrencia ||
        '',
      prazoResposta:
        demanda.prazoResposta || '',
      descricao:
        demanda.descricao || '',
    })
  }, [demanda])

  if (!demanda) {
    return (
      <div className="detalhes-page">
        <div className="demanda-nao-encontrada">
          <h1>
            Demanda não encontrada
          </h1>

          <p>
            O registro solicitado não
            existe ou não está mais
            disponível.
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

  const prioridadeAutomatica =
    calcularPrioridade(
      demanda.prazoResposta,
    )

  const prioridadeAtual =
    demanda.prioridadeManual ||
    prioridadeAutomatica

  const prioridadeFoiAjustada =
    Boolean(
      demanda.prioridadeManual,
    )

  const classePrioridade =
    criarClasse(
      prioridadeAtual,
    )

  const classePrioridadeAutomatica =
    criarClasse(
      prioridadeAutomatica,
    )

  const classeStatus =
    criarClasse(
      demanda.status,
    )

  const anexos =
    demanda.anexos || []

  const gargalos =
    demanda.gargalos || []

  const quantidadeGargalosAbertos =
    gargalos.filter(
      (gargalo) =>
        gargalo.status ===
        'Aberto',
    ).length

  const possuiGargalosOcultos =
    gargalos.length > 3

  const gargalosVisiveis =
    exibirTodosGargalos
      ? gargalos
      : gargalos.slice(0, 3)

  async function confirmarExclusao() {
    if (!usuarioEhGestor) {
      return
    }

    try {
      const resultado =
        await excluirDemanda(id)

      if (!resultado) {
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
        erro.message ||
          'Não foi possível excluir a demanda.',
      )
    }
  }

  function abrirModalPrioridade() {
    setNovaPrioridade(
      demanda.prioridadeManual ||
        prioridadeAutomatica,
    )

    setJustificativaPrioridade(
      demanda
        .justificativaPrioridade ||
        '',
    )

    setErroPrioridade('')
    setModalPrioridadeAberto(true)
  }

  async function salvarPrioridadeManual(
    evento,
  ) {
    evento.preventDefault()

    if (!novaPrioridade) {
      setErroPrioridade(
        'Selecione a nova prioridade da demanda.',
      )

      return
    }

    try {
      const resultado =
        await alterarPrioridade(
          id,
          novaPrioridade,
          justificativaPrioridade,
        )

      if (!resultado) {
        setErroPrioridade(
          'Não foi possível alterar a prioridade.',
        )

        return
      }

      setModalPrioridadeAberto(
        false,
      )

      setErroPrioridade('')
    } catch (erro) {
      console.error(
        'Erro ao alterar prioridade:',
        erro,
      )

      setErroPrioridade(
        erro.message ||
          'Não foi possível salvar a prioridade.',
      )
    }
  }

  async function restaurarPrioridade() {
    try {
      const resultado =
        await restaurarPrioridadeAutomatica(
          id,
        )

      if (!resultado) {
        setErroPrioridade(
          'Não foi possível restaurar a prioridade automática.',
        )

        return
      }

      setModalPrioridadeAberto(
        false,
      )

      setErroPrioridade('')
      setNovaPrioridade('')

      setJustificativaPrioridade(
        '',
      )
    } catch (erro) {
      console.error(
        'Erro ao restaurar prioridade:',
        erro,
      )

      setErroPrioridade(
        erro.message ||
          'Não foi possível restaurar a prioridade.',
      )
    }
  }

  async function salvarResponsavel(
    evento,
  ) {
    evento.preventDefault()

    const responsavelTratado =
      responsavelSelecionado.trim()

    try {
      const resultado =
        await atribuirResponsavel(
          id,
          responsavelTratado,
        )

      if (!resultado) {
        setMensagemResponsavel(
          'Não foi possível atualizar o responsável.',
        )

        return
      }

      setMensagemResponsavel(
        responsavelTratado
          ? 'Responsável atribuído com sucesso.'
          : 'Responsável removido da demanda.',
      )
    } catch (erro) {
      console.error(
        'Erro ao atualizar responsável:',
        erro,
      )

      setMensagemResponsavel(
        erro.message ||
          'Não foi possível salvar o responsável.',
      )
    }
  }

  async function salvarStatus(
    evento,
  ) {
    evento.preventDefault()

    if (
      statusSelecionado ===
      demanda.status
    ) {
      setMensagemStatus(
        'A demanda já está com este status.',
      )

      return
    }

    try {
      const resultado =
        await alterarStatus(
          id,
          statusSelecionado,
        )

      setMensagemStatus(
        resultado
          ? 'Status atualizado com sucesso.'
          : 'Não foi possível atualizar o status.',
      )
    } catch (erro) {
      console.error(
        'Erro ao atualizar status:',
        erro,
      )

      setMensagemStatus(
        erro.message ||
          'Não foi possível salvar o status.',
      )
    }
  }

  async function salvarEdicao(
    evento,
  ) {
    evento.preventDefault()

    try {
      const resultado =
        await editarDemanda(
          id,
          dadosEdicao,
        )

      if (!resultado) {
        setMensagemEdicao(
          'Não foi possível atualizar a demanda.',
        )

        return
      }

      setModoEdicao(false)

      setMensagemEdicao(
        'Dados atualizados com sucesso.',
      )
    } catch (erro) {
      console.error(
        'Erro ao editar demanda:',
        erro,
      )

      setMensagemEdicao(
        erro.message ||
          'Não foi possível salvar as alterações.',
      )
    }
  }

  function cancelarEdicao() {
    setModoEdicao(false)

    setDadosEdicao({
      orgaoSolicitante:
        demanda.orgaoSolicitante ||
        '',
      municipio:
        demanda.municipio || '',
      bairro:
        demanda.bairro || '',
      tipoOcorrencia:
        demanda.tipoOcorrencia ||
        '',
      prazoResposta:
        demanda.prazoResposta || '',
      descricao:
        demanda.descricao || '',
    })
  }

  async function salvarDocumento(
    evento,
  ) {
    evento.preventDefault()

    try {
      setEnviandoDocumento(true)
      setMensagemDocumento('')

      const resultado =
        await anexarDocumento(
          id,
          arquivoDocumento,
          tipoDocumento,
          descricaoDocumento,
        )

      if (!resultado) {
        setMensagemDocumento(
          'Não foi possível anexar o documento.',
        )

        return
      }

      setArquivoDocumento(null)
      setTipoDocumento('')
      setDescricaoDocumento('')

      if (
        arquivoInputRef.current
      ) {
        arquivoInputRef.current.value =
          ''
      }

      setMensagemDocumento(
        'Documento anexado com sucesso.',
      )
    } catch (erro) {
      console.error(
        'Erro ao anexar documento:',
        erro,
      )

      setMensagemDocumento(
        erro.message ||
          'Não foi possível anexar o documento.',
      )
    } finally {
      setEnviandoDocumento(false)
    }
  }

  function iniciarEdicaoDocumento(
    anexo,
  ) {
    if (!usuarioEhGestor) {
      return
    }

    setDocumentoEmEdicao(
      anexo.id,
    )

    setTipoDocumentoEdicao(
      anexo.tipoDocumento,
    )

    setDescricaoDocumentoEdicao(
      anexo.descricao,
    )

    setMensagemDocumento('')
  }

  function cancelarEdicaoDocumento() {
    setDocumentoEmEdicao(null)
    setTipoDocumentoEdicao('')

    setDescricaoDocumentoEdicao(
      '',
    )
  }

  async function salvarEdicaoDocumento(
    anexoId,
  ) {
    try {
      setDocumentoEmProcessamento(
        anexoId,
      )

      setMensagemDocumento('')

      const resultado =
        await editarDocumento(
          id,
          anexoId,
          tipoDocumentoEdicao,
          descricaoDocumentoEdicao,
        )

      if (!resultado) {
        setMensagemDocumento(
          'Não foi possível editar o documento.',
        )

        return
      }

      cancelarEdicaoDocumento()

      setMensagemDocumento(
        'Documento atualizado com sucesso.',
      )
    } catch (erro) {
      console.error(
        'Erro ao editar documento:',
        erro,
      )

      setMensagemDocumento(
        erro.message ||
          'Não foi possível editar o documento.',
      )
    } finally {
      setDocumentoEmProcessamento(
        null,
      )
    }
  }

  async function executarAcaoDocumento(
    anexoId,
    acao,
  ) {
    try {
      setDocumentoEmProcessamento(
        anexoId,
      )

      setMensagemDocumento('')

      await acao(
        id,
        anexoId,
      )
    } catch (erro) {
      console.error(
        'Erro ao acessar documento:',
        erro,
      )

      setMensagemDocumento(
        erro.message ||
          'Não foi possível acessar o documento.',
      )
    } finally {
      setDocumentoEmProcessamento(
        null,
      )
    }
  }

  async function confirmarExclusaoDocumento(
    anexo,
  ) {
    const confirmou =
      window.confirm(
        `Deseja excluir o documento “${anexo.nomeOriginal}”?`,
      )

    if (!confirmou) {
      return
    }

    try {
      setDocumentoEmProcessamento(
        anexo.id,
      )

      setMensagemDocumento('')

      const resultado =
        await excluirDocumento(
          id,
          anexo.id,
        )

      if (!resultado) {
        setMensagemDocumento(
          'Não foi possível excluir o documento.',
        )

        return
      }

      if (
        documentoEmEdicao ===
        anexo.id
      ) {
        cancelarEdicaoDocumento()
      }

      setMensagemDocumento(
        'Documento excluído com sucesso.',
      )
    } catch (erro) {
      console.error(
        'Erro ao excluir documento:',
        erro,
      )

      setMensagemDocumento(
        erro.message ||
          'Não foi possível excluir o documento.',
      )
    } finally {
      setDocumentoEmProcessamento(
        null,
      )
    }
  }

  async function salvarNovoGargalo(
    evento,
  ) {
    evento.preventDefault()

    try {
      setSalvandoGargalo(true)
      setMensagemGargalo('')

      const resultado =
        await registrarGargalo(
          id,
          descricaoGargalo,
        )

      if (!resultado) {
        setMensagemGargalo(
          'Não foi possível registrar o gargalo.',
        )

        return
      }

      setDescricaoGargalo('')

      setMensagemGargalo(
        'Gargalo registrado com sucesso.',
      )
    } catch (erro) {
      console.error(
        'Erro ao registrar gargalo:',
        erro,
      )

      setMensagemGargalo(
        erro.message ||
          'Não foi possível registrar o gargalo.',
      )
    } finally {
      setSalvandoGargalo(false)
    }
  }

  function iniciarEdicaoGargalo(
    gargalo,
  ) {
    if (!usuarioEhGestor) {
      return
    }

    setGargaloEmEdicao(
      gargalo.id,
    )

    setDescricaoGargaloEdicao(
      gargalo.descricao,
    )

    setMensagemGargalo('')
  }

  function cancelarEdicaoGargalo() {
    setGargaloEmEdicao(null)

    setDescricaoGargaloEdicao(
      '',
    )
  }

  async function salvarEdicaoGargalo(
    gargaloId,
  ) {
    try {
      setGargaloEmProcessamento(
        gargaloId,
      )

      setMensagemGargalo('')

      const resultado =
        await editarGargalo(
          id,
          gargaloId,
          descricaoGargaloEdicao,
        )

      if (!resultado) {
        setMensagemGargalo(
          'Não foi possível editar o gargalo.',
        )

        return
      }

      cancelarEdicaoGargalo()

      setMensagemGargalo(
        'Gargalo atualizado com sucesso.',
      )
    } catch (erro) {
      console.error(
        'Erro ao editar gargalo:',
        erro,
      )

      setMensagemGargalo(
        erro.message ||
          'Não foi possível editar o gargalo.',
      )
    } finally {
      setGargaloEmProcessamento(
        null,
      )
    }
  }

  async function alternarStatusGargalo(
    gargalo,
  ) {
    try {
      setGargaloEmProcessamento(
        gargalo.id,
      )

      setMensagemGargalo('')

      const resultado =
        gargalo.status ===
        'Resolvido'
          ? await reabrirGargalo(
              id,
              gargalo.id,
            )
          : await resolverGargalo(
              id,
              gargalo.id,
            )

      if (!resultado) {
        setMensagemGargalo(
          'Não foi possível atualizar o gargalo.',
        )

        return
      }

      setMensagemGargalo(
        gargalo.status ===
        'Resolvido'
          ? 'Gargalo reaberto com sucesso.'
          : 'Gargalo marcado como resolvido.',
      )
    } catch (erro) {
      console.error(
        'Erro ao atualizar gargalo:',
        erro,
      )

      setMensagemGargalo(
        erro.message ||
          'Não foi possível atualizar o gargalo.',
      )
    } finally {
      setGargaloEmProcessamento(
        null,
      )
    }
  }

  async function confirmarExclusaoGargalo(
    gargalo,
  ) {
    const confirmou =
      window.confirm(
        'Deseja realmente excluir este gargalo?',
      )

    if (!confirmou) {
      return
    }

    try {
      setGargaloEmProcessamento(
        gargalo.id,
      )

      setMensagemGargalo('')

      const resultado =
        await excluirGargalo(
          id,
          gargalo.id,
        )

      if (!resultado) {
        setMensagemGargalo(
          'Não foi possível excluir o gargalo.',
        )

        return
      }

      if (
        gargaloEmEdicao ===
        gargalo.id
      ) {
        cancelarEdicaoGargalo()
      }

      setMensagemGargalo(
        'Gargalo excluído com sucesso.',
      )
    } catch (erro) {
      console.error(
        'Erro ao excluir gargalo:',
        erro,
      )

      setMensagemGargalo(
        erro.message ||
          'Não foi possível excluir o gargalo.',
      )
    } finally {
      setGargaloEmProcessamento(
        null,
      )
    }
  }
  return (
    <div className="detalhes-page">
      <nav
        className="detalhes-breadcrumb"
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
            Consulte as informações
            registradas para esta demanda.
          </p>
        </div>

        <button
          className="voltar-button"
          type="button"
          onClick={() =>
            navigate('/demandas')
          }
        >
          Voltar para a lista
        </button>
      </div>

      <section className="detalhes-card">
        <div className="detalhes-card-header">
          <div>
            <h2>
              Informações da demanda
            </h2>

            <p>
              Dados principais registrados
              no cadastro manual.
            </p>
          </div>

          {!modoEdicao && (
            <button
              type="button"
              className="alterar-prioridade-button"
              onClick={() => {
                setModoEdicao(true)
                setMensagemEdicao('')
              }}
            >
              Editar dados
            </button>
          )}
        </div>

        {mensagemEdicao && (
          <p
            className="status-mensagem"
            role="status"
          >
            {mensagemEdicao}
          </p>
        )}

        {!modoEdicao ? (
          <div className="detalhes-grid">
            <div className="detalhes-campo">
              <span>
                Órgão solicitante
              </span>

              <strong>
                {demanda.orgaoSolicitante}
              </strong>
            </div>

            <div className="detalhes-campo">
              <span>
                Tipo de ocorrência
              </span>

              <strong>
                {demanda.tipoOcorrencia}
              </strong>
            </div>

            <div className="detalhes-campo">
              <span>
                Data de entrada
              </span>

              <strong>
                {formatarData(
                  demanda.dataEntrada,
                )}
              </strong>
            </div>

            <div className="detalhes-campo">
              <span>
                Prazo de resposta
              </span>

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
              <span>
                Bairro ou área
              </span>

              <strong>
                {demanda.bairro}
              </strong>
            </div>

            <div className="detalhes-campo detalhes-campo-completo">
              <span>
                Descrição da demanda
              </span>

              <p>
                {demanda.descricao}
              </p>
            </div>
          </div>
        ) : (
          <form
            className="detalhes-grid"
            onSubmit={salvarEdicao}
          >
            <label className="detalhes-campo">
              <span>
                Órgão solicitante
              </span>

              <input
                type="text"
                value={
                  dadosEdicao
                    .orgaoSolicitante
                }
                onChange={(evento) =>
                  setDadosEdicao({
                    ...dadosEdicao,
                    orgaoSolicitante:
                      evento.target.value,
                  })
                }
              />
            </label>

            <label className="detalhes-campo">
              <span>
                Tipo de ocorrência
              </span>

              <input
                type="text"
                value={
                  dadosEdicao
                    .tipoOcorrencia
                }
                onChange={(evento) =>
                  setDadosEdicao({
                    ...dadosEdicao,
                    tipoOcorrencia:
                      evento.target.value,
                  })
                }
              />
            </label>

            <label className="detalhes-campo">
              <span>
                Prazo de resposta
              </span>

              <input
                type="date"
                value={
                  dadosEdicao
                    .prazoResposta
                }
                onChange={(evento) =>
                  setDadosEdicao({
                    ...dadosEdicao,
                    prazoResposta:
                      evento.target.value,
                  })
                }
              />
            </label>

            <label className="detalhes-campo">
              <span>Município</span>

              <input
                type="text"
                value={
                  dadosEdicao.municipio
                }
                onChange={(evento) =>
                  setDadosEdicao({
                    ...dadosEdicao,
                    municipio:
                      evento.target.value,
                  })
                }
              />
            </label>

            <label className="detalhes-campo">
              <span>
                Bairro ou área
              </span>

              <input
                type="text"
                value={
                  dadosEdicao.bairro
                }
                onChange={(evento) =>
                  setDadosEdicao({
                    ...dadosEdicao,
                    bairro:
                      evento.target.value,
                  })
                }
              />
            </label>

            <label className="detalhes-campo detalhes-campo-completo">
              <span>
                Descrição da demanda
              </span>

              <textarea
                rows="5"
                value={
                  dadosEdicao.descricao
                }
                onChange={(evento) =>
                  setDadosEdicao({
                    ...dadosEdicao,
                    descricao:
                      evento.target.value,
                  })
                }
              />
            </label>

            <div className="detalhes-campo detalhes-campo-completo">
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                }}
              >
                <button
                  type="submit"
                  className="salvar-status-button"
                >
                  Salvar alterações
                </button>

                <button
                  type="button"
                  className="cancelar-prioridade-button"
                  onClick={
                    cancelarEdicao
                  }
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        )}
      </section>

      <section className="detalhes-card responsavel-card">
        <div className="detalhes-card-header responsavel-card-header">
          <div className="responsavel-card-texto">
            <h2>
              Responsável pela demanda
            </h2>

            <p>
              {usuarioEhGestor
                ? (
                  'Atribua a demanda a um ' +
                  'integrante da equipe.'
                )
                : (
                  'Consulte o integrante ' +
                  'responsável pelo acompanhamento.'
                )}
            </p>
          </div>

          <div className="responsavel-atual-resumo">
            <span>
              Responsável atual
            </span>

            <strong>
              {demanda.responsavel ||
                'Sem responsável'}
            </strong>
          </div>
        </div>

        {usuarioEhGestor ? (
          <>
            <form
              className="responsavel-form"
              onSubmit={
                salvarResponsavel
              }
            >
              <div className="responsavel-form-field">
                <label htmlFor="responsavelDemanda">
                  Integrante responsável
                </label>

                <input
                  id="responsavelDemanda"
                  type="search"
                  list="listaResponsaveis"
                  maxLength="100"
                  autoComplete="off"
                  value={
                    responsavelSelecionado
                  }
                  onChange={(evento) => {
                    setResponsavelSelecionado(
                      evento.target.value,
                    )

                    setMensagemResponsavel(
                      '',
                    )
                  }}
                />

                <datalist id="listaResponsaveis">
                  {(responsaveis || []).map(
                    (responsavel) => (
                      <option
                        key={responsavel}
                        value={responsavel}
                      />
                    ),
                  )}
                </datalist>
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
          </>
        ) : (
          <p className="responsavel-mensagem">
            A atribuição ou remoção é
            exclusiva do perfil Gestor.
          </p>
        )}
      </section>

      <section className="detalhes-card documentos-card">
        <div className="detalhes-card-header documentos-card-header">
          <div>
            <h2>
              Documentos anexados
            </h2>

            <p>
              Organize as evidências da
              demanda com tipo, descrição
              e responsável.
            </p>
          </div>

          <div className="documentos-resumo">
            <span>
              Total de documentos
            </span>

            <strong>
              {anexos.length}
            </strong>
          </div>
        </div>

        <form
          className="documento-form"
          onSubmit={salvarDocumento}
        >
          <div className="documento-form-grid">
            <div className="documento-form-field">
              <label htmlFor="arquivoDocumento">
                Arquivo
              </label>

              <input
                ref={arquivoInputRef}
                id="arquivoDocumento"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                onChange={(evento) => {
                  setArquivoDocumento(
                    evento.target
                      .files?.[0] ||
                      null,
                  )

                  setMensagemDocumento(
                    '',
                  )
                }}
              />

              <small>
                PDF, Word, Excel ou imagem.
                Máximo de 10 MB.
              </small>
            </div>

            <div className="documento-form-field">
              <label htmlFor="tipoDocumento">
                Tipo de documento
              </label>

              <select
                id="tipoDocumento"
                value={tipoDocumento}
                onChange={(evento) => {
                  setTipoDocumento(
                    evento.target.value,
                  )

                  setMensagemDocumento(
                    '',
                  )
                }}
              >
                <option value="">
                  Selecione o tipo
                </option>

                {TIPOS_DOCUMENTO.map(
                  (tipo) => (
                    <option
                      key={tipo}
                      value={tipo}
                    >
                      {tipo}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="documento-form-field documento-form-descricao">
              <label htmlFor="descricaoDocumento">
                Breve descrição
              </label>

              <textarea
                id="descricaoDocumento"
                rows="3"
                maxLength="300"
                value={
                  descricaoDocumento
                }
                onChange={(evento) => {
                  setDescricaoDocumento(
                    evento.target.value,
                  )

                  setMensagemDocumento(
                    '',
                  )
                }}
                placeholder="Informe o conteúdo ou a finalidade do documento"
              />

              <small>
                {descricaoDocumento.length}
                /300 caracteres
              </small>
            </div>
          </div>

          <button
            className="registrar-documento-button"
            type="submit"
            disabled={
              enviandoDocumento
            }
          >
            {enviandoDocumento
              ? 'Enviando...'
              : 'Anexar documento'}
          </button>
        </form>

        {mensagemDocumento && (
          <p
            className="documento-mensagem"
            role="status"
          >
            {mensagemDocumento}
          </p>
        )}

        <div className="documentos-lista">
          {anexos.length === 0 ? (
            <div className="documentos-vazio">
              <strong>
                Nenhum documento anexado
              </strong>

              <p>
                Os arquivos enviados para
                esta demanda aparecerão aqui.
              </p>
            </div>
          ) : (
            anexos.map((anexo) => {
              const editando =
                documentoEmEdicao ===
                anexo.id

              const processando =
                documentoEmProcessamento ===
                anexo.id

              return (
                <article
                  className="documento-item"
                  key={anexo.id}
                >
                  <div className="documento-item-topo">
                    <div className="documento-identificacao">
                      <span className="documento-extensao">
                        {(
                          anexo.extensao ||
                          'ARQ'
                        ).toUpperCase()}
                      </span>

                      <div>
                        <strong>
                          {anexo.nomeOriginal}
                        </strong>

                        <span>
                          {formatarTamanho(
                            anexo.tamanhoBytes,
                          )}
                          {' · '}
                          {
                            anexo.tipoDocumento
                          }
                        </span>
                      </div>
                    </div>

                    <span className="documento-data">
                      Enviado em{' '}
                      {formatarDataHora(
                        anexo.dataEnvio,
                      )}
                    </span>
                  </div>

                  {editando ? (
                    <div className="documento-edicao">
                      <label>
                        Tipo de documento

                        <select
                          value={
                            tipoDocumentoEdicao
                          }
                          onChange={(
                            evento,
                          ) =>
                            setTipoDocumentoEdicao(
                              evento.target
                                .value,
                            )
                          }
                        >
                          {TIPOS_DOCUMENTO.map(
                            (tipo) => (
                              <option
                                key={tipo}
                                value={tipo}
                              >
                                {tipo}
                              </option>
                            ),
                          )}
                        </select>
                      </label>

                      <label>
                        Descrição

                        <textarea
                          rows="3"
                          maxLength="300"
                          value={
                            descricaoDocumentoEdicao
                          }
                          onChange={(
                            evento,
                          ) =>
                            setDescricaoDocumentoEdicao(
                              evento.target
                                .value,
                            )
                          }
                        />
                      </label>

                      <div className="documento-edicao-acoes">
                        <button
                          type="button"
                          className="documento-cancelar-button"
                          disabled={
                            processando
                          }
                          onClick={
                            cancelarEdicaoDocumento
                          }
                        >
                          Cancelar
                        </button>

                        <button
                          type="button"
                          className="documento-salvar-button"
                          disabled={
                            processando
                          }
                          onClick={() =>
                            salvarEdicaoDocumento(
                              anexo.id,
                            )
                          }
                        >
                          {processando
                            ? 'Salvando...'
                            : 'Salvar edição'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="documento-descricao">
                      {anexo.descricao}
                    </p>
                  )}

                  <div className="documento-metadados">
                    <span>
                      Enviado por{' '}
                      <strong>
                        {anexo.usuarioNome ||
                          'Usuário não identificado'}
                      </strong>
                    </span>

                    {anexo.dataAtualizacao !==
                      anexo.dataEnvio && (
                      <span>
                        Atualizado em{' '}
                        {formatarDataHora(
                          anexo
                            .dataAtualizacao,
                        )}
                      </span>
                    )}
                  </div>

                  {!editando && (
                    <div className="documento-acoes">
                      <button
                        type="button"
                        className="documento-abrir-button"
                        disabled={
                          processando
                        }
                        onClick={() =>
                          executarAcaoDocumento(
                            anexo.id,
                            abrirDocumento,
                          )
                        }
                      >
                        Abrir
                      </button>

                      <button
                        type="button"
                        className="documento-baixar-button"
                        disabled={
                          processando
                        }
                        onClick={() =>
                          executarAcaoDocumento(
                            anexo.id,
                            baixarDocumento,
                          )
                        }
                      >
                        Baixar
                      </button>

                      {usuarioEhGestor && (
                        <button
                          type="button"
                          className="documento-editar-button"
                          disabled={
                            processando
                          }
                          onClick={() =>
                            iniciarEdicaoDocumento(
                              anexo,
                            )
                          }
                        >
                          Editar
                        </button>
                      )}

                      <button
                        type="button"
                        className="documento-excluir-button"
                        disabled={
                          processando
                        }
                        onClick={() =>
                          confirmarExclusaoDocumento(
                            anexo,
                          )
                        }
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </article>
              )
            })
          )}
        </div>
      </section>

      <section className="detalhes-card status-card">
        <div className="detalhes-card-header status-card-header">
          <div className="status-card-texto">
            <h2>
              Status da demanda
            </h2>

            <p>
              Registre a etapa atual da
              demanda.
            </p>
          </div>

          <div className="status-atual-resumo">
            <span>Status atual</span>

            <strong
              className={
                (
                  'status-atual-badge ' +
                  `status-${classeStatus}`
                )
              }
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
            <h2>
              Classificação de prioridade
            </h2>

            <p>
              A prioridade é calculada
              pelo prazo e pode ser
              ajustada.
            </p>
          </div>

          <button
            className="alterar-prioridade-button"
            type="button"
            onClick={
              abrirModalPrioridade
            }
          >
            Alterar prioridade
          </button>
        </div>

        <div className="prioridade-comparacao">
          <div className="prioridade-comparacao-item">
            <span>
              Prioridade atual
            </span>

            <div>
              <span
                className={
                  (
                    'detalhes-prioridade-badge ' +
                    `prioridade-${classePrioridade}`
                  )
                }
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
            <span>
              Sugestão pelo prazo
            </span>

            <div>
              <span
                className={
                  (
                    'detalhes-prioridade-badge ' +
                    `prioridade-${classePrioridadeAutomatica}`
                  )
                }
              >
                {prioridadeAutomatica}
              </span>

              <small>
                Calculada pelo prazo de
                resposta
              </small>
            </div>
          </div>
        </div>

        {prioridadeFoiAjustada && (
          <div className="prioridade-justificativa">
            <div>
              <span>
                Justificativa do ajuste
              </span>

              <p>
                {demanda
                  .justificativaPrioridade ||
                  'Nenhuma justificativa informada.'}
              </p>
            </div>

            <small>
              Alterada em{' '}
              {formatarDataHora(
                demanda
                  .dataAlteracaoPrioridade,
              )}
            </small>
          </div>
        )}
      </section>

      <section className="detalhes-card gargalos-card">
        <div className="detalhes-card-header gargalos-card-header">
          <div className="gargalos-card-texto">
            <h2>
              Gargalos identificados
            </h2>

            <p>
              Registre dificuldades que
              estejam atrasando a demanda.
            </p>
          </div>

          <div className="gargalos-resumo">
            <span>
              Gargalos abertos
            </span>

            <strong>
              {
                quantidadeGargalosAbertos
              }
            </strong>
          </div>
        </div>

        <form
          className="gargalo-form"
          onSubmit={
            salvarNovoGargalo
          }
        >
          <div className="gargalo-form-field">
            <label htmlFor="descricaoGargalo">
              Descrição do gargalo
            </label>

            <textarea
              id="descricaoGargalo"
              rows="3"
              maxLength="500"
              value={descricaoGargalo}
              onChange={(evento) => {
                setDescricaoGargalo(
                  evento.target.value,
                )

                setMensagemGargalo('')
              }}
            />

            <small>
              {descricaoGargalo.length}
              /500 caracteres
            </small>
          </div>

          <button
            className="registrar-gargalo-button"
            type="submit"
            disabled={
              salvandoGargalo
            }
          >
            {salvandoGargalo
              ? 'Registrando...'
              : 'Registrar gargalo'}
          </button>
        </form>

        {mensagemGargalo && (
          <p
            className="gargalo-mensagem"
            role="status"
          >
            {mensagemGargalo}
          </p>
        )}

        <div className="gargalos-lista">
          {gargalos.length === 0 ? (
            <div className="gargalos-vazio">
              <strong>
                Nenhum gargalo registrado
              </strong>

              <p>
                Registre uma dificuldade
                acima para facilitar o
                acompanhamento.
              </p>
            </div>
          ) : (
            gargalosVisiveis.map(
              (gargalo) => {
                const editando =
                  gargaloEmEdicao ===
                    gargalo.id

                const processando =
                  gargaloEmProcessamento ===
                    gargalo.id

                const resolvido =
                  gargalo.status ===
                    'Resolvido'

                return (
                  <article
                    className={
                      resolvido
                        ? (
                          'gargalo-item ' +
                          'gargalo-item-resolvido'
                        )
                        : 'gargalo-item'
                    }
                    key={gargalo.id}
                  >
                    <div className="gargalo-item-cabecalho">
                      <span
                        className={
                          resolvido
                            ? (
                              'gargalo-status ' +
                              'gargalo-status-resolvido'
                            )
                            : (
                              'gargalo-status ' +
                              'gargalo-status-aberto'
                            )
                        }
                      >
                        {gargalo.status}
                      </span>

                      <span className="gargalo-data">
                        Registrado em{' '}
                        {formatarDataHora(
                          gargalo
                            .dataRegistro,
                        )}
                      </span>
                    </div>

                    {editando ? (
                      <div className="gargalo-edicao">
                        <label
                          htmlFor={
                            `gargalo-${gargalo.id}`
                          }
                        >
                          Editar descrição
                        </label>

                        <textarea
                          id={
                            `gargalo-${gargalo.id}`
                          }
                          rows="3"
                          maxLength="500"
                          value={
                            descricaoGargaloEdicao
                          }
                          onChange={(
                            evento,
                          ) =>
                            setDescricaoGargaloEdicao(
                              evento.target
                                .value,
                            )
                          }
                        />

                        <div className="gargalo-edicao-acoes">
                          <button
                            className="gargalo-cancelar-button"
                            type="button"
                            onClick={
                              cancelarEdicaoGargalo
                            }
                          >
                            Cancelar
                          </button>

                          <button
                            className="gargalo-salvar-button"
                            type="button"
                            disabled={
                              processando
                            }
                            onClick={() =>
                              salvarEdicaoGargalo(
                                gargalo.id,
                              )
                            }
                          >
                            {processando
                              ? 'Salvando...'
                              : (
                                'Salvar edição'
                              )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="gargalo-descricao">
                        {gargalo.descricao}
                      </p>
                    )}

                    <div className="gargalo-metadados">
                      <span>
                        Registrado por{' '}
                        <strong>
                          {gargalo
                            .usuarioRegistro ||
                            'Usuário não identificado'}
                        </strong>
                      </span>

                      {resolvido &&
                        gargalo
                          .usuarioResolucao && (
                          <span>
                            Resolvido por{' '}
                            <strong>
                              {
                                gargalo
                                  .usuarioResolucao
                              }
                            </strong>
                            {' '}em{' '}
                            {formatarDataHora(
                              gargalo
                                .dataResolucao,
                            )}
                          </span>
                        )}
                    </div>

                    {usuarioEhGestor &&
                      !editando && (
                        <div className="gargalo-acoes">
                          <button
                            className="gargalo-editar-button"
                            type="button"
                            onClick={() =>
                              iniciarEdicaoGargalo(
                                gargalo,
                              )
                            }
                          >
                            Editar
                          </button>

                          <button
                            className={
                              resolvido
                                ? (
                                  'gargalo-reabrir-button'
                                )
                                : (
                                  'gargalo-resolver-button'
                                )
                            }
                            type="button"
                            disabled={
                              processando
                            }
                            onClick={() =>
                              alternarStatusGargalo(
                                gargalo,
                              )
                            }
                          >
                            {processando
                              ? 'Aguarde...'
                              : (
                                resolvido
                                  ? 'Reabrir'
                                  : (
                                    'Marcar como resolvido'
                                  )
                              )}
                          </button>

                          <button
                            className="gargalo-excluir-button"
                            type="button"
                            onClick={() =>
                              confirmarExclusaoGargalo(
                                gargalo,
                              )
                            }
                          >
                            Excluir
                          </button>
                        </div>
                      )}
                  </article>
                )
              },
            )
          )}

          {possuiGargalosOcultos && (
            <div className="gargalos-expansao">
              <span>
                {exibirTodosGargalos
                  ? (
                    `${gargalos.length} gargalos exibidos`
                  )
                  : (
                    `${gargalos.length - 3} gargalos ocultos`
                  )}
              </span>

              <button
                className="gargalos-expansao-button"
                type="button"
                aria-expanded={
                  exibirTodosGargalos
                }
                onClick={() =>
                  setExibirTodosGargalos(
                    (valor) => !valor,
                  )
                }
              >
                {exibirTodosGargalos
                  ? 'Mostrar menos'
                  : (
                    `Ver todos os ${gargalos.length} gargalos`
                  )}
              </button>
            </div>
          )}
        </div>
      </section>

      <HistoricoDemanda
        historico={
          demanda.historico || []
        }
      />

      {usuarioEhGestor && (
        <section className="acoes-perigosas">
          <div className="acoes-perigosas-texto">
            <h2>
              Excluir demanda
            </h2>

            <p>
              Esta ação removerá a demanda
              e não poderá ser desfeita.
            </p>
          </div>

          <button
            className="excluir-demanda-button"
            type="button"
            onClick={() =>
              setConfirmacaoAberta(
                true,
              )
            }
          >
            Excluir demanda
          </button>
        </section>
      )}

      {modalPrioridadeAberto && (
        <div
          className="prioridade-modal-overlay"
          role="presentation"
          onMouseDown={() =>
            setModalPrioridadeAberto(
              false,
            )
          }
        >
          <section
            className="prioridade-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="prioridade-modal-titulo"
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

                <p>
                  Ajuste a prioridade
                  conforme a complexidade
                  da demanda.
                </p>
              </div>

              <button
                className="prioridade-modal-fechar"
                type="button"
                aria-label="Fechar janela"
                onClick={() =>
                  setModalPrioridadeAberto(
                    false,
                  )
                }
              >
                ×
              </button>
            </div>

            <form
              className="prioridade-modal-form"
              onSubmit={
                salvarPrioridadeManual
              }
            >
              <div className="prioridade-sugestao">
                <span>
                  Sugestão automática pelo
                  prazo
                </span>

                <strong>
                  <span
                    className={
                      (
                        'detalhes-prioridade-badge ' +
                        `prioridade-${classePrioridadeAutomatica}`
                      )
                    }
                  >
                    {
                      prioridadeAutomatica
                    }
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
                  Nova prioridade
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
                  Justificativa
                </label>

                <textarea
                  id="justificativaPrioridade"
                  rows="5"
                  value={
                    justificativaPrioridade
                  }
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
                    onClick={
                      restaurarPrioridade
                    }
                  >
                    Restaurar automática
                  </button>
                )}

                <div className="prioridade-modal-acoes-principais">
                  <button
                    className="cancelar-prioridade-button"
                    type="button"
                    onClick={() =>
                      setModalPrioridadeAberto(
                        false,
                      )
                    }
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

      {usuarioEhGestor &&
        confirmacaoAberta && (
          <div
            className="confirmacao-overlay"
            role="presentation"
            onMouseDown={() =>
              setConfirmacaoAberta(
                false,
              )
            }
          >
            <section
              className="confirmacao-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirmacao-titulo"
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

              <p>
                Você está prestes a
                excluir a demanda de{' '}
                <strong>
                  {
                    demanda
                      .orgaoSolicitante
                  }
                </strong>
                . Esta ação não poderá ser
                desfeita.
              </p>

              <div className="confirmacao-acoes">
                <button
                  className="cancelar-exclusao-button"
                  type="button"
                  onClick={() =>
                    setConfirmacaoAberta(
                      false,
                    )
                  }
                >
                  Cancelar
                </button>

                <button
                  className="confirmar-exclusao-button"
                  type="button"
                  onClick={
                    confirmarExclusao
                  }
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