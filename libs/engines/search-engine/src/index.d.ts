/**
 * @section Discovery Engine - Ambient Types Bridge
 * @description Inyección profesional de tipos para 'fuse.js'.
 * Al declarar el módulo aquí, erradicamos el error TS7016 de forma limpia,
 * cumpliendo con el protocolo de calidad del Neural Sentinel.
 *
 * Protocolo OEDP-V17.0 - Zenith Architecture Standard.
 * SANEADO Zenith: Cierre de clase y resolución de TS7006/TS7016.
 *
 * @author Raz Podestá - MetaShark Tech
 */

declare module 'fuse.js' {
  /**
   * @interface IFuseOptions
   * @description Contrato de configuración para el motor de búsqueda difusa.
   */
  export interface IFuseOptions<T> {
    readonly keys: readonly { readonly name: string; readonly weight: number }[];
    readonly threshold?: number;
    readonly includeScore?: boolean;
    readonly ignoreLocation?: boolean;
    readonly minMatchCharLength?: number;
  }

  /**
   * @class Fuse
   * @description Motor de búsqueda difusa con tipado genérico estricto.
   */
  export default class Fuse<T> {
    constructor(list: readonly T[], options?: IFuseOptions<T>);

    /**
     * Ejecuta una búsqueda difusa sobre la lista indexada.
     */
    search(pattern: string): readonly {
      readonly item: T;
      readonly score?: number;
    }[];
  }
}
