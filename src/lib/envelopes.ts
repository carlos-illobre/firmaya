import type { AuditEvent, Envelope, EnvelopeStatus, Field, FieldType, Recipient } from '../types'
import { buildSignedPdf, sha256 } from './pdf'
import { getFile, putFile, saveEnvelope } from './store'

export const RECIPIENT_COLORS = ['#3B4FE0', '#0E9F8A', '#D6336C', '#E8890C', '#7C3AED', '#0284C7']

export function uid(prefix = '') {
  return prefix + crypto.randomUUID().replace(/-/g, '').slice(0, 12)
}

export const FIELD_META: Record<FieldType, { label: string; w: number; h: number }> = {
  signature: { label: 'Firma', w: 0.26, h: 0.07 },
  initials: { label: 'Iniciales', w: 0.1, h: 0.055 },
  date: { label: 'Fecha de firma', w: 0.18, h: 0.035 },
  name: { label: 'Nombre completo', w: 0.24, h: 0.035 },
  text: { label: 'Texto', w: 0.24, h: 0.035 },
  checkbox: { label: 'Casilla', w: 0.03, h: 0.022 },
}

export const STATUS_LABEL: Record<EnvelopeStatus, string> = {
  draft: 'Borrador',
  sent: 'En curso',
  completed: 'Completado',
  declined: 'Rechazado',
  voided: 'Anulado',
}

export function event(action: string, actor: string, detail?: string): AuditEvent {
  return { at: new Date().toISOString(), action, actor, detail }
}

export function signers(env: Envelope) {
  return env.recipients.filter((r) => r.role === 'signer').sort((a, b) => a.order - b.order)
}

/** Firmantes que pueden firmar ahora mismo (respeta el orden si es secuencial). */
export function activeSigners(env: Envelope): Recipient[] {
  if (env.status !== 'sent') return []
  const pending = signers(env).filter((r) => r.status !== 'signed')
  if (!env.sequential) return pending
  if (!pending.length) return []
  const next = pending[0].order
  return pending.filter((r) => r.order === next)
}

export function needsMySignature(env: Envelope, email: string) {
  return activeSigners(env).some((r) => r.email.toLowerCase() === email.toLowerCase())
}

export function progress(env: Envelope) {
  const s = signers(env)
  return { done: s.filter((r) => r.status === 'signed').length, total: s.length }
}

export function newEnvelope(title: string, fileName: string, pageCount: number): Envelope {
  const now = new Date().toISOString()
  return {
    id: uid('env_'),
    title,
    message: '',
    fileName,
    pageCount,
    status: 'draft',
    sequential: false,
    createdAt: now,
    updatedAt: now,
    recipients: [],
    fields: [],
    audit: [],
  }
}

export function signingLink(env: Envelope, r: Recipient) {
  return `${location.origin}/firmar/${env.id}/${r.id}`
}

export async function sendEnvelope(env: Envelope, actor: string) {
  const original = await getFile(env.id, 'original')
  const hash = original ? await sha256(original) : undefined
  const expires = new Date()
  expires.setDate(expires.getDate() + 30)
  return saveEnvelope({
    ...env,
    status: 'sent',
    sentAt: new Date().toISOString(),
    expiresAt: expires.toISOString(),
    originalHash: hash,
    recipients: env.recipients.map((r) => ({ ...r, status: 'pending' })),
    audit: [
      ...env.audit,
      event('Sobre enviado', actor, signers(env).map((r) => `${r.name} <${r.email}>`).join(', ')),
    ],
  })
}

export async function markViewed(env: Envelope, recipientId: string) {
  const r = env.recipients.find((x) => x.id === recipientId)
  if (!r || r.status !== 'pending') return env
  return saveEnvelope({
    ...env,
    recipients: env.recipients.map((x) => (x.id === recipientId ? { ...x, status: 'viewed' } : x)),
    audit: [...env.audit, event('Documento abierto', `${r.name} <${r.email}>`)],
  })
}

export async function completeSigning(env: Envelope, recipientId: string, values: Record<string, string>) {
  const r = env.recipients.find((x) => x.id === recipientId)!
  const now = new Date().toISOString()
  const fields: Field[] = env.fields.map((f) => (f.id in values ? { ...f, value: values[f.id] } : f))
  const recipients = env.recipients.map((x) =>
    x.id === recipientId ? { ...x, status: 'signed' as const, signedAt: now } : x,
  )
  const audit = [...env.audit, event('Documento firmado', `${r.name} <${r.email}>`, navigator.userAgent.split(') ')[0] + ')')]
  let next: Envelope = { ...env, fields, recipients, audit }

  const allSigned = recipients.filter((x) => x.role === 'signer').every((x) => x.status === 'signed')
  if (allSigned) {
    next = { ...next, status: 'completed', completedAt: now }
    next.audit = [...next.audit, event('Sobre completado', 'FirmaYa', 'Todos los firmantes han firmado')]
    const original = await getFile(env.id, 'original')
    if (original) {
      const signed = await buildSignedPdf(original, next)
      await putFile(env.id, 'signed', signed)
    }
  }
  return saveEnvelope(next)
}

export async function declineEnvelope(env: Envelope, recipientId: string, reason: string) {
  const r = env.recipients.find((x) => x.id === recipientId)!
  return saveEnvelope({
    ...env,
    status: 'declined',
    recipients: env.recipients.map((x) =>
      x.id === recipientId ? { ...x, status: 'declined', declineReason: reason } : x,
    ),
    audit: [...env.audit, event('Firma rechazada', `${r.name} <${r.email}>`, reason)],
  })
}

export async function voidEnvelope(env: Envelope, actor: string, reason: string) {
  return saveEnvelope({
    ...env,
    status: 'voided',
    audit: [...env.audit, event('Sobre anulado', actor, reason)],
  })
}

export function formatDate(iso?: string, withTime = false) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  })
}

export function relativeTime(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })
  if (diff < 60) return 'ahora mismo'
  if (diff < 3600) return rtf.format(-Math.round(diff / 60), 'minute')
  if (diff < 86400) return rtf.format(-Math.round(diff / 3600), 'hour')
  if (diff < 86400 * 30) return rtf.format(-Math.round(diff / 86400), 'day')
  return formatDate(iso)
}
