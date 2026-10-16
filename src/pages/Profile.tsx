import { useState } from 'react'
import { PenLine, Save } from 'lucide-react'
import type { Profile as P } from '../types'
import { saveProfile, useStore } from '../lib/store'
import { SignatureModal } from '../components/SignatureModal'
import { toast } from '../components/ui'

export function Profile() {
  const { profile } = useStore()
  const [form, setForm] = useState<P>(profile)
  const [editing, setEditing] = useState<'signature' | 'initials' | null>(null)

  const set = (k: keyof P, v: string) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="content" style={{ maxWidth: 940 }}>
      <div className="page-head">
        <div>
          <h1>Mi firma y perfil</h1>
          <p>Tus datos aparecen en los documentos que envías. Tu firma guardada se aplica con un clic.</p>
        </div>
      </div>

      <div className="stack" style={{ gap: 24 }}>
        <div className="card card-pad stack">
          <h2>Datos profesionales</h2>
          <div className="grid-2">
            <div className="field">
              <label htmlFor="p-name">Nombre completo</label>
              <input id="p-name" className="input" value={form.name} onChange={(e) => set('name', e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="p-email">Email</label>
              <input id="p-email" className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
              <span className="hint">Los documentos enviados a este email aparecen en «Pendientes de mi firma».</span>
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="p-firm">Despacho</label>
              <input id="p-firm" className="input" value={form.firm} onChange={(e) => set('firm', e.target.value)} />
            </div>
          </div>
          <div>
            <button
              className="btn btn-primary"
              onClick={async () => {
                await saveProfile({ ...profile, name: form.name, email: form.email, firm: form.firm })
                toast('Perfil actualizado')
              }}
            >
              <Save size={16} /> Guardar cambios
            </button>
          </div>
        </div>

        <div className="grid-2">
          {(['signature', 'initials'] as const).map((k) => (
            <div key={k} className="card card-pad stack">
              <h2>{k === 'signature' ? 'Mi firma' : 'Mis iniciales'}</h2>
              <div className="thumb-frame" style={{ background: 'var(--slate-50)', minHeight: 120, alignItems: 'center' }}>
                {profile[k] ? (
                  <img src={profile[k]} alt="" style={{ maxHeight: 90, maxWidth: '100%' }} />
                ) : (
                  <span className="muted">Aún no has creado {k === 'signature' ? 'tu firma' : 'tus iniciales'}</span>
                )}
              </div>
              <div>
                <button className="btn btn-outline" onClick={() => setEditing(k)}>
                  <PenLine size={16} /> {profile[k] ? 'Cambiar' : 'Crear'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editing && (
        <SignatureModal
          kind={editing}
          name={profile.name}
          saveLabel="Guardar"
          onClose={() => setEditing(null)}
          onSave={async (url) => {
            await saveProfile({ ...profile, [editing]: url })
            setEditing(null)
            toast(editing === 'signature' ? 'Firma guardada' : 'Iniciales guardadas')
          }}
        />
      )}
    </div>
  )
}
