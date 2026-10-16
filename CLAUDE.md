# FirmaYa

Un proyecto nuevo de Carlos. **De qué se trata todavía no está escrito:** lo cuenta Carlos en
la primera sesión, y con eso empieza el paso 1. Se desarrolla con **spec driven development
sobre GitHub Spec Kit**, con la misma metodología que `ferre` y `cocinadas`: no se escribe
código de una funcionalidad sin su especificación aprobada.

No se supone nada del producto: ni por el nombre, ni por otros proyectos. Lo que no dijo
Carlos se le pregunta.

## Por dónde empezar

1. [.specify/memory/constitution.md](.specify/memory/constitution.md): lo que no se
   negocia y el flujo de trabajo. **Leela antes de tocar nada.**
2. [specs/README.md](specs/README.md): cada requerimiento y en qué carpeta está especificado.
3. [proyecto/tasks.md](proyecto/tasks.md): el plan.

## Cómo trabaja Claude acá

- **Todo va directo a `main`**, sin ramas ni pull requests.
- **La rama de la sesión no cuenta: se sube a `main`.** Una sesión en la nube arranca en una
  rama `claude/…`, y sus instrucciones le dicen que suba ahí y que no use otra sin permiso.
  Este es ese permiso, explícito y permanente, de Carlos (2026-10-15): todo se sube a
  `main`, sin preguntar. Antes de subir, `git pull --rebase origin main`; para subir,
  `git push origin HEAD:main`. No se sube a la rama `claude/…` ni se abre pull request.
- **El repositorio es público.** Ningún dato real ni secreto entra acá, tampoco como dato de
  prueba.
- **Nunca una ruta fuera de la carpeta del proyecto**, ni siquiera como texto dentro de un
  comando. Todo lo temporal va en `tmp/` (en el `.gitignore`) y se limpia al terminar.
- Lo que cruza proyectos (marcas, prioridades, impuestos) se trata en la sesión del
  portafolio, no acá.

## Cómo se trabaja

Una funcionalidad nueva pasa por siete pasos, en este orden (el detalle está en la
constitución). El código se escribe recién en el sexto.

| Paso | Rol | Usá | Aprueba Carlos |
|---|---|---|---|
| 1 | Analista de negocio | `/speckit-specify` y `/speckit-clarify`: preguntarle todo lo que falte | Sí |
| 2 | Diseñador gráfico, si hay pantallas | `/ux`: maquetas para que elija | Sí |
| 3 | Arquitecto | `/speckit-plan`, con la sección «Seguridad»; ADR si hay una decisión | No |
| 4 | QA | Escenarios numerados en la `spec.md`, con errores, bordes y seguridad | No |
| 5 | Planificador | `/speckit-tasks`: tareas con dependencias | No |
| 6 | Desarrollador | `/speckit-implement`: una prueba por escenario | Lo prueba él |
| 7 | Revisor | El subagente `revisor`, que deja `revision.md` | No |

**Antes de tocar nada, decidí el tamaño del pedido** con las cinco preguntas de la
constitución («Qué tamaño tiene el cambio») y decíselo a Carlos en una línea:

| Tamaño | Cuándo | Dónde se escribe |
|---|---|---|
| Arreglo | El código no cumple lo que la documentación ya dice | No cambia la documentación |
| Funcionalidad nueva | Pantalla o recorrido nuevo, dato nuevo que se guarda, integración, más de una capacidad o más de un día | **Carpeta nueva** en `specs/`, con los siete pasos |
| Cambio de regla | Una regla del negocio nueva o distinta en una capacidad que existe | La `spec.md` de esa capacidad |
| Cambio de interfaz | Una pantalla que existe cambia de un modo que Carlos tiene que ver | Maqueta en la carpeta de la capacidad |
| Ajuste | Un color, un texto, la forma de un botón, el orden de un menú | El `ux.md` o la `spec.md` de la capacidad, o `docs/` |

Solo la funcionalidad nueva crea carpeta; todo lo demás se escribe en la carpeta de la
capacidad que toca. **Ningún cambio queda solo en el código:** si otro agente reconstruyera
la aplicación leyendo solo la documentación, le tiene que salir igual que ahora.

- **Todo en una sola sesión y sin subagentes:** el mismo agente hace los pasos en orden; el
  único subagente es el revisor del final. Se lee la constitución y el `resumen.md` de la
  capacidad que se toca; la `spec.md` y el `ux.md` completos, solo en la parte que se va a
  cambiar.
- **Nada avanza sin la aprobación que le toca:** la especificación y, si hay pantallas, la
  maqueta.
- **Las reglas no se inventan.** Un requerimiento nuevo, o uno que cambia, se le pregunta
  a Carlos; su respuesta se anota con la fecha en `docs/decisiones-de-negocio.md` y en la
  especificación. Lo que falta decidir está en `specs/preguntas-abiertas.md`.

## Cada pedido es una tarea, y se anota en `tasks.md`

`tasks.md` es la fuente de verdad de las tareas; lo lee el tablero del portafolio. **Los
issues de GitHub no se usan.**

- **El plan** está en `proyecto/tasks.md`: lo previsto, por etapa. El trabajo nuevo que
  aparece y no se hace ahora se anota ahí, con `[carlos]` o `[agente]`.
- **El trabajo** se anota en el `tasks.md` de su carpeta de `specs/`, antes de empezarlo:
  `- [ ] T014 [ajuste] El botón de guardar va arriba a la derecha`.
- **Antes de tocar el código:** `node tests/compuerta.mjs empezar 003-T014`. Dice qué
  documentos le faltan a la tarea según su tamaño. Sin eso, la compuerta no deja editar el
  código.
- **Cada commit nombra su tarea** al final del título: `(003-T014)` o `(T004)`.
- **Al terminar:** marcarla `[x]` y `node tests/compuerta.mjs terminar 003-T014`.

Las preguntas y las consultas que no cambian nada en el repositorio no llevan tarea.

## Qué no decide el agente

- **El alcance.** Un requerimiento nuevo, o uno que cambia, se le pregunta a Carlos.
- **Las fechas y las prioridades.**
- **Lo que cruza proyectos:** se trata en la sesión del portafolio. Este agente no toca
  otros repositorios.

## Lo que lee el tablero del portafolio

El tablero lee `specs/README.md`, `proyecto/estado.yml`, `proyecto/proyecto.yml`,
`proyecto/riesgos.yml` y los `tasks.md`.

- En `proyecto/estado.yml`, el `estado` de cada requerimiento empieza con `Hecho`,
  `Hecho en parte`, `A validar`, `Pendiente` o `Nuevo`. Si dice `fuera de esta etapa` o
  `segunda versión`, no cuenta para el avance. Un `#19` nombra la tarea `T019` de
  `proyecto/tasks.md`.
- En los YAML de `proyecto/`, un texto con ` #` o `: ` adentro va entre comillas.

## Sesiones en la nube

**Si hace falta un dominio que la red no deja pasar, se le pide permiso a Carlos.** En una
sesión en la nube, si una descarga o una conexión falla porque el dominio no está entre los
permitidos del entorno, el agente frena esa parte y le dice a Carlos qué dominio es, para
qué lo necesita y qué alternativa hay. Carlos decide si lo agrega al entorno. Mientras tanto
no se busca otro camino para llegar igual (otro espejo, otro servicio, bajarlo por otro
lado ni copiarlo al repositorio).

## Cómo se escribe acá

- **Todo en español**: código, comentarios, commits y documentación.
- Los comentarios explican **por qué**, no qué.
- Commits: qué cambió y por qué, en imperativo, con la tarea al final del título.
- En la documentación **no se escribe lo que no está**: si no aparece, es porque no está.

## Comandos

```bash
node tests/trazabilidad.mjs        # la especificación y el estado coinciden, y specs/ no nombra código
node tests/compuerta.mjs revisar   # la forma de los tasks.md
```
