/**
 * @section Shared UI DNA - Global Type Sanctuary (Zenith Edition)
 * @description Punto de autorización absoluta para identidades de motores de terceros.
 * Resuelve la asfixia de tipos (TS2305/TS7016) mediante la definición de puentes
 * de soberanía que garantizan la visibilidad de miembros en el motor de resolución 'bundler'.
 *
 * Protocolo OEDP-V17.0 - Hardware Isolation & Type Sovereignty.
 * SANEADO Zenith: Erradicación total de 'any', remoción de importaciones huérfanas,
 * firmas de precisión para Framer Motion y contratos lógicos para utilidades de estilo.
 *
 * @author  Raz Podestá - Metashark Tech
 * @license UNLICENSED
 */

/** 🛡️ LEY DE VISIBILIDAD: Inyecta los tipos de Next.js en el ámbito global del búnker. */
/// <reference types="next" />
/// <reference types="next/types/global" />

import type { FC, PropsWithChildren, SVGProps, ComponentType, ReactNode } from 'react';

/**
 * @section Puentes de Soberanía para Next.js
 * Garantiza que los componentes de optimización y ruteo posean firmas íntegras
 * para evitar colapsos durante el renderizado en el servidor (SSR).
 */
declare module 'next/link' {
  import type { LinkProps } from 'next/dist/client/link';
  const Link: FC<PropsWithChildren<LinkProps & {
    readonly className?: string;
    readonly 'aria-label'?: string;
    readonly onClick?: () => void;
  }>>;
  export default Link;
}

declare module 'next/image' {
  import type { ImageProps } from 'next/dist/shared/lib/get-img-props';
  const Image: FC<ImageProps>;
  export default Image;
}

/**
 * 🛡️ SANEADO Zenith: Tipado estricto para el orquestador de navegación.
 */
declare module 'next/navigation' {
  export function usePathname(): string;
  export function useRouter(): {
    readonly push: (href: string) => void;
    readonly replace: (href: string) => void;
    readonly back: () => void;
    readonly forward: () => void;
    readonly refresh: () => void;
    readonly prefetch: (href: string) => void;
  };
  export function useSearchParams(): URLSearchParams;
  export function notFound(): never;
}

/**
 * @section Puentes de Soberanía para Animaciones (Framer Motion)
 * 🛡️ LEY ZENITH: Erradicación de 'any'. 'motion' se define como un objeto
 * de componentes tipados para proteger el Main Thread.
 */
declare module 'framer-motion' {
  import type { ComponentType, ReactNode } from 'react';

  /**
   * Representación tipada de la factoría de animaciones.
   * SANEADO: Uso de Record<string, unknown> en lugar de any para props genéricas.
   */
  export const motion: {
    readonly [K in keyof JSX.IntrinsicElements]: ComponentType<PropsWithChildren<Record<string, unknown>>>;
  } & {
    readonly div: ComponentType<PropsWithChildren<Record<string, unknown>>>;
    readonly nav: ComponentType<PropsWithChildren<Record<string, unknown>>>;
    readonly span: ComponentType<PropsWithChildren<Record<string, unknown>>>;
    readonly header: ComponentType<PropsWithChildren<Record<string, unknown>>>;
  };

  export const AnimatePresence: ComponentType<{
    readonly children?: ReactNode;
    readonly mode?: 'wait' | 'popLayout' | 'sync';
    readonly initial?: boolean;
  }>;
}

/**
 * @section Puentes de Soberanía para Iconografía (Lucide)
 * Este bloque autoriza el uso de la simbología institucional en la Fundición Visual.
 */
declare module 'lucide-react' {
  export interface IIconPrimitiveProperties extends SVGProps<SVGSVGElement> {
    readonly size?: string | number;
    readonly color?: string;
    readonly strokeWidth?: string | number;
  }
  export type TIconPrimitiveComponent = FC<IIconPrimitiveProperties>;

  // --- 📡 Discovery & Navigation Swarm ---
  export const Command: TIconPrimitiveComponent;
  export const Search: TIconPrimitiveComponent;
  export const Menu: TIconPrimitiveComponent;
  export const X: TIconPrimitiveComponent;
  export const Info: TIconPrimitiveComponent;
  export const Newspaper: TIconPrimitiveComponent;
  export const ArrowLeft: TIconPrimitiveComponent;
  export const ExternalLink: TIconPrimitiveComponent;
  export const BookOpen: TIconPrimitiveComponent;
  export const Terminal: TIconPrimitiveComponent;

  // --- 🛡️ Security & Feedback Swarm ---
  export const AlertCircle: TIconPrimitiveComponent;
  export const CheckCircle2: TIconPrimitiveComponent;
  export const ShieldCheck: TIconPrimitiveComponent;
  export const AlertTriangle: TIconPrimitiveComponent;
  export const Loader2: TIconPrimitiveComponent;

  // --- 📧 Communication & Impact Swarm (Observatory Ready) ---
  export const Mail: TIconPrimitiveComponent;
  export const MailCheck: TIconPrimitiveComponent;
  export const Heart: TIconPrimitiveComponent;
  export const Activity: TIconPrimitiveComponent;
  export const BarChart3: TIconPrimitiveComponent;
  export const FileText: TIconPrimitiveComponent;
  export const LayoutDashboard: TIconPrimitiveComponent;
  export const PlayCircle: TIconPrimitiveComponent;
}

/**
 * @section Declaraciones de Utilidades de Estilo
 * SANEADO Zenith: Erradicación de 'any' mediante contratos de unknown y booleanos.
 */
declare module 'tailwind-merge' {
  export function twMerge(...classLists: (string | undefined | null | false)[]): string;
}

declare module 'clsx' {
  /**
   * 🛡️ LEY DE INTEGRIDAD: Un objeto de clase solo debe admitir valores
   * que resuelvan a un estado lógico de presencia/ausencia.
   */
  export type ClassValue =
    | string
    | number
    | boolean
    | undefined
    | null
    | { [key: string]: boolean | number | string | undefined | null }
    | ClassValue[];

  export function clsx(...inputs: ClassValue[]): string;
}

/**
 * @section Declaraciones de Estilos Globales (CSS Modules)
 */
declare module '*.css' {
  const styleSelectorsMapping: Record<string, string>;
  export default styleSelectorsMapping;
}
