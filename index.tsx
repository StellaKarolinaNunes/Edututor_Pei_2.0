import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import "./styles/globals.css";
import "./styles/App.module.css";
import { SpeedInsights } from "@vercel/speed-insights/react"



import { ErrorBoundary } from './src/components/Erro/ErrorBoundary'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
    <SpeedInsights />
  </StrictMode>
)
