/**
 * @section User Management & Identity - Infrastructure Integrity Contracts
 * @description Define el contrato de validación para el desafío de autoridad administrativa
 * de alto nivel. Establece los requisitos de entropía y formato para los tokens
 * de seguridad utilizados en operaciones de bypass de emergencia.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @name ValidateAdministrativeAuthoritySchema
 * @description Validador de integridad para tokens de seguridad administrativa.
 *
 * @prompt_ia: "Valida que 'administrativeSecurityTokenLiteral' posea una longitud
 * mínima de 32 caracteres para cumplir con los estándares de entropía institucional."
 */
export const ValidateAdministrativeAuthoritySchema = z.object({
  /**
   * Token suministrado por el interventor o sistema de auditoría.
   * Representación: Literal (Secret).
   */
  administrativeSecurityTokenLiteral: z.string()
    .min(32, { message: 'SECURITY_TOKEN_INSUFFICIENT_ENTROPY' })
    .describe('Token de seguridad para la activación de privilegios administrativos.'),
}).readonly();

/** 🛡️ ADN Tipado para exportación Verbatim */
export type IValidateAdministrativeAuthorityParameters = z.infer<
  typeof ValidateAdministrativeAuthoritySchema
>;
