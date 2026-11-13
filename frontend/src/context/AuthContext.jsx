import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

const AuthContext = createContext()

const API_BASE_URL =
  import.meta.env.VITE_API_URL

const AUTH_API_URL =
  `${API_BASE_URL}/api/auth`

const PERFIS_VALIDOS = [
  'gestor',
  'inspetor',
]

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
    return 'E-mail ou senha inválidos.'
  }

  if (resposta.status === 403) {
    return (
      'O perfil selecionado não corresponde ' +
      'ao perfil cadastrado para este usuário.'
    )
  }

  return mensagemPadrao
}

function usuarioValido(usuario) {
  if (!usuario) {
    return false
  }

  if (
    !usuario.id ||
    !usuario.nome ||
    !usuario.email ||
    !usuario.perfil
  ) {
    return false
  }

  return PERFIS_VALIDOS.includes(
    usuario.perfil,
  )
}

export function AuthProvider({
  children,
}) {
  const [
    usuario,
    setUsuario,
  ] = useState(null)

  const [
    verificandoAutenticacao,
    setVerificandoAutenticacao,
  ] = useState(true)

  const [
    erroAutenticacao,
    setErroAutenticacao,
  ] = useState('')

  useEffect(() => {
    async function verificarSessao() {
      try {
        setVerificandoAutenticacao(true)
        setErroAutenticacao('')

        const resposta = await fetch(
          `${AUTH_API_URL}/me`,
          {
            method: 'GET',
            credentials: 'include',
          },
        )

        if (resposta.status === 401) {
          setUsuario(null)
          return
        }

        const resultado =
          await obterResultadoResposta(
            resposta,
          )

        if (!resposta.ok) {
          throw new Error(
            obterMensagemErro(
              resposta,
              resultado,
              'Não foi possível verificar a sessão.',
            ),
          )
        }

        if (
          !usuarioValido(
            resultado.usuario,
          )
        ) {
          throw new Error(
            'O backend retornou dados de usuário inválidos.',
          )
        }

        setUsuario(
          resultado.usuario,
        )
      } catch (erro) {
        console.error(
          'Erro ao verificar autenticação:',
          erro,
        )

        setUsuario(null)

        setErroAutenticacao(
          erro.message ||
            'Não foi possível verificar a sessão.',
        )
      } finally {
        setVerificandoAutenticacao(false)
      }
    }

    verificarSessao()
  }, [])

  const entrar = useCallback(
    async (
      email,
      senha,
      perfilSelecionado,
    ) => {
      setErroAutenticacao('')

      const emailTratado =
        email.trim().toLowerCase()

      if (
        !emailTratado ||
        !senha
      ) {
        const mensagem =
          'Informe o e-mail e a senha.'

        setErroAutenticacao(
          mensagem,
        )

        throw new Error(
          mensagem,
        )
      }

      if (
        !PERFIS_VALIDOS.includes(
          perfilSelecionado,
        )
      ) {
        const mensagem =
          'Selecione um perfil válido.'

        setErroAutenticacao(
          mensagem,
        )

        throw new Error(
          mensagem,
        )
      }

      try {
        const resposta = await fetch(
          `${AUTH_API_URL}/login`,
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              email: emailTratado,
              senha,
              perfil:
                perfilSelecionado,
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
              'Não foi possível realizar o login.',
            ),
          )
        }

        if (
          !usuarioValido(
            resultado.usuario,
          )
        ) {
          throw new Error(
            'O backend não retornou dados válidos do usuário.',
          )
        }

        if (
          resultado.usuario.perfil !==
          perfilSelecionado
        ) {
          throw new Error(
            'O perfil retornado pelo backend não corresponde ao perfil selecionado.',
          )
        }

        setUsuario(
          resultado.usuario,
        )

        setErroAutenticacao('')

        return resultado.usuario
      } catch (erro) {
        console.error(
          'Erro ao realizar login:',
          erro,
        )

        const mensagem =
          erro.message ||
          'Não foi possível realizar o login.'

        setUsuario(null)

        setErroAutenticacao(
          mensagem,
        )

        throw new Error(
          mensagem,
        )
      }
    },
    [],
  )

  const sair = useCallback(
    async () => {
      setErroAutenticacao('')

      try {
        const resposta = await fetch(
          `${AUTH_API_URL}/logout`,
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
              'Não foi possível encerrar a sessão.',
            ),
          )
        }

        setUsuario(null)

        return true
      } catch (erro) {
        console.error(
          'Erro ao encerrar sessão:',
          erro,
        )

        const mensagem =
          erro.message ||
          'Não foi possível encerrar a sessão.'

        setErroAutenticacao(
          mensagem,
        )

        throw new Error(
          mensagem,
        )
      }
    },
    [],
  )

  const limparErroAutenticacao =
    useCallback(() => {
      setErroAutenticacao('')
    }, [])

  const autenticado =
    Boolean(usuario)

  const perfil =
    usuario?.perfil || null

  const usuarioEhGestor =
    perfil === 'gestor'

  const usuarioEhInspetor =
    perfil === 'inspetor'

  return (
    <AuthContext.Provider
      value={{
        usuario,
        perfil,
        autenticado,
        usuarioEhGestor,
        usuarioEhInspetor,
        verificandoAutenticacao,
        erroAutenticacao,
        entrar,
        sair,
        limparErroAutenticacao,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const contexto = useContext(
    AuthContext,
  )

  if (!contexto) {
    throw new Error(
      'useAuth deve ser utilizado dentro de AuthProvider.',
    )
  }

  return contexto
}