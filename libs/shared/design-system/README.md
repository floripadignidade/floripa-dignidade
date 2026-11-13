# 🎨 Shared Design System Bunker: The Visual DNA

**Estatus:** Zenith (OEDP-V17.0)  
**Rol:** Capa 0 de Cimentación Visual (Single Source of Truth).  
**Jurisdicción:** Isomórfica (Browser/Node/Edge).  
**Tags:** `scope:shared`, `type:logic`, `platform:isomorphic`

## 🎯 1. Misión Ontológica

El `@floripa-dignidade/shared-design-system` es el búnker encargado de dictar la "Verdad Cromática y
Estructural" de todo el ecosistema. Su responsabilidad es puramente lógica: define constantes,
tokens de diseño y esquemas de integridad visual (Zod) sin depender de ninguna librería de
renderizado (como React o DOM).

Este búnker garantiza que la identidad de la ONG sea inalterable y auditable, permitiendo que tanto
el CMS, los scripts de automatización como las aplicaciones finales compartan el mismo ADN visual.

## 🏗️ 2. Arquitectura de Tokens (Atomic Foundations)

Para cumplir con el estándar **Zenith**, el búnker se organiza en unidades de verdad independientes:

- **`lib/tokens/`**: Contiene los literales físicos de color, espaciado y tipografía (ej.
  `GLOBAL_COLOR_DEFINITION`).
- **`lib/schemas/`**: Define las "Aduanas de ADN" vía Zod. Garantiza que cualquier color o escala
  tipográfica cumpla con los formatos ISO antes de ser procesada.

## 🛡️ 3. Estándares ISO y Calidad

- **ISO/IEC 11179**: Nomenclatura descriptiva (ej: `primaryBrandColorHex` en lugar de `pColor`).
- **Branded Types**: Uso de sellos nominales en TypeScript para evitar la "Obsesión por los
  Primitivos". Un color no es un `string`, es un `IColorHex`.
- **Zero Dependencies**: Este búnker tiene prohibido importar dependencias de UI (React, Lucide,
  Radix) para mantener un Tree-shaking del 100% y latencia cero de compilación.

## 🚀 4. Protocolo de Consumo

Este búnker es la base del enjambre visual. Su flujo de consumo es:

1.  **UI Foundry**: Lo usa para aplicar estilos en componentes React.
2.  **Tailwind Config**: Lo usa para inyectar los colores institucionales en el motor de CSS.
3.  **Content Manager (CMS)**: Lo usa para validar los selectores de color en el panel
    administrativo.

## 🤖 5. Auditoría por IA (Neural Sentinel Ready)

Cualquier modificación en los esquemas de este búnker disparará una alerta de "Cambio de ADN
Global". El `Neural Sentinel` invalidará cualquier Pull Request que intente introducir colores fuera
de la escala hexadecimal autorizada o abreviaturas en los tokens.

---

"La consistencia visual es el primer lenguaje de la transparencia social."
