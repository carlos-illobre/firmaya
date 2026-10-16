import { useNavigate } from 'react-router-dom'
import { Upload, Users, PenLine, Send, ShieldCheck, Download } from 'lucide-react'

const STEPS = [
  { icon: <Upload size={22} />, title: 'Sube el PDF', text: 'Arrastra el contrato, poder o escrito que quieras firmar.' },
  { icon: <Users size={22} />, title: 'Añade firmantes', text: 'Indica nombre y email de cada parte. Puedes exigir un orden de firma.' },
  { icon: <PenLine size={22} />, title: 'Coloca los campos', text: 'Arrastra firma, iniciales, fecha, nombre, texto o casillas sobre el documento.' },
  { icon: <Send size={22} />, title: 'Envía', text: 'Cada firmante recibe su enlace personal para firmar desde cualquier dispositivo.' },
  { icon: <ShieldCheck size={22} />, title: 'Seguimiento', text: 'Consulta en tiempo real quién ha abierto y firmado, con registro de auditoría.' },
  { icon: <Download size={22} />, title: 'Descarga', text: 'Obtén el PDF firmado con un certificado de finalización y la huella SHA-256.' },
]

export function Help() {
  const navigate = useNavigate()
  return (
    <div className="content" style={{ maxWidth: 980 }}>
      <div className="page-head">
        <div>
          <h1>Cómo funciona</h1>
          <p>Firma electrónica en seis pasos, pensada para el día a día del despacho.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/nuevo')}>Empezar ahora</button>
      </div>
      <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {STEPS.map((s, i) => (
          <div key={s.title} className="card card-pad row" style={{ alignItems: 'flex-start', gap: 14 }}>
            <div className="icon-bubble" style={{ background: i % 2 ? 'var(--gold-50)' : 'var(--primary-50)', color: i % 2 ? 'var(--gold-600)' : 'var(--primary)' }}>{s.icon}</div>
            <div>
              <h3>{i + 1}. {s.title}</h3>
              <p className="muted" style={{ marginTop: 4 }}>{s.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="card card-pad" style={{ marginTop: 24 }}>
        <h2>Atajos útiles</h2>
        <ul className="muted" style={{ lineHeight: 1.9, margin: '10px 0 0', paddingLeft: 18 }}>
          <li><b>Supr</b> elimina el campo seleccionado en el editor.</li>
          <li><b>Esc</b> suelta la herramienta activa o cierra una ventana.</li>
          <li>Guarda tu firma en <b>Mi firma y perfil</b> para firmar con un solo clic.</li>
        </ul>
      </div>
    </div>
  )
}
