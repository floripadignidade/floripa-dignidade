/**
 * @section Environment DNA - Infrastructure Sovereignty Schema
 * @description Define el contrato de integridad absoluto para las variables de entorno.
 * Implementa Branded Types para blindar secretos y garantiza el estándar ISO 27001.
 * Actúa como la única Aduana de ADN para la ejecución Cloud-Sovereign (ADR 0015).
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & ReadOnly Integrity.
 * SANEADO Zenith: Inyección de secretos de IA y normalización de sufijos de seguridad.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @section ADN Criptográfico (Branded Types)
 * @description Sellos de marca nominal para evitar colisiones semánticas.
 */

export const ResendApiKeySecretSchema = z.string()
  .startsWith('re_')
  .brand<'ResendApiKeySecret'>();

export const SupabaseUniformResourceLocatorSchema = z.string()
  .url()
  .describe('URL física del proyecto en el Tier de Supabase.')
  .brand<'SupabaseUniformResourceLocator'>();

export const SupabaseServiceKeySecretSchema = z.string()
  .min(50)
  .describe('Token de acceso administrativo (Service Role) para bypass de RLS.')
  .brand<'SupabaseServiceKeySecret'>();

export const PostgresUniformResourceLocatorSchema = z.string()
  .url()
  .startsWith('postgresql://')
  .brand<'PostgresUniformResourceLocator'>();

export const WhatsAppSecretSchema = z.string()
  .min(16)
  .brand<'WhatsAppSecret'>();

export const WhatsAppVerifyTokenSecretSchema = z.string()
  .min(10)
  .brand<'WhatsAppVerifyTokenSecret'>();

export const PayloadSecretSchema = z.string()
  .min(32, { message: 'PAYLOAD_SECRET_MUST_BE_AT_LEAST_32_CHARACTERS' })
  .brand<'PayloadSecret'>();

export const SovereignEmergencyTokenSchema = z.string()
  .min(32)
  .describe('Token de alta seguridad para bypass de auditoría en casos de falla crítica.')
  .brand<'SovereignEmergencyToken'>();

/** ADN para Persistencia Multimídia (S3 Gateway) */
export const S3EndpointUniformResourceLocatorSchema = z.string()
  .url()
  .brand<'S3EndpointUniformResourceLocator'>();

export const S3AccessKeyIdentifierSchema = z.string()
  .min(10)
  .brand<'S3AccessKeyIdentifier'>();

export const S3SecretAccessKeySchema = z.string()
  .min(10)
  .brand<'S3SecretAccessKey'>();

/** 🛡️ SANEADO Zenith: ADN para el Neural Sentinel (Hugging Face) */
export const HuggingFaceApiTokenSecretSchema = z.string()
  .startsWith('hf_')
  .brand<'HuggingFaceApiTokenSecret'>();

export const HuggingFaceModelUrlSchema = z.string()
  .url()
  .brand<'HuggingFaceModelUrl'>();

export const SiteUniformResourceLocatorSchema = z.string()
  .url()
  .brand<'SiteUniformResourceLocator'>();

export const NxCloudAccessSecurityTokenSchema = z.string()
  .brand<'NxCloudAccessSecurityToken'>();

/**
 * @name EnvironmentSchema
 * @description Aduana maestra que valida la salud del entorno antes del arranque del sistema.
 * Implementa el patrón de validación proactiva (Fail-Fast) para evitar estados inconsistentes.
 */
export const EnvironmentSchema = z.object({

  // --- COMUNICAÇÃO TRANSACIONAL (Resend) ---
  RESEND_API_KEY: ResendApiKeySecretSchema
    .describe('Chave de API oficial para o despacho de correios eletrônicos transacionais.'),

  RESEND_FROM_EMAIL: z.string()
    .email()
    .describe('Endereço de remetente autorizado pelo DNS da ONG.'),

  // --- SOBERANIA CLOUD (Supabase / Persistência) ---
  SUPABASE_URL: SupabaseUniformResourceLocatorSchema
    .describe('Ponto de enlace REST para a base de dados de cidadãos.'),

  SUPABASE_SERVICE_ROLE_KEY: SupabaseServiceKeySecretSchema
    .describe('Chave mestra para operações de escrita assíncronas no Supabase.'),

  DATABASE_URL: PostgresUniformResourceLocatorSchema
    .describe('String de conexão física para o motor de persistência Postgres.'),

  // --- PERSISTÊNCIA MULTIMÍDIA (S3-Compatible / Supabase Storage) ---
  S3_ENDPOINT: S3EndpointUniformResourceLocatorSchema
    .describe('Ponto de enlace S3 fornecido pelo Supabase Storage.'),

  S3_ACCESS_KEY_ID: S3AccessKeyIdentifierSchema
    .describe('Identificador de acesso para o protocolo S3.'),

  S3_SECRET_ACCESS_KEY: S3SecretAccessKeySchema
    .describe('Chave secreta criptográfica para a persistência multimídia.'),

  S3_REGION: z.string()
    .default('us-east-1')
    .describe('Região física do bucket de armazenamento.'),

  S3_BUCKET: z.string()
    .min(3)
    .default('media-vault')
    .describe('Nome do contêiner de arquivos na nuvem.'),

  // --- GESTÃO DE CONTEÚDO (Payload CMS) ---
  PAYLOAD_SECRET: PayloadSecretSchema
    .describe('Segredo criptográfico inalterável para a segurança de sessões administrativas.'),

  SOVEREIGN_EMERGENCY_TOKEN: SovereignEmergencyTokenSchema,

  // --- INTELIGENCIA ARTIFICIAL (Neural Sentinel) ---
  /** 🛡️ SANEADO Zenith: Inyección necesaria para la auditoría cognitiva de denuncias. */
  HUGGING_FACE_API_TOKEN: HuggingFaceApiTokenSecretSchema
    .describe('Token de autenticação para os modelos SLM em Hugging Face Spaces.'),

  HUGGING_FACE_MODEL_URL: HuggingFaceModelUrlSchema
    .describe('URL de inferência para o cérebro de análise de saúde e veracidade.'),

  // --- GATEWAY DE MENSAGENS (WhatsApp / Meta) ---
  WHATSAPP_VERIFY_TOKEN: WhatsAppVerifyTokenSecretSchema
    .describe('Token secreto para o handshake inicial com a Meta.'),

  WHATSAPP_APP_SECRET: WhatsAppSecretSchema
    .describe('Segredo de aplicação para validação de assinaturas HMAC SHA256.'),

  // --- IDENTIDADE E ORQUESTRAÇÃO DE PLATAFORMA ---
  NEXT_PUBLIC_SITE_URL: SiteUniformResourceLocatorSchema
    .describe('URL absoluta do portal para geração de links e metadados SEO.'),

  NODE_ENV: z.enum(['development', 'production', 'test'])
    .default('development')
    .describe('Identificador do modo de execução do compilador.'),

  /** Auditoria de Nx Cloud para CI/CD */
  NX_CLOUD_ACCESS_TOKEN: NxCloudAccessSecurityTokenSchema
    .optional()
    .describe('Token para habilitar computação remota e cache distribuído.'),

}).readonly();

/**
 * @section ADN Tipado (Verbatim Module Syntax)
 * Interface inalterável que garante acesso 100% Type-Safe à infraestrutura.
 */
export type IEnvironmentVariables = z.infer<typeof EnvironmentSchema>;
