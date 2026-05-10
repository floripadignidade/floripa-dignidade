/**
 * @section Discovery Engine - Ambient Types Bridge
 * @description Inyección soberana de tipos para 'fuse.js'.
 * Erradica el error TS7016 forzando una identidad validada para el motor de búsqueda.
 *
 * Protocolo OEDP-V17.0 - Zenith Architecture Standard.
 * @author Raz Podestá - MetaShark Tech
 */

declare module 'fuse.js' {
  /**
   * @interface IFuseOptions
   * @description Contrato de configuración para el motor de búsqueda difusa.
   */
  export interface IFuseOptions<T> {
    readonly keys?: readonly (string | { name: string; weight: number })[];
    readonly threshold?: number;
    readonly includeScore?: boolean;
    readonly ignoreLocation?: boolean;
    readonly minMatchCharLength?: number;
    readonly useTokenSearch?: boolean;
    readonly includeMatches?: boolean;
  }

  /**
   * @interface FuseResult
   * @description Representación de un hallazgo del algoritmo.
   */
  export interface FuseResult<T> {
    readonly item: T;
    readonly refIndex: number;
    readonly score?: number;
  }

  /**
   * @class Fuse
   * @description Clase maestra del motor de búsqueda.
   */
  export default class Fuse<T> {
    constructor(list: readonly T[], options?: IFuseOptions<T>);
    search(pattern: string | object): readonly FuseResult<T>[];
    add(doc: T): void;
    remove(predicate: (doc: T) => boolean): readonly T[];
  }
}
