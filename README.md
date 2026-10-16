# FirmaYa

Firma electrónica para despachos de abogados: una alternativa a DocuSign centrada solo en lo esencial —
preparar un documento, enviarlo a firmar y descargarlo firmado con su certificado de auditoría.

## Funcionalidades

- **Inicio** con lo urgente a la vista: pendientes de mi firma, esperando a otros, completados y borradores.
- **Enviar para firmar** en 4 pasos: subir PDF → firmantes (con orden de firma opcional y copias) →
  colocar campos arrastrando (firma, iniciales, fecha, nombre, texto, casilla) → revisar y enviar.
- **Firmar yo mismo**: sube un PDF, coloca tus campos y fírmalo al momento.
- **Experiencia de firma guiada**: consentimiento eIDAS, botón «Ir al siguiente campo», firma escrita,
  dibujada o subida como imagen, y opción de rechazar con motivo.
- **Seguimiento**: estado de cada firmante, enlaces personales para copiar o recordar por email,
  anulación de sobres y registro de auditoría con huella SHA-256 del original.
- **PDF firmado** con los campos estampados, ID de sobre en cada página y un
  **certificado de finalización** anexo (firmantes, fechas, historial de eventos).
- **Mi firma y perfil**: guarda tu firma e iniciales para firmar con un clic.

## Diseño

Paleta «Toga & Oro»: azul real intenso (`#2B3FD6`) sobre marino profundo (`#0C1638`), con oro (`#F2B526`)
para las acciones principales y esmeralda para lo completado. Tipografías Inter (interfaz) y Fraunces (títulos).

## Desarrollo

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # comprobación de tipos + build de producción
```

Stack: React 18 + TypeScript + Vite, `pdfjs-dist` para visualizar y `pdf-lib` para generar el PDF firmado.

## Limitaciones actuales

Es una aplicación solo de cliente: los documentos se guardan en IndexedDB del navegador y no hay envío
real de emails. Los enlaces de firma funcionan en el mismo navegador; para usarlo entre personas distintas
hace falta añadir un backend (almacenamiento, autenticación y envío de correos).
