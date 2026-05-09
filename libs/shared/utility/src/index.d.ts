/**
 * @section Shared Utility - Ambient Types Bridge
 * @description Inyección profesional de tipos para librerías de terceros con
 * exportaciones ESM complejas. Resuelve la asfixia de identidad (TS7016) generada
 * por el modo "bundler" sin degradar la regla "noImplicitAny".
 *
 * Protocolo OEDP-V17.0 - Zenith Architecture Standard.
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

declare module 'tailwind-merge' {
  /**
   * @function twMerge
   * @description Fusión inteligente de clases CSS resolviendo conflictos de Tailwind.
   * Declaramos la firma explícita para sellar la frontera contra el tipo 'any'.
   */
  export function twMerge(...classLists: (string | undefined | null | false)[]): string;
}
