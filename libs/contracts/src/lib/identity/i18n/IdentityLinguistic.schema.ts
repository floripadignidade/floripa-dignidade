/**
 * @section User Management & Identity - Linguistic Integrity Contracts
 * @description Define el contrato estructural para los diccionarios de identidad.
 * Garantiza que cada mensaje de error, rol de autoridad y rastro operativo posea
 * una representación validada para el ciudadano y los sistemas de auditoría.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @name IdentityLinguisticDictionarySchema
 * @description Aduana de ADN para las almas lingüísticas del dominio de identidad.
 * Implementa inmutabilidad absoluta y descriptores para el Health Monitor (IA).
 */
export const IdentityLinguisticDictionarySchema = z.object({

  /** @domain 1: DESCRIPCIONES TÉCNICAS (Metadata) */
  metadataDescriptions: z.object({
    FULL_NAME_LABEL: z.string(),
    EMAIL_ADDRESS_LABEL: z.string(),
    AVATAR_IMAGE_LABEL: z.string(),
    TRUST_LEVEL_LABEL: z.string()
  }).readonly(),

  /** @domain 2: SEÑALES OPERATIVAS (SRE Logs) */
  operationalSignals: z.object({
    AUTHORITY_SYNCHRONIZATION_SUCCESS: z.string()
      .describe('Confirmación de grabación del peso bayesiano en el Ledger Primario.'),
  }).readonly(),

  /** @domain 3: MENSAJES DE EXCEPCIÓN (Standard Errors) */
  exceptionMessages: z.object({
    INVALID_AVATAR_URL: z.string(),
    TRUST_LEVEL_OUT_OF_BOUNDS: z.string(),
    IDENTITY_NOT_FOUND: z.string(),
    UNAUTHORIZED_IDENTITY_PROVIDER: z.string()
  }).readonly(),

  /** @domain 4: JERARQUÍA DE AUTORIDAD (Public Roles) */
  authorityRoles: z.object({
    INFRASTRUCTURE_CORE_AUDITOR: z.string(),
    PLATFORM_GLOBAL_MANAGER: z.string(),
    ORGANIZATION_ADMINISTRATOR: z.string(),
    ORGANIZATION_OPERATOR: z.string(),
    IDENTITY_REGISTERED: z.string(),
    IDENTITY_ANONYMOUS: z.string()
  }).readonly()

}).readonly();

/** 🛡️ ADN Tipado para el motor de traducción */
export type IIdentityLinguisticDictionary = z.infer<typeof IdentityLinguisticDictionarySchema>;
