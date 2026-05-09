/**
 * @section Shared UI DNA - Global Type Sanctuary
 * @description Inyección de tipos ambientales para el motor de Next.js 16+,
 * React 19 y librerías de interfaz de terceros. Centraliza la visibilidad de
 * activos no-TypeScript y puentes de compatibilidad de ecosistema.
 *
 * Protocolo OEDP-V17.0 - Zenith Architecture Standard.
 * SANEADO Zenith: Erradicación de Triple-Slash References (Fix @typescript-eslint)
 * y normalización de rastro semántico ISO.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * 🛡️ LEY DE VISIBILIDAD: Inyecta los tipos globales de Next.js.
 * Necesario para el soporte de metadatos y optimización de imágenes en el búnker.
 */
/// <reference types="next" />
/// <reference types="next/types/global" />

import type React from 'react';

/**
 * @section Puentes Ambientales (Ambient Module Bridges)
 * @description Autoriza la importación de librerías con exportaciones ESM
 * complejas, previniendo el colapso TS7016 (Implicit Any).
 */
declare module '@radix-ui/react-navigation-menu';
declare module '@radix-ui/react-slot';
declare module 'clsx';
declare module 'framer-motion';
declare module 'lucide-react';
declare module 'tailwind-merge';

/**
 * @section Soporte de Estilos Globales (CSS Modules)
 * @description Permite la resolución de archivos CSS como módulos de diseño.
 */
declare module '*.css' {
  /** Mapeo inmutable de selectores de clase inyectados por el compilador. */
  const styleSelectorsMapping: Record<string, string>;
  export default styleSelectorsMapping;
}

/**
 * @section Soporte Vectorial (SVG)
 * @description Habilita el tratamiento de SVGs como componentes de React
 * o como rutas físicas para el motor de activos.
 */
declare module '*.svg' {
  /** Representación del activo como componente funcional (Lucide-ready). */
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { readonly title?: string }
  >;

  /** Ruta física del recurso estático (Sovereign Path Literal). */
  const assetSourcePathLiteral: string;
  export default assetSourcePathLiteral;
}

/**
 * @section Soporte Multimedia (Activos Binarios)
 */
declare module '*.png' { const assetSourcePathLiteral: string; export default assetSourcePathLiteral; }
declare module '*.jpg' { const assetSourcePathLiteral: string; export default assetSourcePathLiteral; }
declare module '*.jpeg' { const assetSourcePathLiteral: string; export default assetSourcePathLiteral; }
declare module '*.webp' { const assetSourcePathLiteral: string; export default assetSourcePathLiteral; }
declare module '*.avif' { const assetSourcePathLiteral: string; export default assetSourcePathLiteral; }
