# Feature Specification: Firma electrónica de documentos

**Feature Branch**: `001-firma-electronica`

**Created**: 2026-10-16

**Status**: Borrador  <!-- pasa a «Aprobada» cuando Carlos aprueba la especificación -->

**Maquetas**: Pendientes  <!-- «Aprobadas» cuando Carlos elige, o «No lleva pantallas» -->

**Input**: User description: "Un clon de DocuSign con mejor aspecto gráfico, una paleta de
colores más llamativa pero profesional orientada a abogados, navegación sencilla y opciones
fáciles de encontrar. Solo firma electrónica." Más las respuestas de Carlos del 2026-10-16.

<!-- Cada escenario de aceptación lleva un número que no se repite en este archivo:
     «1. **E01** **Given** …». El paso de QA agrega los de error, los de borde y los que
     salen de la sección «Seguridad» del plan. Cada prueba nombra su escenario (009-E01). -->

## Qué es y qué no es

FirmaYa le permite a un abogado subir un documento, marcar dónde tiene que firmar cada
persona, mandárselo a firmar y seguir en qué estado está, hasta tener el PDF firmado por
todos. Los firmantes firman desde un enlace que les llega por correo, sin crearse una cuenta.

- **Es firma electrónica simple** en los términos de la ley argentina 25.506 (artículo 5).
  **No es firma digital**: la firma digital con certificado queda para una versión posterior
  (decisión de Carlos, 2026-10-16).
- **Solo firma.** No gestiona clientes, expedientes, cobros ni agenda.
- **Gratis y sin roles** en esta versión: cada abogado tiene su cuenta y ve solo lo suyo. No
  hay estudios con varios usuarios, ni administradores, ni planes pagos.
- Toma a DocuSign como referencia de **qué hace**, no de cómo se ve: ni su nombre, ni su
  marca, ni sus textos.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mandar un documento a firmar (Priority: P1)

El abogado sube un PDF o un Word, agrega a los firmantes con su nombre y su correo, coloca
sobre el documento los campos que cada uno tiene que completar y lo envía. A cada firmante le
llega un correo con su enlace.

**Why this priority**: Es la razón de ser del producto; sin esto no hay nada que firmar.

**Independent Test**: Un abogado sube un PDF, agrega dos firmantes, coloca una firma para cada
uno y lo envía; los dos reciben su correo con un enlace propio.

**Acceptance Scenarios**:

1. **E01** **Given** un abogado con su cuenta, **When** sube un PDF de menos de 25 MB, **Then**
   ve el documento página por página, listo para agregarle firmantes y campos.
2. **E02** **Given** un abogado, **When** sube un Word, **Then** el sistema lo convierte a PDF
   y le muestra el resultado antes de seguir, para que compruebe que se ve bien.
3. **E03** **Given** un documento subido, **When** el abogado agrega un firmante, **Then** le
   pide nombre, correo e idioma (español, inglés o portugués), y el firmante queda con un color
   propio que distingue sus campos de los de los demás.
4. **E04** **Given** un documento con firmantes, **When** el abogado arrastra un campo sobre
   una página y elige a qué firmante le corresponde, **Then** el campo queda ahí, con el color
   de ese firmante, y se puede mover, cambiar de tamaño o borrar.
5. **E05** **Given** un documento en el que todos los firmantes tienen al menos un campo de
   firma, **When** el abogado lo envía, **Then** cada firmante recibe un correo, en su idioma,
   con un enlace propio, y el documento pasa a «Esperando firmas».
6. **E06** **Given** un documento en el que algún firmante no tiene ningún campo de firma,
   **When** el abogado intenta enviarlo, **Then** el sistema no lo envía y le dice qué
   firmante no tiene dónde firmar.
7. **E07** **Given** un documento a medio preparar, **When** el abogado sale sin enviarlo,
   **Then** queda guardado como «Borrador» y lo puede retomar desde el panel.
8. **E08** **Given** un archivo que no es PDF ni Word, o que supera los 25 MB, **When** el
   abogado lo sube, **Then** el sistema lo rechaza y le dice por qué.

---

### User Story 2 - Firmar desde el enlace (Priority: P1)

El firmante abre el enlace del correo, lee el documento, completa sus campos, elige cómo
firmar (dibujando, escribiendo su nombre o subiendo una imagen de su firma) y confirma.

**Why this priority**: Es la otra mitad del recorrido; sin ella el envío no sirve.

**Independent Test**: Un firmante abre su enlace, firma dibujando, confirma, y el abogado ve en
el panel que ese firmante ya firmó.

**Acceptance Scenarios**:

1. **E09** **Given** un firmante con su enlace, **When** lo abre, **Then** ve el documento
   completo en el idioma que eligió el abogado, con sus campos resaltados y un botón que lo
   lleva de un campo pendiente al siguiente.
2. **E10** **Given** un firmante en un campo de firma, **When** firma, **Then** puede elegir
   entre dibujarla, escribir su nombre con una letra de firma o subir una imagen, y la firma
   que adoptó se repite en sus otros campos de firma con un clic.
3. **E11** **Given** un firmante con campos obligatorios sin completar, **When** quiere
   terminar, **Then** el sistema no lo deja y le muestra cuál falta.
4. **E12** **Given** un firmante que completó todo, **When** confirma, **Then** su firma queda
   registrada, ya no la puede cambiar, y el abogado ve en el panel que firmó.
5. **E13** **Given** un firmante, **When** abre el enlace, **Then** puede cambiar el idioma
   entre español, inglés y portugués.
6. **E14** **Given** un firmante que ya firmó, **When** vuelve a abrir el enlace, **Then** ve
   que ya firmó y el estado del documento, pero no puede volver a firmar.

---

### User Story 3 - Terminar y recibir el PDF firmado (Priority: P1)

Cuando firma el último firmante, el documento queda completo y todos reciben por correo una
copia del PDF firmado.

**Why this priority**: Sin el PDF firmado en la mano, la firma no le sirve al abogado.

**Independent Test**: Con dos firmantes, cuando el segundo firma, el abogado, los dos firmantes
y los destinatarios de copia reciben el mismo PDF con las dos firmas.

**Acceptance Scenarios**:

1. **E15** **Given** un documento esperando firmas, **When** firma el último firmante, **Then**
   el documento pasa a «Completado» y el abogado, cada firmante y cada destinatario de copia
   reciben por correo el PDF con todas las firmas.
2. **E16** **Given** un documento completado, **When** el abogado lo abre desde el panel,
   **Then** puede descargar el PDF firmado.
3. **E17** **Given** un documento con destinatarios de copia, **When** se envía, **Then** a
   ellos no les llega nada para firmar: reciben solo el PDF firmado al completarse.

---

### User Story 4 - Seguir el estado en el panel (Priority: P1)

El abogado tiene un panel con todos sus documentos y su estado, con un buscador y filtros.
Desde el teléfono puede consultar el panel y el detalle, pero no preparar ni enviar.

**Why this priority**: Es el centro de la navegación sencilla que pidió Carlos: desde ahí se
llega a todo.

**Independent Test**: Con documentos en distintos estados, el abogado filtra por «Esperando
firmas», busca por el nombre de un firmante y ve quién firmó y quién falta.

**Acceptance Scenarios**:

1. **E18** **Given** un abogado con documentos, **When** entra, **Then** ve el panel con sus
   documentos agrupados por estado (Borrador, Esperando firmas, Completado, Rechazado, Vencido,
   Anulado) y la cantidad de cada uno.
2. **E19** **Given** el panel, **When** el abogado busca, **Then** encuentra los documentos
   cuyo título, nombre o correo de algún firmante contiene lo que escribió.
3. **E20** **Given** un documento enviado, **When** el abogado abre su detalle, **Then** ve
   cada firmante con su estado (pendiente, abrió el documento, firmó, rechazó) y la fecha y
   hora de cada paso.
4. **E21** **Given** un abogado en un teléfono, **When** entra, **Then** puede ver el panel y
   el detalle de cada documento, y no tiene las opciones de subir, preparar ni enviar.

---

### User Story 5 - Rechazar, anular, recordar y vencer (Priority: P2)

El firmante puede rechazar el documento. El abogado puede anularlo mientras no esté completo.
A quien no firmó le llegan recordatorios, y el documento vence si nadie lo completa a tiempo.

**Why this priority**: Cierra los recorridos que no terminan bien; sin esto, un documento
podría quedar esperando para siempre.

**Independent Test**: Un firmante rechaza con un motivo; el abogado recibe el aviso y el
documento queda «Rechazado» y ya no se puede firmar.

**Acceptance Scenarios**:

1. **E22** **Given** un firmante con su enlace, **When** rechaza el documento, **Then** el
   sistema le pide el motivo, el documento pasa a «Rechazado», el abogado recibe un correo
   con el motivo y los enlaces de todos los firmantes dejan de servir para firmar.
2. **E23** **Given** un documento esperando firmas, **When** el abogado lo anula, **Then** le
   pide confirmación y un motivo, el documento pasa a «Anulado», los firmantes reciben un
   aviso y sus enlaces dejan de servir para firmar.
3. **E24** **Given** un documento completado, **When** el abogado busca la opción de anular,
   **Then** no la tiene.
4. **E25** **Given** un documento enviado con recordatorios cada N días, **When** pasan N días
   sin que un firmante firme, **Then** ese firmante recibe un recordatorio por correo, y los
   que ya firmaron no.
5. **E26** **Given** un documento con fecha de vencimiento, **When** llega esa fecha sin que
   todos firmen, **Then** pasa a «Vencido», el abogado recibe un aviso y los enlaces dejan de
   servir para firmar.
6. **E27** **Given** un documento esperando firmas, **When** el abogado reenvía el correo a un
   firmante, **Then** ese firmante recibe de nuevo su enlace.

---

### User Story 6 - Plantillas (Priority: P2)

El abogado guarda como plantilla un documento que usa seguido (un poder, un convenio de
honorarios, un acuerdo de confidencialidad) con sus campos ya colocados para cada papel de
firmante. Al usarla, solo carga los nombres y correos y lo envía.

**Why this priority**: Ahorra el trabajo repetido, que es lo más común en un estudio; Carlos
pidió que entre en esta versión.

**Independent Test**: El abogado crea una plantilla con los papeles «Cliente» y «Abogado»,
la usa cargando dos personas y envía el documento sin volver a colocar ningún campo.

**Acceptance Scenarios**:

1. **E28** **Given** un abogado, **When** crea una plantilla, **Then** sube el documento,
   define los papeles de firmante con un nombre (por ejemplo «Cliente») y coloca los campos de
   cada papel, igual que en un envío.
2. **E29** **Given** una plantilla, **When** el abogado la usa, **Then** se crea un borrador
   con el documento y los campos ya colocados, y solo tiene que cargar nombre, correo e idioma
   de la persona de cada papel.
3. **E30** **Given** un borrador creado desde una plantilla, **When** el abogado lo cambia,
   **Then** la plantilla queda como estaba.
4. **E31** **Given** una plantilla, **When** el abogado la edita o la borra, **Then** los
   documentos que ya se crearon con ella no cambian.

---

### User Story 7 - Borrar documentos (Priority: P3)

Los documentos se guardan hasta que el abogado los borra.

**Why this priority**: Es necesario, pero se usa poco.

**Independent Test**: El abogado borra un documento completado; desaparece del panel y su
enlace ya no abre nada.

**Acceptance Scenarios**:

1. **E32** **Given** un documento en cualquier estado salvo «Esperando firmas», **When** el
   abogado lo borra y confirma, **Then** el documento y su PDF firmado se borran para siempre
   y los enlaces de los firmantes ya no muestran el documento.
2. **E33** **Given** un documento esperando firmas, **When** el abogado quiere borrarlo,
   **Then** el sistema le pide que primero lo anule.

---

### User Story 8 - La cuenta del abogado (Priority: P1)

El abogado se registra gratis, entra y sale. Elige el idioma de la aplicación.

**Why this priority**: Sin cuenta no hay panel ni envíos.

**Independent Test**: Una persona se registra, entra, cambia el idioma a portugués y ve toda
la aplicación en portugués.

**Acceptance Scenarios**:

1. **E34** **Given** una persona sin cuenta, **When** se registra, **Then** el sistema
   [NEEDS CLARIFICATION: ¿cómo se registra y entra el abogado? Ver la pregunta 1] y le crea
   una cuenta gratuita.
2. **E35** **Given** un abogado con su cuenta, **When** elige español, inglés o portugués,
   **Then** toda la aplicación se le muestra en ese idioma.
3. **E36** **Given** dos abogados con su cuenta, **When** uno entra, **Then** no ve nada de lo
   del otro: ni documentos, ni plantillas.

---

### Edge Cases

- Un firmante con el mismo correo aparece dos veces en el mismo documento: el sistema avisa
  antes de enviar.
- El abogado se pone a sí mismo como firmante: firma desde su propio enlace, como cualquiera.
- Un PDF protegido con contraseña o dañado, o un Word que no se puede convertir: se rechaza
  con un mensaje que lo dice.
- Un correo no se puede entregar (dirección inexistente): el abogado lo ve en el detalle del
  documento y puede corregir el correo de ese firmante y reenviar, si todavía no firmó.
- Dos firmantes firman al mismo tiempo: las dos firmas quedan; ninguna pisa a la otra.
- Un firmante abre el enlace de un documento rechazado, anulado, vencido o borrado: ve qué
  pasó y no puede firmar.
- La fecha de vencimiento llega mientras un firmante está firmando: la firma que confirma
  después del vencimiento no se acepta.

## Requirements *(mandatory)*

### Functional Requirements

**Cuenta**

- **RF-01**: Cualquier persona MUST poder crearse una cuenta gratuita de abogado. La forma de
  registrarse y entrar: [NEEDS CLARIFICATION: ver la pregunta 1].
- **RF-02**: Cada abogado MUST ver y manejar solo sus documentos y sus plantillas. No hay roles
  ni cuentas compartidas.
- **RF-03**: La aplicación MUST estar en español, inglés y portugués; el abogado elige el
  idioma de su cuenta.

**Preparar y enviar**

- **RF-04**: El abogado MUST poder subir documentos PDF y Word (.doc y .docx) de hasta 25 MB
  cada uno, el mismo límite que DocuSign. El Word se convierte a PDF y se le muestra el
  resultado antes de seguir.
- **RF-05**: Un envío MUST poder llevar uno o más documentos, que se firman juntos.
- **RF-06**: El abogado MUST poder agregar firmantes (nombre, correo e idioma) y destinatarios
  de copia (nombre, correo e idioma), y ponerse a sí mismo como firmante.
- **RF-07**: El abogado MUST poder colocar, mover, cambiar de tamaño y borrar sobre el
  documento estos campos, cada uno asignado a un firmante: firma, iniciales, fecha de firma,
  nombre, casilla y texto libre. La fecha de firma y el nombre se completan solos. La casilla
  y el texto libre pueden ser obligatorios u opcionales.
- **RF-08**: El sistema MUST no enviar un documento en el que algún firmante no tenga ningún
  campo de firma.
- **RF-09**: Todos los firmantes MUST recibir el documento a la vez y poder firmar en
  cualquier orden.
- **RF-10**: El abogado MUST poder elegir, al enviar, cada cuántos días se le recuerda a quien
  no firmó (o ningún recordatorio) y una fecha de vencimiento (o ninguna).
- **RF-11**: Un documento que no se envió MUST quedar como borrador, que el abogado puede
  retomar o borrar.

**Firmar**

- **RF-12**: Cada firmante MUST recibir un correo, en su idioma, con un enlace propio que le
  permite firmar sin crearse una cuenta. Tener el enlace es lo único que se le pide para
  firmar (decisión de Carlos, 2026-10-16).
- **RF-13**: El firmante MUST poder firmar dibujando, escribiendo su nombre con una letra de
  firma o subiendo una imagen de su firma, y reusar la firma que adoptó en todos sus campos.
- **RF-14**: El sistema MUST no aceptar la firma mientras falte algún campo obligatorio de ese
  firmante, y MUST decirle cuál falta.
- **RF-15**: El firmante MUST poder rechazar el documento indicando un motivo. Un rechazo
  frena el documento para todos.
- **RF-16**: El firmante MUST poder cambiar el idioma de la página de firma entre español,
  inglés y portugués.
- **RF-17**: Una firma confirmada MUST no poder cambiarse ni retirarse.

**Seguimiento y cierre**

- **RF-18**: Cuando firma el último firmante, el sistema MUST mandar por correo el PDF con
  todas las firmas al abogado, a cada firmante y a cada destinatario de copia. En esta versión
  se entrega solo el PDF; el certificado llega con la firma digital (decisión de Carlos,
  2026-10-16).
- **RF-19**: El abogado MUST tener un panel con sus documentos por estado (Borrador, Esperando
  firmas, Completado, Rechazado, Vencido, Anulado), con la cantidad de cada uno, un buscador
  por título y por nombre o correo de firmante, y el detalle de cada documento con el estado
  de cada firmante y la fecha y hora de cada paso.
- **RF-20**: El abogado MUST poder anular un documento que no esté completado, con un motivo;
  los firmantes reciben un aviso.
- **RF-21**: El abogado MUST poder reenviar el correo a un firmante que no firmó, y corregir
  su correo si todavía no firmó.
- **RF-22**: Al llegar la fecha de vencimiento sin todas las firmas, el documento MUST pasar a
  «Vencido» y el abogado recibir un aviso.
- **RF-23**: Un documento rechazado, anulado, vencido o borrado MUST no poder firmarse desde
  ningún enlace.
- **RF-24**: El abogado MUST recibir un correo cuando un firmante rechaza, cuando el documento
  vence y cuando se completa.
- **RF-25**: El sistema MUST registrar, por cada firmante, cuándo se le envió, cuándo abrió el
  documento y cuándo firmó o rechazó.
  [NEEDS CLARIFICATION: ¿se guarda además una constancia para probar la firma? Ver la pregunta 3]

**Plantillas**

- **RF-26**: El abogado MUST poder crear, editar y borrar plantillas: uno o más documentos,
  papeles de firmante con nombre y campos colocados para cada papel.
- **RF-27**: Usar una plantilla MUST crear un borrador con todo lo de la plantilla, donde el
  abogado solo carga la persona de cada papel. Cambiar el borrador no cambia la plantilla, y
  cambiar o borrar la plantilla no cambia los documentos ya creados.

**Guardado y borrado**

- **RF-28**: Los documentos MUST guardarse hasta que el abogado los borra; no vencen solos.
- **RF-29**: El abogado MUST poder borrar para siempre un documento que no esté esperando
  firmas, con confirmación. Uno que espera firmas se anula primero.

### Non-Functional Requirements

- **RNF-01**: **Aspecto.** Una paleta de colores más llamativa que la de DocuSign pero
  profesional, pensada para abogados. Carlos la elige entre las maquetas del paso 2.
- **RNF-02**: **Navegación sencilla.** Desde cualquier pantalla del abogado, el panel y
  «Nuevo envío» están a un clic. Las acciones de un documento están en su detalle, a la
  vista, sin menús escondidos.
- **RNF-03**: **Dispositivos.** Preparar y enviar es solo en computadora. En el teléfono, el
  abogado puede ver el panel y el detalle de los documentos.
  La página de firma: [NEEDS CLARIFICATION: ver la pregunta 2].
- **RNF-04**: **El documento no cambia.** Lo que firma cada firmante es exactamente el
  documento que envió el abogado, y el PDF final es ese documento con las firmas y los campos
  completados, sin otro cambio.
- **RNF-05**: **El enlace es secreto.** El enlace de cada firmante no se puede adivinar a
  partir de otro y sirve solo para ese firmante y ese documento.
- **RNF-06**: **Datos de prueba.** El repositorio es público: ningún documento, nombre ni
  correo real se usa como dato de prueba.

### Key Entities *(include if feature involves data)*

- **Abogado**: el dueño de una cuenta. Nombre, correo, idioma.
- **Envío** (lo que el panel llama «documento»): uno o más documentos que se firman juntos,
  con título, estado, recordatorios, vencimiento y motivo de rechazo o anulación. Es de un
  abogado.
- **Documento**: un PDF dentro de un envío (el original y, al completarse, el firmado).
- **Firmante**: una persona que firma un envío. Nombre, correo, idioma, color, estado, enlace
  propio y la firma que adoptó.
- **Destinatario de copia**: una persona que recibe el PDF firmado y no firma.
- **Campo**: un lugar en una página de un documento, de un tipo, asignado a un firmante, con
  su valor una vez completado.
- **Paso registrado**: qué pasó con un firmante (enviado, abierto, firmado, rechazado) y
  cuándo.
- **Plantilla**: documentos, papeles de firmante y campos por papel, para crear envíos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un abogado que nunca usó FirmaYa prepara y envía un documento de dos firmantes en
  menos de 5 minutos, sin ayuda.
- **SC-002**: Un firmante firma un documento de una página en menos de 2 minutos desde que
  abre el enlace.
- **SC-003**: Con una plantilla, enviar un documento lleva menos de 1 minuto.
- **SC-004**: Desde el panel, el abogado encuentra un documento por el nombre de un firmante en
  menos de 10 segundos.
- **SC-005**: Ningún documento rechazado, anulado, vencido o borrado acepta una firma.

## Assumptions

- El límite de 25 MB por archivo es el que publica DocuSign para cada documento; Carlos pidió
  el mismo.
- El idioma de la aplicación sale del navegador la primera vez y después el abogado lo cambia.
- Los recordatorios, si el abogado no elige otra cosa, salen cada 3 días, y el vencimiento, si
  no elige otro, es a los 30 días del envío.
- Los correos salen a nombre de FirmaYa e indican qué abogado manda el documento.
- La validez de la firma electrónica simple, si se la desconoce en un juicio, la tiene que
  probar quien la invoca (ley 25.506, artículo 5). Por eso importa la pregunta 3.
