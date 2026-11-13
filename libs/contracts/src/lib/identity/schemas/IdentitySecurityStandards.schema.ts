/**
 * @section User Management & Identity - Security Integrity Contracts
 * @description Define el contrato de integridad para los estándares de seguridad
 * institucional. Establece las reglas de entropía, gobernanza de sesiones y MFA
 * necesarias para la operación Multi-tenant de grado gubernamental.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @name IdentitySecurityStandardsSchema
 * @description Aduana de ADN para la validación de matrices de seguridad.
 * Garantiza que la configuración de cada Institución (Tenant) cumpla con los
 * requisitos mínimos de resiliencia del ecosistema.
 *
 * @prompt_ia: "Valida que 'accessTokenExpirationMinutesDuration' sea siempre
 * un valor bajo (ej. < 60) para mitigar el riesgo de secuestro de sesión."
 */
export const IdentitySecurityStandardsSchema = z
  .object({
    /** @domain 1: POLÍTICA DE CREDENCIALES (Credential Hygiene) */
    credentialPolicy: z
      .object({
        minimumPasswordLengthQuantity: z.number().default(12),
        minimumPasswordStrengthLevelNumeric: z.number().min(1).max(5).default(4),
        requiresSpecialCharactersBoolean: z.boolean().default(true),
        passwordExpirationDaysDuration: z.number().default(90),
      })
      .readonly(),

    /** @domain 2: GOBERNANZA DE SESIONES (Lifecycle Management) */
    sessionManagement: z
      .object({
        accessTokenExpirationMinutesDuration: z.number().default(15),
        refreshTokenExpirationDaysDuration: z.number().default(7),
        absoluteSessionTimeoutMinutesDuration: z.number().default(1440),
        idleInactivityTimeoutMinutesDuration: z.number().default(30),
        isConcurrentSessionAllowedBoolean: z.boolean().default(false),
      })
      .readonly(),

    /** @domain 3: PROTECCIÓN PERIMETRAL (Intrusion Prevention) */
    accessProtection: z
      .object({
        maximumLoginAttemptsQuantity: z.number().default(5),
        lockoutCoolDownMinutesDuration: z.number().default(15),
        isIpReputationCheckEnabledBoolean: z.boolean().default(true),
      })
      .readonly(),

    /** @domain 4: AUTENTICACIÓN MULTI-FACTOR (Identity Verification) */
    multiFactorAuthentication: z
      .object({
        isMandatoryForAdministrativeRolesBoolean: z.boolean().default(true),
        isMandatoryForStandardRolesBoolean: z.boolean().default(false),
        allowedMfaMethodsCollection: z
          .array(z.enum(['TOTP', 'SMS', 'WEB_AUTHN', 'EMAIL']))
          .default(['TOTP', 'WEB_AUTHN']),
      })
      .readonly(),
  })
  .readonly();

/** 🛡️ ADN Tipado para exportación Verbatim */
export type IIdentitySecurityStandards = z.infer<typeof IdentitySecurityStandardsSchema>;
