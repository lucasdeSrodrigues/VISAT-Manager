function criarDataLocal(dataTexto) {
  if (!dataTexto) {
    return null
  }

  const [ano, mes, dia] = dataTexto.split('-').map(Number)

  if (!ano || !mes || !dia) {
    return null
  }

  const data = new Date(ano, mes - 1, dia)

  const dataValida =
    data.getFullYear() === ano &&
    data.getMonth() === mes - 1 &&
    data.getDate() === dia

  if (!dataValida) {
    return null
  }

  return data
}

export function calcularDiasRestantes(prazoResposta) {
  const dataPrazo = criarDataLocal(prazoResposta)

  if (!dataPrazo) {
    return null
  }

  const hoje = new Date()

  const hojeEmUtc = Date.UTC(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate(),
  )

  const prazoEmUtc = Date.UTC(
    dataPrazo.getFullYear(),
    dataPrazo.getMonth(),
    dataPrazo.getDate(),
  )

  const milissegundosPorDia = 1000 * 60 * 60 * 24
  const diferencaEmMilissegundos = prazoEmUtc - hojeEmUtc

  return Math.round(
    diferencaEmMilissegundos / milissegundosPorDia,
  )
}

export function calcularPrioridade(prazoResposta) {
  const diasRestantes = calcularDiasRestantes(prazoResposta)

  if (diasRestantes === null) {
    return 'Não definida'
  }

  if (diasRestantes <= 3) {
    return 'Alta'
  }

  if (diasRestantes <= 7) {
    return 'Média'
  }

  return 'Baixa'
}

export function estaComPrazoProximo(prazoResposta) {
  const diasRestantes = calcularDiasRestantes(prazoResposta)

  if (diasRestantes === null) {
    return false
  }

  return diasRestantes >= 0 && diasRestantes <= 3
}

export function criarMensagemPrazoProximo(prazoResposta) {
  const diasRestantes = calcularDiasRestantes(prazoResposta)

  if (diasRestantes === null) {
    return null
  }

  if (diasRestantes === 0) {
    return 'Vence hoje'
  }

  if (diasRestantes === 1) {
    return 'Vence amanhã'
  }

  if (diasRestantes === 2) {
    return 'Vence em 2 dias'
  }

  if (diasRestantes === 3) {
    return 'Vence em 3 dias'
  }

  return null
}

export function obterAlertaPrazo(prazoResposta) {
  const diasRestantes = calcularDiasRestantes(prazoResposta)

  if (
    diasRestantes === null ||
    diasRestantes < 0 ||
    diasRestantes > 3
  ) {
    return null
  }

  return {
    diasRestantes,
    mensagem: criarMensagemPrazoProximo(prazoResposta),
  }
}