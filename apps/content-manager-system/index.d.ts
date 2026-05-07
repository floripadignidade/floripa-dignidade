/**
 * @section CMS DNA - Global Asset & Environment Declarations
 * @description Define el mapa de tipos para activos no-TypeScript y el contrato
 * de identidad del entorno de ejecución Node.js/Edge. Garantiza la integridad
 * del compilador ante importaciones de efectos secundarios y secretos cloud.
 *
 * Protocolo OEDP-V17.0 - Verbatim Module Syntax & High Performance Typings.
 * SANEADO Zenith: Erradicación de rastro muerto de ESLint y sincronización de secretos.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type React from 'react';

/**
 * @section Soporte de Estilos Globales (CSS Modules)
 * @description Autoriza la importación de archivos CSS como módulos de diseño.
 * Erradica el colapso TS2882 en el búnker administrativo.
 */
declare module '*.css' {
  /** Mapeo inmutable de selectores de clase inyectados por el compilador. */
  const styleSelectorsMapping: Record<string, string>;
  export default styleSelectorsMapping;
}

/**
 * @section Soporte Vectorial (SVG)
 * @description Permite tratar los SVGs como componentes funcionales de React
 * o como rutas físicas para el motor de imágenes de Next.js.
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
 * @description Define la firma técnica para imágenes y formatos de alta definición.
 * Cumple con la norma ISO de nomenclatura descriptiva.
 */
declare module '*.png' { const assetSourcePathLiteral: string; export default assetSourcePathLiteral; }
declare module '*.jpg' { const assetSourcePathLiteral: string; export default assetSourcePathLiteral; }
declare module '*.jpeg' { const assetSourcePathLiteral: string; export default assetSourcePathLiteral; }
declare module '*.webp' { const assetSourcePathLiteral: string; export default assetSourcePathLiteral; }
declare module '*.avif' { const assetSourcePathLiteral: string; export default assetSourcePathLiteral; }

/**
 * @section Declaraciones de Entorno (ProcessEnv)
 * @description Sincroniza el objeto 'process.env' con los secretos validados por la
 * Aduana de Entorno Core. Proporciona autocompletado y seguridad de tipos en el
 * orquestador maestro 'payload.config.ts'.
 */
declare namespace NodeJS {
  /**
   * 🛡️ SANEADO Zenith: Se eliminan los disable de ESLint.
   * La Constitución Técnica ahora reconoce esta interfaz como extensión legítima.
   */
  interface ProcessEnv {
    // --- INFRAESTRUCTURA BASE ---
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly NEXT_PUBLIC_SITE_URL: string;
    readonly DATABASE_URL: string;
    readonly PAYLOAD_SECRET: string;
    readonly PAYLOAD_CONFIG_PATH: string;

    // --- SOBERANÍA CLOUD (Supabase) ---
    readonly SUPABASE_URL: string;
    readonly SUPABASE_SERVICE_ROLE_KEY: string;

    // --- BÓVEDA MULTIMEDIA (S3 Gateway) ---
    readonly S3_ENDPOINT: string;
    readonly S3_ACCESS_KEY_ID: string;
    readonly S3_SECRET_ACCESS_KEY: string;
    readonly S3_REGION: string;
    readonly S3_BUCKET: string;

    // --- COMUNICACIÓN Y MENSAJERÍA ---
    readonly RESEND_API_KEY: string;
    readonly RESEND_FROM_EMAIL: string;
    readonly WHATSAPP_VERIFY_TOKEN: string;
    readonly WHATSAPP_APP_SECRET: string;

    // --- SEGURIDAD SRE ---
    readonly SOVEREIGN_EMERGENCY_TOKEN: string;
  }
}
