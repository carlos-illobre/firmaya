# Decisiones de negocio

Lo que Carlos decidió sobre qué tiene que hacer el producto, por fecha. Es el par de los
[ADR](adr/README.md), que guardan las decisiones técnicas. Cada decisión está además en la
especificación que toca (`specs/`). Una decisión nueva se agrega acá con su fecha; las
anteriores no se reescriben: si una cambia, se agrega la nueva y se anota a cuál reemplaza.

## Decisiones del 2026-10-16

1. El proyecto empieza de cero: se borró la primera versión, que se había programado sin
   especificación.
2. Se desarrolla con la misma metodología de spec driven development que `ferre` y
   `cocinadas`.
3. Es el proyecto de menor prioridad del portafolio, después de todos los demás.

## Decisiones del 2026-10-16 (primera descripción del producto)

4. FirmaYa es una aplicación de **firma electrónica** en la línea de DocuSign, y **solo
   eso**: ninguna otra capacidad fuera de la firma.
5. Está **orientada a abogados**.
6. El aspecto gráfico tiene que ser mejor que el de DocuSign: una paleta de colores **más
   llamativa pero profesional**, pensada para abogados.
7. La navegación tiene que ser **sencilla** y las opciones **fáciles de encontrar**.

## Decisiones del 2026-10-16 (respuestas para la especificación 001)

8. Por ahora es **gratis**: no paga nadie y no hay cobro en esta versión. **No hay roles.**
9. Los firmantes firman **desde un enlace**, sin cuenta, y el enlace es lo único que se les
   pide para identificarse.
10. Tiene que valer en **Argentina**. Esta versión es de **firma electrónica simple**; la
    **firma digital** queda para una versión posterior.
11. Se suben **PDF y Word**, que se convierte. El tamaño máximo es **el mismo que DocuSign**.
12. Entran **todos los campos** (firma, iniciales, fecha, nombre, casilla, texto libre) y las
    **tres formas de firmar** (dibujar, escribir, subir una imagen).
13. Con varios firmantes, firman **todos a la vez**, y hay **copias para todos**, también para
    quien solo recibe.
14. El firmante puede **rechazar** y el abogado puede **anular**.
15. Hay **recordatorios** automáticos y **fecha de vencimiento**.
16. Al terminar se entrega **solo el PDF** firmado; el certificado llega con la firma digital.
17. Las **plantillas** entran en esta versión, y también el **panel** con estados y buscador.
18. Los documentos **duran hasta que el abogado los borra**.
19. **Solo computadora**; en el teléfono, solo ver el seguimiento y el estado de los
    documentos.
20. Idiomas: **español, inglés y portugués**.
21. Los colores, que se los muestre como **opciones** para elegir.
22. El abogado entra **solo con su cuenta de Google**.
23. El firmante **puede firmar desde el teléfono**.
24. Por cada paso de cada firmante se guarda **fecha y hora, IP y navegador**; el abogado lo
    ve en el detalle y no se envía.
25. **Lo primero es la interfaz y que funcione.** Los aspectos legales se le vuelven a
    preguntar cuando esté definida la interfaz. Con esto aprueba la especificación 001.
26. Del panel elige la **variante A, marino y oro**, con el menú a la izquierda: a los
    abogados les gusta tener todas las opciones a mano y que no estén escondidas.
27. Aprueba las maquetas de la firma electrónica, con un solo cambio: **la letra no tiene
    que ser con serifa**. Se usa Inter, o la letra del sistema.
