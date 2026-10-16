import { useEffect, useRef, useState, type ReactNode } from 'react'
import { PenLine, Type, Calendar, UserRound, CheckSquare, Signature, Trash2, MousePointerClick } from 'lucide-react'
import type { Envelope, Field, FieldType } from '../types'
import { FIELD_META, signers, uid } from '../lib/envelopes'
import { PdfPages, useContainerWidth, type PageSize } from './PdfPages'

export const FIELD_ICONS: Record<FieldType, ReactNode> = {
  signature: <Signature size={15} />,
  initials: <PenLine size={15} />,
  date: <Calendar size={15} />,
  name: <UserRound size={15} />,
  text: <Type size={15} />,
  checkbox: <CheckSquare size={15} />,
}

const TOOL_ORDER: FieldType[] = ['signature', 'initials', 'date', 'name', 'text', 'checkbox']

interface Drag {
  id: string
  mode: 'move' | 'resize'
  startX: number
  startY: number
  orig: Field
  size: PageSize
}

export function FieldEditor({ env, bytes, onChange }: { env: Envelope; bytes?: Uint8Array; onChange: (fields: Field[]) => void }) {
  const people = signers(env)
  const [active, setActive] = useState(people[0]?.id)
  const [armed, setArmed] = useState<FieldType | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const drag = useRef<Drag | null>(null)
  const fieldsRef = useRef(env.fields)
  fieldsRef.current = env.fields
  const { ref, width } = useContainerWidth(820)

  const recipient = (id: string) => env.recipients.find((r) => r.id === id)
  const sel = env.fields.find((f) => f.id === selected)

  const place = (type: FieldType, page: number, cx: number, cy: number) => {
    if (!active) return
    const m = FIELD_META[type]
    const f: Field = {
      id: uid('f_'),
      type,
      recipientId: active,
      page,
      w: m.w,
      h: m.h,
      x: clamp(cx - m.w / 2, 0, 1 - m.w),
      y: clamp(cy - m.h / 2, 0, 1 - m.h),
      required: type !== 'checkbox',
      label: type === 'text' ? 'Texto' : undefined,
    }
    onChange([...env.fields, f])
    setSelected(f.id)
  }

  const update = (id: string, patch: Partial<Field>) => onChange(fieldsRef.current.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  const remove = (id: string) => {
    onChange(env.fields.filter((f) => f.id !== id))
    setSelected(null)
  }

  // Borrar con Supr / Retroceso, Esc para soltar la herramienta
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected) remove(selected)
      if (e.key === 'Escape') {
        setArmed(null)
        setSelected(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // Mover y redimensionar con el puntero
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current
      if (!d) return
      const dx = (e.clientX - d.startX) / d.size.width
      const dy = (e.clientY - d.startY) / d.size.height
      if (d.mode === 'move') {
        update(d.id, { x: clamp(d.orig.x + dx, 0, 1 - d.orig.w), y: clamp(d.orig.y + dy, 0, 1 - d.orig.h) })
      } else {
        update(d.id, { w: clamp(d.orig.w + dx, 0.02, 1 - d.orig.x), h: clamp(d.orig.h + dy, 0.015, 1 - d.orig.y) })
      }
    }
    const up = () => (drag.current = null)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  })

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const type = e.dataTransfer.getData('text/field') as FieldType
    const pageEl = (e.target as HTMLElement).closest('[data-page]') as HTMLElement | null
    if (!type || !pageEl) return
    const rect = pageEl.getBoundingClientRect()
    place(type, Number(pageEl.dataset.page), (e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height)
  }

  const activeR = recipient(active ?? '')

  return (
    <div className="editor">
      <aside className="panel">
        <section>
          <h3>1 · Elige firmante</h3>
          <div className="signer-pick">
            {people.map((r) => (
              <button key={r.id} className={`signer-opt${active === r.id ? ' active' : ''}`} style={{ color: r.color }} onClick={() => setActive(r.id)}>
                <span className="sw" style={{ background: r.color }} />
                <span style={{ minWidth: 0 }}>
                  <b>{r.name}</b>
                  <small>{env.fields.filter((f) => f.recipientId === r.id).length} campos</small>
                </span>
              </button>
            ))}
          </div>
        </section>
        <section>
          <h3>2 · Arrastra o pulsa un campo</h3>
          <div className="tools">
            {TOOL_ORDER.map((t) => (
              <button
                key={t}
                className={`tool${armed === t ? ' armed' : ''}`}
                style={{ ['--tool-color' as string]: activeR?.color }}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/field', t)}
                onClick={() => setArmed(armed === t ? null : t)}
              >
                <span className="ti">{FIELD_ICONS[t]}</span>
                {FIELD_META[t].label}
              </button>
            ))}
          </div>
        </section>
        <p className="hint" style={{ marginTop: 18 }}>
          <MousePointerClick size={14} style={{ verticalAlign: -2 }} /> {armed ? 'Haz clic en el documento para colocar el campo.' : 'Mueve los campos arrastrándolos y cambia su tamaño desde la esquina.'}
        </p>
      </aside>

      <div className="canvas-area" ref={ref} onDragOver={(e) => e.preventDefault()} onDrop={onDrop} onClick={() => setSelected(null)}>
        <PdfPages
          bytes={bytes}
          width={width}
          pageClassName={armed ? 'placing' : ''}
          onPageClick={(page, e, size) => {
            if (!armed) return
            e.stopPropagation()
            const rect = e.currentTarget.getBoundingClientRect()
            place(armed, page, (e.clientX - rect.left) / size.width, (e.clientY - rect.top) / size.height)
            setArmed(null)
          }}
          overlay={(page, size) =>
            env.fields
              .filter((f) => f.page === page)
              .map((f) => {
                const r = recipient(f.recipientId)
                return (
                  <div
                    key={f.id}
                    className={`f-box${selected === f.id ? ' selected' : ''}`}
                    style={{ ['--c' as string]: r?.color, left: f.x * size.width, top: f.y * size.height, width: f.w * size.width, height: f.h * size.height }}
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => {
                      e.stopPropagation()
                      setSelected(f.id)
                      setActive(f.recipientId)
                      const mode = (e.target as HTMLElement).classList.contains('handle') ? 'resize' : 'move'
                      drag.current = { id: f.id, mode, startX: e.clientX, startY: e.clientY, orig: f, size }
                    }}
                    title={`${FIELD_META[f.type].label} · ${r?.name}`}
                  >
                    {f.type !== 'checkbox' && FIELD_ICONS[f.type]}
                    {f.type !== 'checkbox' && <span className="lbl">{f.type === 'text' ? f.label : FIELD_META[f.type].label}</span>}
                    <span className="handle" />
                  </div>
                )
              })
          }
        />
      </div>

      <aside className="panel right">
        {sel ? (
          <div className="stack">
            <h3>Campo seleccionado</h3>
            <div className="row" style={{ fontWeight: 600 }}>
              <span className="icon-bubble" style={{ width: 28, height: 28, borderRadius: 8, color: '#fff', background: recipient(sel.recipientId)?.color }}>
                {FIELD_ICONS[sel.type]}
              </span>
              {FIELD_META[sel.type].label}
            </div>
            <div className="field">
              <label htmlFor="f-owner">Asignado a</label>
              <select id="f-owner" className="select" value={sel.recipientId} onChange={(e) => update(sel.id, { recipientId: e.target.value })}>
                {people.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            {sel.type === 'text' && (
              <div className="field">
                <label htmlFor="f-label">Etiqueta</label>
                <input id="f-label" className="input" value={sel.label ?? ''} onChange={(e) => update(sel.id, { label: e.target.value })} placeholder="Ej.: DNI, Domicilio…" />
              </div>
            )}
            {(sel.type === 'text' || sel.type === 'checkbox') && (
              <label className="row" style={{ cursor: 'pointer' }}>
                <input type="checkbox" checked={sel.required} onChange={(e) => update(sel.id, { required: e.target.checked })} /> Obligatorio
              </label>
            )}
            {(sel.type === 'date' || sel.type === 'name') && (
              <p className="hint">Se rellena automáticamente al firmar.</p>
            )}
            <button className="btn btn-danger" onClick={() => remove(sel.id)}>
              <Trash2 size={16} /> Eliminar campo
            </button>
          </div>
        ) : (
          <div className="stack">
            <h3>Resumen de campos</h3>
            {people.map((r) => {
              const fs = env.fields.filter((f) => f.recipientId === r.id)
              return (
                <div key={r.id}>
                  <div className="row" style={{ fontWeight: 600, fontSize: 13.5 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: r.color }} /> {r.name}
                  </div>
                  <div className="hint" style={{ marginTop: 4, paddingLeft: 20 }}>
                    {fs.length
                      ? TOOL_ORDER.filter((t) => fs.some((f) => f.type === t)).map((t) => `${fs.filter((f) => f.type === t).length} ${FIELD_META[t].label.toLowerCase()}`).join(' · ')
                      : 'Sin campos todavía'}
                  </div>
                </div>
              )
            })}
            <p className="hint">Selecciona un campo para editarlo. Pulsa <kbd>Supr</kbd> para eliminarlo.</p>
          </div>
        )}
      </aside>
    </div>
  )
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}
