/**
 * @section Data Ingestion - Sync Municipality Expenditure Schema (Atom)
 * @description Contrato Zod inmutable para la validación perimetral de parámetros
 * de sincronización presupuestaria y definición de constantes de conexión gubernamental.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/** Punto de enlace oficial del servicio de datos abiertos presupuestarios. */
export const MUNICIPAL_OPEN_DATA_ENDPOINT_URL_LITERAL =
  'https://transparencia.florianopolis.sc.gov.br/api/v1/despesas';

/** Límite de tiempo perimetral (SRE) para evitar bloqueos por latencia en el servidor gubernamental. */
export const HTTP_TRANSMISSION_TIMEOUT_IN_MILLISECONDS_QUANTITY = 8000;

/**
 * @name SyncMunicipalityExpenditureParametersSchema
 * @description Contrato de validación estructural para los parámetros de sincronización presupuestaria.
 */
export const SyncMunicipalityExpenditureParametersSchema = z
  .object({
    /** Identificador textual del municipio (ej: 'florianopolis'). */
    municipalitySlugLiteral: z.string().min(2, { message: 'SLUG_MUNICIPAL_DEMASIADO_CORTO' }),

    /** Rango temporal de la consulta en formato de dos dígitos de mes y cuatro de año (MM/AAAA). */
    periodRange: z.object({
      initialMonthYearLiteral: z
        .string()
        .regex(/^\d{2}\/\d{4}$/, { message: 'FORMATO_MES_ANO_INICIAL_INVALIDO' }),
      finalMonthYearLiteral: z
        .string()
        .regex(/^\d{2}\/\d{4}$/, { message: 'FORMATO_MES_ANO_FINAL_INVALIDO' }),
    }),

    /** Identificador de correlación único para trazabilidad forense. */
    correlationIdentifier: z.string().uuid().optional(),
  })
  .readonly();

export type ISyncMunicipalityExpenditureParameters = z.infer<
  typeof SyncMunicipalityExpenditureParametersSchema
>;
