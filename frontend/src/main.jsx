import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'
import { DemandasProvider } from './context/DemandasContext.jsx'

import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DemandasProvider>
      <App />
    </DemandasProvider>
  </StrictMode>,
)