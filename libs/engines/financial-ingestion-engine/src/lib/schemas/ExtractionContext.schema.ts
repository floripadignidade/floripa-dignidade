/**
 * @section Financial Ingestion DNA - Internal Extraction Context
 * @description Define el contrato de integridad para la memoria volátil utilizada
 * durante el escaneo del libro Excel. Garantiza que el rastro entre filas sea
 * inmutable, tipado nominalmente y auditable por el Neural Sentinel.
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & ReadOnly Integrity.
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @name ExtractionContextSchema
 * @description Aduana de ADN para el estado interno de la máquina de ingesta.
 * Estructura el rastro necesario para vincular cargos con montos mensuales.
 */
export const ExtractionContextSchema = z
  .object({
    /**
     * Nombre de la categoría de gasto activa capturada en la fila superior.
     * Se utiliza para dar contexto a los registros de montos encontrados debajo.
     */
    activeCategorySpecificationLiteral: z
      .string()
      .describe('Literal técnico de la especificación presupuestaria activa.'),

    /**
     * Mapeo de índices de columna física hacia nombres de meses localizados.
     * Las llaves deben ser numéricas (en formato string por restricción de Zod record).
     */
    monthHeadersMapping: z
      .record(z.string().regex(/^\d+$/), z.string())
      .describe('Diccionario de correspondencia [Columna]: "Mes Año".'),

    /**
     * Colección de registros capturados en memoria.
     * Se almacenan como objetos planos antes de pasar por la aduana 'FinancialIngestionBatchSchema'.
     */
    recordsCollection: z
      .array(z.record(z.string(), z.unknown()))
      .describe('Búfer de registros recolectados durante el escaneo.'),

    /**
     * Identificador de trazabilidad forense.
     * Vincula el proceso de extracción con el rastro de telemetría global.
     */
    correlationIdentifier: z
      .string()
      .uuid()
      .describe('ID de correlación único para el rastro de sangre digital.'),
  })
  .readonly(); // Inmutabilidad absoluta para el contrato externo.

/** 🛡️ ADN Tipado para exportación Verbatim */
export type IExtractionContext = z.infer<typeof ExtractionContextSchema>;
