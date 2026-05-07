/**
 * @section Application DNA - Global Asset & Infrastructure Declarations
 * @description Define el mapa de tipos para activos no-TypeScript y los puentes
 * de infraestructura necesarios para el correcto funcionamiento del compilador.
 * Garantiza la integridad del rastro de archivos CSS, imágenes, vectores y
 * variables de entorno del sistema operativo.
 *
 * Protocolo OEDP-V17.0 - Verbatim Module Syntax & High Performance Typings.
 * SANEADO Zenith: Erradicación de términos genéricos (content) e inyección de DNA Bridge.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type React from 'react';

/**
 * @section Soporte de Estilos Globales (CSS Modules)
 * @description Autoriza la importación de archivos CSS como objetos de diseño.
 * Erradica el colapso TS2882 permitiendo el uso de selectores tipados.
 */
declare module '*.css' {
  /** Colección inmutable de selectores de clase inyectados por el motor de estilos. */
  const styleSelectorsMapping: Record<string, string>;
  export default styleSelectorsMapping;
}

/**
 * @section Soporte Vectorial (SVG)
 * @description Permite tratar los SVGs como componentes funcionales de React 19+
 * o como rutas físicas para el motor de optimización de imágenes.
 */
declare module '*.svg' {
  /** Representación del activo como componente funcional (A11y Ready). */
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { readonly title?: string }
  >;

  /** Ruta física absoluta del recurso estático (Sovereign Path Literal). */
  const assetSourcePathLiteral: string;
  export default assetSourcePathLiteral;
}

/**
 * @section Soporte Multimedia (Activos Binarios)
 * @description Define la firma técnica para imágenes y formatos de alta definición.
 * Cumple con la norma ISO de nomenclatura de Objeto + Propiedad + Representación.
 */
declare module '*.png' { const assetSourcePathLiteral: string; export default assetSourcePathLiteral; }
declare module '*.jpg' { const assetSourcePathLiteral: string; export default assetSourcePathLiteral; }
declare module '*.jpeg' { const assetSourcePathLiteral: string; export default assetSourcePathLiteral; }
declare module '*.webp' { const assetSourcePathLiteral: string; export default assetSourcePathLiteral; }
declare module '*.avif' { const assetSourcePathLiteral: string; export default assetSourcePathLiteral; }

/**
 * @section Puente de Infraestructura: PostCSS
 * @description Define la firma estructural para el orquestador de estilos,
 * permitiendo que 'postcss.config.js' resuelva tipos sin dependencias externas.
 * SANEADO Zenith: Resolución del colapso TS2307.
 */
declare module 'postcss-load-config' {
  /** Interfaz de configuración mínima requerida por el motor PostCSS. */
  export interface Config {
    readonly plugins: Record<string, unknown>;
  }
}

/**
 * @section Declaraciones de Entorno (ProcessEnv)
 * @description Sincroniza el objeto 'process.env' con los secretos validados por la
 * Aduana de Entorno. Proporciona autocompletado y seguridad de tipos en Next.js.
 */
declare namespace NodeJS {
  /**
   * Contrato de identidad del hardware de ejecución.
   * Prohíbe la ceguera de tipos ante variables críticas de infraestructura.
   */
  interface ProcessEnv {
    // --- INFRAESTRUCTURA DE APLICACIÓN ---
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly NEXT_PUBLIC_SITE_URL: string;

    // --- SOBERANÍA CLOUD (Supabase) ---
    readonly SUPABASE_URL: string;
    readonly SUPABASE_SERVICE_ROLE_KEY: string;

    // --- COMUNICACIÓN (Resend/WhatsApp) ---
    readonly RESEND_API_KEY: string;
    readonly WHATSAPP_VERIFY_TOKEN: string;
    readonly WHATSAPP_APP_SECRET: string;

    // --- SEGURIDAD SRE ---
    readonly SOVEREIGN_EMERGENCY_TOKEN: string;
  }
}
