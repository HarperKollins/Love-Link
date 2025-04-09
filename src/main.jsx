import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <SubscriptionProvider>
          <App />
        </SubscriptionProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
