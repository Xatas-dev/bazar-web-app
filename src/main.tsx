import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './styles/tokens.css'
import './styles/global.css'
import { initializeTheme } from './store/themeStore'

// Инициализация темы до рендера, чтобы избежать мигания
initializeTheme()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
