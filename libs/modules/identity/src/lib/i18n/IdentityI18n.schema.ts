/**
 * @section Identity DNA - Linguistic Integrity Schema
 * @description Contrato soberano que define la estructura obligatoria para los
 * diccionarios de traducción del búnker de identidad. Garantiza que cada mensaje,
 * rol y rastro telemétrico posea una representación técnica validada.
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & ReadOnly Integrity.
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @name IdentityI18nSchema
 * @description Aduana de validación para las almas lingüísticas del dominio de identidad.
 * Implementa inmutabilidad absoluta para prevenir ruidos en el motor de renderizado.
 */
export const IdentityI18nSchema = z.object({

  /**
   * @section Metadatos de Esquema
   * Descripciones técnicas utilizadas para generar documentación y tooltips.
   */
  schemas: z.object({
    FULL_NAME_DESCRIPTION: z.string(),
    EMAIL_DESCRIPTION: z.string(),
    AVATAR_DESCRIPTION: z.string(),
    TRUST_LEVEL_DESCRIPTION: z.string()
  }).readonly(),

  /**
   * @section Trazabilidad Telemétrica (SRE Logs)
   * Mensajes para el rastro forense y auditoría de sincronización cloud.
   */
  logs: z.object({
    AUTHORITY_SYNC_NOMINAL: z.string()
      .describe('Confirmación de grabación del peso bayesiano en el Ledger.'),
  }).readonly(),

  /**
   * @section Señales de Error (Exceptions)
   * Mensajes localizados para fallos de integridad y autoridad.
   */
  errors: z.object({
    INVALID_AVATAR_URL: z.string(),
    TRUST_LEVEL_OUT_OF_BOUNDS: z.string(),
    IDENTITY_NOT_FOUND: z.string(),
    UNAUTHORIZED_PROVIDER: z.string()
  }).readonly(),

  /**
   * @section Catálogo de Roles (RBAC)
   * Representación textual de la jerarquía de poder institucional.
   */
  roles: z.object({
    INFRASTRUCTURE_SOVEREIGN_AUDITOR: z.string(),
    PLATFORM_GLOBAL_MANAGER: z.string(),
    ORGANIZATION_ADMINISTRATOR: z.string(),
    ORGANIZATION_OPERATOR: z.string(),
    CITIZEN_REGISTERED: z.string(),
    CITIZEN_ANONYMOUS: z.string()
  }).readonly()

}).readonly();

/** 🛡️ ADN Tipado para exportación Verbatim */
export type IIdentityI18n = z.infer<typeof IdentityI18nSchema>;
