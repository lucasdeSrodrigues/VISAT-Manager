import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useDemandas } from '../context/DemandasContext.jsx'
import './CadastroDemanda.css'

function CadastroDemanda() {
  const navigate = useNavigate()
  const { cadastrarDemanda } = useDemandas()

  const [formulario, setFormulario] = useState({
    orgaoSolicitante: '',
    dataEntrada: '',
    municipio: '',
    bairro: '',
    tipoOcorrencia: '',
    prazoResposta: '',
    descricao: '',
  })

  const [mensagemErro, setMensagemErro] = useState('')

  function atualizarCampo(evento) {
    const { name, value } = evento.target

    setFormulario((formularioAnterior) => ({
      ...formularioAnterior,
      [name]: value,
    }))
  }

  function enviarFormulario(evento) {
    evento.preventDefault()

    const camposObrigatorios = [
      formulario.orgaoSolicitante,
      formulario.dataEntrada,
      formulario.municipio,
      formulario.bairro,
      formulario.tipoOcorrencia,
      formulario.prazoResposta,
      formulario.descricao,
    ]

    const possuiCampoVazio = camposObrigatorios.some(
      (campo) => campo.trim() === '',
    )

    if (possuiCampoVazio) {
      setMensagemErro('Preencha todos os campos obrigatórios.')
      return
    }

    cadastrarDemanda({
      ...formulario,
      status: 'Em andamento',
    })

    setMensagemErro('')
    navigate('/demandas')
  }

  return (
    <div className="cadastro-page">
      <div className="cadastro-page-header">
        <div>
          <h1>Cadastrar demanda</h1>

          <p>
            Registre manualmente uma demanda recebida por um meio diferente do
            SEI.
          </p>
        </div>

        <span className="origem-badge">Origem: Manual</span>
      </div>

      <form className="cadastro-form" onSubmit={enviarFormulario}>
        <div className="form-section-header">
          <h2>Informações da demanda</h2>

          <p>Os campos marcados com * são obrigatórios.</p>
        </div>

        {mensagemErro && (
          <p className="form-error" role="alert">
            {mensagemErro}
          </p>
        )}

        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="orgaoSolicitante">
              Órgão solicitante <span>*</span>
            </label>

            <input
              id="orgaoSolicitante"
              name="orgaoSolicitante"
              type="text"
              placeholder="Informe o órgão solicitante"
              value={formulario.orgaoSolicitante}
              onChange={atualizarCampo}
            />
          </div>

          <div className="form-field">
            <label htmlFor="tipoOcorrencia">
              Tipo de ocorrência <span>*</span>
            </label>

            <input
              id="tipoOcorrencia"
              name="tipoOcorrencia"
              type="text"
              placeholder="Informe o tipo de ocorrência"
              value={formulario.tipoOcorrencia}
              onChange={atualizarCampo}
            />
          </div>

          <div className="form-field">
            <label htmlFor="dataEntrada">
              Data de entrada <span>*</span>
            </label>

            <input
              id="dataEntrada"
              name="dataEntrada"
              type="date"
              value={formulario.dataEntrada}
              onChange={atualizarCampo}
            />
          </div>

          <div className="form-field">
            <label htmlFor="prazoResposta">
              Prazo de resposta <span>*</span>
            </label>

            <input
              id="prazoResposta"
              name="prazoResposta"
              type="date"
              value={formulario.prazoResposta}
              onChange={atualizarCampo}
            />
          </div>

          <div className="form-field">
            <label htmlFor="municipio">
              Município <span>*</span>
            </label>

            <input
              id="municipio"
              name="municipio"
              type="text"
              placeholder="Informe o município"
              value={formulario.municipio}
              onChange={atualizarCampo}
            />
          </div>

          <div className="form-field">
            <label htmlFor="bairro">
              Bairro ou área <span>*</span>
            </label>

            <input
              id="bairro"
              name="bairro"
              type="text"
              placeholder="Informe o bairro ou área"
              value={formulario.bairro}
              onChange={atualizarCampo}
            />
          </div>

          <div className="form-field form-field-full">
            <label htmlFor="descricao">
              Descrição da demanda <span>*</span>
            </label>

            <textarea
              id="descricao"
              name="descricao"
              rows="5"
              placeholder="Descreva as principais informações da demanda"
              value={formulario.descricao}
              onChange={atualizarCampo}
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={() => navigate('/demandas')}
          >
            Cancelar
          </button>

          <button className="primary-button" type="submit">
            Cadastrar demanda
          </button>
        </div>
      </form>
    </div>
  )
}

export default CadastroDemanda