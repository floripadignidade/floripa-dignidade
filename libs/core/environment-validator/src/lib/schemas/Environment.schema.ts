/**
 * @section Environment Configuration - Infrastructure Contract Schema (Multi-Cloud AI Standard)
 * @description Única Fuente de Verdad (SSOT) para la auditoría y validación estricta de variables
 * de entorno del ecosistema. Implementa tipos nominales bridados bajo el estándar ISO/IEC 27001,
 * aislamiento de hardware conforme a la doctrina Cloud-Primary (ADR 0015) y soporte elástico
 * para inferencia cognitiva multi-proveedor (Google Gemini y Hugging Face Router).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Seguridad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @section ADN Criptográfico y Tipado Nominal (Branded Types)
 * Sellos de marca nominal que impiden colisiones semánticas y garantizan seguridad en tiempo de compilación.
 */

export const ResendApiKeySecretSchema = z
  .string()
  .startsWith('re_', {
    message: 'LA_CLAVE_RESEND_DEBE_INICIAR_CON_EL_PREFIJO_re_',
  })
  .brand<'ResendApiKeySecret'>();

export type TResendApiKeySecret = z.infer<typeof ResendApiKeySecretSchema>;

export const SupabaseUniformResourceLocatorSchema = z
  .string()
  .url({
    message: 'LA_URL_DE_SUPABASE_DEBE_SER_UNA_DIRECCION_HTTPS_VALIDA',
  })
  .describe('URL física del proyecto en la infraestructura gestionada de Supabase.')
  .brand<'SupabaseUniformResourceLocator'>();

export type TSupabaseUniformResourceLocator = z.infer<
  typeof SupabaseUniformResourceLocatorSchema
>;

export const SupabaseServiceKeySecretSchema = z
  .string()
  .min(50, {
    message: 'EL_TOKEN_SERVICE_ROLE_DEBE_CONTENER_AL_MENOS_50_CARACTERES',
  })
  .describe('Token administrativo institucional (Service Role) para bypass de RLS.')
  .brand<'SupabaseServiceKeySecret'>();

export type TSupabaseServiceKeySecret = z.infer<
  typeof SupabaseServiceKeySecretSchema
>;

export const PostgresUniformResourceLocatorSchema = z
  .string()
  .url({
    message: 'FORMATO_DE_DATABASE_URL_INVALIDO',
  })
  .startsWith('postgresql://', {
    message: 'DATABASE_URL_DEBE_INICIAR_CON_postgresql://',
  })
  .describe('Cadena de conexión directa o agrupada (pooling) al motor PostgreSQL.')
  .brand<'PostgresUniformResourceLocator'>();

export type TPostgresUniformResourceLocator = z.infer<
  typeof PostgresUniformResourceLocatorSchema
>;

export const WhatsAppSecretSchema = z
  .string()
  .min(16, {
    message: 'WHATSAPP_APP_SECRET_DEBE_CONTENER_AL_MENOS_16_CARACTERES',
  })
  .describe('Secreto de aplicación para validación de firmas HMAC-SHA256 en webhooks de Meta.')
  .brand<'WhatsAppSecret'>();

export type TWhatsAppSecret = z.infer<typeof WhatsAppSecretSchema>;

export const WhatsAppVerifyTokenSecretSchema = z
  .string()
  .min(10, {
    message: 'WHATSAPP_VERIFY_TOKEN_DEBE_CONTENER_AL_MENOS_10_CARACTERES',
  })
  .describe('Token de verificación para el handshake inicial del webhook con Meta Developers.')
  .brand<'WhatsAppVerifyTokenSecret'>();

export type TWhatsAppVerifyTokenSecret = z.infer<
  typeof WhatsAppVerifyTokenSecretSchema
>;

export const PayloadSecretSchema = z
  .string()
  .min(32, {
    message: 'PAYLOAD_SECRET_DEBE_CONTENER_AL_MENOS_32_CARACTERES',
  })
  .describe('Secreto criptográfico inalterable para el cifrado de sesiones en Payload CMS.')
  .brand<'PayloadSecret'>();

export type TPayloadSecret = z.infer<typeof PayloadSecretSchema>;

/**
 * @name EmergencySecurityTokenSchema
 * @description Token de alta entropía para contingencias y auditorías de infraestructura.
 */
export const EmergencySecurityTokenSchema = z
  .string()
  .min(32, {
    message: 'EL_TOKEN_DE_EMERGENCIA_DEBE_CONTENER_AL_MENOS_32_CARACTERES',
  })
  .describe('Token criptográfico para bypass de seguridad en recuperación ante desastres.')
  .brand<'EmergencySecurityToken'>();

export type TEmergencySecurityToken = z.infer<
  typeof EmergencySecurityTokenSchema
>;

/**
 * @name SovereignEmergencyTokenSchema
 * @description Alias institucional de compatibilidad histórica para transiciones de grafo.
 * @deprecated Utilizar canónicamente 'EmergencySecurityTokenSchema' bajo norma ISO/IEC 11179.
 */
export const SovereignEmergencyTokenSchema = EmergencySecurityTokenSchema;

/**
 * @section Persistencia Multimedia (Pasarela S3 Compatible)
 */
export const S3EndpointUniformResourceLocatorSchema = z
  .string()
  .url({
    message: 'S3_ENDPOINT_DEBE_SER_UNA_URL_VALIDA',
  })
  .describe('Endpoint S3 expuesto por Supabase Storage.')
  .brand<'S3EndpointUniformResourceLocator'>();

export type TS3EndpointUniformResourceLocator = z.infer<
  typeof S3EndpointUniformResourceLocatorSchema
>;

export const S3AccessKeyIdentifierSchema = z
  .string()
  .min(10, {
    message: 'S3_ACCESS_KEY_ID_DEBE_CONTENER_AL_MENOS_10_CARACTERES',
  })
  .describe('Identificador alfanumérico de acceso a la pasarela S3.')
  .brand<'S3AccessKeyIdentifier'>();

export type TS3AccessKeyIdentifier = z.infer<
  typeof S3AccessKeyIdentifierSchema
>;

export const S3SecretAccessKeySchema = z
  .string()
  .min(10, {
    message: 'S3_SECRET_ACCESS_KEY_DEBE_CONTENER_AL_MENOS_10_CARACTERES',
  })
  .describe('Clave secreta para la firma canónica AWS Signature v4.')
  .brand<'S3SecretAccessKey'>();

export type TS3SecretAccessKey = z.infer<typeof S3SecretAccessKeySchema>;

/**
 * @section Inteligencia Artificial y Análisis Cognitivo
 */

export const GoogleGeminiApiKeySecretSchema = z
  .string()
  .startsWith('AIzaSy', {
    message: 'LA_CLAVE_GEMINI_DEBE_COMENZAR_CON_EL_PREFIJO_AIzaSy',
  })
  .length(39, {
    message: 'LA_CLAVE_GEMINI_DEBE_CONTENER_EXACTAMENTE_39_CARACTERES',
  })
  .describe('Clave oficial de Google AI Studio para inferencia con modelos Gemini Flash.')
  .brand<'GoogleGeminiApiKeySecret'>();

export type TGoogleGeminiApiKeySecret = z.infer<
  typeof GoogleGeminiApiKeySecretSchema
>;

export const HuggingFaceApiTokenSecretSchema = z
  .string()
  .startsWith('hf_', {
    message: 'EL_TOKEN_DE_HUGGING_FACE_DEBE_INICIAR_CON_EL_PREFIJO_hf_',
  })
  .describe('Token de autenticación para inferencia en Hugging Face Router.')
  .brand<'HuggingFaceApiTokenSecret'>();

export type THuggingFaceApiTokenSecret = z.infer<
  typeof HuggingFaceApiTokenSecretSchema
>;

export const HuggingFaceModelUrlSchema = z
  .string()
  .url({
    message: 'HUGGING_FACE_MODEL_URL_DEBE_SER_UNA_URL_VALIDA',
  })
  .describe('URL canónica del modelo en el enrutador de Hugging Face.')
  .brand<'HuggingFaceModelUrl'>();

export type THuggingFaceModelUrl = z.infer<typeof HuggingFaceModelUrlSchema>;

/**
 * @section Metadatos de Red y Plataforma
 */
export const SiteUniformResourceLocatorSchema = z
  .string()
  .url({
    message: 'NEXT_PUBLIC_SITE_URL_DEBE_SER_UNA_URL_VALIDA',
  })
  .describe('URL canónica absoluta del portal ciudadano para generación de enlaces y SEO.')
  .brand<'SiteUniformResourceLocator'>();

export type TSiteUniformResourceLocator = z.infer<
  typeof SiteUniformResourceLocatorSchema
>;

export const NxCloudAccessSecurityTokenSchema = z
  .string()
  .describe('Token de autenticación para aceleración de compilación y caché de Nx Cloud.')
  .brand<'NxCloudAccessSecurityToken'>();

export type TNxCloudAccessSecurityToken = z.infer<
  typeof NxCloudAccessSecurityTokenSchema
>;

/**
 * @name EnvironmentSchema
 * @description Esquema inmutable de validación perimetral para el entorno de ejecución.
 * Aplica el principio Fail-Fast impidiendo el arranque si las variables requeridas están ausentes,
 * y verifica mediante una regla de refinamiento que al menos un motor de IA esté habilitado.
 */
export const EnvironmentSchema = z
  .object({
    // --- 1. COMUNICACIÓN TRANSACCIONAL (Resend) ---
    RESEND_API_KEY: ResendApiKeySecretSchema.describe(
      'Clave de API oficial para despacho de correos electrónicos transaccionales.',
    ),

    RESEND_FROM_EMAIL: z
      .string()
      .email({
        message: 'RESEND_FROM_EMAIL_DEBE_SER_UN_CORREO_VALIDO',
      })
      .describe('Dirección de correo remitente verificada en el DNS de la organización.'),

    // --- 2. PERSISTENCIA RELACIONAL Y DATA LAKE (Supabase / Postgres) ---
    SUPABASE_URL: SupabaseUniformResourceLocatorSchema.describe(
      'Punto de enlace REST del proyecto gestionado en Supabase.',
    ),

    SUPABASE_SERVICE_ROLE_KEY: SupabaseServiceKeySecretSchema.describe(
      'Clave de servicio institucional para operaciones seguras en el servidor.',
    ),

    DATABASE_URL: PostgresUniformResourceLocatorSchema.describe(
      'Cadena de conexión física para el adaptador relacional de PostgreSQL.',
    ),

    // --- 3. ALMACENAMIENTO MULTIMEDIA (Pasarela S3 Compatible) ---
    S3_ENDPOINT: S3EndpointUniformResourceLocatorSchema.describe(
      'Punto de enlace del gateway S3 de Supabase Storage.',
    ),

    S3_ACCESS_KEY_ID: S3AccessKeyIdentifierSchema.describe(
      'Identificador de acceso para la pasarela de almacenamiento S3.',
    ),

    S3_SECRET_ACCESS_KEY: S3SecretAccessKeySchema.describe(
      'Clave criptográfica secreta para operaciones sobre el bucket S3.',
    ),

    S3_REGION: z
      .string()
      .default('sa-east-1')
      .describe('Región geográfica oficial del proyecto (São Paulo, Brasil).'),

    S3_BUCKET: z
      .string()
      .min(3, {
        message: 'EL_NOMBRE_DEL_BUCKET_DEBE_CONTENER_AL_MENOS_3_CARACTERES',
      })
      .default('media-vault')
      .describe('Nombre del contenedor de evidencias y multimedia institucional.'),

    // --- 4. GESTIÓN DE CONTENIDOS Y SEGURIDAD INTERNA ---
    PAYLOAD_SECRET: PayloadSecretSchema.describe(
      'Secreto criptográfico inmutable para la seguridad de sesiones de Payload CMS.',
    ),

    SOVEREIGN_EMERGENCY_TOKEN: EmergencySecurityTokenSchema.describe(
      'Token de alta entropía para bypass de mantenimiento y auditorías de emergencia.',
    ),

    // --- 5. INFERENCIA COGNITIVA MULTI-PROVEEDOR (AI Engine) ---
    GOOGLE_GEMINI_API_KEY: GoogleGeminiApiKeySecretSchema.optional().describe(
      'Clave de Google AI Studio para inferencia cognitiva de baja latencia con Gemini.',
    ),

    HUGGING_FACE_API_TOKEN: HuggingFaceApiTokenSecretSchema.optional().describe(
      'Token de acceso para el enrutador serverless de Hugging Face.',
    ),

    HUGGING_FACE_MODEL_URL: HuggingFaceModelUrlSchema.optional().describe(
      'Endpoint del modelo SLM en el enrutador de Hugging Face.',
    ),

    // --- 6. COMUNICACIÓN CIUDADANA Y WEBHOOKS (Meta / WhatsApp) ---
    WHATSAPP_VERIFY_TOKEN: WhatsAppVerifyTokenSecretSchema.describe(
      'Token secreto para el apretón de manos del webhook en Meta Developers.',
    ),

    WHATSAPP_APP_SECRET: WhatsAppSecretSchema.describe(
      'Secreto de aplicación para verificación de firmas criptográficas HMAC de Meta.',
    ),

    // --- 7. INFRAESTRUCTURA Y TOPOLOGÍA DE RED ---
    NEXT_PUBLIC_SITE_URL: SiteUniformResourceLocatorSchema.describe(
      'URL canónica institucional para SEO y generación de enlaces de retorno.',
    ),

    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development')
      .describe('Modo de ejecución del runtime de Node.js.'),

    NX_CLOUD_ACCESS_TOKEN: NxCloudAccessSecurityTokenSchema.optional().describe(
      'Token de aceleración para compilaciones distribuidas en Nx Cloud.',
    ),
  })
  .refine(
    (environmentDataSnapshot) => {
      const isGeminiConfiguredBoolean =
        !!environmentDataSnapshot.GOOGLE_GEMINI_API_KEY &&
        environmentDataSnapshot.GOOGLE_GEMINI_API_KEY.trim() !== '';

      const isHuggingFaceConfiguredBoolean =
        !!environmentDataSnapshot.HUGGING_FACE_API_TOKEN &&
        !!environmentDataSnapshot.HUGGING_FACE_MODEL_URL &&
        environmentDataSnapshot.HUGGING_FACE_API_TOKEN.trim() !== '' &&
        environmentDataSnapshot.HUGGING_FACE_MODEL_URL.trim() !== '';

      return isGeminiConfiguredBoolean || isHuggingFaceConfiguredBoolean;
    },
    {
      message:
        'DEBE_CONFIGURAR_AL_MENOS_UN_PROVEEDOR_COGNITIVO_VALIDO_GOOGLE_GEMINI_O_HUGGING_FACE',
      path: ['GOOGLE_GEMINI_API_KEY'],
    },
  )
  .readonly();

export type IEnvironmentVariables = z.infer<typeof EnvironmentSchema>;