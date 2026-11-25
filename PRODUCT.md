# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Dos públicos igual de importantes, ambos en Cochabamba (Cercado):

- **Jóvenes de 15 a 26 años** que buscan qué hacer hoy: dónde comer, salir, qué evento ir, con quién. Usan sobre todo el celular, con conexión a veces irregular. Deben poder usarlo "como un niño de 5 años": un gesto principal por pantalla y sin instrucciones.
- **Dueños de negocios locales chicos** (cafés, restaurantes, bares, ferias, organizadores de eventos) que quieren visibilidad y verse tan bien como una marca grande, sin pagar publicidad.

## Product Purpose

Lugabiz es la calle de Cochabamba hecha app: un lugar para descubrir negocios y eventos locales y decidir con un click si valen la pena. Existe para que el negocio más chico de la ciudad compita de igual a igual con uno grande, y para darle a la gente una vida útil con tecnología potente. Éxito = la gente interactúa (reacciona, va, guarda, arma planes) y los negocios ven resultados reales; la plataforma crece junto con ellos y con la ciudad.

## Positioning

**La ciudad decide con un click, y Lugabiz crece junto a los negocios.** La visibilidad no se compra: la ordena lo que opina la gente de Cochabamba (reacciones de un toque en jerga local, asistencia, planes). Una plataforma que cobra por posicionamiento no puede decir esto con verdad.

## Operating Context

- Uso principal en celular; pantallas grandes secundarias. Doble toque para reaccionar en móvil, íconos en pantallas grandes.
- Los negocios se registran y el sistema genera su presencia (cartel, promoción contextual) sin que tengan que diseñar nada.
- Flujo de dueño: Asesor de oportunidades → verificar identidad (CI + selfie) → publicar el negocio → documentos aprobados = insignia dorada.
- Funciones sociales: reacciones de un click (Al palo / Bien nomás / Ahí nomás), "Voy" a eventos, planes con amigos, pasaporte de sellos, "Ta' pues" del día.
- Backend en Supabase (Postgres, Auth, Storage, Realtime); recomendación tipo Netflix compartida entre web y móvil.

## Capabilities and Constraints

- **No se cobra a negocios ni por eventos** (por ahora). Sin entradas, sin publicidad pagada.
- **Solo Cochabamba (Cercado):** jerga, barrios y contenido locales; no se diseña para otras ciudades todavía.
- **Simple para un niño de 5 años y rápido:** botones táctiles ≥ 44 px, una acción principal por vista, peticiones por lote, sin animaciones que se muevan solas.
- **Votar sin login obligatorio:** se reacciona por dispositivo, con una invitación suave a registrarse; al iniciar sesión el voto se adopta, sin duplicarse.
- Lenguaje: tuteo corto y jerga boliviana ("Al palo", "Bien nomás", "Ta' pues"). El usuario rechazó la palabra "Jallalla" y la palabra "gratis" en el copy de captación de negocios.
- Decisiones de producto aún abiertas: si "Bien nomás"/"Ahí nomás" también existen en celular; plan con votación y mezcla de gustos tipo Spotify Blend (aprobadas, en spec).

## Brand Commitments

- Nombre: **Lugabiz**. Voz cercana, local y directa, sin tono corporativo.
- Identidad visual vigente ("Violeta Ciruela" + carteles estilo flyer de agencia): ya implementada en el código; Nueva York (flyers) y Times Square (escala, pantallas) son inspiración, nunca copia. Sin neón, sin ilustraciones dibujadas, sin cintas de texto en movimiento (el usuario las rechazó).

## Evidence on Hand

- Specs y memoria del proyecto en `docs/sdd/` (PROGRESS.md, SPEC-*.md, PLAN-*.md).
- No hay testimonios, clientes ni métricas de uso reales documentados: no inventar prueba social ni cifras.

## Product Principles

1. **La ciudad decide, no el dinero.** Ninguna función puede dar ventaja a quien paga; el orden sale de lo que opina la gente y de rotaciones justas.
2. **El negocio no trabaja para existir.** Registrarse alcanza: el sistema arma su cartel y su promoción contextual.
3. **Un gesto, una decisión.** Cada pantalla tiene una acción principal que un niño de 5 años entiende sin leer.
4. **Rápido primero.** Carga ligera, lotes en vez de ráfagas de peticiones, nada que se mueva por sí solo.
5. **Local de verdad.** Cochabamba en el lenguaje, los barrios y los planes; crecer junto a la ciudad.

## Accessibility & Inclusion

- Área táctil mínima de 44 px; contraste de texto ≥ 4.5:1 (grande ≥ 3:1); foco visible; `prefers-reduced-motion` respetado.
- Debe funcionar bien con conexión irregular en celulares de gama media.
- Alternativa accesible a todo gesto (el doble toque tiene un botón equivalente).
