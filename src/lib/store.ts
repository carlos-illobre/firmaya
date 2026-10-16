import { useSyncExternalStore } from 'react'
import { db } from './db'
import type { Envelope, Profile } from '../types'

interface State {
  ready: boolean
  envelopes: Envelope[]
  profile: Profile
}

const DEFAULT_PROFILE: Profile = {
  name: 'Lucía Martín',
  email: 'lucia@despacho.es',
  firm: 'Martín & Asociados Abogados',
}

let state: State = { ready: false, envelopes: [], profile: DEFAULT_PROFILE }
const listeners = new Set<() => void>()

function emit(next: Partial<State>) {
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

function sortEnvelopes(list: Envelope[]) {
  return [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

async function load() {
  const [envelopes, profile] = await Promise.all([
    db.getAll<Envelope>('envelopes'),
    db.get<Profile>('meta', 'profile'),
  ])
  emit({ ready: true, envelopes: sortEnvelopes(envelopes), profile: profile ?? DEFAULT_PROFILE })
}
load()

export function useStore(): State {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
  )
}

export function getState() {
  return state
}

export async function saveEnvelope(env: Envelope) {
  const updated = { ...env, updatedAt: new Date().toISOString() }
  await db.put('envelopes', updated.id, updated)
  emit({ envelopes: sortEnvelopes([updated, ...state.envelopes.filter((e) => e.id !== env.id)]) })
  return updated
}

export async function deleteEnvelope(id: string) {
  await Promise.all([
    db.del('envelopes', id),
    db.del('files', `${id}:original`),
    db.del('files', `${id}:signed`),
  ])
  emit({ envelopes: state.envelopes.filter((e) => e.id !== id) })
}

export async function saveProfile(profile: Profile) {
  await db.put('meta', 'profile', profile)
  emit({ profile })
}

export type FileKind = 'original' | 'signed'

export function putFile(envelopeId: string, kind: FileKind, bytes: Uint8Array) {
  return db.put('files', `${envelopeId}:${kind}`, bytes)
}

export async function getFile(envelopeId: string, kind: FileKind) {
  return db.get<Uint8Array>('files', `${envelopeId}:${kind}`)
}
