import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './styles/tokens.css'
import './styles/global.css'
import { initializeTheme } from './store/themeStore'
import { initPwaInstall } from './lib/pwaInstall'

// Инициализация темы до рендера, чтобы избежать мигания
initializeTheme()

// Must listen before React mounts: the install prompt event can fire very early
initPwaInstall()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
