/**
 * @section User Management & Identity - Identity Integrity Contracts
 * @description Define el contrato de validación estructural para el proceso de
 * anonimización de identidades. Garantiza que la entrada sea una cadena íntegra,
 * purificada y normalizada bajo estándares institucionales de privacidad.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Calidad: ISO/IEC 25010 (Modularidad, Privacidad y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @name AnonymizeIdentityNameSchema
 * @description Validador de ADN para la purificación de nombres civiles.
 * Implementa transformación proactiva para normalizar el rastro físico a
 * mayúsculas y eliminar ruidos de espacios redundantes.
 *
 * @prompt_ia: "Asegura que 'fullLegalNameLiteral' sea tratado como un dato de
 * Identificación Personal (PII). La transformación a UpperCase en este nivel
 * garantiza que los índices de búsqueda sean deterministas."
 */
export const AnonymizeIdentityNameSchema = z.object({
  /**
   * Nombre legal completo capturado del registro o proveedor.
   * Representación: Literal.
   * 🛡️ SANEADO (Fix TS7006): Tipado explícito en transformación de ADN.
   */
  fullLegalNameLiteral: z.string()
    .min(1, { message: 'IDENTITY_RECORD_NOT_FOUND' })
    .transform((valueLiteral: string) => valueLiteral.toUpperCase().trim())
    .describe('Nombre civil original para procesamiento de privacidad.'),

  /**
   * Marcador de posición lingüístico (Fallback) para identidades no reconocidas.
   * Representación: Literal (Sincronizado con diccionarios institucionales).
   */
  anonymousPlaceholderLiteral: z.string()
    .default('IDENTIDADE ANÔNIMA')
    .describe('Texto de sustitución para proteger la privacidad en la interfaz pública.'),

}).readonly();

/**
 * @interface IAnonymizeIdentityNameParameters
 * @description Representación física del contrato de parámetros.
 * Cumple con el estándar de tipado inmutable de grado Enterprise.
 */
export type IAnonymizeIdentityNameParameters = z.infer<typeof AnonymizeIdentityNameSchema>;
