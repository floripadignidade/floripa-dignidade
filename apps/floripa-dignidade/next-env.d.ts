/// <reference types="next" />
/// <reference types="next/image-types/global" />

/**
 * @section Declaración Ambiental de Estilos CSS (Resolución TS2882)
 * Autoriza la importación de efectos secundarios de hojas de estilo globales.
 */
declare module '*.css';

declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}
