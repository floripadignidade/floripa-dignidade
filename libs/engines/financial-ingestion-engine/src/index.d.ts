/**
 * @section Financial Ingestion - Ambient Types Bridge
 * @description Inyección soberana de tipos para 'exceljs'.
 * SANEADO Zenith: Transición de Namespace a Exportaciones Nombradas para
 * compatibilidad con el motor de resolución 'bundler'.
 *
 * Protocolo OEDP-V17.0 - Zenith Architecture Standard.
 * @author Raz Podestá - MetaShark Tech
 */

declare module 'exceljs' {
  /**
   * @interface Cell
   * @description Representación de una celda física en la matriz.
   */
  export interface Cell {
    readonly text: string;
    readonly value: unknown;
  }

  /**
   * @interface Row
   * @description Contrato para la manipulación de filas.
   */
  export interface Row {
    readonly getCell: (index: number) => Cell;
    readonly cellCount: number;
  }

  /**
   * @interface Worksheet
   * @description Representación de una hoja de cálculo.
   */
  export interface Worksheet {
    readonly getRow: (index: number) => Row;
    readonly eachRow: (callback: (row: Row, rowNumber: number) => void) => void;
  }

  /**
   * @class Workbook
   * @description Motor principal de gestión de archivos XLSX.
   */
  export class Workbook {
    constructor();
    readonly xlsx: {
      readonly readFile: (path: string) => Promise<void>;
    };
    readonly worksheets: Worksheet[];
  }
}
