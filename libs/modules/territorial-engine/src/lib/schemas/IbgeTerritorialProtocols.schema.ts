/**
 * @section Territorial DNA - IBGE API Protocols
 * @description Define la estructura exacta de los datos abiertos del IBGE.
 * Actúa como la aduana de entrada para el rastro de datos gubernamentales.
 *
 * Protocolo OEDP-V16.0 - High Performance & Geographic Integrity.
 */

import { z } from 'zod';

/**
 * Representación cruda de un Distrito según la API de Localidades.
 */
export const IbgeDistrictRawResponseSchema = z
  .object({
    id: z.number().describe('Código técnico del distrito.'),
    nome: z.string().describe('Nombre oficial de la localidad.'),
    municipio: z.object({
      id: z.number(),
      nome: z.string(),
      UF: z.object({
        id: z.number(),
        sigla: z.string(),
        nome: z.string(),
      }),
    }),
  })
  .readonly();

/**
 * Colección de distritos (Array de respuesta de la API).
 */
export const IbgeDistrictCollectionSchema = z.array(IbgeDistrictRawResponseSchema).readonly();

/** 🛡️ ADN Tipado para el enjambre de datos */
export type IIbgeDistrictRawResponse = z.infer<typeof IbgeDistrictRawResponseSchema>;
export type IIbgeDistrictCollection = z.infer<typeof IbgeDistrictCollectionSchema>;
