/**
 * @section CMS DNA - Global Type Sanctuary (Zenith Edition)
 * @description Punto de autorización absoluta para identidades de hardware y software.
 * Resuelve la asfixia de tipos (TS7016/TS2307) inyectando las firmas de Next.js,
 * Payload y activos binarios en el motor de resolución 'bundler'.
 *
 * Protocolo OEDP-V17.0 - Hardware Isolation & Type Sovereignty.
 * SANEADO Zenith: Inyección de Next.js Global, soporte de CSS Modules y
 * sincronización de secretos cloud inmutables.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/** 🛡️ LEY DE VISIBILIDAD: Inyecta los tipos de Next.js en el ámbito global del búnker. */
/// <reference types="next" />
/// <reference types="next/types/global" />
/// <reference types="next/navigation" />

import type React from 'react';

/**
 * @section Soporte de Estilos (CSS & Modules)
 * @description Autoriza la importación de estilos globales y módulos de diseño.
 * Erradica el colapso TS2307 en componentes de página.
 */
declare module '*.module.css' {
  const classesMapping: { readonly [key: string]: string };
  export default classesMapping;
}

declare module '*.css' {
  const styleSelectorsMapping: Record<string, string>;
  export default styleSelectorsMapping;
}

/**
 * @section Soporte Vectorial (SVG)
 * @description Permite tratar los SVGs como componentes funcionales o recursos estáticos.
 */
declare module '*.svg' {
  /** Representación como componente React funcional (Lucide-style). */
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
declare module '*.png' { const path: string; export default path; }
declare module '*.jpg' { const path: string; export default path; }
declare module '*.jpeg' { const path: string; export default path; }
declare module '*.webp' { const path: string; export default path; }
declare module '*.avif' { const path: string; export default path; }

/**
 * @section Declaraciones de Entorno (ProcessEnv)
 * @description Sincroniza el objeto 'process.env' con los secretos validados por la
 * Aduana de Entorno. Garantiza el autocompletado y la seguridad de tipos en
 * los orquestadores de configuración de Payload y Next.js.
 */
declare namespace NodeJS {
  interface ProcessEnv {
    // --- INFRAESTRUCTURA DE NODO ---
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly NEXT_RUNTIME?: 'nodejs' | 'edge';

    // --- ENLACE DE DATOS SOBERANOS ---
    readonly DATABASE_URL: string;
    readonly PAYLOAD_SECRET: string;
    readonly PAYLOAD_CONFIG_PATH?: string;
    readonly NEXT_PUBLIC_SITE_URL: string;

    // --- SOBERANÍA CLOUD (Supabase & Storage) ---
    readonly SUPABASE_URL: string;
    readonly SUPABASE_SERVICE_ROLE_KEY: string;
    readonly S3_ENDPOINT: string;
    readonly S3_ACCESS_KEY_ID: string;
    readonly S3_SECRET_ACCESS_KEY: string;
    readonly S3_REGION: string;
    readonly S3_BUCKET: string;

    // --- COMUNICACIÓN INSTITUCIONAL ---
    readonly RESEND_API_KEY: string;
    readonly RESEND_FROM_EMAIL: string;

    // --- SEGURIDAD SRE ---
    readonly SOVEREIGN_EMERGENCY_TOKEN: string;
  }
}
