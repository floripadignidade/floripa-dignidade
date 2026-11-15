# 04. PERIÓDICO CÍVICO DE TRANSPARENCIA POR SECRETARÍAS Y HERO CARRUSEL EDITORIAL

**Código:** ADR 0035 / OEDP-V18.1  
**Estado:** VIGENTE / NORMA TÉCNICA  
**Ámbito de Aplicación:** `apps/floripa-dignidade`, `apps/content-manager-system`,
`@floripa-dignidade/contracts`, `@floripa-dignidade/shared-ui-foundry`,
`@floripa-dignidade/shared-ui-contracts`, `@floripa-dignidade/telemetry`  
**Normas de Referencia:**

- **W3C WCAG 2.2 Nivel AAA:** Criterios 1.4.3/1.4.6 (Contraste visual $\ge 7:1$), 2.1.1/2.1.2
  (Operabilidad total por teclado), 2.2.2 (_Pause, Stop, Hide_ para contenido en movimiento), 2.5.5
  (Área de destino táctil mínima $\ge 44\times 44\text{px}$).
- **W3C WAI-ARIA Authoring Practices Guide (APG):** _Carousel Pattern (Tabbed Carousel & Rotator)_.
- **ISO/IEC 11179:** Metadata Registry & Naming Conventions (Objeto + Propiedad + Representación).
- **ISO/IEC 25010:** Systems and Software Quality Requirements and Evaluation (Usabilidad,
  Rendimiento y Mantenibilidad).
- **Core Web Vitals Next.js 16:** Largest Contentful Paint (LCP $\le 1.2\text{s}$), Cumulative
  Layout Shift ($\text{CLS} = 0$), Interaction to Next Paint (INP $\le 200\text{ms}$).
- **Marco Legal de Transparencia:** Lei Federal 12.527/2011 (LAI) y Lei Federal 13.019/2014 (MROSC).

**Objetivo Técnico:** Gobernar la arquitectura, diseño visual de primera plana, accesibilidad
universal y rendimiento a 120 FPS del **Periódico Cívico de Transparencia Activa**
(`/[locale]/transparencia`), especificando el funcionamiento del **Hero Carrusel de Noticias**
(intervalos de 5 segundos, transiciones de fundido cruzado con arrastre suave, fotografías remotas
de fondo, velos oscuros de contraste AAA, botones "Leia mais", controles táctiles laterales y pausa
obligatoria), así como los **Cuadernos Editoriales por Secretaría Municipal**.

---

## 1. Misión y Fundamento Técnico (El Porqué)

La transparencia pública no debe presentarse como un mar estéril de tablas incomprensibles. Para que
la ciudadanía fiscalice con eficacia el destino de los recursos públicos en Florianópolis, la
información fiscal debe estructurarse bajo un **lenguaje periodístico claro, editorializado y
organizado por secretarías municipales ejecutadas**.

La cabecera de esta edición cívica exige un **Hero Carrusel de Impacto** que capture la atención
inmediata del visitante, destacando las investigaciones y boletines más urgentes generados desde el
CMS. Sin embargo, un carrusel dinámico en la web es susceptible de inducir problemas críticos de
accesibilidad (distracción para personas con TDAH o trastornos vestibulares) y degradación de Core
Web Vitals (LCP retrasado por imágenes pesadas y saltos de layout CLS).

Este estándar define los requisitos biomecánicos, visuales, contractuales y de rendimiento para que
el carrusel y los cuadernos sectoriales operen con rigor industrial sin excepciones.

---

## 2. Reglas de Inviolabilidad (Leyes de Oro / Prohibiciones)

1. **Pausa y Control Obligatorio de Movimiento (WCAG 2.2 SC 2.2.2):**
   - Queda estrictamente prohibido implementar un carrusel con auto-avance que no pueda ser pausado
     por el usuario.
   - Es mandatorio proveer un botón visible y accesible (`aria-label="Pausar rotação automática"` /
     `"Retomar rotação automática"`).
   - El carrusel debe pausar automáticamente la rotación al recibir eventos `:hover` de cursor,
     `:focus-within` de teclado, o cuando el sistema operativo señale
     `prefers-reduced-motion: reduce`.
2. **Presupuesto Temporal de Rotación:**
   - La duración de cada diapositiva en modo automático está fijada exactamente en **5.000
     milisegundos** (`5 segundos`). Cualquier intervalo inferior a 4 segundos se considera una
     violación ergonómica por no permitir la lectura completa del titular.
3. **Contraste Visual Nivel AAA ($\ge 7:1$) sobre Fotografías:**
   - Queda prohibido renderizar textos institucionales o botones directamente sobre fotos sin un
     velo protector.
   - Toda diapositiva debe aplicar una capa de gradiente cenital u oblicuo con tokens
     institucionales oscuros (`#002244` / `#0F172A`) con opacidad calculada para certificar una
     relación de contraste mínima de **$7:1$** entre el texto blanco (`#FFFFFF`) o botón ámbar de
     texto oscuro y la imagen de fondo.
4. **Erradicación de Saltos de Layout ($\text{CLS} = 0$):**
   - El contenedor del carrusel Hero debe mantener una altura fija o relación de aspecto estructural
     bloqueada (`min-h-[520px] lg:min-h-[620px]` o `aspect-[16/9]`).
   - La primera imagen (`slideIndex === 0`) se carga con `fetchPriority="high"` y `loading="eager"`.
     Las imágenes subsiguientes emplean `loading="lazy"`.
5. **Semántica ARIA APG Inviolable:**
   - El contenedor principal declara `role="region"`, `aria-roledescription="carousel"` y
     `aria-label="Notícias em Destaque da Transparência"`.
   - Las diapositivas declaran `role="group"`, `aria-roledescription="slide"` y
     `aria-label="Notícia X de Y"`.
   - Las diapositivas ocultas deben quedar marcadas con `aria-hidden="true"` y contener enlaces
     desactivados de la navegación por tabulación (`tabIndex={-1}` o atributo `inert`) para no
     desorientar a usuarios de lectores de pantalla.

---

## 3. Especificación Técnica y Contratos Estructurales

### 3.1. Anatomía Visual y Biomecánica del Hero Carrusel

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│  [◄ Flecha Anterior (44x44)]                       [Botón Pausa/Play]   [Flecha ►]│
│                                                                                  │
│   FOTOGRAFÍA DE FONDO (next/image optimizada WebP/AVIF desde media-vault S3)     │
│   + Velo de Gradiente Degradé (#002244 / rgba(0, 34, 68, 0.88))                  │
│                                                                                  │
│   [Insignia Editorial: VERIFIED_AUDIT • Assistência Social]                      │
│   TITULAR H2 PRINCIPAL EN LEXEND (clamp fluido 32px -> 56px)                     │
│   Resumen periodístico en Inter (máx. 3 líneas balanceadas)                      │
│   Fecha oficial de publicación • Diário Oficial / Portal PMF                      │
│                                                                                  │
│   ┌──────────────────────────┐   ┌─────────────────────────────┐                 │
│   │ [Leia mais da notícia]   │   │ [Ver gastos no Observatório]│                 │
│   └──────────────────────────┘   └─────────────────────────────┘                 │
│                                                                                  │
│   [Indicadores de Posición: • • ○ •]  (Barra de progreso visual 5s animada)      │
└──────────────────────────────────────────────────────────────────────────────────┘

---

3.2. Parámetros de Transición Visual (Fade + Desplazamiento Acelerado por GPU)
Duración de la transición: 600ms con curva de aceleración cubic-bezier(0.16, 1, 0.3, 1)
(desaceleración suave).
Transformación física:
Diapositiva entrante: opacity: 0 -> 1, transform: translateX(24px) -> translateX(0).
Diapositiva saliente: opacity: 1 -> 0, transform: translateX(0) -> translateX(-24px).
En dispositivos con prefers-reduced-motion: reduce: transform se suprime, aplicando
únicamente transición de opacidad pura.
Aceleración por hardware: Se aplica will-change: transform, opacity exclusivamente durante la
animación activa y se retira al finalizar para no sobrecargar la memoria de la GPU en móviles.
3.3. Controles Interactivos y Ergonomía Táctil (WCAG 2.5.5)
Flechas Laterales (Navegación Manual):
Dimensiones mínimas del contenedor de toque:
48
×
48
px
48×48px
 (área de contacto
superior a la exigencia base de 44px).
Estados de interacción: desenfoque de cristal (backdrop-blur-md), superficie blanca
semitransparente con texto oscuro o contraste invertido, anillo de foco visible
focus-visible:ring-4 focus-visible:ring-amber-500.
Evento de activación: reinicia el temporizador de 5 segundos para que la diapositiva
seleccionada permanezca visible el tiempo reglamentario completo.
Botón "Leia mais" (Llamada a la Acción):
Enlace semántico hacia /[locale]/prensa/[slug] o hacia el boletín específico.
En noticias vinculadas a gastos públicos, se complementa con un botón secundario hacia
/[locale]/observatorio/gastos-publicos.
3.4. Cuadernos Sectoriales por Secretaría Municipal
Bajo el carrusel Hero de primera plana, la página despliega el cuerpo periodístico dividido en
cuadernos:
Barra de Filtros Rápida por Secretaría (Sticky / Navegable):
Pestañas conmutables para Todas as Secretarias o filtros dedicados (Assistência Social,
Saúde, Educação, Infraestrutura e Habitação).
Tarjeta de Cuaderno Editorial:
Resumen ejecutivo del período de la secretaría redactado por el equipo de fiscalización.
Indicador de partidas orçamentarias relacionadas.
Colección de boletines con fecha, estado documental (VERIFIED_AUDIT, MONITORING_ACTIVE,
CRITICAL_ALERT) y enlace al detalle.
Pie Metodológico LAI / MROSC:
Bloque accesible de rendición de cuentas explicando cómo se verifican las fuentes oficiales y
cómo se protegen las identidades de informantes bajo la LGPD.
4. Matriz de Compatibilidad y Mitigación de Regresiones
Dimensión	Riesgo Técnico / Falla Detectada	Mitigación Obligatoria
Rotación en Lectores de Pantalla	Anuncios verbales inesperados cada 5 segundos que saturan al usuario invidente.	Mantener aria-live="off" en el contenedor durante la reproducción automática; conmutar a aria-live="polite" únicamente ante navegación manual explícita.
Pérdida de Foco de Teclado	El foco salta dentro de una diapositiva que acaba de ocultarse por rotación.	Pausar inmediatamente la rotación en cuanto el foco ingrese a cualquier elemento del carrusel (onFocusCapture / :focus-within).
LCP Degradado en Móvil	Cargar fotos de alta resolución (1920px) en pantallas pequeñas de 360px.	Exigir sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1280px" para que next/image descargue la variante standard_card (800px) o responsive.
Fallo en Fotos Remotas	Supabase Storage no configurado en next.config.js arrojando error 500 en producción.	Configurar images.remotePatterns para Supabase Storage en apps/floripa-dignidade/next.config.js.
Ausencia de Noticias en CMS	Base de datos vacía o servicio no disponible dejando el Hero en blanco.	Inyectar FALLBACK_ARTICLE_SPECS desde TransparencyPageFallbackDictionaries.ts con telemetría de advertencia.

---


```
