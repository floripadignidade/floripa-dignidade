/**
 * @section Exception DNA - Linguistic Integrity Schema
 * @description Define el contrato soberano para los diccionarios de traducción
 * del búnker de excepciones. Garantiza que cada código de error posea una
 * representación humana validada antes de ser ensamblada por el Weaver.
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & ReadOnly Integrity.
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @name ExceptionsLinguisticDictionarySchema
 * @description Aduana de validación para las almas lingüísticas (JSON).
 * Implementa inmutabilidad absoluta para prevenir ruidos en el motor de renderizado.
 */
export const ExceptionsLinguisticDictionarySchema = z
  .object({
    /**
     * Mapeo de Mensajes de Error Localizados.
     * Cada llave debe corresponder a un literal del catálogo ErrorCode.
     */
    localizedErrorMessagesMapping: z
      .object({
        VALIDATION_FAILED: z
          .string()
          .describe('Mensaje emitido cuando los datos fallan la auditoría de esquema Zod.'),

        UNAUTHORIZED_ACCESS: z
          .string()
          .describe('Mensaje emitido ante violaciones de jerarquía de autoridad (RBAC).'),

        INTERNAL_SYSTEM_FAILURE: z
          .string()
          .describe('Mensaje genérico de resiliencia para colapsos de infraestructura.'),

        RESOURCE_NOT_FOUND: z
          .string()
          .describe('Mensaje emitido cuando una entidad solicitada no existe en el Ledger.'),

        EXTERNAL_SERVICE_TIMEOUT: z
          .string()
          .describe(
            'Mensaje emitido ante latencias críticas en proveedores (Resend/Meta/Supabase).',
          ),
      })
      .readonly(),
  })
  .readonly();

/**
 * @section ADN Tipado (Verbatim Module Syntax)
 * Interfaz inmutable del diccionario para el compilador de internacionalización.
 */
export type IExceptionsLinguisticDictionary = z.infer<typeof ExceptionsLinguisticDictionarySchema>;
