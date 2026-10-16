import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowDown, Check, Download, ShieldCheck, X, Hourglass, Ban, PenLine } from 'lucide-react'
import type { Envelope, Field } from '../types'
import { getFile, saveProfile, useStore } from '../lib/store'
import { activeSigners, completeSigning, declineEnvelope, FIELD_META, markViewed } from '../lib/envelopes'
import { downloadEnvelope } from '../lib/download'
import { PdfPages, useContainerWidth } from '../components/PdfPages'
import { SignatureModal } from '../components/SignatureModal'
import { Modal, Spinner } from '../components/ui'
import { Logo } from '../components/Layout'
import { FIELD_ICONS } from '../components/FieldEditor'

export function SignDocument() {
  const { envId, recipientId } = useParams()
  const { envelopes, ready, profile } = useStore()
  const navigate = useNavigate()
  const env = envelopes.find((e) => e.id === envId)
  const recipient = env?.recipients.find((r) => r.id === recipientId)
  const [bytes, setBytes] = useState<Uint8Array>()
  const [started, setStarted] = useState(false)
  const [consent, setConsent] = useState(false)
  const [values, setValues] = useState<Record<string, string>>({})
  const [adopted, setAdopted] = useState<{ signature?: string; initials?: string }>({})
  const [modal, setModal] = useState<{ field: Field } | null>(null)
  const [declining, setDeclining] = useState(false)
  const [reason, setReason] = useState('')
  const [finishing, setFinishing] = useState(false)
  const [done, setDone] = useState<Envelope | null>(null)
  const { ref, width } = useContainerWidth(860, 32)

  const isMe = recipient && recipient.email.toLowerCase() === profile.email.toLowerCase()

  useEffect(() => {
    if (envId) getFile(envId, 'original').then(setBytes)
  }, [envId])

  // Firmas guardadas en el perfil si quien firma es el propio usuario
  useEffect(() => {
    if (isMe) setAdopted({ signature: profile.signature, initials: profile.initials })
  }, [isMe, profile.signature, profile.initials])

  const myFields = useMemo(
    () => (env ? env.fields.filter((f) => f.recipientId === recipientId).sort((a, b) => a.page - b.page || a.y - b.y || a.x - b.x) : []),
    [env, recipientId],
  )

  // Autorrellenar nombre y fecha
  useEffect(() => {
    if (!recipient || !started) return
    const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
    setValues((v) => {
      const next = { ...v }
      for (const f of myFields) {
        if (f.type === 'name' && !next[f.id]) next[f.id] = recipient.name
        if (f.type === 'date' && !next[f.id]) next[f.id] = today
      }
      return next
    })
  }, [started, myFields, recipient])

  if (!ready) return <Spinner />
  if (!env || !recipient) return <Notice icon={<X size={34} />} tone="ruby" title="Enlace no válido" text="No encontramos este documento. Comprueba el enlace que te han enviado." />
  if (done) return <DoneScreen env={done} />

  if (env.status === 'voided') return <Notice icon={<Ban size={34} />} tone="ruby" title="Sobre anulado" text="El remitente ha anulado este documento. Ya no es necesario firmarlo." />
  if (env.status === 'declined') return <Notice icon={<Ban size={34} />} tone="ruby" title="Firma rechazada" text="Uno de los firmantes ha rechazado el documento." />
  if (recipient.status === 'signed') return <DoneScreen env={env} />
  if (env.status === 'draft') return <Notice icon={<Hourglass size={34} />} tone="amber" title="Documento no enviado" text="Este documento todavía es un borrador." />
  if (!activeSigners(env).some((r) => r.id === recipient.id))
    return <Notice icon={<Hourglass size={34} />} tone="amber" title="Aún no es tu turno" text="Este documento se firma en orden. Te avisaremos cuando los firmantes anteriores hayan firmado." />

  const isFilled = (f: Field) => !!values[f.id] && (f.type !== 'checkbox' || values[f.id] === 'true' || !f.required)
  const pending = myFields.filter((f) => (f.required || f.type === 'signature' || f.type === 'initials') && !isFilled(f))
  const next = pending[0]

  const goNext = () => {
    if (!next) return
    document.getElementById(`sf-${next.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const clickField = (f: Field) => {
    if (f.type === 'signature' || f.type === 'initials') {
      const saved = adopted[f.type]
      if (saved && !values[f.id]) setValues((v) => ({ ...v, [f.id]: saved }))
      else setModal({ field: f })
    }
  }

  const start = async () => {
    setStarted(true)
    await markViewed(env, recipient.id)
  }

  const finish = async () => {
    setFinishing(true)
    const result = await completeSigning(env, recipient.id, values)
    setFinishing(false)
    setDone(result)
  }

  return (
    <div className="sign-shell">
      <div className="sign-top">
        <Logo />
        <div className="grow" style={{ marginLeft: 16 }}>
          <b>{env.title}</b>
          <small>Firmando como {recipient.name} · {recipient.email}</small>
        </div>
        <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,.1)', color: '#fff' }} onClick={() => setDeclining(true)}>
          Rechazar
        </button>
        <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,.1)', color: '#fff' }} onClick={() => navigate('/')}>
          Cerrar
        </button>
      </div>
      <div className="sign-banner">
        <ShieldCheck size={18} />
        {pending.length
          ? `Completa ${pending.length} campo${pending.length > 1 ? 's' : ''} marcado${pending.length > 1 ? 's' : ''} en amarillo`
          : 'Todo listo. Pulsa «Finalizar» para firmar el documento.'}
      </div>

      <div className="sign-body" ref={ref}>
        <PdfPages
          bytes={bytes}
          width={width}
          overlay={(page, size) =>
            env.fields
              .filter((f) => f.page === page)
              .map((f) => {
                const style = { left: f.x * size.width, top: f.y * size.height, width: f.w * size.width, height: f.h * size.height }
                if (f.recipientId !== recipient.id) {
                  if (f.value && (f.type === 'signature' || f.type === 'initials'))
                    return <div key={f.id} className="s-field filled" style={{ ...style, cursor: 'default' }}><img src={f.value} alt="" /></div>
                  if (f.value) return <div key={f.id} className="s-field filled" style={{ ...style, cursor: 'default', justifyContent: 'flex-start', fontWeight: 500 }}>{f.type === 'checkbox' ? (f.value === 'true' ? '✓' : '') : f.value}</div>
                  return <div key={f.id} className="s-field other" style={style}>{env.recipients.find((r) => r.id === f.recipientId)?.name}</div>
                }
                const filled = isFilled(f)
                const cls = `s-field${filled ? ' filled' : ''}${next?.id === f.id ? ' current' : ''}`
                return (
                  <div key={f.id} style={{ display: 'contents' }}>
                  {next?.id === f.id && (
                    <button className="nav-flag" style={{ top: style.top + style.height / 2 - 14 }} onClick={() => clickField(f)}>
                      {f.type === 'signature' || f.type === 'initials' ? 'Firmar' : 'Rellenar'}
                    </button>
                  )}
                  <div id={`sf-${f.id}`} className={cls} style={style} onClick={() => clickField(f)}>
                    {(f.type === 'signature' || f.type === 'initials') &&
                      (values[f.id] ? <img src={values[f.id]} alt={FIELD_META[f.type].label} /> : <>{FIELD_ICONS[f.type]} {FIELD_META[f.type].label}</>)}
                    {(f.type === 'text' || f.type === 'name' || f.type === 'date') && (
                      <input
                        type="text"
                        placeholder={f.type === 'text' ? f.label : FIELD_META[f.type].label}
                        value={values[f.id] ?? ''}
                        readOnly={f.type === 'date'}
                        onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
                        aria-label={f.label ?? FIELD_META[f.type].label}
                      />
                    )}
                    {f.type === 'checkbox' && (
                      <input type="checkbox" checked={values[f.id] === 'true'} onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.checked ? 'true' : '' }))} aria-label="Casilla" />
                    )}
                  </div>
                  </div>
                )
              })
          }
        />
      </div>

      <div className="sign-footer">
        {pending.length > 0 ? (
          <>
            <span className="muted">{myFields.length - pending.length} de {myFields.length} campos completados</span>
            <button className="btn btn-gold btn-lg" onClick={goNext}>
              <ArrowDown size={18} /> Ir al siguiente campo
            </button>
          </>
        ) : (
          <button className="btn btn-success btn-lg" disabled={finishing} onClick={finish}>
            <Check size={18} strokeWidth={3} /> {finishing ? 'Firmando…' : 'Finalizar y firmar'}
          </button>
        )}
      </div>

      {!started && (
        <Modal title="Revisa y firma" onClose={() => navigate('/')} width={540}
          footer={<button className="btn btn-primary btn-lg" disabled={!consent} onClick={start}>Empezar <PenLine size={16} /></button>}
        >
          <p>Te han enviado <b>{env.title}</b> para que lo firmes electrónicamente.</p>
          {env.message && (
            <div style={{ marginTop: 14, padding: 14, borderRadius: 12, background: 'var(--slate-50)', whiteSpace: 'pre-wrap', color: 'var(--ink-2)' }}>
              {env.message}
            </div>
          )}
          <label className="row" style={{ marginTop: 18, alignItems: 'flex-start', cursor: 'pointer' }}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 3 }} />
            <span>Acepto utilizar firmas y registros electrónicos, y entiendo que mi firma electrónica tiene la misma validez que mi firma manuscrita (Reglamento eIDAS).</span>
          </label>
        </Modal>
      )}

      {modal && (
        <SignatureModal
          kind={modal.field.type === 'initials' ? 'initials' : 'signature'}
          name={recipient.name}
          onClose={() => setModal(null)}
          onSave={(url) => {
            const kind = modal.field.type as 'signature' | 'initials'
            setAdopted((a) => ({ ...a, [kind]: url }))
            setValues((v) => ({ ...v, [modal.field.id]: url }))
            if (isMe && !profile[kind]) saveProfile({ ...profile, [kind]: url })
            setModal(null)
          }}
        />
      )}

      {declining && (
        <Modal title="Rechazar la firma" onClose={() => setDeclining(false)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setDeclining(false)}>Cancelar</button>
              <button className="btn btn-danger" disabled={!reason.trim()} onClick={async () => {
                await declineEnvelope(env, recipient.id, reason.trim())
                setDeclining(false)
              }}>Rechazar documento</button>
            </>
          }
        >
          <p className="muted" style={{ marginBottom: 12 }}>El remitente recibirá tu motivo y el documento quedará cerrado para todos los firmantes.</p>
          <textarea className="textarea" placeholder="Indica el motivo del rechazo…" value={reason} onChange={(e) => setReason(e.target.value)} autoFocus />
        </Modal>
      )}
    </div>
  )
}

function Notice({ icon, title, text, tone }: { icon: React.ReactNode; title: string; text: string; tone: 'ruby' | 'amber' }) {
  const navigate = useNavigate()
  return (
    <div className="sign-shell" style={{ alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="card success-hero" style={{ maxWidth: 520 }}>
        <div className="icon-bubble" style={{ background: `var(--${tone}-50)`, color: `var(--${tone})` }}>{icon}</div>
        <h1>{title}</h1>
        <p className="muted" style={{ marginTop: 8 }}>{text}</p>
        <button className="btn btn-outline" style={{ marginTop: 22 }} onClick={() => navigate('/')}>Ir a FirmaYa</button>
      </div>
    </div>
  )
}

function DoneScreen({ env }: { env: Envelope }) {
  const navigate = useNavigate()
  const completed = env.status === 'completed'
  return (
    <div className="sign-shell" style={{ alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="card success-hero" style={{ maxWidth: 560 }}>
        <div className="icon-bubble"><Check size={36} strokeWidth={3} /></div>
        <h1>{completed ? '¡Documento completado!' : '¡Gracias por firmar!'}</h1>
        <p className="muted" style={{ marginTop: 8 }}>
          {completed
            ? 'Todas las partes han firmado. Descarga el PDF firmado con su certificado de finalización.'
            : 'Tu firma se ha registrado. Recibirás una copia cuando el resto de firmantes complete el documento.'}
        </p>
        <div className="row" style={{ justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
          {completed && (
            <button className="btn btn-primary btn-lg" onClick={() => downloadEnvelope(env)}>
              <Download size={18} /> Descargar PDF firmado
            </button>
          )}
          <button className="btn btn-outline btn-lg" onClick={() => navigate(`/documentos/${env.id}`)}>Ver detalles</button>
        </div>
      </div>
    </div>
  )
}
