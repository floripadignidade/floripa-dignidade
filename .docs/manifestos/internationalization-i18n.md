# 🌐 MANIFIESTO DE INTERNACIONALIZACIÓN UNIVERSAL Y ANIDACIÓN MULTI-IDIOMA (OEDP-V18.1 / ADR 0030)

**Estado:** VIGENTE / LEY ABSOLUTA (Reemplaza la convención plana de OEDP-V11.0 y las notas
preliminares de `architecture.md` y `functional-atomicity.md`)  
**Referencia:** ADR 0030  
**Normas Aplicadas:** BCP 47 (RFC 5646), ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010
(Mantenibilidad, Portabilidad y Confiabilidad)  
**Objetivo:** Garantizar que cada módulo y aplicación del ecosistema opere bajo una estructura de
**carpetas por idioma** validada por Zod, inicialmente con `pt-BR`, `es-ES` y `en-US`, pero diseñada
para escalar a **N idiomas** sin refactorizar lógica ni duplicar enumeraciones.

---

## 1. Doctrina del Silo Lingüístico Descentralizado

1. **Propiedad Modular:** Ningún archivo gigante escrito a mano puede concentrar las traducciones de
   todo el monorepo. Cada dominio, motor o ruta de aplicación es dueño de su propio directorio
   `i18n/`.
2. **Idioma Fuente de Verdad (Source Locale):** `pt-BR` es el idioma canónico base. Toda clave nueva
   nace en `pt-BR` y su esquema Zod asociado antes de propagarse a los demás idiomas.
3. **Cero Textos Hardcoded:** Todo texto visible por humanos, mensaje de correo, etiqueta ARIA o
   error de usuario debe provenir de un diccionario validado por Zod.

---

## 2. Topología Física Canónica: Carpeta por Idioma (`i18n/<bcp47-locale>/`)

Todo módulo o segmento de aplicación debe estructurar sus traducciones con **una carpeta por cada
código BCP 47 habilitado** y archivos separados por **namespace funcional**:

```text
<modulo-o-ruta>/i18n/
├── schemas/
│   ├── Common.i18n.schema.ts         # Contrato Zod para common.json
│   └── [Namespace].i18n.schema.ts    # Contrato Zod específico del dominio o página
├── pt-BR/                            # Idioma raíz de verdad (obligatorio)
│   ├── common.json
│   └── [namespace].json
├── es-ES/                            # Mismo conjunto exacto de archivos que pt-BR
│   ├── common.json
│   └── [namespace].json
├── en-US/                            # Mismo conjunto exacto de archivos que pt-BR
│   ├── common.json
│   └── [namespace].json
└── [cualquier-bcp47]/                # Ej: fr-FR, ht-HT, de-DE (expansión N idiomas)
    ├── common.json
    └── [namespace].json

    Reglas de Compatibilidad Transicional (Zero-Regression)
Los silos legados en formato plano (i18n/pt-BR.json, i18n/es-ES.json, i18n/en-US.json) permanecen soportados por el motor Weaver durante la migración gradual.
Todo silo nuevo o refactorizado debe adoptar obligatoriamente la estructura de carpeta por idioma (i18n/<locale>/<namespace>.json).
3. Única Fuente de Verdad (SSOT) para Locales y Escalabilidad a N Idiomas
Queda estrictamente prohibido repetir z.enum(['pt-BR', 'es-ES', 'en-US']), switch (locale) o mapas manuales de idiomas en librerías, hooks o páginas.
Catálogo Único en @floripa-dignidade/contracts:
Define SUPPORTED_LOCALES_REGISTRY (código BCP 47, etiqueta nativa, dirección ltr/rtl, isEnabledBoolean, fallbackLocaleIdentifier).
Exporta SupportedLocaleSchema y DEFAULT_LOCALE_IDENTIFIER = 'pt-BR' derivados dinámicamente del catálogo.
Consumidores Dinámicos:
core/routing, modules/newsletter, shared/state-store, libs/tools/i18n-builder y apps/floripa-dignidade consumen exclusivamente el catálogo SSOT.
El selector de idioma (LanguageSwitcher) renderiza dinámicamente las opciones activas del registro.
Protocolo de Alta de un Nuevo Idioma (O(1)):
Registrar la nueva entrada BCP 47 en SUPPORTED_LOCALES_REGISTRY.
Crear la carpeta i18n/<nuevo-locale>/ en cada silo replicando la estructura de i18n/pt-BR/ (manualmente o vía puente de traducción asistida).
Ejecutar pnpm weaver:build para compilar y certificar paridad estructural al 100%.
4. Contrato de Anidación en el Diccionario Compilado (Weaver Output)
El compilador Weaver (libs/tools/src/lib/i18n-builder/) escanea tanto libs/ como apps/ (excluyendo el directorio de salida generado) y construye un JSON consolidado por cada idioma activo en apps/floripa-dignidade/src/app/i18n/dictionaries/<locale>.json (y opcionalmente artefactos divididos por ruta):
JSON
{
  "core": {
    "exceptions": { ... },
    "telemetry": { ... }
  },
  "shared": {
    "ui-contracts": {
      "header": { ... },
      "newsletterForm": { ... }
    }
  },
  "modules": {
    "messaging-engine": { ... },
    "whatsapp-communication-service": { ... }
  },
  "apps": {
    "floripa-dignidade": {
      "frontpage": { ... },
      "observatorio": { ... },
      "newsletterWelcome": { ... }
    }
  }
}
Reglas de Identidad y Anidación
Clave basada en dominio real: La identidad del silo se deriva del nombre oficial del workspace/app y namespace, nunca mediante cortes ciegos de ruta como .slice(0, 2) ni exponiendo segmentos técnicos (src, lib).
Nomenclatura ISO dentro del JSON:
Textos de UI/dominio en camelCase descriptivo (headlineTitleLiteral, submitButtonLiteral, sin abreviaturas).
Códigos de log/error en UPPER_SNAKE_CASE.
Prohibido introducir metáforas informales en nuevos literales técnicos.
5. Validación Fail-Fast y Resiliencia en Runtime (Cero 404)
Aduana en Compilación (pnpm weaver:build):
Cada <namespace>.json debe superar su esquema Zod correspondiente y mantener paridad exacta de claves frente a pt-BR.
Si falta una clave en un idioma activo o el JSON está corrupto, el Weaver aborta el pipeline de CI/CD antes del despliegue.
Cascada de Fallback en Runtime (Inmunidad de Layout y Páginas):
Ningún layout o página debe colapsar con notFound() o pantalla en blanco por ausencia de una clave secundaria de traducción.
Orden de resolución obligatorio: locale solicitado → idioma base sin región → pt-BR → fallback institucional inmutable en memoria, emitiendo siempre una señal WARNING a EmitTelemetrySignal.
6. Obligación de la IA (Quality Gate)
Ante cualquier creación o refactorización de módulos con interacción humana, la IA debe:
Utilizar la estructura i18n/<locale>/<namespace>.json + i18n/schemas/<Namespace>.i18n.schema.ts.
Entregar simultáneamente los diccionarios base (pt-BR, es-ES, en-US) validados contra el esquema Zod.
Verificar que no existan listas de idiomas hardcodeadas fuera del catálogo SSOT.

---

```
