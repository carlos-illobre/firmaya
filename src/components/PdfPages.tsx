import { useEffect, useRef, useState, type ReactNode } from 'react'
import { loadPdf, type PdfDoc } from '../lib/pdf'
import { Spinner } from './ui'

export interface PageSize {
  width: number
  height: number
}

export function usePdf(bytes: Uint8Array | undefined) {
  const [doc, setDoc] = useState<PdfDoc | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (!bytes) return
    let cancelled = false
    let loaded: PdfDoc | null = null
    loadPdf(bytes)
      .then((d) => {
        loaded = d
        if (!cancelled) setDoc(d)
      })
      .catch((e) => !cancelled && setError(String(e?.message ?? e)))
    return () => {
      cancelled = true
      loaded?.destroy()
    }
  }, [bytes])
  return { doc, error }
}

function PageCanvas({ doc, index, width, overlay, className, onPageClick }: {
  doc: PdfDoc
  index: number
  width: number
  overlay?: (size: PageSize) => ReactNode
  className?: string
  onPageClick?: (e: React.MouseEvent<HTMLDivElement>, size: PageSize) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [size, setSize] = useState<PageSize | null>(null)

  useEffect(() => {
    let task: { cancel: () => void } | null = null
    let cancelled = false
    doc.getPage(index + 1).then((page) => {
      if (cancelled) return
      const base = page.getViewport({ scale: 1 })
      const scale = width / base.width
      const viewport = page.getViewport({ scale })
      const ratio = window.devicePixelRatio || 1
      const canvas = canvasRef.current!
      canvas.width = Math.floor(viewport.width * ratio)
      canvas.height = Math.floor(viewport.height * ratio)
      canvas.style.width = `${viewport.width}px`
      canvas.style.height = `${viewport.height}px`
      const ctx = canvas.getContext('2d')!
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      const t = page.render({ canvasContext: ctx, viewport })
      task = t
      t.promise.catch(() => {})
      setSize({ width: viewport.width, height: viewport.height })
    })
    return () => {
      cancelled = true
      task?.cancel()
    }
  }, [doc, index, width])

  return (
    <div
      className={`page-wrap ${className ?? ''}`}
      data-page={index}
      onClick={(e) => size && onPageClick?.(e, size)}
      style={size ? { width: size.width, height: size.height } : { width, minHeight: width * 1.3 }}
    >
      <canvas ref={canvasRef} />
      {size && overlay?.(size)}
    </div>
  )
}

/** Renderiza todas las páginas de un PDF con una capa superpuesta por página. */
export function PdfPages({ bytes, width = 760, overlay, pageClassName, onPageClick, showNumbers = true }: {
  bytes: Uint8Array | undefined
  width?: number
  overlay?: (page: number, size: PageSize) => ReactNode
  pageClassName?: string
  onPageClick?: (page: number, e: React.MouseEvent<HTMLDivElement>, size: PageSize) => void
  showNumbers?: boolean
}) {
  const { doc, error } = usePdf(bytes)
  if (error) return <div className="empty">No se pudo leer el PDF: {error}</div>
  if (!doc) return <Spinner />
  return (
    <>
      {Array.from({ length: doc.numPages }, (_, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
          {showNumbers && (
            <div className="page-num">
              Página {i + 1} de {doc.numPages}
            </div>
          )}
          <PageCanvas
            doc={doc}
            index={i}
            width={width}
            className={pageClassName}
            overlay={overlay && ((s) => overlay(i, s))}
            onPageClick={onPageClick && ((e, s) => onPageClick(i, e, s))}
          />
        </div>
      ))}
    </>
  )
}

/** Ancho disponible de un contenedor, para ajustar las páginas al espacio. */
export function useContainerWidth(max = 820, padding = 56) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(max)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setWidth(Math.max(280, Math.min(max, Math.floor(entry.contentRect.width - padding))))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [max, padding])
  return { ref, width }
}
