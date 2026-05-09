/**
 * @section Application DNA - Global Asset & Infrastructure Declarations
 * @description Define el mapa de tipos para activos y puentes de infraestructura.
 *
 * Protocolo OEDP-V17.0 - Zenith Architecture Standard.
 * SANEADO Zenith: Resolución definitiva de TS7016 y TS2688 mediante el uso
 * de referencias de triple barra para el motor de Next.js.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/** 🛡️ LEY DE VISIBILIDAD: Inyecta los tipos de Next.js en el ámbito global del proyecto. */
/// <reference types="next" />
/// <reference types="next/types/global" />

import type React from 'react';

/**
 * @section Puentes Ambientales (Ambient Type Bridges)
 * Erradicación de Asfixia de Identidad (TS7016) para librerías de terceros.
 */
declare module 'lucide-react';
declare module 'framer-motion';
declare module 'tailwind-merge';

/**
 * @section Soporte de Estilos Globales (CSS Modules)
 */
declare module '*.css' {
  const styleSelectorsMapping: Record<string, string>;
  export default styleSelectorsMapping;
}

/**
 * @section Soporte Vectorial (SVG)
 */
declare module '*.svg' {
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { readonly title?: string }
  >;
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

/**
 * @section Declaraciones de Entorno (ProcessEnv)
 */
declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly NEXT_PUBLIC_SITE_URL: string;
    readonly SUPABASE_URL: string;
    readonly SUPABASE_SERVICE_ROLE_KEY: string;
    readonly RESEND_API_KEY: string;
    readonly WHATSAPP_VERIFY_TOKEN: string;
    readonly WHATSAPP_APP_SECRET: string;
    readonly SOVEREIGN_EMERGENCY_TOKEN: string;
  }
}
