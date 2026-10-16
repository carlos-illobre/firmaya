import type { Envelope } from '../types'
import { getFile } from './store'

export function downloadBytes(bytes: Uint8Array, name: string) {
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function downloadEnvelope(env: Envelope) {
  const signed = env.status === 'completed' ? await getFile(env.id, 'signed') : undefined
  const bytes = signed ?? (await getFile(env.id, 'original'))
  if (!bytes) return
  const base = env.title.replace(/[\\/:*?"<>|]+/g, '-')
  downloadBytes(bytes, signed ? `${base} (firmado).pdf` : `${base}.pdf`)
}
