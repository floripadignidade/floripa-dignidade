/**
 * @section User Management & Identity - Security Infrastructure Standards
 * @description Única Fuente de Verdad (SSOT) para la configuración física de
 * seguridad del ecosistema Floripa Dignidade. Implementa la instancia
 * por defecto validada por el búnker de contratos.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/* 1. ADN ESTRUCTURAL (Consumo desde SSOT Contracts) */
import { IdentitySecurityStandardsSchema } from '@floripa-dignidade/contracts';
import type { IIdentitySecurityStandards } from '@floripa-dignidade/contracts';

/**
 * @name IDENTITY_SECURITY_STANDARDS
 * @description Instancia inmutable de los estándares de seguridad institucionales.
 * Actúa como la configuración base para el orquestador de autenticación.
 */
export const IDENTITY_SECURITY_STANDARDS: IIdentitySecurityStandards =
  IdentitySecurityStandardsSchema.parse({
    credentialPolicy: {
      minimumPasswordLengthQuantity: 12,
      minimumPasswordStrengthLevelNumeric: 4,
      requiresSpecialCharactersBoolean: true,
      passwordExpirationDaysDuration: 90,
    },
    sessionManagement: {
      accessTokenExpirationMinutesDuration: 15,
      refreshTokenExpirationDaysDuration: 7,
      absoluteSessionTimeoutMinutesDuration: 1440,
      idleInactivityTimeoutMinutesDuration: 60,
      isConcurrentSessionAllowedBoolean: false,
    },
    accessProtection: {
      maximumLoginAttemptsQuantity: 5,
      lockoutCoolDownMinutesDuration: 30,
      isIpReputationCheckEnabledBoolean: true,
    },
    multiFactorAuthentication: {
      isMandatoryForAdministrativeRolesBoolean: true,
      isMandatoryForStandardRolesBoolean: false,
      allowedMfaMethodsCollection: ['TOTP', 'WEB_AUTHN'],
    },
  });
