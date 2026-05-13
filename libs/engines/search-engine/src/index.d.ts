/**
 * @section Shared UI DNA - Global Type Sanctuary (Zenith Edition)
 * @description Punto de autorización absoluta para la identidad del motor 'fuse.js'.
 * Resuelve la asfixia de tipos (TS7016) mediante la definición de puentes
 * de soberanía que garantizan la visibilidad de miembros en el motor de resolución 'bundler'.
 *
 * Protocolo OEDP-V17.0 - Hardware Isolation & Type Sovereignty.
 * SANEADO Zenith: Erradicación de genéricos no utilizados (Fix TS6133) y
 * normalización de nomenclatura ISO para parámetros de motor.
 *
 * @author  Raz Podestá - Metashark Tech
 * @license UNLICENSED
 */

declare module 'fuse.js' {
  /**
   * @interface IFuseOptions
   * @description Contrato de configuración para el motor de búsqueda difusa.
   * 🛡️ SANEADO Zenith: Se remueve el genérico <T> para satisfacer la regla de
   * 'Zero Unused Variables' al no ser referenciado en las propiedades.
   */
  export interface IFuseOptions {
    readonly keys?: readonly (string | { readonly name: string; readonly weight: number })[];
    readonly threshold?: number;
    readonly includeScore?: boolean;
    readonly ignoreLocation?: boolean;
    readonly minMatchCharLength?: number;
    readonly useTokenSearch?: boolean;
    readonly includeMatches?: boolean;
  }

  /**
   * @interface FuseResult
   * @description Representación técnica de un hallazgo del algoritmo.
   * @template T - ADN de la entidad indexada.
   */
  export interface FuseResult<T> {
    /** La entidad original recuperada del índice. */
    readonly item: T;
    /** Índice físico de la posición en el Ledger original. */
    readonly refIndex: number;
    /** Coeficiente de relevancia calculado (0.0 a 1.0). */
    readonly score?: number;
  }

  /**
   * @class Fuse
   * @description Clase maestra del motor de búsqueda de alta velocidad.
   * @template T - Tipo de datos de la colección autorizada.
   */
  export default class Fuse<T> {
    /**
     * Inicializa el motor inyectando el universo de datos.
     * @param collectionReference - Lista inmutable de entidades a indexar.
     * @param optionsConfiguration - Parámetros de sensibilidad y pesos.
     */
    constructor(collectionReference: readonly T[], optionsConfiguration?: IFuseOptions);

    /**
     * Ejecuta la computación de búsqueda sobre el índice.
     * @param searchPatternLiteral - Término o expresión de búsqueda.
     */
    public search(searchPatternLiteral: string | object): readonly FuseResult<T>[];

    /**
     * Inyecta dinámicamente una nueva entidad en el índice de memoria.
     */
    public add(entitySnapshot: T): void;

    /**
     * Remueve entidades que cumplan con el predicado del motor.
     */
    public remove(predicateAction: (entity: T) => boolean): readonly T[];
  }
}
