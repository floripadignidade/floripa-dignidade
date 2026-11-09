/// <reference types="next" />
/// <reference types="next/image-types/global" />

/**
 * @section CMS Infrastructure DNA - Global Ambient Declarations
 * @description Manifiesto de declaraciones ambientales para el búnker de Payload CMS.
 * Proporciona el mapa de tipos para activos estáticos (CSS, SVG, Multimedia)
 * y variables de entorno del proceso NodeJS.
 *
 * Resuelve definitivamente el error TS2882 mediante la implementación de la
 * Estrategia de Declaración Dual para CSS (Side-Effect Import + CSS Modules)
 * en cumplimiento estricto con TypeScript 5.9+ y Next.js 16.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad y Calidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * @section 1. Estrategia de Declaración Dual para Estilos CSS (Resolución TS2882)
 */

/**
 * Rama A: Declaración ambiental pura para importaciones de efectos secundarios (Global CSS).
 * Autoriza sentencias como: import './global.css'; sin ligadura de variables.
 */
declare module '*.css';

/**
 * Rama B: Declaración de módulos CSS para componentes con encapsulamiento de estilos.
 * Autoriza sentencias como: import styles from './component.module.css';
 */
declare module '*.module.css' {
  const contentStyleClassesMap: Record<string, string>;
  export default contentStyleClassesMap;
}

/**
 * @section 2. Soporte Vectorial (SVG)
 * Tipado calificado internamente para evitar convertir este archivo en un módulo ES.
 */
declare module '*.svg' {
  export const ReactComponent: (
    propertiesSnapshot: import('react').SVGProps<SVGSVGElement> & {
      readonly title?: string;
    },
  ) => import('react').ReactElement;

  const contentAssetPathLiteral: string;
  export default contentAssetPathLiteral;
}

/**
 * @section 3. Soporte Multimedia e Imágenes Binarias
 */
declare module '*.png' {
  const contentAssetPathLiteral: string;
  export default contentAssetPathLiteral;
}

declare module '*.jpg' {
  const contentAssetPathLiteral: string;
  export default contentAssetPathLiteral;
}

declare module '*.jpeg' {
  const contentAssetPathLiteral: string;
  export default contentAssetPathLiteral;
}

declare module '*.webp' {
  const contentAssetPathLiteral: string;
  export default contentAssetPathLiteral;
}

declare module '*.avif' {
  const contentAssetPathLiteral: string;
  export default contentAssetPathLiteral;
}

declare module '*.ico' {
  const contentAssetPathLiteral: string;
  export default contentAssetPathLiteral;
}

/**
 * @section 4. Extensión del Espacio de Nombres de Entorno NodeJS
 * Sincroniza las propiedades de configuración accesibles en tiempo de compilación.
 */
declare namespace NodeJS {
  /* eslint-disable @typescript-eslint/naming-convention */
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly PAYLOAD_CONFIG_PATH?: string;
    readonly NEXT_PUBLIC_SITE_URL?: string;
    readonly DATABASE_URL?: string;
    readonly PAYLOAD_SECRET?: string;
  }
  /* eslint-enable @typescript-eslint/naming-convention */
}
