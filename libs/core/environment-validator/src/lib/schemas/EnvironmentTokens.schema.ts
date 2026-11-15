/**
 * @section Environment Configuration - Cryptographic Tokens & Branded Types (Atom)
 * @description Bóveda atómica de contratos criptográficos y tipos nominales (Branded Types)
 * para los secretos de infraestructura del ecosistema Floripa Dignidade. Aplica saneamiento
 * `.trim()` preventivo, cumplimiento TLS (ADR 0015) y soporte multi-formato para claves
 * de Google AI Studio (`AIza*` y `AQ.*`).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

const enforceHttpsProtocolAction = (endpointUrlLiteral: string): boolean =>
  endpointUrlLiteral.startsWith('https://');

const enforceHttpOrHttpsProtocolAction = (siteUrlLiteral: string): boolean =>
  siteUrlLiteral.startsWith('https://') || siteUrlLiteral.startsWith('http://');

const enforcePostgresSchemeAction = (connectionStringLiteral: string): boolean =>
  connectionStringLiteral.startsWith('postgresql://') ||
  connectionStringLiteral.startsWith('postgres://');

const enforceGeminiKeyPrefixAction = (apiKeyLiteral: string): boolean =>
  apiKeyLiteral.startsWith('AIza') || apiKeyLiteral.startsWith('AQ.');

/* 1. COMUNICACIÓN Y CORREO TRANSACCIONAL (Resend) */
export const ResendApiKeySecretSchema = z
  .string()
  .trim()
  .startsWith('re_', { message: 'LA_CLAVE_RESEND_DEBE_INICIAR_CON_EL_PREFIJO_re_' })
  .min(10, { message: 'LA_CLAVE_RESEND_DEBE_CONTENER_AL_MENOS_10_CARACTERES' })
  .brand<'ResendApiKeySecret'>();

export type TResendApiKeySecret = z.infer<typeof ResendApiKeySecretSchema>;

/* 2. PERSISTENCIA RELACIONAL Y DATA LAKE (Supabase / Postgres) */
export const SupabaseUniformResourceLocatorSchema = z
  .string()
  .trim()
  .url({ message: 'LA_URL_DE_SUPABASE_DEBE_SER_UNA_DIRECCION_HTTPS_VALIDA' })
  .refine(enforceHttpsProtocolAction, {
    message: 'LA_URL_DE_SUPABASE_REQUIERE_PROTOCOLO_HTTPS',
  })
  .describe('URL HTTPS del proyecto en la infraestructura gestionada de Supabase.')
  .brand<'SupabaseUniformResourceLocator'>();

export type TSupabaseUniformResourceLocator = z.infer<typeof SupabaseUniformResourceLocatorSchema>;

export const SupabaseServiceKeySecretSchema = z
  .string()
  .trim()
  .min(50, { message: 'EL_TOKEN_SERVICE_ROLE_DEBE_CONTENER_AL_MENOS_50_CARACTERES' })
  .describe('Token administrativo institucional (Service Role) para bypass de RLS.')
  .brand<'SupabaseServiceKeySecret'>();

export type TSupabaseServiceKeySecret = z.infer<typeof SupabaseServiceKeySecretSchema>;

export const PostgresUniformResourceLocatorSchema = z
  .string()
  .trim()
  .url({ message: 'FORMATO_DE_DATABASE_URL_INVALIDO' })
  .refine(enforcePostgresSchemeAction, {
    message: 'DATABASE_URL_DEBE_INICIAR_CON_postgresql://',
  })
  .describe('Cadena de conexión directa o agrupada (pooling) al motor PostgreSQL.')
  .brand<'PostgresUniformResourceLocator'>();

export type TPostgresUniformResourceLocator = z.infer<typeof PostgresUniformResourceLocatorSchema>;

/* 3. MENSAJERÍA CIUDADANA Y WEBHOOKS (Meta / WhatsApp) */
export const WhatsAppSecretSchema = z
  .string()
  .trim()
  .min(16, { message: 'WHATSAPP_APP_SECRET_DEBE_CONTENER_AL_MENOS_16_CARACTERES' })
  .describe('Secreto de aplicación para validación de firmas HMAC-SHA256 en webhooks de Meta.')
  .brand<'WhatsAppSecret'>();

export type TWhatsAppSecret = z.infer<typeof WhatsAppSecretSchema>;

export const WhatsAppVerifyTokenSecretSchema = z
  .string()
  .trim()
  .min(10, { message: 'WHATSAPP_VERIFY_TOKEN_DEBE_CONTENER_AL_MENOS_10_CARACTERES' })
  .describe('Token de verificación para el handshake inicial del webhook con Meta Developers.')
  .brand<'WhatsAppVerifyTokenSecret'>();

export type TWhatsAppVerifyTokenSecret = z.infer<typeof WhatsAppVerifyTokenSecretSchema>;

/* 4. GESTIÓN DE CONTENIDOS Y CONTINGENCIA */
export const PayloadSecretSchema = z
  .string()
  .trim()
  .min(32, { message: 'PAYLOAD_SECRET_DEBE_CONTENER_AL_MENOS_32_CARACTERES' })
  .describe('Secreto criptográfico inalterable para el cifrado de sesiones en Payload CMS.')
  .brand<'PayloadSecret'>();

export type TPayloadSecret = z.infer<typeof PayloadSecretSchema>;

export const EmergencySecurityTokenSchema = z
  .string()
  .trim()
  .min(32, { message: 'EL_TOKEN_DE_EMERGENCIA_DEBE_CONTENER_AL_MENOS_32_CARACTERES' })
  .describe('Token criptográfico para bypass de seguridad en recuperación ante desastres.')
  .brand<'EmergencySecurityToken'>();

export type TEmergencySecurityToken = z.infer<typeof EmergencySecurityTokenSchema>;

/**
 * @deprecated Utilizar canónicamente `EmergencySecurityTokenSchema` bajo norma ISO/IEC 11179.
 */
export const SovereignEmergencyTokenSchema = EmergencySecurityTokenSchema;

/* 5. ALMACENAMIENTO MULTIMEDIA (Pasarela S3 Compatible) */
export const S3EndpointUniformResourceLocatorSchema = z
  .string()
  .trim()
  .url({ message: 'S3_ENDPOINT_DEBE_SER_UNA_URL_VALIDA' })
  .refine(enforceHttpsProtocolAction, {
    message: 'S3_ENDPOINT_REQUIERE_PROTOCOLO_HTTPS',
  })
  .describe('Endpoint HTTPS S3 expuesto por Supabase Storage.')
  .brand<'S3EndpointUniformResourceLocator'>();

export type TS3EndpointUniformResourceLocator = z.infer<
  typeof S3EndpointUniformResourceLocatorSchema
>;

export const S3AccessKeyIdentifierSchema = z
  .string()
  .trim()
  .min(10, { message: 'S3_ACCESS_KEY_ID_DEBE_CONTENER_AL_MENOS_10_CARACTERES' })
  .describe('Identificador alfanumérico de acceso a la pasarela S3.')
  .brand<'S3AccessKeyIdentifier'>();

export type TS3AccessKeyIdentifier = z.infer<typeof S3AccessKeyIdentifierSchema>;

export const S3SecretAccessKeySchema = z
  .string()
  .trim()
  .min(10, { message: 'S3_SECRET_ACCESS_KEY_DEBE_CONTENER_AL_MENOS_10_CARACTERES' })
  .describe('Clave secreta para la firma canónica AWS Signature v4.')
  .brand<'S3SecretAccessKey'>();

export type TS3SecretAccessKey = z.infer<typeof S3SecretAccessKeySchema>;

/* 6. INTELIGENCIA ARTIFICIAL Y ANÁLISIS COGNITIVO */
export const GoogleGeminiApiKeySecretSchema = z
  .string()
  .trim()
  .min(20, { message: 'LA_CLAVE_GEMINI_DEBE_CONTENER_AL_MENOS_20_CARACTERES' })
  .refine(enforceGeminiKeyPrefixAction, {
    message: 'LA_CLAVE_GEMINI_DEBE_INICIAR_CON_AIza_O_AQ_',
  })
  .describe(
    'Clave oficial de Google AI Studio (Standard AIza* o Auth Key AQ.*) para modelos Gemini.',
  )
  .brand<'GoogleGeminiApiKeySecret'>();

export type TGoogleGeminiApiKeySecret = z.infer<typeof GoogleGeminiApiKeySecretSchema>;

export const HuggingFaceApiTokenSecretSchema = z
  .string()
  .trim()
  .startsWith('hf_', { message: 'EL_TOKEN_DE_HUGGING_FACE_DEBE_INICIAR_CON_EL_PREFIJO_hf_' })
  .min(10, { message: 'EL_TOKEN_DE_HUGGING_FACE_DEBE_CONTENER_AL_MENOS_10_CARACTERES' })
  .describe('Token de autenticación para inferencia en Hugging Face Router.')
  .brand<'HuggingFaceApiTokenSecret'>();

export type THuggingFaceApiTokenSecret = z.infer<typeof HuggingFaceApiTokenSecretSchema>;

export const HuggingFaceModelUrlSchema = z
  .string()
  .trim()
  .url({ message: 'HUGGING_FACE_MODEL_URL_DEBE_SER_UNA_URL_VALIDA' })
  .refine(enforceHttpsProtocolAction, {
    message: 'HUGGING_FACE_MODEL_URL_REQUIERE_PROTOCOLO_HTTPS',
  })
  .describe('URL HTTPS canónica del modelo o endpoint en el enrutador de Hugging Face.')
  .brand<'HuggingFaceModelUrl'>();

export type THuggingFaceModelUrl = z.infer<typeof HuggingFaceModelUrlSchema>;

/* 7. TOPOLOGÍA DE RED Y PLATAFORMA */
export const SiteUniformResourceLocatorSchema = z
  .string()
  .trim()
  .url({ message: 'NEXT_PUBLIC_SITE_URL_DEBE_SER_UNA_URL_VALIDA' })
  .refine(enforceHttpOrHttpsProtocolAction, {
    message: 'NEXT_PUBLIC_SITE_URL_DEBE_SER_HTTP_O_HTTPS',
  })
  .describe('URL canónica absoluta del portal ciudadano para generación de enlaces y SEO.')
  .brand<'SiteUniformResourceLocator'>();

export type TSiteUniformResourceLocator = z.infer<typeof SiteUniformResourceLocatorSchema>;

export const NxCloudAccessSecurityTokenSchema = z
  .string()
  .trim()
  .min(1, { message: 'NX_CLOUD_ACCESS_TOKEN_NO_PUEDE_ESTAR_VACIO' })
  .describe('Token de autenticación para aceleración de compilación y caché de Nx Cloud.')
  .brand<'NxCloudAccessSecurityToken'>();

export type TNxCloudAccessSecurityToken = z.infer<typeof NxCloudAccessSecurityTokenSchema>;
