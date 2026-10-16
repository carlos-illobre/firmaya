# Resumen: 001 Firma electrónica

Lo primero que se lee. Ante una diferencia, manda la [spec.md](spec.md).

Un abogado sube un PDF o un Word, marca dónde firma cada persona, lo envía y sigue su
estado hasta tener el PDF firmado. Los firmantes firman desde un enlace, sin cuenta. Firma
electrónica simple (ley 25.506, art. 5); la firma digital, en una versión posterior. Gratis,
sin roles, en español, inglés y portugués.

## Requerimientos

- **RF-01** Cuenta gratuita de abogado con Google
- **RF-02** Cada abogado ve solo lo suyo; sin roles
- **RF-03** Aplicación en español, inglés y portugués
- **RF-04** Subir PDF y Word (.doc, .docx) de hasta 25 MB; el Word se convierte a PDF
- **RF-05** Un envío lleva uno o más documentos
- **RF-06** Firmantes y destinatarios de copia; el abogado puede firmar
- **RF-07** Campos: firma, iniciales, fecha, nombre, casilla, texto libre
- **RF-08** No se envía si un firmante no tiene campo de firma
- **RF-09** Todos firman a la vez, en cualquier orden
- **RF-10** Recordatorios cada N días y vencimiento, a elección del abogado
- **RF-11** Borradores
- **RF-12** Enlace propio por correo, en el idioma del firmante; el enlace alcanza para firmar
- **RF-13** Firmar dibujando, escribiendo o subiendo una imagen
- **RF-14** No se firma con campos obligatorios vacíos
- **RF-15** El firmante puede rechazar, con motivo; frena para todos
- **RF-16** El firmante cambia el idioma de la página de firma
- **RF-17** Una firma confirmada no se cambia
- **RF-18** Al completarse, el PDF firmado por correo a todos (sin certificado en esta versión)
- **RF-19** Panel por estado, buscador y detalle por firmante
- **RF-20** Anular lo que no está completado, con motivo
- **RF-21** Reenviar el correo y corregir el correo de un firmante
- **RF-22** Vencimiento automático
- **RF-23** Rechazado, anulado, vencido o borrado no se firma
- **RF-24** Avisos al abogado: rechazo, vencimiento, completado
- **RF-25** Registro de pasos por firmante con IP y navegador
- **RF-26** Plantillas con papeles de firmante
- **RF-27** Usar una plantilla crea un borrador independiente
- **RF-28** Se guarda hasta que el abogado lo borra
- **RF-29** Borrar para siempre, salvo lo que espera firmas
- **RNF-01** Paleta llamativa pero profesional, para abogados
- **RNF-02** Navegación sencilla: panel y «Nuevo envío» a un clic
- **RNF-03** Preparar y enviar solo en computadora; en el teléfono, ver ; la firma, también en el teléfono
- **RNF-04** El documento firmado es el enviado, sin otro cambio
- **RNF-05** El enlace de cada firmante es secreto
- **RNF-06** Ningún dato real como dato de prueba

## Decisiones de Carlos que la tocan

Las del 2026-10-16, en [decisiones-de-negocio.md](../../docs/decisiones-de-negocio.md).

## Preguntas abiertas que frenan

Ninguna. Los aspectos legales se vuelven a revisar con Carlos cuando esté definida la interfaz.
