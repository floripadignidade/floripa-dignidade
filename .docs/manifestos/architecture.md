# Manifiesto Arquitectónico: Floripa Dignidade (Sistema Lego)

**Fecha:** Febrero 2024 **Versión:** 1.0.0 **Arquitecto:** Equipo de Ingeniería Floripa Dignidade
**Stack Base:** Nx Monorepo, pnpm, Next.js (React), Tailwind CSS, TypeScript, Zod, Jest.

## 1. Visión General y Filosofía (El Sistema "Lego")

La arquitectura del monorepo de Floripa Dignidade no se basa en una estructura tradicional donde la
aplicación contiene toda la lógica. Se basa en un **Sistema Lego (Domain-Driven Design en Nx)**.

La aplicación `apps/blog-noticias` es únicamente una "carcasa de ensamblaje" (shell). Todo el valor
de negocio, lógica, UI y esquemas vivirán en `libs/` (Librerías/Aparatos).

**Principios Inquebrantables:**

1. **Desacoplamiento Absoluto:** Cada módulo debe ser capaz de ser exportado a otro repositorio sin
   romperse.
2. **SOLID & DRY:** Responsabilidad única por librería. Ninguna lógica de negocio se repite.
3. **Auditoría Nativa:** Cada módulo debe tener un 100% de cobertura en sus contratos (Zod) y lógica
   (Jest).

---

## 2. Topología del Monorepo

El workspace gestionado por `pnpm` se divide en tres ecosistemas principales:

```text
floripa-dignidade/
├── apps/                 # Consumidores finales (Next.js, APIs de ensamblaje)
│   └── blog-noticias/    # App Router que ensambla las librerías
├── libs/                 # El sistema Lego (Los Aparatos)
│   ├── core/             # Bloques base transversales (Observabilidad, Errores)
│   ├── shared/           # UI genérica (Botones, Inputs) y utilidades puras
│   └── modules/          # Dominios de negocio (Ej. Newsletter, Artículos)
├── tools/                # Scripts de automatización y pre-builds
└── .docs/                # Manifiestos y ADRs (Architecture Decision Records)
3. Fase 1: Bloques Base (Core & Observability)
Antes de construir funcionalidades, el sistema se asienta sobre 4 pilares fundamentales de observabilidad que cualquier otro módulo debe consumir. Estos viven en libs/core/:
@floripa/core-logger: Único punto de entrada para logs (consola, Datadog, Sentry, etc.). Ningún console.log está permitido en el monorepo.
@floripa/core-errors: Clases de error estandarizadas. Gestión de excepciones seguras para no exponer lógica interna al cliente.
@floripa/core-metrics: Recolector de telemetría y performance (Web Vitals y rendimiento de algoritmos lógicos).
@floripa/core-health: Algoritmo global que orquesta la salud general del sistema, verificando conexiones a BBDD, APIs de terceros (Resend) y estado de los módulos.
4. Fase 2: Arquitectura de un Módulo de Dominio (Ej. Newsletter)
Los dominios de negocio son aparatos autocontenidos. Tomando como ejemplo el módulo de Newsletter, su estructura interna en libs/modules/newsletter/ se divide granularmente:
code
Text
libs/modules/newsletter/
├── feature/              # Server Components de Next.js (El punto de entrada)
├── ui/                   # Web Components / Client Components (Botones de suscripción)
├── data-access/          # Lógica de conexión externa (Integración con Resend API)
├── schemas/              # Zod schemas para validación de emails y DTOs
└── i18n/                 # JSONs granulares por idioma (pt, es, en)
    ├── pt.json
    └── es.json
Flujo del Módulo:
El UI (Client Component) captura el correo.
Se valida localmente e instantáneamente con @floripa/newsletter-schemas (Zod).
Se envía al Server Action / API Route en el feature/.
El data-access gestiona el envío seguro a través de Resend, encapsulando las credenciales.
Todo es monitoreado por @floripa/core-logger y @floripa/core-metrics.
5. Gestión de i18n y Tooling (Scripts Workspace)
Para mantener el principio de cohesión, las traducciones de un módulo viven dentro del propio módulo (como se ve en el árbol anterior), no en una carpeta global gigante.
Para que Next.js o la librería next-intl / i18next pueda consumirlas eficientemente, implementamos un ecosistema de scripts en tools/scripts/i18n-builder/.
Comportamiento Pre-build: Durante el comando pnpm build, un script de Node.js recorre recursivamente todos los directorios libs/modules/**/i18n/*.json.
Ensamblaje: Extrae los esquemas de diccionario, valida con Zod que no falten claves en diferentes idiomas, y genera de forma automatizada los diccionarios unificados en .cache/i18n-dictionaries/ que la app principal consumirá.
6. Reglas de Gobierno y Linting (Module Boundaries)
Para asegurar que un desarrollador júnior o futuro contribuyente no rompa el desacoplamiento, usaremos @nx/eslint-plugin.
Se aplicarán las siguientes reglas en el archivo .eslintrc.json raíz:
Regla de Dependencia Unidireccional: Un ui no puede importar un feature. Un feature sí puede importar un ui.
Regla de Dominio Aislado: El módulo newsletter NO PUEDE importar nada directamente del módulo articles. Si necesitan comunicarse, deben hacerlo a través de eventos o un módulo shared-interfaces.
Regla de Core Público: Todos los módulos tienen permitido y alentado importar de libs/core/*.
7. Pruebas y Auditoría
Cada "aparato" (workspace/library) se prueba en aislamiento:
pnpm nx test core-health
pnpm nx lint modules-newsletter-ui

---


```
