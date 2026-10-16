import { useEffect, useRef, useState } from 'react'
import { PenLine, Type, Upload, Eraser } from 'lucide-react'
import { Modal, initials as toInitials } from './ui'

type Mode = 'draw' | 'type' | 'upload'
const INKS = ['#0C1638', '#1D3FBF', '#000000']
const FONTS = ['Dancing Script', 'Great Vibes', 'Caveat']

/** Recorta los márgenes transparentes de un canvas y devuelve un PNG. */
function trimmedPng(src: HTMLCanvasElement) {
  const ctx = src.getContext('2d')!
  const { width, height } = src
  const data = ctx.getImageData(0, 0, width, height).data
  let top = height, left = width, right = 0, bottom = 0
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 10) {
        if (x < left) left = x
        if (x > right) right = x
        if (y < top) top = y
        if (y > bottom) bottom = y
      }
    }
  }
  if (right <= left || bottom <= top) return null
  const pad = 8
  left = Math.max(0, left - pad)
  top = Math.max(0, top - pad)
  right = Math.min(width, right + pad)
  bottom = Math.min(height, bottom + pad)
  const out = document.createElement('canvas')
  out.width = right - left
  out.height = bottom - top
  out.getContext('2d')!.drawImage(src, left, top, out.width, out.height, 0, 0, out.width, out.height)
  return out.toDataURL('image/png')
}

async function renderTyped(text: string, font: string, color: string) {
  await document.fonts.load(`80px "${font}"`)
  const c = document.createElement('canvas')
  c.width = 1200
  c.height = 260
  const ctx = c.getContext('2d')!
  ctx.font = `110px "${font}"`
  ctx.fillStyle = color
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 30, 130, 1140)
  return trimmedPng(c)
}

export function SignatureModal({ kind, name, onClose, onSave, saveLabel = 'Adoptar y firmar' }: {
  kind: 'signature' | 'initials'
  name: string
  onClose: () => void
  onSave: (dataUrl: string) => void
  saveLabel?: string
}) {
  const [mode, setMode] = useState<Mode>('type')
  const [text, setText] = useState(kind === 'initials' ? toInitials(name) : name)
  const [font, setFont] = useState(FONTS[0])
  const [ink, setInk] = useState(INKS[0])
  const [upload, setUpload] = useState<string | null>(null)
  const [hasDrawing, setHasDrawing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (mode !== 'draw') return
    const c = canvasRef.current!
    const rect = c.getBoundingClientRect()
    c.width = rect.width * 2
    c.height = rect.height * 2
    setHasDrawing(false)
  }, [mode])

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: (e.clientX - rect.left) * 2, y: (e.clientY - rect.top) * 2 }
  }
  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drawing.current = pos(e)
  }
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const p = pos(e)
    const ctx = e.currentTarget.getContext('2d')!
    ctx.strokeStyle = ink
    ctx.lineWidth = 5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(drawing.current.x, drawing.current.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    drawing.current = p
    setHasDrawing(true)
  }
  const up = () => (drawing.current = null)
  const clear = () => {
    const c = canvasRef.current!
    c.getContext('2d')!.clearRect(0, 0, c.width, c.height)
    setHasDrawing(false)
  }

  const onFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      // Normalizamos a PNG para poder incrustarlo en el PDF
      const img = new Image()
      img.onload = () => {
        const c = document.createElement('canvas')
        const scale = Math.min(1, 1200 / img.width)
        c.width = img.width * scale
        c.height = img.height * scale
        c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
        setUpload(c.toDataURL('image/png'))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  }

  const canSave = mode === 'type' ? text.trim().length > 0 : mode === 'draw' ? hasDrawing : !!upload

  const save = async () => {
    let url: string | null = null
    if (mode === 'type') url = await renderTyped(text.trim(), font, ink)
    else if (mode === 'draw') url = trimmedPng(canvasRef.current!)
    else url = upload
    if (url) onSave(url)
  }

  const title = kind === 'signature' ? 'Tu firma' : 'Tus iniciales'

  return (
    <Modal
      title={title}
      onClose={onClose}
      width={600}
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={!canSave} onClick={save}>{saveLabel}</button>
        </>
      }
    >
      <div className="seg" role="tablist">
        <button className={mode === 'type' ? 'active' : ''} onClick={() => setMode('type')}><Type size={16} /> Escribir</button>
        <button className={mode === 'draw' ? 'active' : ''} onClick={() => setMode('draw')}><PenLine size={16} /> Dibujar</button>
        <button className={mode === 'upload' ? 'active' : ''} onClick={() => setMode('upload')}><Upload size={16} /> Subir imagen</button>
      </div>

      {mode === 'type' && (
        <>
          <div className="field" style={{ marginTop: 14 }}>
            <label htmlFor="sig-text">{kind === 'signature' ? 'Nombre completo' : 'Iniciales'}</label>
            <input id="sig-text" className="input" value={text} onChange={(e) => setText(e.target.value)} autoFocus />
          </div>
          <div className="type-opts">
            {FONTS.map((f) => (
              <button key={f} className={`type-opt${font === f ? ' active' : ''}`} style={{ fontFamily: `"${f}"`, color: ink }} onClick={() => setFont(f)}>
                {text || 'Tu firma'}
              </button>
            ))}
          </div>
        </>
      )}

      {mode === 'draw' && (
        <div className="pad-wrap">
          <canvas ref={canvasRef} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} />
          <div className="pad-line" />
          <div className="pad-x">✕</div>
          <div className="pad-tools">
            <button className="btn btn-outline btn-sm" onClick={clear}><Eraser size={14} /> Borrar</button>
          </div>
        </div>
      )}

      {mode === 'upload' && (
        <label className="dropzone" style={{ display: 'block', marginTop: 14, padding: 28 }}>
          <input type="file" accept="image/png,image/jpeg" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          {upload ? (
            <img src={upload} alt="Firma subida" style={{ maxHeight: 120, maxWidth: '100%' }} />
          ) : (
            <>
              <Upload size={26} color="var(--primary)" />
              <p style={{ marginTop: 8, fontWeight: 600 }}>Selecciona una imagen de tu firma</p>
              <p className="hint">PNG con fondo transparente o JPG</p>
            </>
          )}
        </label>
      )}

      {mode !== 'upload' && (
        <div className="row" style={{ marginTop: 14, justifyContent: 'space-between' }}>
          <span className="hint">Color de tinta</span>
          <div className="row">
            {INKS.map((c) => (
              <span key={c} className={`ink-dot${ink === c ? ' active' : ''}`} style={{ background: c }} onClick={() => setInk(c)} role="button" aria-label={`Tinta ${c}`} />
            ))}
          </div>
        </div>
      )}

      <p className="hint" style={{ marginTop: 14 }}>
        Al adoptar esta firma acepto que es la representación electrónica de mi firma manuscrita y que tiene la misma validez en los documentos que firme.
      </p>
    </Modal>
  )
}
