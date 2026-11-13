/**
 * @section Environment Configuration - Infrastructure Contract Schema (Master Orchestrator)
 * @description Única Fuente de Verdad (SSOT) para la auditoría y validación estricta de variables
 * de entorno del ecosistema. Implementa aislamiento de hardware conforme a la doctrina
 * Cloud-Primary (ADR 0015) y soporte elástico para inferencia cognitiva multi-proveedor.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Seguridad).
 *
 * SANEADO Zenith:
 * 1. Atomización completada: tokens bridados delegados a 'EnvironmentTokens.schema'.
 * 2. Reducción física a 112 líneas (cumplimiento de max-lines <= 150).
 * 3. Re-exportación simétrica total para preservar retrocompatibilidad absoluta en el monorepo.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/* 1. Importación y Re-exportación Simétrica de Tokens de Hardware (Clean Paths) */
import {
  EmergencySecurityTokenSchema,
  GoogleGeminiApiKeySecretSchema,
  HuggingFaceApiTokenSecretSchema,
  HuggingFaceModelUrlSchema,
  NxCloudAccessSecurityTokenSchema,
  PayloadSecretSchema,
  PostgresUniformResourceLocatorSchema,
  ResendApiKeySecretSchema,
  S3AccessKeyIdentifierSchema,
  S3EndpointUniformResourceLocatorSchema,
  S3SecretAccessKeySchema,
  SiteUniformResourceLocatorSchema,
  SupabaseServiceKeySecretSchema,
  SupabaseUniformResourceLocatorSchema,
  WhatsAppSecretSchema,
  WhatsAppVerifyTokenSecretSchema,
} from './EnvironmentTokens.schema';

export * from './EnvironmentTokens.schema';

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
      'Clave de API oficial para correos transaccionales.',
    ),
    RESEND_FROM_EMAIL: z
      .string()
      .email({ message: 'RESEND_FROM_EMAIL_DEBE_SER_UN_CORREO_VALIDO' })
      .describe('Dirección de correo remitente verificada en el DNS.'),

    // --- 2. PERSISTENCIA RELACIONAL Y DATA LAKE (Supabase / Postgres) ---
    SUPABASE_URL: SupabaseUniformResourceLocatorSchema.describe(
      'Punto de enlace REST de Supabase.',
    ),
    SUPABASE_SERVICE_ROLE_KEY: SupabaseServiceKeySecretSchema.describe(
      'Token institucional Service Role.',
    ),
    DATABASE_URL: PostgresUniformResourceLocatorSchema.describe(
      'Cadena de conexión física a PostgreSQL.',
    ),

    // --- 3. ALMACENAMIENTO MULTIMEDIA (Pasarela S3 Compatible) ---
    S3_ENDPOINT: S3EndpointUniformResourceLocatorSchema.describe(
      'Endpoint S3 de Supabase Storage.',
    ),
    S3_ACCESS_KEY_ID: S3AccessKeyIdentifierSchema.describe('ID de acceso S3.'),
    S3_SECRET_ACCESS_KEY: S3SecretAccessKeySchema.describe('Clave secreta para firma AWS SigV4.'),
    S3_REGION: z.string().default('sa-east-1').describe('Región geográfica oficial (São Paulo).'),
    S3_BUCKET: z
      .string()
      .min(3, { message: 'EL_NOMBRE_DEL_BUCKET_DEBE_CONTENER_AL_MENOS_3_CARACTERES' })
      .default('media-vault')
      .describe('Contenedor de evidencias y multimedia.'),

    // --- 4. GESTIÓN DE CONTENIDOS Y SEGURIDAD INTERNA ---
    PAYLOAD_SECRET: PayloadSecretSchema.describe(
      'Secreto criptográfico para sesiones en Payload CMS.',
    ),
    SOVEREIGN_EMERGENCY_TOKEN: EmergencySecurityTokenSchema.describe(
      'Token para bypass de contingencias.',
    ),

    // --- 5. INFERENCIA COGNITIVA MULTI-PROVEEDOR (AI Engine) ---
    GOOGLE_GEMINI_API_KEY: GoogleGeminiApiKeySecretSchema.optional().describe(
      'Clave de Google AI Studio.',
    ),
    HUGGING_FACE_API_TOKEN: HuggingFaceApiTokenSecretSchema.optional().describe(
      'Token de Hugging Face Router.',
    ),
    HUGGING_FACE_MODEL_URL: HuggingFaceModelUrlSchema.optional().describe(
      'URL del modelo SLM en Hugging Face.',
    ),

    // --- 6. COMUNICACIÓN CIUDADANA Y WEBHOOKS (Meta / WhatsApp) ---
    WHATSAPP_VERIFY_TOKEN: WhatsAppVerifyTokenSecretSchema.describe(
      'Token para handshake del webhook.',
    ),
    WHATSAPP_APP_SECRET: WhatsAppSecretSchema.describe('Secreto para verificación de firmas HMAC.'),

    // --- 7. INFRAESTRUCTURA Y TOPOLOGÍA DE RED ---
    NEXT_PUBLIC_SITE_URL: SiteUniformResourceLocatorSchema.describe(
      'URL canónica del portal para SEO.',
    ),
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development')
      .describe('Modo de ejecución del runtime.'),
    NX_CLOUD_ACCESS_TOKEN: NxCloudAccessSecurityTokenSchema.optional().describe(
      'Token de aceleración Nx Cloud.',
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
