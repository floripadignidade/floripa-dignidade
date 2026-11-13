**Estado:** Aceptado  
**Fecha:** 19 de Abril, 2026  
**Contexto:** En un sistema "Lego" masivo, la ambigüedad es el enemigo. Este documento establece las
reglas de comunicación escrita dentro del código para la ONG Floripa Dignidade.

---

## 🛡️ 1. La Regla de Oro: "Zero Abbreviations" (Prosa Code)

El código debe leerse como literatura técnica. Queda estrictamente prohibido el uso de
abreviaciones, acrónimos (salvo los estándares de la industria como UI, SEO, API) o nombres
crípticos.

- ❌ `src`, `auth`, `intl`, `msg`, `btn`, `err`, `qty`, `nav`.
- ✅ `source`, `authentication`, `internationalization`, `message`, `button`, `error`, `quantity`,
  `navigation`.

**Ejemplo de Dominio:**

- ❌ `complaintMsg`
- ✅ `humanRightsComplaintMessage`

---

## 🏷️ 2. Nomenclatura Estricta (Convenciones)

### A. Archivos y Directorios

1. **Aparatos Lego (Componentes UI):** `PascalCase` (Ej: `NewsArticleCard.tsx`,
   `SubscriptionForm.tsx`).
2. **Lógica y Utilidades (Functions):** `camelCase` (Ej: `validateBrazilianDocument.ts`).
3. **Estructura de Workspace (Nx):** `kebab-case` (Ej: `libs/modules/newsletter-engine`).
4. **Configuraciones:** `kebab-case` (Ej: `tailwind.config.js`).

### B. Variables y Tipado

1. **Constantes Globales:** `UPPER_SNAKE_CASE` (Ej: `MAXIMUM_RETRY_ATTEMPTS`).
2. **Interfaces y Types:** `PascalCase`. Deben ser nombres descriptivos que expliquen el flujo.
   - ✅ `NewsArticleSubscriptionRequest`
   - ❌ `SubData`
3. **Booleanos:** Deben comenzar con un verbo interrogativo (`is`, `has`, `should`, `can`).
   - ✅ `isVerificationPending`
   - ❌ `verified`

---

## 🤖 3. Auditoría IA y Cumplimiento

Este ADR no es sugerencia, es ley técnica. El bloque `@core-ai-audit-brain` tiene la potestad de:

1. **Rechazar Pull Requests:** Si detecta variables de menos de 4 caracteres (salvo en iteradores
   `i`, `j`).
2. **Sugerir Refactorización:** Si un componente excede las 150 líneas, indicando que el "Aparato
   Lego" debe ser subdividido.
3. **Validar Boundaries:** Asegurar que las etiquetas en `project.json` coincidan con la ruta del
   archivo.

---

## 🌍 4. Internacionalización (i18n) en Código

Nunca se debe escribir texto estático (Hardcoded) dentro de los componentes.

- **Mala Práctica:** `<span>Enviar Denuncia</span>`
- **Buena Práctica:** `<span>{translations.complaint.submitButton}</span>`

Cada "Aparato" debe prever su integración con el `tools-i18n-builder` para que los diccionarios sean
granulares y el código permanezca puro.

---

## 🔗 6. Exportaciones (Barrels)

Solo se permite un punto de entrada por librería: el archivo `index.ts` en la raíz de `src/`. Esto
evita que otros módulos accedan a las "tripas" de una pieza Lego, respetando el **Principio de
Encapsulamiento**.

---
