# Constitución de FirmaYa

Lo que no se negocia. Toda especificación, plan y tarea se revisa contra este documento; si
algo lo contradice, se cambia ese algo o se enmienda la constitución con la aprobación de
Carlos. El porqué de cada regla técnica está en los ADR ([docs/adr](../../docs/adr/README.md)).

Los principios del producto todavía no están escritos: salen del paso 1 de la primera
capacidad, con lo que Carlos cuente del producto, y se suman acá con su aprobación. Hasta
entonces no se escribe código.

## Core Principles

### I. La especificación manda y no depende del código

Lo fijo son las reglas de negocio; el código puede rehacerse en cualquier momento. Las
especificaciones tienen que alcanzar para que alguien que nunca vio este código construya
de nuevo una aplicación que cumpla todos los requerimientos, funcionales y no funcionales.
Por eso describen qué tiene que pasar y nunca cómo está hecho hoy: no nombran archivos,
componentes ni pantallas del código, y no dicen si algo está construido o no.

No se escribe código de una funcionalidad sin su `spec.md` aprobada por Carlos. Si el
trabajo no coincide con la especificación, se corrige el trabajo o se le pregunta a Carlos
si cambia la especificación; el agente no decide el alcance. Los arreglos que no cambian lo
que el usuario ve o puede hacer no necesitan especificación.

### II. Primero la prueba, y «hecho» solo con evidencia

Cada escenario de aceptación de una especificación tiene una prueba que se escribe antes
del código y falla hasta que el código existe. Un requerimiento figura como hecho solo
cuando sus escenarios tienen pruebas que pasan. Ese estado no se escribe en la
especificación: vive en `proyecto/estado.yml`, con las pruebas que lo respaldan, y es lo
único que hay que reiniciar si el código se rehace.

### III. En castellano

Código, comentarios, commits, documentación y textos de la app van en español. Los
comentarios explican por qué, no qué.

### IV. Toda decisión queda escrita

Una decisión técnica que afecta a más de una funcionalidad es un ADR, con las opciones
consideradas y el porqué. Un ADR viejo no se reescribe: se le agrega una enmienda. Las
decisiones de negocio de Carlos se anotan con su fecha en la especificación que tocan y en
[docs/decisiones-de-negocio.md](../../docs/decisiones-de-negocio.md).

## Restricciones técnicas

- **Stack, alojamiento y servicios de afuera:** todavía sin decidir. Los decide el paso 3 de
  la primera capacidad, con un ADR cada uno.
- **El repositorio es público:** ningún dato real ni secreto entra en él, tampoco como dato
  de prueba.

## Flujo de trabajo

Una funcionalidad, una carpeta en `specs/`. **No hay ramas ni pull requests:** todo se
sube directo a `main`; lo que no está terminado no se sube en un estado que rompa las
pruebas. Los comandos de Spec Kit no crean rama.

Una funcionalidad nueva pasa por siete pasos, en este orden. **Son pasos, no agentes:** los
hace el mismo agente en la misma sesión, y cada uno deja un documento del que parte el
siguiente. El código se escribe recién en el sexto.

| Paso | Rol | Cómo | Produce | Aprueba Carlos |
|---|---|---|---|---|
| 1 | Analista de negocio | `/speckit-specify` y `/speckit-clarify`: le pregunta a Carlos todo lo que falte hasta poder escribir la regla | `spec.md` con «**Status**: Aprobada» | Sí |
| 2 | Diseñador gráfico | `/ux`: dos o tres maquetas de cada pantalla que cambia, para que Carlos elija | `maquetas/` y `ux.md`; en `spec.md`, «**Maquetas**: Aprobadas» o «**Maquetas**: No lleva pantallas» | Sí |
| 3 | Arquitecto | `/speckit-plan` | `plan.md`, con la sección «Seguridad», y un ADR en `docs/adr/` si hay una decisión de arquitectura | No |
| 4 | QA | Completa los escenarios de la `spec.md` | Escenarios numerados (`E01`, `E02`…) que incluyen los de error, los de borde y los que salen de la sección de seguridad | No |
| 5 | Planificador | `/speckit-tasks` | `tasks.md`: todas las tareas, con sus dependencias | No |
| 6 | Desarrollador | `/speckit-implement` | Código y una prueba por escenario, que lo nombra (`009-E03`) | Lo prueba en el ambiente de pruebas |
| 7 | Revisor | El subagente `revisor`, con el contexto limpio | `revision.md`: en qué se aparta el código de la especificación | No |

- **Paso 1.** No se inventan reglas: lo que no está definido se pregunta. Las preguntas van
  todas juntas. La especificación no se da por aprobada mientras tenga un
  `[NEEDS CLARIFICATION]`.
- **Paso 3, seguridad.** La sección «Seguridad» de `plan.md` contesta siempre lo mismo:
  qué datos personales o del negocio toca, quién puede hacer cada cosa (permisos), qué
  entra desde afuera y cómo se valida, qué secretos usa y dónde viven, y qué queda
  registrado de quién hizo qué. Si un punto no aplica, se escribe por qué; no queda en blanco.
- **Paso 3, ADR.** Si hay que elegir entre alternativas técnicas razonables, el ADR se
  escribe acá, antes del código, no al cerrar.
- **Paso 4.** Los escenarios se escriben una sola vez, en la `spec.md`; no hay un archivo
  aparte de casos de prueba que se pueda desincronizar. El QA no agrega reglas: si un caso
  de borde no tiene respuesta en la especificación, vuelve al paso 1 y se le pregunta a Carlos.
- **Paso 7.** Es el único subagente del flujo, porque quien programó no puede revisarse.
  Corre una sola vez, al terminar la última tarea, y solo en funcionalidades nuevas. Lo que
  encuentra se arregla o se anota como defecto en `proyecto/estado.yml`.

No se usan los comandos opcionales del kit (análisis de coherencia, listas de control). Los
comandos de Spec Kit no crean rama.

**Los pasos 1 a 6 corren en la misma sesión, uno detrás del otro, y los hace el mismo
agente.** No se abre una sesión por rol ni se lanzan otros subagentes que el revisor,
porque cada uno arrancaría vacío y volvería a leer lo mismo. Para
gastar poco:

- Se lee la constitución, el `resumen.md` de la capacidad que se toca y el código que hace
  falta. La `spec.md` y el `ux.md` completos se abren solo en la parte del requerimiento
  que se va a cambiar, o ante una duda que el resumen no resuelve. No se leen las demás
  capacidades, ni los ADR que no vienen al caso.
- Lo que ya se leyó en la sesión no se vuelve a leer.
- Las preguntas del analista van todas juntas, y las maquetas también.
- Solo si la sesión se cortó se retoma en otra: `spec.md`, la maqueta aprobada y `tasks.md`
  alcanzan para seguir sin la conversación anterior.

### Qué tamaño tiene el cambio

Antes de tocar nada, el agente decide el tamaño del pedido con estas preguntas, en orden,
y se queda con la primera que contesta que sí. **Se lo dice a Carlos en una línea** antes
de empezar («Esto es un ajuste en 003-ventas, porque…»), para que pueda corregirlo.

1. **¿La documentación ya dice lo que Carlos pide, y es el código el que no lo cumple?**
   Es un **arreglo**.
2. **¿Agrega una pantalla o un recorrido que no existe, un dato nuevo que se guarda, una
   integración con algo de afuera, toca más de una capacidad, o lleva más de un día?**
   Es una **funcionalidad nueva**: carpeta nueva en `specs/` y los siete pasos.
3. **¿Agrega o cambia una regla del negocio** (qué se puede hacer, quién, con qué límites,
   qué se calcula) dentro de una capacidad que ya existe? Es un **cambio de regla**: se
   actualiza la `spec.md` de esa capacidad.
4. **¿Cambia cómo se ve o cómo se usa una pantalla que ya existe, de un modo que Carlos
   tiene que ver para aprobar?** Es un **cambio de interfaz**: maqueta primero.
5. **Lo demás** (un color, un texto, la forma de un botón, el orden de un menú) es un
   **ajuste**: se escribe en la documentación y se hace.

Ante la duda entre dos tamaños, vale el más grande. Si a mitad del trabajo el cambio
resulta ser más grande de lo que parecía, se frena y se vuelve a clasificar.

| Tamaño | Dónde se escribe | Pasos | Antes de programar |
|---|---|---|---|
| Arreglo | La documentación no cambia; si el defecto estaba en `proyecto/estado.yml`, se borra | 6 | La tarea anotada |
| Ajuste | En el `ux.md` o la `spec.md` de la capacidad, o en el documento de `docs/` que corresponda | 6 | El documento ya actualizado. El pedido de Carlos vale como aprobación |
| Cambio de interfaz | Maqueta en `specs/<capacidad>/maquetas/` y, si cambia un requerimiento de interfaz, su `ux.md` | 2 y 6 | La maqueta aprobada por Carlos |
| Cambio de regla | En la `spec.md` de la capacidad, con sus escenarios | 1, 4 y 6 | La regla escrita y aprobada por Carlos |
| Funcionalidad nueva | Carpeta nueva `NNN-nombre` (el número que sigue), con `spec.md`, `plan.md`, `tasks.md` y, si hay pantallas, `maquetas/` | Los siete | Todo lo de los pasos 1 a 5 |

**Carpeta nueva o carpeta existente.** Las carpetas de capacidad son la especificación
vigente de cada parte del sistema. Un arreglo, un ajuste, un cambio de interfaz o un cambio
de regla se escriben **en la carpeta de la capacidad que tocan**: no crean carpeta. Solo la
funcionalidad nueva crea una, y al terminar lo que cambió de cada capacidad se incorpora a
la `spec.md` de esa capacidad, con una nota de qué carpeta lo cambió y cuándo. Si el pedido
no entra en ninguna capacidad existente, la carpeta nueva queda como capacidad nueva y se
agrega al índice.

**Ningún cambio queda solo en el código.** La pregunta para saber si hay que tocar la
documentación es siempre la misma: si otro agente reconstruyera la aplicación leyendo solo
la documentación, ¿le saldría igual que ahora? Si no, falta escribirlo, por chico que sea
el cambio. Solo el arreglo se salva, porque ahí el documento ya decía lo correcto.

### El registro de tareas: `tasks.md`

Todo trabajo queda anotado como una tarea en el `tasks.md` de su carpeta de `specs/`,
**antes de empezarlo**. Es el registro de qué se pidió y qué se hizo; lo lee el tablero del
portafolio. **Los issues de GitHub no se usan:** una tarea existe cuando está escrita en un
`tasks.md`.

- **Forma de una tarea:** `- [ ] T014 [ajuste] El botón de Google va azul y redondeado`.
  El número sigue al último de ese archivo. La marca dice el tamaño: `[arreglo]`,
  `[ajuste]`, `[interfaz]` o `[regla]`; una tarea sin marca de tamaño es de una
  funcionalidad nueva. `[P]` dice que se puede hacer en paralelo con otras. Las
  dependencias van al final: `(depende de T003, T004)`.
- **Dónde:** hay dos clases de `tasks.md`.
  - `proyecto/tasks.md` es **el plan**: lo que está previsto hacer, por etapa, con quién
    lo hace (`[carlos]` o `[agente]`), su prioridad y de qué depende. Ahí se anota el
    trabajo nuevo que aparece y no se va a hacer ahora.
  - El `tasks.md` de cada carpeta de `specs/` es **el trabajo**: en la carpeta de una
    funcionalidad nueva, las tareas que arma el planificador; en la de una capacidad, los
    arreglos, ajustes y cambios de regla que se le fueron haciendo, uno debajo del otro.
  Cuando se toma una tarea del plan, la tarea de `specs/` que la resuelve la nombra al
  final (`(T056)`), y al terminar se marcan las dos.
- **Se nombra como** carpeta y número: `003-T014` (las del plan, solo `T056`). Cada commit la lleva al final del
  título, entre paréntesis: `(003-T014)`.
- **Al terminar** se marca `[x]`.

### La compuerta

Para que ningún paso se saltee, `tests/compuerta.mjs` controla el orden y Claude Code lo corre solo
antes de cada edición (`.claude/settings.json`): **no deja editar el código** si no hay una
tarea empezada, o si a esa tarea le falta lo que su tamaño exige en la tabla de arriba.
Mientras no haya arquitectura, es código todo lo que no es documentación (`specs/`, `docs/`,
`proyecto/`, `.specify/`, `.claude/`, `.github/` y los `.md` de la raíz).

```bash
node tests/compuerta.mjs empezar 003-T014    # antes de tocar el código; dice qué falta
node tests/compuerta.mjs terminar 003-T014   # con la tarea ya marcada [x]
node tests/compuerta.mjs estado              # qué tareas están empezadas
```

En una funcionalidad nueva exige además, al terminar la última tarea, que cada escenario
tenga una prueba que lo nombre y que exista `revision.md`. Si la compuerta frena algo que
debería pasar, se arregla la compuerta o la documentación; no se la esquiva editando por
otro camino.

### Toda lista de tareas termina con estas

1. Una prueba por cada escenario de aceptación, que lo nombra, anotada en `proyecto/estado.yml`.
2. Si hay pantallas, comparar el resultado con la maqueta aprobada mediante capturas en cada tamaño de pantalla,
   y mostrarle a Carlos las diferencias.
3. La revisión independiente: `revision.md`, con lo que encontró y qué se hizo con cada punto.
4. Actualizar `proyecto/estado.yml`, incorporar lo nuevo a la `spec.md` de la capacidad y
   marcar la tarea del plan, si había una.

## Convenciones propias sobre Spec Kit

- **Plantillas casi sin tocar.** Los títulos de las plantillas quedan como los trae el kit,
  en inglés, para no apartarse del estándar; el contenido se escribe en castellano. Los cambios
  propios son tres: en `spec-template.md`, las líneas de aprobación y los escenarios
  numerados; en `plan-template.md`, la sección «Seguridad»; y en `tasks-template.md`, la
  forma de las tareas y la fase final de cierre.
- **Identificadores.** Los requerimientos usan `RF-01` (funcional) y `RNF-01` (no
  funcional) en lugar de `FR-001`. Los nuevos siguen la numeración de su capacidad.
- **Una carpeta por capacidad.** Las primeras carpetas especifican cada capacidad completa:
  todos sus requerimientos, estén construidos o no. Son la especificación vigente.
- **Qué vale hoy.** Al cerrar una funcionalidad, lo que cambia de una capacidad se
  incorpora a la `spec.md` de esa capacidad, con una nota de qué carpeta lo cambió y cuándo.
  La carpeta de la funcionalidad conserva la historia; la de la capacidad, lo vigente.
- **Regla y estado, separados.** `specs/` dice qué tiene que hacer el sistema.
  `proyecto/estado.yml` dice, por requerimiento, si está hecho, qué pruebas lo respaldan y
  en qué se aparta hoy el código de la regla. `tests/trazabilidad.mjs` controla en el CI que
  los dos coincidan.
- **Un resumen por capacidad.** Cada carpeta de capacidad tiene un `resumen.md` de 80
  líneas como mucho: cada requerimiento con su ID en una línea, las reglas que más pesan,
  las decisiones de Carlos que la tocan y las preguntas abiertas que frenan. Es lo primero
  que se lee, y lo único si alcanza. Sigue las reglas de `specs/`: no nombra código ni dice
  qué está hecho. Quien cambia una regla actualiza el resumen en
  el mismo cambio; ante una diferencia, manda la `spec.md`.
- **`ux.md` son requerimientos de interfaz:** qué tiene que poder hacer cada rol en cada
  recorrido y con qué reglas, sin atarse a un diseño. En una funcionalidad nueva, el
  diseño concreto va en `specs/NNN/maquetas/`.
- **Índice.** [specs/README.md](../../specs/README.md) lista cada requerimiento y su
  carpeta. Es la entrada para quien llega al proyecto.
- **Fuera de Spec Kit:** los ADR (`docs/adr/`), las decisiones de negocio
  (`docs/decisiones-de-negocio.md`) y la gestión del portafolio (`proyecto/`). Lo demás de
  `docs/` (manuales de operación, sistema visual) se crea cuando haga falta.

## Governance

Esta constitución prevalece sobre cualquier otra práctica del repositorio. Se enmienda con
la aprobación de Carlos, anotando qué cambió y por qué, y subiendo la versión. Cada
rol comprueba su trabajo contra ella antes de entregarlo; lo que la incumple no se cierra.

**Version**: 1.0.0 | **Ratified**: 2026-10-16 | **Last Amended**: 2026-10-16
