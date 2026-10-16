# Sistema visual de FirmaYa

Los colores, las letras y las formas que comparten todas las pantallas. Sale de las maquetas
que aprobó Carlos el 2026-10-16 (variante A, «marino y oro»). Una pantalla nueva usa estos
valores; si necesita uno nuevo, se agrega acá.

## Colores

| Nombre | Valor | Para qué |
|---|---|---|
| Marino | `#14213d` | Menú lateral, títulos, botón principal oscuro |
| Marino claro | `#1f3260` | Opción del menú activa |
| Oro | `#c9a227` | Acción principal («Nuevo envío», «Enviar», «Usar»), lo activo, lo pendiente de firmar |
| Oro claro | `#f5e9c4` | Halo de lo seleccionado |
| Fondo | `#faf8f3` | Fondo de las pantallas |
| Tarjeta | `#ffffff` | Cajas y tablas |
| Texto | `#1c2333` | Texto común |
| Texto suave | `#5b6476` | Datos secundarios |
| Borde | `#e7e2d6` | Bordes y separadores |
| Verde | `#1f7a4d` | Completado, firmó |
| Ámbar | `#b26a00` | Esperando firmas |
| Rojo | `#b42318` | Rechazado, vencido, errores y acciones que no se deshacen |
| Gris | `#6b7280` | Borrador, anulado, pendiente |

**Colores de los firmantes**, en este orden: `#2563eb`, `#c2410c`, `#7c3aed`; si hay más,
se siguen eligiendo colores que se distingan de estos y de los de estado.

## Letra

- **Inter**, sin serifa, en toda la aplicación; si no está, la letra del sistema
  (`system-ui`). Carlos pidió que no fuera con serifa (2026-10-16).
- Títulos en negrita (700), con el espacio entre letras un poco cerrado. La marca, en 800.
- La letra con serifa de las maquetas dentro de la hoja es solo el ejemplo del documento del
  abogado: el PDF se muestra como es.
- La firma escrita usa una letra manuscrita.

## Formas

- Esquinas redondeadas: 12 px en cajas, 9 a 10 px en botones y campos, píldoras en los
  estados.
- Estados como píldoras de fondo claro con el texto del color del estado.
- Botones: el principal en oro con texto marino; el común blanco con borde; el de peligro
  blanco con texto rojo; el que no se puede usar, a media opacidad.
- Las animaciones (el latido de los campos pendientes, el brillo de «cargando») se apagan si
  la persona pidió reducir el movimiento.

## Tamaños de pantalla

Computadora desde 1366 px; teléfono a 390 px, con el menú arriba en lugar de al costado.
