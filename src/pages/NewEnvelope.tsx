import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Upload, FileText, Users, PenLine, Send, Check, ArrowLeft, ArrowRight, Plus, Trash2, Sparkles, UserRound, Copy, ExternalLink } from 'lucide-react'
import type { Envelope, Recipient } from '../types'
import { getFile, putFile, saveEnvelope, useStore, getState } from '../lib/store'
import { RECIPIENT_COLORS, newEnvelope, sendEnvelope, signers, signingLink, uid, event } from '../lib/envelopes'
import { loadPdf, samplePdf } from '../lib/pdf'
import { FieldEditor } from '../components/FieldEditor'
import { Avatar, Spinner, Toggle, toast } from '../components/ui'

const STEPS = [
  { label: 'Documento', icon: FileText },
  { label: 'Firmantes', icon: Users },
  { label: 'Campos', icon: PenLine },
  { label: 'Revisar y enviar', icon: Send },
]

export function NewEnvelope() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { profile } = useStore()
  const selfMode = params.get('modo') === 'yo'
  const [step, setStep] = useState(0)
  const [env, setEnv] = useState<Envelope | null>(null)
  const [bytes, setBytes] = useState<Uint8Array>()
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState<Envelope | null>(null)

  // Reanudar un borrador existente
  useEffect(() => {
    const id = params.get('id')
    if (!id) return
    const draft = getState().envelopes.find((e) => e.id === id)
    if (!draft) return
    getFile(id, 'original').then((b) => {
      setEnv(draft)
      setBytes(b)
      setStep(draft.fields.length ? 2 : 1)
    })
  }, [params])

  const update = (patch: Partial<Envelope>) => setEnv((e) => (e ? { ...e, ...patch } : e))

  const onFile = async (name: string, data: Uint8Array) => {
    setBusy(true)
    try {
      const pdf = await loadPdf(data)
      const title = name.replace(/\.pdf$/i, '')
      const e = newEnvelope(title, name, pdf.numPages)
      pdf.destroy()
      if (selfMode) {
        e.recipients = [{ id: uid('r_'), name: profile.name, email: profile.email, role: 'signer', order: 1, color: RECIPIENT_COLORS[0], status: 'pending' }]
      }
      e.audit = [event('Sobre creado', `${profile.name} <${profile.email}>`, name)]
      await putFile(e.id, 'original', data)
      setEnv(e)
      setBytes(data)
      setStep(selfMode ? 2 : 1)
    } catch {
      toast('El archivo no es un PDF válido')
    } finally {
      setBusy(false)
    }
  }

  const saveDraft = async () => {
    if (!env) return
    await saveEnvelope(env)
    toast('Borrador guardado')
    navigate('/documentos?f=draft')
  }

  const sMissing = env ? signers(env).filter((r) => !env.fields.some((f) => f.recipientId === r.id && f.type === 'signature')) : []
  const recipientsValid = !!env && signers(env).length > 0 && env.recipients.every((r) => r.name.trim() && /^\S+@\S+\.\S+$/.test(r.email))

  const canNext = step === 0 ? !!env : step === 1 ? recipientsValid : step === 2 ? sMissing.length === 0 : true

  const finish = async () => {
    if (!env) return
    setBusy(true)
    const actor = `${profile.name} <${profile.email}>`
    const result = await sendEnvelope({ ...env, recipients: env.recipients }, actor)
    setBusy(false)
    if (selfMode) {
      navigate(`/firmar/${result.id}/${result.recipients[0].id}`)
      return
    }
    setSent(result)
  }

  if (sent) return <SentScreen env={sent} />

  const visibleSteps = selfMode ? STEPS.filter((_, i) => i !== 1) : STEPS
  const visibleIndex = selfMode ? (step === 0 ? 0 : step - 1) : step

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 68px)' }}>
      <div style={{ padding: '18px 32px', background: 'var(--surface)', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>{selfMode ? 'Firmar yo mismo' : 'Enviar para firmar'}</h2>
          {env && <div className="hint">{env.fileName} · {env.pageCount} página{env.pageCount > 1 ? 's' : ''}</div>}
        </div>
        <div className="stepper">
          {visibleSteps.map((s, i) => (
            <div key={s.label} className="row" style={{ gap: 8 }}>
              {i > 0 && <div className="step-sep" />}
              <div className={`step${i === visibleIndex ? ' active' : i < visibleIndex ? ' done' : ''}`}>
                <span className="num">{i < visibleIndex ? <Check size={15} strokeWidth={3} /> : i + 1}</span>
                <span className="txt">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {busy && <Spinner />}
      {!busy && step === 0 && <UploadStep onFile={onFile} />}
      {!busy && step === 1 && env && <RecipientsStep env={env} update={update} />}
      {!busy && step === 2 && env && <FieldEditor env={env} bytes={bytes} onChange={(fields) => update({ fields })} />}
      {!busy && step === 3 && env && <ReviewStep env={env} update={update} />}

      {step > 0 && env && (
        <div className="wizard-bar">
          <button className="btn btn-ghost" onClick={() => setStep(step === 2 && selfMode ? 0 : step - 1)}>
            <ArrowLeft size={16} /> Atrás
          </button>
          <div className="row">
            {step === 2 && sMissing.length > 0 && (
              <span className="hint" style={{ marginRight: 6 }}>
                Falta un campo de firma para: <b>{sMissing.map((r) => r.name).join(', ')}</b>
              </span>
            )}
            {!selfMode && (
              <button className="btn btn-outline" onClick={saveDraft}>
                Guardar borrador
              </button>
            )}
            {selfMode && step === 2 ? (
              <button className="btn btn-gold" disabled={!canNext} onClick={finish}>
                <PenLine size={16} /> Continuar a firmar
              </button>
            ) : step < 3 ? (
              <button className="btn btn-primary" disabled={!canNext} onClick={() => setStep(step + 1)}>
                Siguiente <ArrowRight size={16} />
              </button>
            ) : (
              <button className="btn btn-gold" onClick={finish}>
                <Send size={16} /> Enviar ahora
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function UploadStep({ onFile }: { onFile: (name: string, data: Uint8Array) => void }) {
  const [over, setOver] = useState(false)
  const read = (file: File) => file.arrayBuffer().then((b) => onFile(file.name, new Uint8Array(b)))
  return (
    <div className="content" style={{ maxWidth: 820 }}>
      <label
        className={`dropzone${over ? ' over' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          const f = e.dataTransfer.files[0]
          if (f) read(f)
        }}
      >
        <input type="file" accept="application/pdf" hidden onChange={(e) => e.target.files?.[0] && read(e.target.files[0])} />
        <div className="icon-bubble" style={{ margin: '0 auto', width: 64, height: 64, borderRadius: 18, background: 'var(--primary)', color: '#fff' }}>
          <Upload size={28} />
        </div>
        <h2>Arrastra aquí tu documento PDF</h2>
        <p className="muted">o haz clic para seleccionarlo desde tu equipo</p>
        <span className="btn btn-primary" style={{ marginTop: 18 }}>
          <Upload size={16} /> Seleccionar archivo
        </span>
      </label>
      <div style={{ textAlign: 'center', marginTop: 18 }}>
        <button className="btn btn-ghost" onClick={async () => onFile('Contrato de servicios jurídicos.pdf', await samplePdf())}>
          <Sparkles size={16} color="var(--gold-600)" /> Probar con un contrato de ejemplo
        </button>
      </div>
    </div>
  )
}

function RecipientsStep({ env, update }: { env: Envelope; update: (p: Partial<Envelope>) => void }) {
  const { profile } = useStore()
  const list = env.recipients

  useEffect(() => {
    if (!list.length) add()
  }, [])

  function add(r?: Partial<Recipient>) {
    const used = new Set(env.recipients.map((x) => x.color))
    const color = RECIPIENT_COLORS.find((c) => !used.has(c)) ?? RECIPIENT_COLORS[env.recipients.length % RECIPIENT_COLORS.length]
    const order = env.recipients.length + 1
    update({ recipients: [...env.recipients, { id: uid('r_'), name: '', email: '', role: 'signer', order, color, status: 'pending', ...r }] })
  }
  const set = (id: string, patch: Partial<Recipient>) => update({ recipients: list.map((r) => (r.id === id ? { ...r, ...patch } : r)) })
  const remove = (id: string) =>
    update({
      recipients: list.filter((r) => r.id !== id).map((r, i) => ({ ...r, order: i + 1 })),
      fields: env.fields.filter((f) => f.recipientId !== id),
    })
  const meAdded = list.some((r) => r.email.toLowerCase() === profile.email.toLowerCase())

  return (
    <div className="content" style={{ maxWidth: 980 }}>
      <div className="page-head" style={{ marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 24 }}>¿Quién tiene que firmar?</h1>
          <p>Añade a las partes del documento. Cada firmante tiene su color para identificar sus campos.</p>
        </div>
        <Toggle checked={env.sequential} onChange={(v) => update({ sequential: v })} label="Firmar en orden" />
      </div>

      <div className="stack" style={{ gap: 10 }}>
        {list.map((r, i) => (
          <div key={r.id} className="recipient-card" style={{ borderLeftColor: r.color }}>
            <div className="order-num">{env.sequential ? r.order : <Avatar name={r.name || '?'} color={r.color} small />}</div>
            <input className="input" placeholder="Nombre completo" value={r.name} onChange={(e) => set(r.id, { name: e.target.value })} autoFocus={i === list.length - 1 && !r.name} aria-label="Nombre" />
            <input className="input" type="email" placeholder="correo@ejemplo.com" value={r.email} onChange={(e) => set(r.id, { email: e.target.value })} aria-label="Email" />
            <select className="select" value={r.role} onChange={(e) => set(r.id, { role: e.target.value as Recipient['role'] })} aria-label="Rol">
              <option value="signer">Debe firmar</option>
              <option value="cc">Recibe copia</option>
            </select>
            <button className="btn btn-ghost btn-icon" onClick={() => remove(r.id)} aria-label="Eliminar firmante" disabled={list.length === 1}>
              <Trash2 size={17} />
            </button>
          </div>
        ))}
      </div>

      <div className="row" style={{ marginTop: 14, flexWrap: 'wrap' }}>
        <button className="btn btn-outline" onClick={() => add()}>
          <Plus size={16} /> Añadir firmante
        </button>
        {!meAdded && (
          <button className="btn btn-ghost" onClick={() => add({ name: profile.name, email: profile.email })}>
            <UserRound size={16} /> Añadirme a mí
          </button>
        )}
      </div>
    </div>
  )
}

function ReviewStep({ env, update }: { env: Envelope; update: (p: Partial<Envelope>) => void }) {
  return (
    <div className="content" style={{ maxWidth: 980 }}>
      <div className="dash-grid">
        <div className="card card-pad stack">
          <h2>Mensaje para los firmantes</h2>
          <div className="field">
            <label htmlFor="subj">Asunto</label>
            <input id="subj" className="input" value={env.title} onChange={(e) => update({ title: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="msg">Mensaje (opcional)</label>
            <textarea id="msg" className="textarea" rows={5} placeholder="Estimado cliente, le remito el contrato para su firma…" value={env.message} onChange={(e) => update({ message: e.target.value })} />
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h2>Resumen</h2></div>
          <div>
            {env.recipients.map((r) => (
              <div key={r.id} className="recip-line">
                <Avatar name={r.name} color={r.color} small />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{r.name}</div>
                  <div className="hint">{r.email}</div>
                </div>
                <span className="hint">
                  {r.role === 'cc' ? 'Copia' : `${env.fields.filter((f) => f.recipientId === r.id).length} campos`}
                </span>
              </div>
            ))}
            <div className="recip-line hint">
              {env.sequential ? 'Firma en orden secuencial' : 'Todos pueden firmar a la vez'} · Caduca en 30 días
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SentScreen({ env }: { env: Envelope }) {
  const navigate = useNavigate()
  const { profile } = useStore()
  const me = signers(env).find((r) => r.email.toLowerCase() === profile.email.toLowerCase())
  return (
    <div className="content" style={{ maxWidth: 760 }}>
      <div className="card success-hero">
        <div className="icon-bubble"><Check size={36} strokeWidth={3} /></div>
        <h1>¡Documento enviado!</h1>
        <p className="muted" style={{ marginTop: 8 }}>
          Comparte con cada firmante su enlace personal. Te avisaremos en la bandeja cuando firmen.
        </p>
        <div className="stack" style={{ textAlign: 'left', marginTop: 26, gap: 12 }}>
          {signers(env).map((r) => (
            <div key={r.id}>
              <div className="row" style={{ marginBottom: 6 }}>
                <Avatar name={r.name} color={r.color} small />
                <b>{r.name}</b>
                <span className="hint">{r.email}</span>
              </div>
              <div className="link-box">
                <code>{signingLink(env, r)}</code>
                <button className="btn btn-outline btn-sm" onClick={() => navigator.clipboard.writeText(signingLink(env, r)).then(() => toast('Enlace copiado'))}>
                  <Copy size={14} /> Copiar
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/firmar/${env.id}/${r.id}`)}>
                  <ExternalLink size={14} /> Abrir
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="row" style={{ justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
          {me && (
            <button className="btn btn-gold" onClick={() => navigate(`/firmar/${env.id}/${me.id}`)}>
              <PenLine size={16} /> Firmar ahora
            </button>
          )}
          <button className="btn btn-outline" onClick={() => navigate(`/documentos/${env.id}`)}>Ver estado</button>
          <button className="btn btn-ghost" onClick={() => navigate('/')}>Volver al inicio</button>
        </div>
      </div>
    </div>
  )
}
