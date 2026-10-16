import { useState, type ReactNode } from 'react'
import { NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Home, FileText, PenLine, Clock, CheckCircle2, FilePen, Plus, Search, UserRound, Menu, HelpCircle } from 'lucide-react'
import { useStore } from '../lib/store'
import { needsMySignature } from '../lib/envelopes'
import { Avatar } from './ui'

export function Logo() {
  return (
    <div className="brand">
      <div className="brand-mark">
        <svg width="22" height="22" viewBox="0 0 64 64" aria-hidden>
          <path d="M8 44c6-2 10-16 15-16s-2 16 4 16 7-12 12-12 1 9 11 9" fill="none" stroke="#F2B526" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div>
        <div className="brand-name">Firma<span>Ya</span></div>
        <div className="brand-tag">Firma electrónica legal</div>
      </div>
    </div>
  )
}

function NavItem({ to, icon, label, count, hot }: { to: string; icon: ReactNode; label: string; count?: number; hot?: boolean }) {
  const loc = useLocation()
  const [path, query] = to.split('?')
  const active = loc.pathname === path && (query ? loc.search === `?${query}` : path !== '/documentos' || !loc.search)
  return (
    <NavLink to={to} className={() => (active ? 'active' : '')} end>
      {icon}
      {label}
      {!!count && <span className={`count${hot ? ' hot' : ''}`}>{count}</span>}
    </NavLink>
  )
}

export function Layout() {
  const { envelopes, profile } = useStore()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState(params.get('q') ?? '')

  const mine = envelopes.filter((e) => needsMySignature(e, profile.email)).length
  const waiting = envelopes.filter((e) => e.status === 'sent').length
  const drafts = envelopes.filter((e) => e.status === 'draft').length

  return (
    <div className="app">
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <aside className={`sidebar${open ? ' open' : ''}`} onClick={() => setOpen(false)}>
        <Logo />
        <button className="cta-new" onClick={() => navigate('/nuevo')}>
          <Plus size={18} strokeWidth={2.6} /> Nuevo documento
        </button>
        <nav className="nav">
          <NavItem to="/" icon={<Home size={18} />} label="Inicio" />
          <NavItem to="/documentos" icon={<FileText size={18} />} label="Todos los documentos" />
          <div className="nav-label">Bandejas</div>
          <NavItem to="/documentos?f=action" icon={<PenLine size={18} />} label="Por firmar" count={mine} hot />
          <NavItem to="/documentos?f=sent" icon={<Clock size={18} />} label="Esperando a otros" count={waiting} />
          <NavItem to="/documentos?f=completed" icon={<CheckCircle2 size={18} />} label="Completados" />
          <NavItem to="/documentos?f=draft" icon={<FilePen size={18} />} label="Borradores" count={drafts} />
          <div className="nav-label">Cuenta</div>
          <NavItem to="/perfil" icon={<UserRound size={18} />} label="Mi firma y perfil" />
          <NavItem to="/ayuda" icon={<HelpCircle size={18} />} label="Ayuda" />
        </nav>
        <div className="sidebar-foot">
          <Avatar name={profile.name} color="#5468F5" />
          <div className="who">
            <b>{profile.name}</b>
            <small>{profile.firm}</small>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="btn btn-ghost btn-icon menu-btn" onClick={() => setOpen(true)} aria-label="Menú">
            <Menu size={20} />
          </button>
          <form
            className="search"
            onSubmit={(e) => {
              e.preventDefault()
              navigate(`/documentos${q ? `?q=${encodeURIComponent(q)}` : ''}`)
            }}
          >
            <Search size={18} />
            <input placeholder="Buscar por documento, cliente o email…" value={q} onChange={(e) => setQ(e.target.value)} />
          </form>
          <div className="spacer" />
          <button className="btn btn-outline hide-sm" onClick={() => navigate('/nuevo?modo=yo')}>
            <PenLine size={16} /> Firmar yo mismo
          </button>
          <button className="btn btn-primary hide-sm" onClick={() => navigate('/nuevo')}>
            <Plus size={16} /> Enviar para firmar
          </button>
        </header>
        <Outlet />
      </div>
    </div>
  )
}
