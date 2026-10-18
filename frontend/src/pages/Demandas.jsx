import { useNavigate } from 'react-router-dom'

import { useDemandas } from '../context/DemandasContext.jsx'
import './Demandas.css'

function formatarData(data) {
  if (!data) {
    return '-'
  }

  const [ano, mes, dia] = data.split('-')

  return `${dia}/${mes}/${ano}`
}

function Demandas() {
  const navigate = useNavigate()
  const { demandas } = useDemandas()

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
                  <th>Órgão solicitante</th>
                  <th>Local</th>
                  <th>Tipo de ocorrência</th>
                  <th>Data de entrada</th>
                  <th>Prazo</th>
                  <th>Status</th>
                  <th>Origem</th>
                </tr>
              </thead>

              <tbody>
                {demandas.map((demanda) => (
                  <tr key={demanda.id}>
                    <td>
                      <strong>{demanda.orgaoSolicitante}</strong>
                    </td>

                    <td>
                      <span>{demanda.municipio}</span>

                      <small>{demanda.bairro}</small>
                    </td>

                    <td>{demanda.tipoOcorrencia}</td>

                    <td>{formatarData(demanda.dataEntrada)}</td>

                    <td>{formatarData(demanda.prazoResposta)}</td>

                    <td>
                      <span className="status-badge">
                        {demanda.status}
                      </span>
                    </td>

                    <td>
                      <span className="manual-badge">
                        {demanda.origem}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default Demandas