# 🎭 Shared UI Foundry Bunker: The Render Layer

**Estatus:** Zenith (OEDP-V17.0)  
**Rol:** Capa 2 de Implementación Visual (React/Next.js Implementation).  
**Jurisdicción:** Lado del Cliente (DOM Aware).  
**Tags:** `scope:shared`, `type:ui`, `platform:web`

## 🎯 1. Misión Ontológica

Este búnker es el único lugar autorizado para la fundición física de componentes React 19. Su misión
es tomar el **ADN** (`shared-design-system`) y los **Planos** (`shared-ui-contracts`) para construir
la piel visual del ecosistema.

## 🏗️ 2. Arquitectura de Construcción

- **`lib/atoms/`**: Unidades de interacción mínima (Botones, Logos).
- **`lib/molecules/`**: Ensambles de átomos (Buscadores, Cards).
- **`lib/organisms/`**: Bloques complejos vinculados a la lógica de la ONG.

## 🛡️ 3. Reglas de Hierro

1.  **Cero Lógica de Negocio**: Los componentes solo reciben datos purificados y emiten telemetría.
2.  **Soberanía de Estilos**: Se prohíbe el uso de colores en duro; solo se consumen tokens del
    Design System.
3.  **Accesibilidad Mandatoria**: Todo componente debe implementar el contrato ARIA definido en los
    contratos.
