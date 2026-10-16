import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Download, PenLine, Copy, Ban, Trash2, CheckCircle2, Clock, Eye, XCircle, Mail } from 'lucide-react'
import type { Recipient } from '../types'
import { deleteEnvelope, getFile, useStore } from '../lib/store'
import { activeSigners, formatDate, needsMySignature, progress, signingLink, voidEnvelope } from '../lib/envelopes'
import { downloadEnvelope } from '../lib/download'
import { PdfPages } from '../components/PdfPages'
import { Avatar, Modal, Spinner, StatusBadge, toast } from '../components/ui'

const R_STATUS: Record<Recipient['status'], { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: 'Pendiente', icon: <Clock size={15} />, color: 'var(--amber)' },
  viewed: { label: 'Abierto', icon: <Eye size={15} />, color: 'var(--primary)' },
  signed: { label: 'Firmado', icon: <CheckCircle2 size={15} />, color: 'var(--emerald)' },
  declined: { label: 'Rechazado', icon: <XCircle size={15} />, color: 'var(--ruby)' },
}

export function EnvelopeDetail() {
  const { id } = useParams()
  const { envelopes, profile, ready } = useStore()
  const navigate = useNavigate()
  const env = envelopes.find((e) => e.id === id)
  const [bytes, setBytes] = useState<Uint8Array>()
  const [voiding, setVoiding] = useState(false)
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (!env) return
    getFile(env.id, env.status === 'completed' ? 'signed' : 'original').then(async (b) => setBytes(b ?? (await getFile(env.id, 'original'))))
  }, [env?.id, env?.status])

  if (!ready) return <Spinner />
  if (!env) return <div className="content"><div className="card empty">Documento no encontrado. <Link to="/documentos">Volver</Link></div></div>

  const p = progress(env)
  const active = activeSigners(env)
  const mine = needsMySignature(env, profile.email)
  const me = env.recipients.find((r) => r.email.toLowerCase() === profile.email.toLowerCase())
  const actor = `${profile.name} <${profile.email}>`

  return (
    <div className="content">
      <Link to="/documentos" className="row" style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 14 }}>
        <ArrowLeft size={16} /> Documentos
      </Link>
      <div className="page-head">
        <div style={{ minWidth: 0 }}>
          <div className="row" style={{ marginBottom: 8 }}><StatusBadge env={env} mine={mine} /></div>
          <h1>{env.title}</h1>
          <p>
            {env.fileName} · Enviado {formatDate(env.sentAt)}{env.completedAt ? ` · Completado ${formatDate(env.completedAt)}` : ''}
          </p>
        </div>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          {mine && me && (
            <button className="btn btn-gold" onClick={() => navigate(`/firmar/${env.id}/${me.id}`)}>
              <PenLine size={16} /> Firmar ahora
            </button>
          )}
          <button className="btn btn-primary" onClick={() => downloadEnvelope(env)}>
            <Download size={16} /> {env.status === 'completed' ? 'Descargar firmado' : 'Descargar original'}
          </button>
          {env.status === 'sent' && (
            <button className="btn btn-danger" onClick={() => setVoiding(true)}>
              <Ban size={16} /> Anular
            </button>
          )}
          {env.status !== 'sent' && (
            <button
              className="btn btn-ghost btn-icon"
              aria-label="Eliminar"
              title="Eliminar"
              onClick={async () => {
                if (!confirm('¿Eliminar este documento de forma permanente?')) return
                await deleteEnvelope(env.id)
                toast('Documento eliminado')
                navigate('/documentos')
              }}
            >
              <Trash2 size={17} />
            </button>
          )}
        </div>
      </div>

      <div className="detail-grid">
        <div className="card" style={{ padding: 16 }}>
          <div className="thumb-frame" style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: 16, maxHeight: '75vh', overflow: 'auto' }}>
            <PdfPages bytes={bytes} width={620} showNumbers={false} />
          </div>
        </div>

        <div className="stack">
          <div className="card">
            <div className="card-head">
              <h2>Firmantes</h2>
              <span className="hint">{p.done}/{p.total} firmados</span>
            </div>
            <div style={{ padding: '0 22px 6px' }}>
              <div className={`progress${p.done === p.total ? ' done' : ''}`} style={{ margin: '14px 0 4px' }}>
                <div style={{ width: `${p.total ? (p.done / p.total) * 100 : 0}%` }} />
              </div>
            </div>
            {env.recipients.map((r) => {
              const st = R_STATUS[r.status]
              const canSignNow = active.some((a) => a.id === r.id)
              return (
                <div key={r.id} className="recip-line" style={{ flexWrap: 'wrap' }}>
                  <Avatar name={r.name} color={r.color} small />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>{r.name} {env.sequential && r.role === 'signer' && <span className="hint">· #{r.order}</span>}</div>
                    <div className="hint">{r.role === 'cc' ? 'Recibe copia' : r.email}</div>
                  </div>
                  {r.role === 'signer' && (
                    <span className="row" style={{ color: st.color, fontWeight: 600, fontSize: 12.5, gap: 5 }}>
                      {st.icon} {st.label}
                    </span>
                  )}
                  {canSignNow && (
                    <div className="row" style={{ width: '100%', paddingLeft: 40, gap: 6 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => navigator.clipboard.writeText(signingLink(env, r)).then(() => toast('Enlace de firma copiado'))}>
                        <Copy size={13} /> Copiar enlace
                      </button>
                      <a className="btn btn-ghost btn-sm" href={`mailto:${r.email}?subject=${encodeURIComponent(`Firma pendiente: ${env.title}`)}&body=${encodeURIComponent(`Hola ${r.name},\n\nTienes un documento pendiente de firma:\n${signingLink(env, r)}\n\nUn saludo,\n${profile.name}`)}`}>
                        <Mail size={13} /> Recordar
                      </a>
                    </div>
                  )}
                  {r.declineReason && <div className="hint" style={{ width: '100%', paddingLeft: 40, color: 'var(--ruby)' }}>Motivo: {r.declineReason}</div>}
                </div>
              )
            })}
          </div>

          <div className="card">
            <div className="card-head">
              <h2>Registro de auditoría</h2>
            </div>
            <div className="timeline">
              {[...env.audit].reverse().map((a, i) => (
                <div key={i} className="tl-item">
                  <b>{a.action}</b>
                  <small>{a.actor}</small>
                  {a.detail && <small>{a.detail}</small>}
                  <small>{formatDate(a.at, true)}</small>
                </div>
              ))}
            </div>
            {env.originalHash && (
              <div style={{ padding: '0 22px 18px' }}>
                <div className="hint">Huella SHA-256 del original</div>
                <code style={{ fontSize: 11, wordBreak: 'break-all', color: 'var(--ink-2)' }}>{env.originalHash}</code>
              </div>
            )}
          </div>
        </div>
      </div>

      {voiding && (
        <Modal title="Anular documento" onClose={() => setVoiding(false)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setVoiding(false)}>Cancelar</button>
              <button className="btn btn-danger" disabled={!reason.trim()} onClick={async () => {
                await voidEnvelope(env, actor, reason.trim())
                setVoiding(false)
                toast('Documento anulado')
              }}>Anular</button>
            </>
          }
        >
          <p className="muted" style={{ marginBottom: 12 }}>Los firmantes ya no podrán firmar. Esta acción no se puede deshacer.</p>
          <textarea className="textarea" placeholder="Motivo de la anulación" value={reason} onChange={(e) => setReason(e.target.value)} autoFocus />
        </Modal>
      )}
    </div>
  )
}
