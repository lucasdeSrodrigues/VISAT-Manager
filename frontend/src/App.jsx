import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Demandas from './pages/Demandas'
import CadastroDemanda from './pages/CadastroDemanda'

import Layout from './components/Layout'

import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />

        <Route
          path="/demandas"
          element={
            <Layout>
              <Demandas />
            </Layout>
          }
        />

        <Route
          path="/cadastro"
          element={
            <Layout>
              <CadastroDemanda />
            </Layout>
          }
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App