import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthWrapper } from './components/context/auth.context.jsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthWrapper>
      <App />
    </AuthWrapper>
  </React.StrictMode>,
)