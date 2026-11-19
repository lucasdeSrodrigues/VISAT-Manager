import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

const DemandasContext = createContext()

const API_BASE_URL =
  import.meta.env.VITE_API_URL

if (!API_BASE_URL) {
  throw new Error(
    'A variável VITE_API_URL não foi configurada.',
  )
}

const API_URL =
  `${API_BASE_URL}/api/demandas`

const API_ARQUIVADAS_URL =
  `${API_URL}/arquivadas`

const PRIORIDADES_VALIDAS = [
  'Baixa',
  'Média',
  'Alta',
]

const STATUS_VALIDOS = [
  'Em andamento',
  'Em revisão',
  'Finalizada',
]

const STATUS_GARGALO_VALIDOS = [
  'Aberto',
  'Resolvido',
]

const TIPOS_DOCUMENTO_VALIDOS = [
  'Relatório',
  'Laudo',
  'Foto',
  'Ofício',
  'Planilha',
  'Outro',
]

const EXTENSOES_DOCUMENTO_VALIDAS = [
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'png',
  'jpg',
  'jpeg',
]

const TAMANHO_MAXIMO_ANEXO =
  10 * 1024 * 1024

function formatarEventoHistorico(
  evento,
) {
  return {
    id: String(evento.id),
    demandaId: String(
      evento.demanda_id,
    ),
    dataHora:
      evento.data_hora,
    tipoAcao:
      evento.tipo_acao,
    descricao:
      evento.descricao,
    usuario:
      evento.usuario,
    statusAnterior:
      evento.status_anterior,
    statusPosterior:
      evento.status_posterior,
  }
}

function formatarGargalo(
  gargalo,
) {
  return {
    id: String(gargalo.id),
    demandaId: String(
      gargalo.demanda_id,
    ),
    descricao:
      gargalo.descricao,
    status:
      gargalo.status ||
      'Aberto',
    usuarioRegistro:
      gargalo.usuario_registro,
    perfilRegistro:
      gargalo.perfil_registro,
    dataRegistro:
      gargalo.data_registro,
    dataAtualizacao:
      gargalo.data_atualizacao,
    usuarioResolucao:
      gargalo.usuario_resolucao,
    dataResolucao:
      gargalo.data_resolucao,
  }
}

function formatarAnexo(
  anexo,
) {
  return {
    id: String(anexo.id),
    demandaId: String(
      anexo.demanda_id,
    ),
    nomeOriginal:
      anexo.nome_original,
    extensao:
      anexo.extensao,
    tipoDocumento:
      anexo.tipo_documento,
    descricao:
      anexo.descricao,
    tamanhoBytes:
      Number(
        anexo.tamanho_bytes,
      ) || 0,
    usuarioId: String(
      anexo.usuario_id,
    ),
    usuarioNome:
      anexo.usuario_nome,
    usuarioPerfil:
      anexo.usuario_perfil,
    dataEnvio:
      anexo.data_envio,
    dataAtualizacao:
      anexo.data_atualizacao,
  }
}

function formatarDemanda(
  demanda,
) {
  return {
    id: String(demanda.id),
    numeroProcesso:
      demanda.numero_processo,
    orgaoSolicitante:
      demanda.orgao_solicitante,
    municipio:
      demanda.municipio,
    bairro:
      demanda.bairro,
    tipoOcorrencia:
      demanda.tipo_ocorrencia,
    dataEntrada:
      demanda.data_entrada,
    prazoResposta:
      demanda.prazo_resposta,
    descricao:
      demanda.descricao,
    prioridadeManual:
      demanda.prioridade_manual,
    justificativaPrioridade:
      demanda.justificativa_prioridade,
    dataAlteracaoPrioridade:
      demanda.data_alteracao_prioridade,
    responsavel:
      demanda.responsavel,
    status:
      demanda.status ||
      'Em andamento',
    origem:
      demanda.origem,
    dataCadastro:
      demanda.data_cadastro,
    dataFinalizacao:
      demanda.data_finalizacao,
    arquivada:
      Boolean(
        demanda.arquivada,
      ),
    dataArquivamento:
      demanda.data_arquivamento,
    historico: (
      demanda.historico || []
    ).map(
      formatarEventoHistorico,
    ),
    gargalos: (
      demanda.gargalos || []
    ).map(
      formatarGargalo,
    ),
    anexos: (
      demanda.anexos || []
    ).map(
      formatarAnexo,
    ),
  }
}

async function obterResultadoResposta(
  resposta,
) {
  const tipoConteudo =
    resposta.headers.get(
      'content-type',
    ) || ''

  if (
    tipoConteudo.includes(
      'application/json',
    )
  ) {
    return resposta.json()
  }

  return {}
}

function obterMensagemErro(
  resposta,
  resultado,
  mensagemPadrao,
) {
  if (resultado?.mensagem) {
    return resultado.mensagem
  }

  if (resposta.status === 401) {
    return (
      'Sua sessão expirou ou não foi iniciada. ' +
      'Entre novamente no sistema.'
    )
  }

  if (resposta.status === 403) {
    return (
      'Você não possui permissão ' +
      'para realizar esta ação.'
    )
  }

  if (resposta.status === 409) {
    return (
      'A operação não pode ser realizada ' +
      'no estado atual da demanda.'
    )
  }

  if (resposta.status === 413) {
    return (
      'O arquivo deve possuir ' +
      'no máximo 10 MB.'
    )
  }

  return mensagemPadrao
}

function obterExtensaoArquivo(
  nomeArquivo,
) {
  const partesNome =
    String(nomeArquivo || '')
      .split('.')

  if (partesNome.length < 2) {
    return ''
  }

  return partesNome
    .pop()
    .toLowerCase()
}

function validarArquivoAnexo(
  arquivo,
) {
  if (!arquivo) {
    throw new Error(
      'Selecione um arquivo.',
    )
  }

  if (arquivo.size === 0) {
    throw new Error(
      'O arquivo está vazio.',
    )
  }

  if (
    arquivo.size >
    TAMANHO_MAXIMO_ANEXO
  ) {
    throw new Error(
      'O arquivo deve possuir no máximo 10 MB.',
    )
  }

  const extensao =
    obterExtensaoArquivo(
      arquivo.name,
    )

  if (
    !EXTENSOES_DOCUMENTO_VALIDAS.includes(
      extensao,
    )
  ) {
    throw new Error(
      'Formato de arquivo não permitido. ' +
      'Envie PDF, DOC, DOCX, XLS, XLSX, ' +
      'PNG, JPG ou JPEG.',
    )
  }
}

function validarDemandaEditavel(
  demanda,
) {
  if (!demanda) {
    return
  }

  if (demanda.arquivada) {
    throw new Error(
      'Demandas arquivadas estão disponíveis somente para consulta.',
    )
  }
}

export function DemandasProvider({
  children,
}) {
  const [
    demandas,
    setDemandas,
  ] = useState([])

  const [
    demandasArquivadas,
    setDemandasArquivadas,
  ] = useState([])

  const [
    carregandoDemandas,
    setCarregandoDemandas,
  ] = useState(true)

  const [
    carregandoArquivadas,
    setCarregandoArquivadas,
  ] = useState(false)

  const [
    arquivadasCarregadas,
    setArquivadasCarregadas,
  ] = useState(false)

  const [
    erroAoCarregar,
    setErroAoCarregar,
  ] = useState('')

  const [
    erroAoCarregarArquivadas,
    setErroAoCarregarArquivadas,
  ] = useState('')

  useEffect(() => {
    async function carregarDemandas() {
      try {
        setCarregandoDemandas(true)
        setErroAoCarregar('')

        const resposta = await fetch(
          API_URL,
          {
            method: 'GET',
            credentials: 'include',
          },
        )

        const resultado =
          await obterResultadoResposta(
            resposta,
          )

        if (!resposta.ok) {
          throw new Error(
            obterMensagemErro(
              resposta,
              resultado,
              'Não foi possível carregar as demandas.',
            ),
          )
        }

        if (!Array.isArray(resultado)) {
          throw new Error(
            'A resposta recebida ao carregar as demandas é inválida.',
          )
        }

        setDemandas(
          resultado.map(
            formatarDemanda,
          ),
        )
      } catch (erro) {
        console.error(
          'Erro ao carregar demandas:',
          erro,
        )

        setDemandas([])

        setErroAoCarregar(
          erro.message ||
            'Não foi possível carregar as demandas. Verifique se o backend está funcionando.',
        )
      } finally {
        setCarregandoDemandas(
          false,
        )
      }
    }

    carregarDemandas()
  }, [])

  const responsaveis = [
    ...new Set(
      [
        ...demandas,
        ...demandasArquivadas,
      ]
        .map(
          (demanda) =>
            demanda.responsavel
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

  async function carregarDemandasArquivadas(
    forcarAtualizacao = false,
  ) {
    if (
      arquivadasCarregadas &&
      !forcarAtualizacao
    ) {
      return demandasArquivadas
    }

    try {
      setCarregandoArquivadas(true)

      setErroAoCarregarArquivadas(
        '',
      )

      const resposta = await fetch(
        API_ARQUIVADAS_URL,
        {
          method: 'GET',
          credentials: 'include',
        },
      )

      const resultado =
        await obterResultadoResposta(
          resposta,
        )

      if (!resposta.ok) {
        throw new Error(
          obterMensagemErro(
            resposta,
            resultado,
            'Não foi possível carregar as demandas arquivadas.',
          ),
        )
      }

      if (!Array.isArray(resultado)) {
        throw new Error(
          'A resposta recebida ao carregar as demandas arquivadas é inválida.',
        )
      }

      const arquivadasFormatadas =
        resultado.map(
          formatarDemanda,
        )

      setDemandasArquivadas(
        arquivadasFormatadas,
      )

      setArquivadasCarregadas(
        true,
      )

      return arquivadasFormatadas
    } catch (erro) {
      console.error(
        'Erro ao carregar demandas arquivadas:',
        erro,
      )

      setErroAoCarregarArquivadas(
        erro.message ||
          'Não foi possível carregar as demandas arquivadas.',
      )

      throw erro
    } finally {
      setCarregandoArquivadas(
        false,
      )
    }
  }

  function buscarDemandaPorId(id) {
    const idTratado =
      String(id)

    return (
      demandas.find(
        (demanda) =>
          demanda.id ===
          idTratado,
      ) ||
      demandasArquivadas.find(
        (demanda) =>
          demanda.id ===
          idTratado,
      )
    )
  }

  function buscarDemandaArquivadaPorId(
    id,
  ) {
    const idTratado =
      String(id)

    return demandasArquivadas.find(
      (demanda) =>
        demanda.id === idTratado,
    )
  }

  function substituirDemandaAtiva(
    demandaAtualizada,
  ) {
    const demandaFormatada =
      formatarDemanda(
        demandaAtualizada,
      )

    setDemandas(
      (demandasAtuais) =>
        demandasAtuais.map(
          (demanda) =>
            demanda.id ===
            demandaFormatada.id
              ? demandaFormatada
              : demanda,
        ),
    )

    return demandaFormatada
  }

  function substituirDemandaArquivada(
    demandaAtualizada,
  ) {
    const demandaFormatada =
      formatarDemanda(
        demandaAtualizada,
      )

    setDemandasArquivadas(
      (demandasAtuais) => {
        const demandaExiste =
          demandasAtuais.some(
            (demanda) =>
              demanda.id ===
              demandaFormatada.id,
          )

        if (!demandaExiste) {
          return [
            demandaFormatada,
            ...demandasAtuais,
          ]
        }

        return demandasAtuais.map(
          (demanda) =>
            demanda.id ===
            demandaFormatada.id
              ? demandaFormatada
              : demanda,
        )
      },
    )

    return demandaFormatada
  }

  function substituirDemanda(
    demandaAtualizada,
  ) {
    const demandaFormatada =
      formatarDemanda(
        demandaAtualizada,
      )

    if (
      demandaFormatada.arquivada
    ) {
      return substituirDemandaArquivada(
        demandaAtualizada,
      )
    }

    return substituirDemandaAtiva(
      demandaAtualizada,
    )
  }

  function atualizarColecaoDaDemanda(
    demandaId,
    nomeColecao,
    atualizarColecao,
    historicoAtualizado = null,
  ) {
    const idTratado =
      String(demandaId)

    setDemandas(
      (demandasAtuais) =>
        demandasAtuais.map(
          (demanda) => {
            if (
              demanda.id !==
              idTratado
            ) {
              return demanda
            }

            const colecaoAtual =
              demanda[
                nomeColecao
              ] || []

            const novaColecao =
              atualizarColecao(
                colecaoAtual,
              )

            return {
              ...demanda,
              [nomeColecao]:
               novaColecao,
              historico:
                Array.isArray(
                  historicoAtualizado,
                )
                  ? historicoAtualizado.map(
                      formatarEventoHistorico,
                    )
                  : demanda.historico,
            }
          },
        ),
    )
  }

  function atualizarGargalosDaDemanda(
    demandaId,
    atualizarGargalos,
    historicoAtualizado = null,
  ) {
    atualizarColecaoDaDemanda(
      demandaId,
      'gargalos',
      atualizarGargalos,
      historicoAtualizado,
    )
  }

  function atualizarAnexosDaDemanda(
    demandaId,
    atualizarAnexos,
    historicoAtualizado = null,
  ) {
    atualizarColecaoDaDemanda(
      demandaId,
      'anexos',
      atualizarAnexos,
      historicoAtualizado,
    )
  }

  async function arquivarDemanda(id) {
    const idTratado =
      String(id)

    const demanda =
      demandas.find(
        (item) =>
          item.id === idTratado,
      )

    if (!demanda) {
      return false
    }

    if (
      demanda.status !==
      'Finalizada'
    ) {
      throw new Error(
        'Somente demandas finalizadas podem ser arquivadas.',
      )
    }

    const resposta = await fetch(
      (
        `${API_URL}/${idTratado}` +
        '/arquivar'
      ),
      {
        method: 'POST',
        credentials: 'include',
      },
    )

    const resultado =
      await obterResultadoResposta(
        resposta,
      )

    if (!resposta.ok) {
      throw new Error(
        obterMensagemErro(
          resposta,
          resultado,
          'Não foi possível arquivar a demanda.',
        ),
      )
    }

    const demandaArquivada =
      formatarDemanda(
        resultado,
      )

    setDemandas(
      (demandasAtuais) =>
        demandasAtuais.filter(
          (item) =>
            item.id !==
            idTratado,
        ),
    )

    setDemandasArquivadas(
      (arquivadasAtuais) => {
        const semDuplicacao =
          arquivadasAtuais.filter(
            (item) =>
              item.id !==
              idTratado,
          )

        return [
          demandaArquivada,
          ...semDuplicacao,
        ]
      },
    )

    setArquivadasCarregadas(
      true,
    )

    return demandaArquivada
  }

  async function cadastrarDemanda(
    novaDemanda,
  ) {
    const dataCadastro =
      new Date().toISOString()

    const responsavelTratado =
      novaDemanda.responsavel
        ?.trim() || null

    const dadosParaApi = {
      numero_processo:
        novaDemanda
          .numeroProcesso ||
        null,
      orgao_solicitante:
        novaDemanda
          .orgaoSolicitante,
      municipio:
        novaDemanda.municipio,
      bairro:
        novaDemanda.bairro,
      tipo_ocorrencia:
        novaDemanda
          .tipoOcorrencia,
      data_entrada:
        novaDemanda.dataEntrada,
      prazo_resposta:
        novaDemanda
          .prazoResposta,
      descricao:
        novaDemanda.descricao,
      prioridade_manual:
        novaDemanda
          .prioridadeManual ||
        null,
      justificativa_prioridade:
        novaDemanda
          .justificativaPrioridade ||
        null,
      data_alteracao_prioridade:
        novaDemanda
          .dataAlteracaoPrioridade ||
        null,
      responsavel:
        responsavelTratado,
      status:
        novaDemanda.status ||
        'Em andamento',
      origem:
        'Manual',
      data_cadastro:
        dataCadastro,
    }

    const resposta = await fetch(
      API_URL,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify(
          dadosParaApi,
        ),
      },
    )

    const resultado =
      await obterResultadoResposta(
        resposta,
      )

    if (!resposta.ok) {
      throw new Error(
        obterMensagemErro(
          resposta,
          resultado,
          'Não foi possível cadastrar a demanda.',
        ),
      )
    }

    const demandaCadastrada =
      formatarDemanda(
        resultado,
      )

    setDemandas(
      (demandasAtuais) => [
        ...demandasAtuais,
        demandaCadastrada,
      ],
    )

    return demandaCadastrada
  }

  async function atualizarDemanda(
    id,
    dados,
  ) {
    const idTratado =
      String(id)

    const demanda =
      buscarDemandaPorId(
        idTratado,
      )

    if (!demanda) {
      return false
    }

    validarDemandaEditavel(
      demanda,
    )

    const resposta = await fetch(
      `${API_URL}/${idTratado}`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify(
          dados,
        ),
      },
    )

    const resultado =
      await obterResultadoResposta(
        resposta,
      )

    if (!resposta.ok) {
      console.error(
        'Erro retornado pelo backend:',
        resultado,
      )

      throw new Error(
        obterMensagemErro(
          resposta,
          resultado,
          'Não foi possível atualizar a demanda.',
        ),
      )
    }

    return substituirDemanda(
      resultado,
    )
  }

  async function excluirDemanda(id) {
    const idTratado =
      String(id)

    const demanda =
      buscarDemandaPorId(
        idTratado,
      )

    if (!demanda) {
      return false
    }

    validarDemandaEditavel(
      demanda,
    )

    const resposta = await fetch(
      `${API_URL}/${idTratado}`,
      {
        method: 'DELETE',
        credentials: 'include',
      },
    )

    const resultado =
      await obterResultadoResposta(
        resposta,
      )

    if (!resposta.ok) {
      throw new Error(
        obterMensagemErro(
          resposta,
          resultado,
          'Não foi possível excluir a demanda.',
        ),
      )
    }

    setDemandas(
      (demandasAtuais) =>
        demandasAtuais.filter(
          (item) =>
            item.id !==
            idTratado,
        ),
    )

    return true
  }
    async function alterarPrioridade(
    id,
    novaPrioridade,
    justificativa,
  ) {
    if (
      !PRIORIDADES_VALIDAS.includes(
        novaPrioridade,
      )
    ) {
      return false
    }

    const demanda =
      buscarDemandaPorId(id)

    if (!demanda) {
      return false
    }

    validarDemandaEditavel(
      demanda,
    )

    const justificativaTratada =
      justificativa?.trim() || ''

    await atualizarDemanda(id, {
      prioridade_manual:
        novaPrioridade,
      justificativa_prioridade:
        justificativaTratada ||
        null,
      data_alteracao_prioridade:
        new Date().toISOString(),
    })

    return true
  }

  async function restaurarPrioridadeAutomatica(
    id,
  ) {
    const demanda =
      buscarDemandaPorId(id)

    if (!demanda) {
      return false
    }

    validarDemandaEditavel(
      demanda,
    )

    await atualizarDemanda(id, {
      prioridade_manual: null,
      justificativa_prioridade:
        null,
      data_alteracao_prioridade:
        null,
    })

    return true
  }

  async function atribuirResponsavel(
    id,
    novoResponsavel,
  ) {
    const responsavelTratado =
      novoResponsavel?.trim() ||
      null

    if (
      responsavelTratado &&
      responsavelTratado.length > 100
    ) {
      throw new Error(
        'O nome do responsável deve possuir no máximo 100 caracteres.',
      )
    }

    const demanda =
      buscarDemandaPorId(id)

    if (!demanda) {
      return false
    }

    validarDemandaEditavel(
      demanda,
    )

    await atualizarDemanda(id, {
      responsavel:
        responsavelTratado,
    })

    return true
  }

  async function alterarStatus(
    id,
    novoStatus,
  ) {
    if (
      !STATUS_VALIDOS.includes(
        novoStatus,
      )
    ) {
      return false
    }

    const demanda =
      buscarDemandaPorId(id)

    if (!demanda) {
      return false
    }

    validarDemandaEditavel(
      demanda,
    )

    await atualizarDemanda(id, {
      status: novoStatus,
    })

    return true
  }

  async function editarDemanda(
    id,
    dadosAtualizados,
  ) {
    const demanda =
      buscarDemandaPorId(id)

    if (!demanda) {
      return false
    }

    validarDemandaEditavel(
      demanda,
    )

    const orgaoSolicitante =
      dadosAtualizados
        .orgaoSolicitante
        .trim()

    const municipio =
      dadosAtualizados
        .municipio
        .trim()

    const bairro =
      dadosAtualizados
        .bairro
        .trim()

    const tipoOcorrencia =
      dadosAtualizados
        .tipoOcorrencia
        .trim()

    const prazoResposta =
      dadosAtualizados
        .prazoResposta

    const descricao =
      dadosAtualizados
        .descricao
        .trim()

    if (
      !orgaoSolicitante ||
      !municipio ||
      !bairro ||
      !tipoOcorrencia ||
      !prazoResposta ||
      !descricao
    ) {
      throw new Error(
        'Preencha todos os campos antes de salvar.',
      )
    }

    await atualizarDemanda(id, {
      orgao_solicitante:
        orgaoSolicitante,
      municipio,
      bairro,
      tipo_ocorrencia:
        tipoOcorrencia,
      prazo_resposta:
        prazoResposta,
      descricao,
    })

    return true
  }

  async function registrarGargalo(
    demandaId,
    descricao,
  ) {
    const idTratado =
      String(demandaId)

    const demanda =
      buscarDemandaPorId(
        idTratado,
      )

    if (!demanda) {
      return false
    }

    validarDemandaEditavel(
      demanda,
    )

    const descricaoTratada =
      descricao?.trim()

    if (!descricaoTratada) {
      throw new Error(
        'Informe a descrição do gargalo.',
      )
    }

    if (
      descricaoTratada.length >
      500
    ) {
      throw new Error(
        'A descrição do gargalo deve possuir no máximo 500 caracteres.',
      )
    }

    const resposta = await fetch(
      (
        `${API_URL}/${idTratado}` +
        '/gargalos'
      ),
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
          descricao:
            descricaoTratada,
        }),
      },
    )

    const resultado =
      await obterResultadoResposta(
        resposta,
      )

    if (!resposta.ok) {
      throw new Error(
        obterMensagemErro(
          resposta,
          resultado,
          'Não foi possível registrar o gargalo.',
        ),
      )
    }

    const gargaloFormatado =
      formatarGargalo(
        resultado,
      )

    atualizarGargalosDaDemanda(
      idTratado,
      (gargalosAtuais) => [
        gargaloFormatado,
        ...gargalosAtuais,
      ],
      resultado.historico,
    )

    return gargaloFormatado
  }

  async function atualizarGargalo(
    demandaId,
    gargaloId,
    dadosAtualizados,
  ) {
    const demandaIdTratado =
      String(demandaId)

    const gargaloIdTratado =
      String(gargaloId)

    const demanda =
      buscarDemandaPorId(
        demandaIdTratado,
      )

    if (!demanda) {
      return false
    }

    validarDemandaEditavel(
      demanda,
    )

    const gargaloAtual =
      (
        demanda.gargalos || []
      ).find(
        (gargalo) =>
          gargalo.id ===
          gargaloIdTratado,
      )

    if (!gargaloAtual) {
      return false
    }

    const dadosParaApi = {}

    if (
      Object.prototype
        .hasOwnProperty.call(
          dadosAtualizados,
          'descricao',
        )
    ) {
      const descricaoTratada =
        dadosAtualizados
          .descricao
          ?.trim()

      if (!descricaoTratada) {
        throw new Error(
          'Informe a descrição do gargalo.',
        )
      }

      if (
        descricaoTratada.length >
        500
      ) {
        throw new Error(
          'A descrição do gargalo deve possuir no máximo 500 caracteres.',
        )
      }

      dadosParaApi.descricao =
        descricaoTratada
    }

    if (
      Object.prototype
        .hasOwnProperty.call(
          dadosAtualizados,
          'status',
        )
    ) {
      if (
        !STATUS_GARGALO_VALIDOS
          .includes(
            dadosAtualizados.status,
          )
      ) {
        throw new Error(
          'Status do gargalo inválido.',
        )
      }

      dadosParaApi.status =
        dadosAtualizados.status
    }

    const resposta = await fetch(
      (
        `${API_URL}/` +
        `${demandaIdTratado}/` +
        `gargalos/` +
        `${gargaloIdTratado}`
      ),
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify(
          dadosParaApi,
        ),
      },
    )

    const resultado =
      await obterResultadoResposta(
        resposta,
      )

    if (!resposta.ok) {
      throw new Error(
        obterMensagemErro(
          resposta,
          resultado,
          'Não foi possível atualizar o gargalo.',
        ),
      )
    }

    const gargaloFormatado =
      formatarGargalo(
        resultado,
      )

    atualizarGargalosDaDemanda(
      demandaIdTratado,
      (gargalosAtuais) =>
        gargalosAtuais.map(
          (gargalo) =>
            gargalo.id ===
            gargaloIdTratado
              ? gargaloFormatado
              : gargalo,
        ),
      resultado.historico,
    )

    return gargaloFormatado
  }

  async function editarGargalo(
    demandaId,
    gargaloId,
    novaDescricao,
  ) {
    return atualizarGargalo(
      demandaId,
      gargaloId,
      {
        descricao:
          novaDescricao,
      },
    )
  }

  async function alterarStatusGargalo(
    demandaId,
    gargaloId,
    novoStatus,
  ) {
    if (
      !STATUS_GARGALO_VALIDOS
        .includes(
          novoStatus,
        )
    ) {
      throw new Error(
        'Status do gargalo inválido.',
      )
    }

    return atualizarGargalo(
      demandaId,
      gargaloId,
      {
        status:
          novoStatus,
      },
    )
  }

  async function resolverGargalo(
    demandaId,
    gargaloId,
  ) {
    return alterarStatusGargalo(
      demandaId,
      gargaloId,
      'Resolvido',
    )
  }

  async function reabrirGargalo(
    demandaId,
    gargaloId,
  ) {
    return alterarStatusGargalo(
      demandaId,
      gargaloId,
      'Aberto',
    )
  }

  async function excluirGargalo(
    demandaId,
    gargaloId,
  ) {
    const demandaIdTratado =
      String(demandaId)

    const gargaloIdTratado =
      String(gargaloId)

    const demanda =
      buscarDemandaPorId(
        demandaIdTratado,
      )

    if (!demanda) {
      return false
    }

    validarDemandaEditavel(
      demanda,
    )

    const gargaloExiste =
      (
        demanda.gargalos || []
      ).some(
        (gargalo) =>
          gargalo.id ===
          gargaloIdTratado,
      )

    if (!gargaloExiste) {
      return false
    }

    const resposta = await fetch(
      (
        `${API_URL}/` +
        `${demandaIdTratado}/` +
        `gargalos/` +
        `${gargaloIdTratado}`
      ),
      {
        method: 'DELETE',
        credentials: 'include',
      },
    )

    const resultado =
      await obterResultadoResposta(
        resposta,
      )

    if (!resposta.ok) {
      throw new Error(
        obterMensagemErro(
          resposta,
          resultado,
          'Não foi possível excluir o gargalo.',
        ),
      )
    }

    atualizarGargalosDaDemanda(
      demandaIdTratado,
      (gargalosAtuais) =>
        gargalosAtuais.filter(
          (gargalo) =>
            gargalo.id !==
            gargaloIdTratado,
        ),
      resultado.historico,
    )

    return true
  }

  async function anexarDocumento(
    demandaId,
    arquivo,
    tipoDocumento,
    descricao,
  ) {
    const demandaIdTratado =
      String(demandaId)

    const demanda =
      buscarDemandaPorId(
        demandaIdTratado,
      )

    if (!demanda) {
      return false
    }

    validarDemandaEditavel(
      demanda,
    )

    validarArquivoAnexo(
      arquivo,
    )

    const tipoTratado =
      tipoDocumento?.trim()

    const descricaoTratada =
      descricao?.trim()

    if (
      !TIPOS_DOCUMENTO_VALIDOS
        .includes(
          tipoTratado,
        )
    ) {
      throw new Error(
        'Selecione um tipo de documento válido.',
      )
    }

    if (!descricaoTratada) {
      throw new Error(
        'Informe uma breve descrição.',
      )
    }

    if (
      descricaoTratada.length >
      300
    ) {
      throw new Error(
        'A descrição deve possuir no máximo 300 caracteres.',
      )
    }

    const formulario =
      new FormData()

    formulario.append(
      'arquivo',
      arquivo,
    )

    formulario.append(
      'tipo_documento',
      tipoTratado,
    )

    formulario.append(
      'descricao',
      descricaoTratada,
    )

    const resposta = await fetch(
      (
        `${API_URL}/` +
        `${demandaIdTratado}/` +
        'anexos'
      ),
      {
        method: 'POST',
        credentials: 'include',
        body: formulario,
      },
    )

    const resultado =
      await obterResultadoResposta(
        resposta,
      )

    if (!resposta.ok) {
      throw new Error(
        obterMensagemErro(
          resposta,
          resultado,
          'Não foi possível anexar o documento.',
        ),
      )
    }

    const anexoFormatado =
      formatarAnexo(
        resultado,
      )

    atualizarAnexosDaDemanda(
      demandaIdTratado,
      (anexosAtuais) => [
        anexoFormatado,
        ...anexosAtuais,
      ],
      resultado.historico,
    )

    return anexoFormatado
  }

  async function editarDocumento(
    demandaId,
    anexoId,
    tipoDocumento,
    descricao,
  ) {
    const demandaIdTratado =
      String(demandaId)

    const anexoIdTratado =
      String(anexoId)

    const demanda =
      buscarDemandaPorId(
        demandaIdTratado,
      )

    if (!demanda) {
      return false
    }

    validarDemandaEditavel(
      demanda,
    )

    const anexoExiste =
      (
        demanda.anexos || []
      ).some(
        (anexo) =>
          anexo.id ===
          anexoIdTratado,
      )

    if (!anexoExiste) {
      return false
    }

    const tipoTratado =
      tipoDocumento?.trim()

    const descricaoTratada =
      descricao?.trim()

    if (
      !TIPOS_DOCUMENTO_VALIDOS
        .includes(
          tipoTratado,
        )
    ) {
      throw new Error(
        'Selecione um tipo de documento válido.',
      )
    }

    if (!descricaoTratada) {
      throw new Error(
        'Informe uma breve descrição.',
      )
    }

    if (
      descricaoTratada.length >
      300
    ) {
      throw new Error(
        'A descrição deve possuir no máximo 300 caracteres.',
      )
    }

    const resposta = await fetch(
      (
        `${API_URL}/` +
        `${demandaIdTratado}/` +
        `anexos/` +
        `${anexoIdTratado}`
      ),
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
          tipo_documento:
            tipoTratado,
          descricao:
            descricaoTratada,
        }),
      },
    )

    const resultado =
      await obterResultadoResposta(
        resposta,
      )

    if (!resposta.ok) {
      throw new Error(
        obterMensagemErro(
          resposta,
          resultado,
          'Não foi possível editar o documento.',
        ),
      )
    }

    const anexoFormatado =
      formatarAnexo(
        resultado,
      )

    atualizarAnexosDaDemanda(
      demandaIdTratado,
      (anexosAtuais) =>
        anexosAtuais.map(
          (anexo) =>
            anexo.id ===
            anexoIdTratado
              ? anexoFormatado
              : anexo,
        ),
      resultado.historico,
    )

    return anexoFormatado
  }
    async function obterArquivoDocumento(
    demandaId,
    anexoId,
    baixar = false,
  ) {
    const demandaIdTratado =
      String(demandaId)

    const anexoIdTratado =
      String(anexoId)

    const demanda =
      buscarDemandaPorId(
        demandaIdTratado,
      )

    if (!demanda) {
      return false
    }

    const anexo =
      (
        demanda.anexos || []
      ).find(
        (item) =>
          item.id ===
          anexoIdTratado,
      )

    if (!anexo) {
      return false
    }

    const parametroDownload =
      baixar
        ? '?download=true'
        : ''

    const resposta = await fetch(
      (
        `${API_URL}/` +
        `${demandaIdTratado}/` +
        `anexos/` +
        `${anexoIdTratado}/` +
        `arquivo${parametroDownload}`
      ),
      {
        method: 'GET',
        credentials: 'include',
      },
    )

    if (!resposta.ok) {
      const resultado =
        await obterResultadoResposta(
          resposta,
        )

      throw new Error(
        obterMensagemErro(
          resposta,
          resultado,
          baixar
            ? 'Não foi possível baixar o documento.'
            : 'Não foi possível abrir o documento.',
        ),
      )
    }

    const blob =
      await resposta.blob()

    const urlTemporaria =
      URL.createObjectURL(
        blob,
      )

    if (baixar) {
      const link =
        document.createElement(
          'a',
        )

      link.href =
        urlTemporaria

      link.download =
        anexo.nomeOriginal

      document.body.appendChild(
        link,
      )

      link.click()

      link.remove()
    } else {
      const novaJanela =
        window.open(
          urlTemporaria,
          '_blank',
          'noopener,noreferrer',
        )

      if (!novaJanela) {
        URL.revokeObjectURL(
          urlTemporaria,
        )

        throw new Error(
          'O navegador bloqueou a abertura do documento. Permita pop-ups e tente novamente.',
        )
      }
    }

    window.setTimeout(
      () => {
        URL.revokeObjectURL(
          urlTemporaria,
        )
      },
      60000,
    )

    return true
  }

  async function abrirDocumento(
    demandaId,
    anexoId,
  ) {
    return obterArquivoDocumento(
      demandaId,
      anexoId,
      false,
    )
  }

  async function baixarDocumento(
    demandaId,
    anexoId,
  ) {
    return obterArquivoDocumento(
      demandaId,
      anexoId,
      true,
    )
  }

  async function excluirDocumento(
    demandaId,
    anexoId,
  ) {
    const demandaIdTratado =
      String(demandaId)

    const anexoIdTratado =
      String(anexoId)

    const demanda =
      buscarDemandaPorId(
        demandaIdTratado,
      )

    if (!demanda) {
      return false
    }

    validarDemandaEditavel(
      demanda,
    )

    const anexoExiste =
      (
        demanda.anexos || []
      ).some(
        (anexo) =>
          anexo.id ===
          anexoIdTratado,
      )

    if (!anexoExiste) {
      return false
    }

    const resposta = await fetch(
      (
        `${API_URL}/` +
        `${demandaIdTratado}/` +
        `anexos/` +
        `${anexoIdTratado}`
      ),
      {
        method: 'DELETE',
        credentials: 'include',
      },
    )

    const resultado =
      await obterResultadoResposta(
        resposta,
      )

    if (!resposta.ok) {
      throw new Error(
        obterMensagemErro(
          resposta,
          resultado,
          'Não foi possível excluir o documento.',
        ),
      )
    }

    atualizarAnexosDaDemanda(
      demandaIdTratado,
      (anexosAtuais) =>
        anexosAtuais.filter(
          (anexo) =>
            anexo.id !==
            anexoIdTratado,
        ),
      resultado.historico,
    )

    return true
  }

  return (
    <DemandasContext.Provider
      value={{
        demandas,
        demandasArquivadas,
        responsaveis,
        carregandoDemandas,
        carregandoArquivadas,
        arquivadasCarregadas,
        erroAoCarregar,
        erroAoCarregarArquivadas,
        carregarDemandasArquivadas,
        cadastrarDemanda,
        buscarDemandaPorId,
        buscarDemandaArquivadaPorId,
        arquivarDemanda,
        excluirDemanda,
        alterarPrioridade,
        restaurarPrioridadeAutomatica,
        atribuirResponsavel,
        alterarStatus,
        editarDemanda,
        registrarGargalo,
        editarGargalo,
        alterarStatusGargalo,
        resolverGargalo,
        reabrirGargalo,
        excluirGargalo,
        anexarDocumento,
        editarDocumento,
        abrirDocumento,
        baixarDocumento,
        excluirDocumento,
      }}
    >
      {children}
    </DemandasContext.Provider>
  )
}

export function useDemandas() {
  const contexto =
    useContext(
      DemandasContext,
    )

  if (!contexto) {
    throw new Error(
      'useDemandas deve ser utilizado dentro de DemandasProvider.',
    )
  }

  return contexto
}