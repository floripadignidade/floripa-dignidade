/**
 * @section Core Infrastructure - Environment Validator Master Barrel (Entry Point)
 * @description Único punto de exportación autorizado para el módulo de auditoría de infraestructura
 * y validación estricta de variables de entorno. Centraliza contratos criptográficos con tipado
 * nominal (Branded Types), sensores de hardware, almas lingüísticas y orquestadores de prevuelo.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad y Seguridad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * @version 1.3.0
 * Estatus: Nivelación Multi-Cloud AI completada. Soporte para Google Gemini AI Studio,
 * Hugging Face Router, mitigación de fallos regionales S3 y tipos bridados de hardware.
 */
export const CORE_ENVIRONMENT_VALIDATOR_VERSION = '1.3.0';

/**
 * @section 1. Contratos Estructurales y Tipado Nominal (Schemas & Branded Types)
 * Exportación formal de validadores Zod y tipos nominales sellados para la infraestructura cloud.
 */
export {
  // Esquema Maestro Unificado
  EnvironmentSchema,

  // Comunicación y Correo Transaccional (Resend)
  ResendApiKeySecretSchema,

  // Persistencia Relacional y Data Lake (Supabase / Postgres)
  SupabaseUniformResourceLocatorSchema,
  SupabaseServiceKeySecretSchema,
  PostgresUniformResourceLocatorSchema,

  // Mensajería Ciudadana (Meta / WhatsApp)
  WhatsAppSecretSchema,
  WhatsAppVerifyTokenSecretSchema,

  // Gestión de Contenidos y Seguridad de Sesión (Payload CMS)
  PayloadSecretSchema,
  EmergencySecurityTokenSchema,
  SovereignEmergencyTokenSchema,

  // Almacenamiento Multimedia (Pasarela S3 Compatible)
  S3EndpointUniformResourceLocatorSchema,
  S3AccessKeyIdentifierSchema,
  S3SecretAccessKeySchema,

  // Inferencia Cognitiva Multi-Proveedor (AI Engine)
  GoogleGeminiApiKeySecretSchema,
  HuggingFaceApiTokenSecretSchema,
  HuggingFaceModelUrlSchema,

  // Topología y Red
  SiteUniformResourceLocatorSchema,
  NxCloudAccessSecurityTokenSchema,
} from './lib/schemas/Environment.schema.js';

export type {
  IEnvironmentVariables,
  TResendApiKeySecret,
  TSupabaseUniformResourceLocator,
  TSupabaseServiceKeySecret,
  TPostgresUniformResourceLocator,
  TWhatsAppSecret,
  TWhatsAppVerifyTokenSecret,
  TPayloadSecret,
  TEmergencySecurityToken,
  TS3EndpointUniformResourceLocator,
  TS3AccessKeyIdentifier,
  TS3SecretAccessKey,
  TGoogleGeminiApiKeySecret,
  THuggingFaceApiTokenSecret,
  THuggingFaceModelUrl,
  TSiteUniformResourceLocator,
  TNxCloudAccessSecurityToken,
} from './lib/schemas/Environment.schema.js';

/**
 * @section 2. Contratos Lingüísticos (Internationalization)
 * Definiciones formales para la validación de diccionarios de auditoría de infraestructura.
 */
export {
  EnvironmentLinguisticDictionarySchema,
} from './lib/i18n/EnvironmentLinguisticDictionary.schema.js';

export type {
  IEnvironmentLinguisticDictionary,
} from './lib/i18n/EnvironmentLinguisticDictionary.schema.js';

/**
 * @section 3. Lógica Atómica y Orquestadores de Prevuelo
 * Unidades funcionales para la extracción pasiva de hardware y validación perimetral.
 */

// Orquestador Principal de Inicialización (Fail-Fast Gatekeeper)
export {
  ValidateEnvironmentAduana,
  ValidateEnvironmentAduana as ValidateEnvironmentContract,
} from './lib/logic/ValidateEnvironmentAduana.js';

// Sensor de Hardware para Extracción Isomórfica de Metadatos
export {
  GatherEnvironmentMetadata,
} from './lib/logic/GatherEnvironmentMetadata.js';

// Átomo de Triaje y Bloqueo Forense ante Corrupción de Entorno
export {
  ReportEnvironmentIntegrityViolation,
} from './lib/logic/atomic/ReportEnvironmentIntegrityViolation.js';

// Tipos de Rastro Técnico
export type {
  IEnvironmentMetadataSnapshot,
} from './lib/logic/GatherEnvironmentMetadata.js';