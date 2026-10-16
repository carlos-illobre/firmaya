import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import type { Envelope } from '../types'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

export async function loadPdf(bytes: Uint8Array) {
  // pdf.js transfiere el buffer al worker: le pasamos una copia
  return pdfjs.getDocument({ data: bytes.slice() }).promise
}

export type PdfDoc = Awaited<ReturnType<typeof loadPdf>>

export async function sha256(bytes: Uint8Array) {
  const hash = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function dataUrlToBytes(dataUrl: string) {
  const b64 = dataUrl.split(',')[1]
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

// Helvetica estándar usa WinAnsi: eliminamos caracteres que no puede codificar
function safe(text: string) {
  return text.replace(/[^\x20-\x7E -ÿ€]/g, '?')
}

function fitText(font: PDFFont, text: string, maxWidth: number, size: number) {
  let s = safe(text)
  while (s.length > 1 && font.widthOfTextAtSize(s, size) > maxWidth) s = s.slice(0, -2) + '…'
  return s
}

const INK = rgb(0.06, 0.09, 0.2)
const MUTED = rgb(0.42, 0.45, 0.55)
const BRAND = rgb(0.17, 0.25, 0.84)
const GOLD = rgb(0.95, 0.71, 0.15)

/** Genera el PDF final: estampa los valores de los campos y añade el certificado de finalización. */
export async function buildSignedPdf(original: Uint8Array, env: Envelope) {
  const doc = await PDFDocument.load(original)
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const pages = doc.getPages()

  for (const f of env.fields) {
    if (!f.value) continue
    const page = pages[f.page]
    if (!page) continue
    const { width, height } = page.getSize()
    const x = f.x * width
    const w = f.w * width
    const h = f.h * height
    const y = height - f.y * height - h

    if (f.type === 'signature' || f.type === 'initials') {
      const img = await doc.embedPng(dataUrlToBytes(f.value))
      const scale = Math.min(w / img.width, h / img.height)
      const iw = img.width * scale
      const ih = img.height * scale
      page.drawImage(img, { x: x + (w - iw) / 2, y: y + (h - ih) / 2, width: iw, height: ih })
    } else if (f.type === 'checkbox') {
      if (f.value === 'true') {
        const s = Math.min(w, h)
        page.drawLine({ start: { x: x + s * 0.15, y: y + s * 0.5 }, end: { x: x + s * 0.4, y: y + s * 0.2 }, thickness: 1.6, color: INK })
        page.drawLine({ start: { x: x + s * 0.4, y: y + s * 0.2 }, end: { x: x + s * 0.88, y: y + s * 0.85 }, thickness: 1.6, color: INK })
      }
    } else {
      const size = Math.max(7, Math.min(12, h * 0.65))
      page.drawText(fitText(font, f.value, w, size), { x: x + 2, y: y + (h - size) / 2 + 1.5, size, font, color: INK })
    }
  }

  // Identificador del sobre en cada página
  for (const page of pages) {
    const { height } = page.getSize()
    page.drawText(`FirmaYa · ID de sobre: ${env.id}`, { x: 18, y: height - 14, size: 7, font, color: MUTED })
  }

  await addCertificate(doc, env, font, bold)
  return doc.save()
}

async function addCertificate(doc: PDFDocument, env: Envelope, font: PDFFont, bold: PDFFont) {
  const W = 595.28
  const H = 841.89
  const M = 48
  let page: PDFPage = doc.addPage([W, H])
  let y = H - M

  const header = () => {
    page.drawRectangle({ x: 0, y: H - 8, width: W, height: 8, color: BRAND })
    page.drawRectangle({ x: 0, y: H - 10, width: W, height: 2, color: GOLD })
  }
  const ensure = (need: number) => {
    if (y - need < M) {
      page = doc.addPage([W, H])
      header()
      y = H - M
    }
  }
  const text = (t: string, opts: { size?: number; f?: PDFFont; color?: ReturnType<typeof rgb>; x?: number; max?: number } = {}) => {
    const size = opts.size ?? 9.5
    const f = opts.f ?? font
    const x = opts.x ?? M
    page.drawText(fitText(f, t, opts.max ?? W - x - M, size), { x, y, size, font: f, color: opts.color ?? INK })
  }
  const rule = () => {
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.6, color: rgb(0.85, 0.87, 0.92) })
  }

  header()
  y -= 10
  text('Certificado de finalización', { size: 20, f: bold })
  y -= 18
  text('Registro de auditoría de la firma electrónica', { size: 10, color: MUTED })
  y -= 26

  const rows: [string, string][] = [
    ['Documento', env.title],
    ['Archivo', env.fileName],
    ['ID de sobre', env.id],
    ['Páginas', String(env.pageCount)],
    ['Enviado', fmt(env.sentAt)],
    ['Completado', fmt(env.completedAt)],
    ['Huella SHA-256 (original)', env.originalHash ?? '—'],
  ]
  for (const [k, v] of rows) {
    text(k, { f: bold, size: 9, color: MUTED })
    text(v, { x: M + 150, size: 9 })
    y -= 15
  }

  y -= 10
  rule()
  y -= 22
  text('Firmantes', { size: 13, f: bold })
  y -= 18

  for (const r of env.recipients.filter((x) => x.role === 'signer')) {
    ensure(70)
    const sig = env.fields.find((f) => f.recipientId === r.id && f.type === 'signature' && f.value)
    page.drawRectangle({ x: M, y: y - 48, width: W - 2 * M, height: 58, color: rgb(0.97, 0.97, 1), borderColor: rgb(0.86, 0.88, 0.95), borderWidth: 0.6 })
    const top = y
    y -= 6
    text(r.name, { f: bold, size: 10.5, x: M + 12 })
    y -= 14
    text(r.email, { size: 9, x: M + 12, color: MUTED })
    y -= 14
    text(`Firmado: ${fmt(r.signedAt)}`, { size: 9, x: M + 12 })
    if (sig?.value) {
      const img = await doc.embedPng(dataUrlToBytes(sig.value))
      const scale = Math.min(150 / img.width, 44 / img.height)
      page.drawImage(img, { x: W - M - 12 - img.width * scale, y: top - 44, width: img.width * scale, height: img.height * scale })
    }
    y = top - 70
  }
  for (const r of env.recipients.filter((x) => x.role === 'cc')) {
    ensure(20)
    text(`Copia a: ${r.name} <${r.email}>`, { size: 9, color: MUTED })
    y -= 16
  }

  y -= 6
  ensure(40)
  rule()
  y -= 22
  text('Historial de eventos', { size: 13, f: bold })
  y -= 18
  for (const e of env.audit) {
    ensure(30)
    text(fmt(e.at), { size: 8.5, color: MUTED, max: 120 })
    text(e.action, { size: 9, f: bold, x: M + 125, max: 150 })
    text(e.actor, { size: 9, x: M + 280 })
    if (e.detail) {
      y -= 12
      text(e.detail, { size: 8, x: M + 125, color: MUTED })
    }
    y -= 16
  }

  y -= 10
  ensure(30)
  text('Documento firmado electrónicamente con FirmaYa. Los eventos se registran con fecha y hora del dispositivo del firmante.', { size: 7.5, color: MUTED })
}

function fmt(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'medium' })
}

/** Contrato de ejemplo para probar la aplicación sin tener un PDF a mano. */
export async function samplePdf() {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.TimesRoman)
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold)
  const page = doc.addPage([595.28, 841.89])
  const M = 64
  let y = 760
  const para = (t: string, size = 11, f = font) => {
    const words = t.split(' ')
    let line = ''
    for (const w of words) {
      const test = line ? line + ' ' + w : w
      if (f.widthOfTextAtSize(test, size) > 595.28 - 2 * M) {
        page.drawText(line, { x: M, y, size, font: f })
        y -= size * 1.5
        line = w
      } else line = test
    }
    if (line) page.drawText(line, { x: M, y, size, font: f })
    y -= size * 1.5 + 6
  }
  page.drawText('CONTRATO DE PRESTACIÓN DE SERVICIOS JURÍDICOS', { x: M, y, size: 15, font: bold })
  y -= 34
  para('En Madrid, a la fecha de la firma electrónica del presente documento.')
  para('REUNIDOS', 12, bold)
  para('De una parte, el DESPACHO, con domicilio profesional en Madrid, representado por su socio director. De otra parte, el CLIENTE, cuyos datos constan en la firma del presente contrato.')
  para('CLÁUSULAS', 12, bold)
  para('PRIMERA. Objeto. El DESPACHO prestará al CLIENTE servicios de asesoramiento jurídico y, en su caso, defensa procesal en el asunto descrito en la hoja de encargo adjunta.')
  para('SEGUNDA. Honorarios. Los honorarios se fijan conforme a la propuesta económica aceptada por el CLIENTE, más los impuestos aplicables. Las provisiones de fondos se abonarán dentro de los diez días siguientes a su solicitud.')
  para('TERCERA. Confidencialidad. Ambas partes se obligan a guardar secreto profesional sobre toda la información intercambiada, de conformidad con el Estatuto General de la Abogacía Española.')
  para('CUARTA. Protección de datos. Los datos personales del CLIENTE serán tratados conforme al Reglamento (UE) 2016/679 con la única finalidad de gestionar la relación profesional.')
  para('QUINTA. Duración. El presente contrato entrará en vigor en la fecha de su firma y se mantendrá hasta la conclusión del asunto encomendado.')
  para('Y en prueba de conformidad, las partes firman electrónicamente el presente documento.')
  y -= 20
  page.drawText('EL DESPACHO', { x: M, y, size: 11, font: bold })
  page.drawText('EL CLIENTE', { x: 340, y, size: 11, font: bold })
  y -= 70
  page.drawLine({ start: { x: M, y }, end: { x: M + 190, y }, thickness: 0.7 })
  page.drawLine({ start: { x: 340, y }, end: { x: 340 + 190, y }, thickness: 0.7 })
  return doc.save()
}
