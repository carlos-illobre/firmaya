# Requerimientos de interfaz: 001 Firma electrónica

Qué tiene que poder hacer cada rol en cada recorrido, qué necesita a la vista y con qué
reglas. No describe la disposición: el diseño concreto está en las maquetas aprobadas y los
colores y letras, en [el sistema visual](../../docs/sistema-visual.md).

**Maquetas aprobadas por Carlos el 2026-10-16:** las once de [maquetas/](maquetas/) salvo
las dos variantes del panel que no eligió (`panel-b-…` y `panel-c-…`), con la letra cambiada
a una sin serifa. Eligió la variante A, marino y oro, porque «a los abogados les gusta tener
todas las opciones a mano, que no estén escondidas».

## Reglas para todas las pantallas

- **Nada escondido.** Las acciones que se pueden hacer sobre algo están a la vista como
  botones, junto a eso. No hay menús de «más opciones». Una acción que en ese momento no se
  puede hacer se ve deshabilitada y dice por qué, en lugar de desaparecer.
- **Siempre a un clic** desde cualquier pantalla del abogado en computadora: «Nuevo envío»,
  el panel, las plantillas, el idioma y salir.
- **Lo que no se deshace pide confirmación** y dice qué va a pasar: anular, borrar, rechazar.
- **Los colores de los firmantes** distinguen de quién es cada campo, en la preparación y en
  el detalle. Cada firmante tiene el suyo dentro de un envío.
- **Textos con las palabras del negocio:** documento, envío, firmante, recibe copia,
  plantilla, papel, borrador, esperando firmas, completado, rechazado, vencido, anulado.
- **Tres idiomas** (español, inglés y portugués) en todo, también en los correos.
- **En el teléfono**, el abogado solo ve el panel y el detalle. Si entra a preparar un envío o
  a las plantillas, ve «Esto se hace en la computadora» y un camino de vuelta al panel. La
  página de firma anda completa en el teléfono.

## Entrar (historia 8)

- Lo único que se le pide es entrar con Google. Si es la primera vez, se le dice que se le
  crea una cuenta gratis.
- Puede elegir el idioma antes de entrar.

## Panel (historia 4)

En este orden: la cantidad de documentos de cada estado (que funciona como filtro), el
buscador y la lista. De cada documento se ve el título, cuántos firmantes firmaron de
cuántos, el estado, el último movimiento con su fecha y lo que pida atención: que vence
pronto, el motivo de un rechazo.

Estados: sin ningún documento (con «Nuevo envío» y «Crear una plantilla»), búsqueda sin
resultados (con «Limpiar la búsqueda»), cargando, y sin conexión (con «Reintentar»).

## Nuevo envío (historia 1)

Dos pasos: los documentos, y después firmantes, campos y envío.

1. **Documentos.** Arrastrar o elegir archivos. Se dicen los formatos y el límite antes de
   subir. Cada archivo subido se puede ver y quitar. El Word convertido avisa que se revise el
   PDF. Un archivo rechazado dice por qué. Desde acá también se puede empezar con una
   plantilla.
2. **Firmantes, campos y envío**, todo junto, sin pasos escondidos:
   - firmantes y copias, con nombre, correo, idioma y color, y cómo agregar más;
   - los seis tipos de campo, para el firmante elegido;
   - el documento, página por página, con los campos colocados;
   - lo que se puede cambiar del campo elegido: a quién le corresponde, si es obligatorio y
     borrarlo;
   - recordatorios, vencimiento y un mensaje para el correo;
   - lo que falta para poder enviar, dicho con nombre y apellido;
   - siempre a mano: guardar borrador, guardar como plantilla y enviar.

Al enviar: confirmación de a quién le llega el enlace, o el error y que el borrador quedó
guardado.

## Detalle de un documento (historia 4 y 5)

En este orden: título, estado y cuántos firmaron; las fechas de envío y vencimiento y cada
cuánto se recuerda; las acciones (reenviar a quienes no firmaron, ver los documentos,
descargar el PDF firmado, anular y borrar); cada firmante con su correo, su idioma, su estado
y su fecha, con «Reenviar» o «Corregir correo» al lado si corresponde; los que reciben copia;
el historial de pasos con fecha, hora, IP y navegador; y los documentos del envío.

Un correo que rebotó se ve junto al firmante.

## Página de firma (historias 2, 3 y 5)

- Arriba: quién le manda qué documento, el idioma y «Rechazar».
- Siempre a la vista: cuántos campos le faltan, «Siguiente campo» y «Terminar y firmar», que
  se habilita cuando no falta nada obligatorio.
- Sus campos pendientes se destacan; los de los demás se ven como ya firmados o no se ven.
- Al tocar el primer campo de firma elige cómo firmar (dibujar, escribir o subir una imagen),
  y esa firma se usa en todos sus campos.
- Rechazar pide el motivo y avisa que nadie más va a poder firmar.
- Pantallas finales: «Firmaste» (con quién falta), «Ya firmaste este documento» si vuelve a
  entrar, y «Este documento ya no se puede firmar», con qué pasó y el motivo si lo hay.

## Plantillas (historia 6)

- De cada plantilla: el nombre, cuántos documentos y páginas tiene, cuántas veces se usó, sus
  papeles de firmante, y los botones Usar, Editar y Borrar.
- Usar una plantilla pide nombre, correo e idioma de la persona de cada papel, y deja ir a
  enviar o a revisar los campos.

## Borrar y anular (historias 5 y 7)

- Anular pide un motivo y avisa que los enlaces dejan de servir.
- Borrar avisa que es para siempre y que se borra también el PDF firmado. Un documento que
  espera firmas no se puede borrar: el botón dice que primero hay que anularlo.

## Chequeo contra los principios de interfaz de la constitución

La constitución todavía no tiene principios de interfaz: los principios del producto salen
de esta primera capacidad y se suman con la aprobación de Carlos. Las reglas de arriba para
todas las pantallas son las candidatas.
