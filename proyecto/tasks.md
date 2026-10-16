# Tasks: plan de FirmaYa

Las tareas del proyecto, por etapa. **Este archivo es la fuente de verdad**: lo lee el
tablero del portafolio, y una tarea existe cuando está escrita acá.

Cada tarea es una línea. Entre corchetes van quién la hace (`[carlos]` o `[agente]`),
la prioridad si no es la normal (`[alta]`, `[baja]`), `[definir]` si antes Carlos
tiene que decidir algo y `[en curso]` mientras se hace. Al final, entre paréntesis, de
qué depende, cuánto lleva y entre qué fechas va:

    - [ ] T041 [carlos] [alta] Llamar al plomero (depende de T040) (estimación 2h) (2026-10-20 a 2026-10-22)

Una tarea nueva lleva el número que sigue al más alto del archivo y va bajo su etapa. Al
terminarla se marca `[x]`; no se borra.

## Definición

- [x] T001 [agente] Borrar la primera versión, programada sin especificación
- [x] T002 [agente] Preparar el repositorio con la metodología de spec driven development
- [ ] T003 [carlos] [alta] Contarle el producto al agente para el paso 1 de la primera capacidad
- [ ] T004 [agente] [alta] Especificar la primera capacidad con /speckit-specify y /speckit-clarify (depende de T003)
- [ ] T005 [carlos] [alta] Aprobar la especificación de la primera capacidad (depende de T004)
