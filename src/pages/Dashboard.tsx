import { Link, useNavigate } from 'react-router-dom'
import { PenLine, Clock, CheckCircle2, FilePen, Send, Upload, ArrowRight, Inbox } from 'lucide-react'
import { useStore } from '../lib/store'
import { needsMySignature, relativeTime } from '../lib/envelopes'
import { DocRow } from './Documents'

export function Dashboard() {
  const { envelopes, profile } = useStore()
  const navigate = useNavigate()
  const mine = envelopes.filter((e) => needsMySignature(e, profile.email))
  const waiting = envelopes.filter((e) => e.status === 'sent')
  const completed = envelopes.filter((e) => e.status === 'completed')
  const drafts = envelopes.filter((e) => e.status === 'draft')

  const kpis = [
    { label: 'Pendientes de mi firma', n: mine.length, icon: <PenLine size={22} />, color: 'var(--gold-600)', bg: 'var(--gold-50)', f: 'action' },
    { label: 'Esperando a otros', n: waiting.length, icon: <Clock size={22} />, color: 'var(--amber)', bg: 'var(--amber-50)', f: 'sent' },
    { label: 'Completados', n: completed.length, icon: <CheckCircle2 size={22} />, color: 'var(--emerald)', bg: 'var(--emerald-50)', f: 'completed' },
    { label: 'Borradores', n: drafts.length, icon: <FilePen size={22} />, color: 'var(--primary)', bg: 'var(--primary-50)', f: 'draft' },
  ]

  const activity = envelopes
    .flatMap((e) => e.audit.map((a) => ({ ...a, env: e })))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 8)

  const hour = new Date().getHours()
  const greet = hour < 13 ? 'Buenos días' : hour < 21 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="content">
      <section className="hero">
        <div>
          <h1>{greet}, {profile.name.split(' ')[0]}</h1>
          <p>
            {mine.length
              ? `Tienes ${mine.length} documento${mine.length > 1 ? 's' : ''} esperando tu firma.`
              : 'Prepara un documento, añade a los firmantes y recíbelo firmado en minutos.'}
          </p>
        </div>
        <div className="hero-actions">
          <button className="btn btn-gold btn-lg" onClick={() => navigate('/nuevo')}>
            <Send size={18} /> Enviar para firmar
          </button>
          <button className="btn btn-outline btn-lg" onClick={() => navigate('/nuevo?modo=yo')}>
            <PenLine size={18} /> Firmar yo mismo
          </button>
        </div>
      </section>

      <div className="kpis">
        {kpis.map((k) => (
          <Link key={k.f} to={`/documentos?f=${k.f}`} className="kpi">
            <div className="icon-bubble" style={{ background: k.bg, color: k.color }}>{k.icon}</div>
            <div>
              <b>{k.n}</b>
              <span>{k.label}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="dash-grid">
        <div className="card">
          <div className="card-head">
            <h2>Documentos recientes</h2>
            <Link to="/documentos" className="row" style={{ fontWeight: 600, fontSize: 13.5 }}>
              Ver todos <ArrowRight size={15} />
            </Link>
          </div>
          {envelopes.length ? (
            <div className="doc-list">
              {envelopes.slice(0, 6).map((e) => (
                <DocRow key={e.id} env={e} compact />
              ))}
            </div>
          ) : (
            <div className="empty">
              <div className="icon-bubble" style={{ background: 'var(--primary-50)', color: 'var(--primary)' }}>
                <Upload size={22} />
              </div>
              <h3 style={{ color: 'var(--ink)' }}>Aún no tienes documentos</h3>
              <p style={{ margin: '6px 0 18px' }}>Sube tu primer contrato y envíalo a firmar.</p>
              <button className="btn btn-primary" onClick={() => navigate('/nuevo')}>
                <Upload size={16} /> Subir documento
              </button>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-head">
            <h2>Actividad</h2>
          </div>
          {activity.length ? (
            <div className="activity">
              {activity.map((a, i) => (
                <Link key={i} to={`/documentos/${a.env.id}`} className="activity-item" style={{ color: 'inherit' }}>
                  <span className="dot" style={{ background: dotColor(a.action) }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{a.action}</div>
                    <div className="muted" style={{ fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.env.title} · {relativeTime(a.at)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty">
              <div className="icon-bubble" style={{ background: 'var(--slate-50)', color: 'var(--slate)' }}>
                <Inbox size={22} />
              </div>
              Aquí verás cada envío, apertura y firma.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function dotColor(action: string) {
  if (/firmado|completado/i.test(action)) return 'var(--emerald)'
  if (/rechaz|anulad/i.test(action)) return 'var(--ruby)'
  if (/enviado/i.test(action)) return 'var(--primary)'
  return 'var(--gold)'
}
