import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FileText, PenLine, Search, Plus } from 'lucide-react'
import type { Envelope } from '../types'
import { useStore } from '../lib/store'
import { needsMySignature, progress, relativeTime, signers } from '../lib/envelopes'
import { Avatar, StatusBadge } from '../components/ui'

const FILTERS = [
  { key: '', label: 'Todos' },
  { key: 'action', label: 'Pendientes de mi firma' },
  { key: 'sent', label: 'Esperando a otros' },
  { key: 'completed', label: 'Completados' },
  { key: 'draft', label: 'Borradores' },
  { key: 'closed', label: 'Rechazados y anulados' },
]

function matchFilter(key: string, e: Envelope, email: string) {
  switch (key) {
    case 'action': return needsMySignature(e, email)
    case 'sent': return e.status === 'sent'
    case 'completed': return e.status === 'completed'
    case 'draft': return e.status === 'draft'
    case 'closed': return e.status === 'declined' || e.status === 'voided'
    default: return true
  }
}

export function DocRow({ env, compact }: { env: Envelope; compact?: boolean }) {
  const { profile } = useStore()
  const navigate = useNavigate()
  const mine = needsMySignature(env, profile.email)
  const p = progress(env)
  const me = mine ? signers(env).find((r) => r.email.toLowerCase() === profile.email.toLowerCase()) : undefined
  const people = signers(env)

  return (
    <Link to={env.status === 'draft' ? `/nuevo?id=${env.id}` : `/documentos/${env.id}`} className={`doc-row${compact ? ' compact' : ''}`}>
      <div className="icon-bubble" style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--primary-50)', color: 'var(--primary)' }}>
        <FileText size={19} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="title">{env.title}</div>
        <div className="sub">
          {people.length ? `Para: ${people.map((r) => r.name).join(', ')}` : 'Sin destinatarios'} · {relativeTime(env.updatedAt)}
        </div>
      </div>
      {!compact && (
        <div className="row" style={{ gap: 0 }}>
          {people.slice(0, 4).map((r, i) => (
            <span key={r.id} style={{ marginLeft: i ? -8 : 0, borderRadius: '50%', boxShadow: '0 0 0 2px #fff' }}>
              <Avatar name={r.name} color={r.status === 'signed' ? 'var(--emerald)' : r.color} small />
            </span>
          ))}
        </div>
      )}
      {!compact && (
        <div className="col-progress">
          {p.total > 0 && env.status !== 'draft' && (
            <>
              <div className={`progress${p.done === p.total ? ' done' : ''}`}>
                <div style={{ width: `${(p.done / p.total) * 100}%` }} />
              </div>
              <div className="hint" style={{ marginTop: 4 }}>{p.done} de {p.total} firmas</div>
            </>
          )}
        </div>
      )}
      <div className="actions">
        {mine && me ? (
          <button
            className="btn btn-gold btn-sm"
            onClick={(e) => {
              e.preventDefault()
              navigate(`/firmar/${env.id}/${me.id}`)
            }}
          >
            <PenLine size={14} /> Firmar
          </button>
        ) : (
          <StatusBadge env={env} />
        )}
      </div>
    </Link>
  )
}

export function Documents() {
  const { envelopes, profile } = useStore()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const f = params.get('f') ?? ''
  const q = (params.get('q') ?? '').toLowerCase()

  const search = (e: Envelope) =>
    !q || [e.title, e.fileName, ...e.recipients.flatMap((r) => [r.name, r.email])].some((s) => s.toLowerCase().includes(q))

  const list = envelopes.filter((e) => matchFilter(f, e, profile.email) && search(e))
  const title = FILTERS.find((x) => x.key === f)?.label ?? 'Todos'

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1>{f ? title : 'Documentos'}</h1>
          <p>{q ? `Resultados para “${params.get('q')}”` : 'Todos tus sobres de firma en un solo lugar.'}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/nuevo')}>
          <Plus size={16} /> Nuevo documento
        </button>
      </div>

      <div className="tabs">
        {FILTERS.map((x) => {
          const n = envelopes.filter((e) => matchFilter(x.key, e, profile.email)).length
          return (
            <button
              key={x.key}
              className={`tab${x.key === f ? ' active' : ''}`}
              onClick={() => {
                const next = new URLSearchParams(params)
                if (x.key) next.set('f', x.key)
                else next.delete('f')
                setParams(next)
              }}
            >
              {x.label} <span className="n">{n}</span>
            </button>
          )
        })}
      </div>

      <div className="card">
        {list.length ? (
          <div className="doc-list">
            {list.map((e) => (
              <DocRow key={e.id} env={e} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <div className="icon-bubble" style={{ background: 'var(--slate-50)', color: 'var(--slate)' }}>
              <Search size={22} />
            </div>
            No hay documentos en esta bandeja.
          </div>
        )}
      </div>
    </div>
  )
}
