# Especificaciones de FirmaYa

La entrada al proyecto: dónde está escrito cada requerimiento. Con lo que hay en esta
carpeta, alguien que nunca vio el código tiene que poder construir de nuevo una aplicación
que cumpla todos los requerimientos, funcionales y no funcionales.

**Acá no se dice si algo está hecho.** Eso vive en [proyecto/estado.yml](../proyecto/estado.yml).

| Dónde | Qué tiene |
|---|---|
| [La constitución](../.specify/memory/constitution.md) | Lo que no se negocia y el flujo de trabajo |
| `001` en adelante | Una por capacidad: `resumen.md`, `spec.md`, `ux.md` y, donde hay datos, `data-model.md` |
| [preguntas-abiertas.md](preguntas-abiertas.md) | Lo que todavía no está decidido |

## Requerimientos

### 001 Firma electrónica

| ID | Requerimiento | Especificación |
|---|---|---|
| RF-01 | Cuenta gratuita de abogado con Google | [001](001-firma-electronica/spec.md) |
| RF-02 | Cada abogado ve solo lo suyo; sin roles | [001](001-firma-electronica/spec.md) |
| RF-03 | Aplicación en español, inglés y portugués | [001](001-firma-electronica/spec.md) |
| RF-04 | Subir PDF y Word (.doc, .docx) de hasta 25 MB; el Word se convierte a PDF | [001](001-firma-electronica/spec.md) |
| RF-05 | Un envío lleva uno o más documentos | [001](001-firma-electronica/spec.md) |
| RF-06 | Firmantes y destinatarios de copia; el abogado puede firmar | [001](001-firma-electronica/spec.md) |
| RF-07 | Campos: firma, iniciales, fecha, nombre, casilla, texto libre | [001](001-firma-electronica/spec.md) |
| RF-08 | No se envía si un firmante no tiene campo de firma | [001](001-firma-electronica/spec.md) |
| RF-09 | Todos firman a la vez, en cualquier orden | [001](001-firma-electronica/spec.md) |
| RF-10 | Recordatorios cada N días y vencimiento, a elección del abogado | [001](001-firma-electronica/spec.md) |
| RF-11 | Borradores | [001](001-firma-electronica/spec.md) |
| RF-12 | Enlace propio por correo, en el idioma del firmante; el enlace alcanza para firmar | [001](001-firma-electronica/spec.md) |
| RF-13 | Firmar dibujando, escribiendo o subiendo una imagen | [001](001-firma-electronica/spec.md) |
| RF-14 | No se firma con campos obligatorios vacíos | [001](001-firma-electronica/spec.md) |
| RF-15 | El firmante puede rechazar, con motivo; frena para todos | [001](001-firma-electronica/spec.md) |
| RF-16 | El firmante cambia el idioma de la página de firma | [001](001-firma-electronica/spec.md) |
| RF-17 | Una firma confirmada no se cambia | [001](001-firma-electronica/spec.md) |
| RF-18 | Al completarse, el PDF firmado por correo a todos (sin certificado en esta versión) | [001](001-firma-electronica/spec.md) |
| RF-19 | Panel por estado, buscador y detalle por firmante | [001](001-firma-electronica/spec.md) |
| RF-20 | Anular lo que no está completado, con motivo | [001](001-firma-electronica/spec.md) |
| RF-21 | Reenviar el correo y corregir el correo de un firmante | [001](001-firma-electronica/spec.md) |
| RF-22 | Vencimiento automático | [001](001-firma-electronica/spec.md) |
| RF-23 | Rechazado, anulado, vencido o borrado no se firma | [001](001-firma-electronica/spec.md) |
| RF-24 | Avisos al abogado: rechazo, vencimiento, completado | [001](001-firma-electronica/spec.md) |
| RF-25 | Registro de pasos por firmante con IP y navegador | [001](001-firma-electronica/spec.md) |
| RF-26 | Plantillas con papeles de firmante | [001](001-firma-electronica/spec.md) |
| RF-27 | Usar una plantilla crea un borrador independiente | [001](001-firma-electronica/spec.md) |
| RF-28 | Se guarda hasta que el abogado lo borra | [001](001-firma-electronica/spec.md) |
| RF-29 | Borrar para siempre, salvo lo que espera firmas | [001](001-firma-electronica/spec.md) |
| RNF-01 | Paleta llamativa pero profesional, para abogados | [001](001-firma-electronica/spec.md) |
| RNF-02 | Navegación sencilla: panel y «Nuevo envío» a un clic | [001](001-firma-electronica/spec.md) |
| RNF-03 | Preparar y enviar solo en computadora; en el teléfono, ver ; la firma, también en el teléfono | [001](001-firma-electronica/spec.md) |
| RNF-04 | El documento firmado es el enviado, sin otro cambio | [001](001-firma-electronica/spec.md) |
| RNF-05 | El enlace de cada firmante es secreto | [001](001-firma-electronica/spec.md) |
| RNF-06 | Ningún dato real como dato de prueba | [001](001-firma-electronica/spec.md) |
