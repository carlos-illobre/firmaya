import { useEffect, useState, type ReactNode } from 'react'
import { X, CheckCircle2 } from 'lucide-react'
import type { Envelope } from '../types'
import { STATUS_LABEL } from '../lib/envelopes'

export function Modal({ title, onClose, children, footer, width }: {
  title: ReactNode
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  width?: number
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={width ? { maxWidth: width } : undefined} role="dialog" aria-modal="true">
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  )
}

export function StatusBadge({ env, mine }: { env: Envelope; mine?: boolean }) {
  if (mine) return <span className="badge badge-action">Requiere tu firma</span>
  return <span className={`badge badge-${env.status}`}>{STATUS_LABEL[env.status]}</span>
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?'
}

export function Avatar({ name, color, small }: { name: string; color?: string; small?: boolean }) {
  return (
    <span className={`avatar${small ? ' sm' : ''}`} style={color ? { background: color } : undefined} title={name}>
      {initials(name)}
    </span>
  )
}

let pushToast: (msg: string) => void = () => {}
export function toast(msg: string) {
  pushToast(msg)
}

export function ToastHost() {
  const [msg, setMsg] = useState<string | null>(null)
  useEffect(() => {
    let t: number
    pushToast = (m) => {
      setMsg(m)
      clearTimeout(t)
      t = window.setTimeout(() => setMsg(null), 2600)
    }
    return () => clearTimeout(t)
  }, [])
  if (!msg) return null
  return (
    <div className="toast" role="status">
      <CheckCircle2 size={18} color="#34D399" /> {msg}
    </div>
  )
}

export function Spinner() {
  return (
    <div className="center">
      <div className="spinner" />
    </div>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="track" />
      {label}
    </label>
  )
}
