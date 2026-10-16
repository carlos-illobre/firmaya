import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './styles.css'
import { Layout } from './components/Layout'
import { ToastHost } from './components/ui'
import { Dashboard } from './pages/Dashboard'
import { Documents } from './pages/Documents'
import { NewEnvelope } from './pages/NewEnvelope'
import { EnvelopeDetail } from './pages/EnvelopeDetail'
import { SignDocument } from './pages/SignDocument'
import { Profile } from './pages/Profile'
import { Help } from './pages/Help'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/documentos" element={<Documents />} />
          <Route path="/documentos/:id" element={<EnvelopeDetail />} />
          <Route path="/nuevo" element={<NewEnvelope />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/ayuda" element={<Help />} />
        </Route>
        <Route path="/firmar/:envId/:recipientId" element={<SignDocument />} />
      </Routes>
      <ToastHost />
    </BrowserRouter>
  </React.StrictMode>,
)
