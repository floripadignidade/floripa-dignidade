/**
 * @section Environment DNA - Infrastructure Sovereignty Schema
 * @description Define o contrato de integridade absoluto para as variáveis de ambiente.
 * Implementa Branded Types para blindar segredos e garantir o padrão ISO de segurança.
 * Atua como a única Aduana de ADN para a execução Cloud-Sovereign (ADR 0015).
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & ReadOnly Integrity.
 * SANEADO Zenith: Erradicação de abreviações e injeção de ADN nominal completo.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */
import { z } from 'zod';
/**
 * @section Branded Types (ADN Criptográfico)
 * @description Evitam a colisão semântica entre diferentes segredos de infraestrutura.
 */
export declare const ResendApiKeySchema: z.ZodBranded<z.ZodString, "ResendApiKey">;
export declare const SupabaseUniformResourceLocatorSchema: z.ZodBranded<z.ZodString, "SupabaseUniformResourceLocator">;
export declare const SupabaseServiceKeySchema: z.ZodBranded<z.ZodString, "SupabaseServiceKey">;
export declare const PostgresUniformResourceLocatorSchema: z.ZodBranded<z.ZodString, "PostgresUniformResourceLocator">;
export declare const WhatsAppSecretSchema: z.ZodBranded<z.ZodString, "WhatsAppSecret">;
export declare const WhatsAppVerifyTokenSchema: z.ZodBranded<z.ZodString, "WhatsAppVerifyToken">;
export declare const PayloadSecretSchema: z.ZodBranded<z.ZodString, "PayloadSecret">;
export declare const SovereignEmergencyTokenSchema: z.ZodBranded<z.ZodString, "SovereignEmergencyToken">;
/** ADN para Persistência Multimídia (S3 Gateway) */
export declare const S3EndpointUniformResourceLocatorSchema: z.ZodBranded<z.ZodString, "S3EndpointUniformResourceLocator">;
export declare const S3AccessKeyIdentifierSchema: z.ZodBranded<z.ZodString, "S3AccessKeyIdentifier">;
export declare const S3SecretAccessKeySchema: z.ZodBranded<z.ZodString, "S3SecretAccessKey">;
export declare const SiteUniformResourceLocatorSchema: z.ZodBranded<z.ZodString, "SiteUniformResourceLocator">;
export declare const NxCloudAccessTokenSchema: z.ZodBranded<z.ZodString, "NxCloudAccessToken">;
/**
 * @name EnvironmentSchema
 * @description Aduana mestra que valida a saúde do ambiente antes do arranque do sistema.
 * Implementa o padrão de validação proativa (Fail-Fast) para evitar estados inconsistentes.
 */
export declare const EnvironmentSchema: z.ZodReadonly<z.ZodObject<{
    RESEND_API_KEY: z.ZodBranded<z.ZodString, "ResendApiKey">;
    RESEND_FROM_EMAIL: z.ZodString;
    SUPABASE_URL: z.ZodBranded<z.ZodString, "SupabaseUniformResourceLocator">;
    SUPABASE_SERVICE_ROLE_KEY: z.ZodBranded<z.ZodString, "SupabaseServiceKey">;
    DATABASE_URL: z.ZodBranded<z.ZodString, "PostgresUniformResourceLocator">;
    S3_ENDPOINT: z.ZodBranded<z.ZodString, "S3EndpointUniformResourceLocator">;
    S3_ACCESS_KEY_ID: z.ZodBranded<z.ZodString, "S3AccessKeyIdentifier">;
    S3_SECRET_ACCESS_KEY: z.ZodBranded<z.ZodString, "S3SecretAccessKey">;
    S3_REGION: z.ZodDefault<z.ZodString>;
    S3_BUCKET: z.ZodDefault<z.ZodString>;
    PAYLOAD_SECRET: z.ZodBranded<z.ZodString, "PayloadSecret">;
    /** 🛡️ SANEADO: Injeção oficial do token de bypass soberano no contrato global */
    SOVEREIGN_EMERGENCY_TOKEN: z.ZodBranded<z.ZodString, "SovereignEmergencyToken">;
    WHATSAPP_VERIFY_TOKEN: z.ZodBranded<z.ZodString, "WhatsAppVerifyToken">;
    WHATSAPP_APP_SECRET: z.ZodBranded<z.ZodString, "WhatsAppSecret">;
    NEXT_PUBLIC_SITE_URL: z.ZodBranded<z.ZodString, "SiteUniformResourceLocator">;
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
    /** Auditoria de Nx Cloud para CI/CD */
    NX_CLOUD_ACCESS_TOKEN: z.ZodOptional<z.ZodBranded<z.ZodString, "NxCloudAccessToken">>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "production" | "test";
    SUPABASE_URL: string & z.BRAND<"SupabaseUniformResourceLocator">;
    SUPABASE_SERVICE_ROLE_KEY: string & z.BRAND<"SupabaseServiceKey">;
    RESEND_API_KEY: string & z.BRAND<"ResendApiKey">;
    RESEND_FROM_EMAIL: string;
    DATABASE_URL: string & z.BRAND<"PostgresUniformResourceLocator">;
    S3_ENDPOINT: string & z.BRAND<"S3EndpointUniformResourceLocator">;
    S3_ACCESS_KEY_ID: string & z.BRAND<"S3AccessKeyIdentifier">;
    S3_SECRET_ACCESS_KEY: string & z.BRAND<"S3SecretAccessKey">;
    S3_REGION: string;
    S3_BUCKET: string;
    PAYLOAD_SECRET: string & z.BRAND<"PayloadSecret">;
    SOVEREIGN_EMERGENCY_TOKEN: string & z.BRAND<"SovereignEmergencyToken">;
    WHATSAPP_VERIFY_TOKEN: string & z.BRAND<"WhatsAppVerifyToken">;
    WHATSAPP_APP_SECRET: string & z.BRAND<"WhatsAppSecret">;
    NEXT_PUBLIC_SITE_URL: string & z.BRAND<"SiteUniformResourceLocator">;
    NX_CLOUD_ACCESS_TOKEN?: (string & z.BRAND<"NxCloudAccessToken">) | undefined;
}, {
    SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    RESEND_API_KEY: string;
    RESEND_FROM_EMAIL: string;
    DATABASE_URL: string;
    S3_ENDPOINT: string;
    S3_ACCESS_KEY_ID: string;
    S3_SECRET_ACCESS_KEY: string;
    PAYLOAD_SECRET: string;
    SOVEREIGN_EMERGENCY_TOKEN: string;
    WHATSAPP_VERIFY_TOKEN: string;
    WHATSAPP_APP_SECRET: string;
    NEXT_PUBLIC_SITE_URL: string;
    NODE_ENV?: "development" | "production" | "test" | undefined;
    S3_REGION?: string | undefined;
    S3_BUCKET?: string | undefined;
    NX_CLOUD_ACCESS_TOKEN?: string | undefined;
}>>;
/**
 * @section ADN Tipado (Verbatim Module Syntax)
 * Interface inalterável que garante acesso 100% Type-Safe à infraestrutura.
 */
export type IEnvironmentVariables = z.infer<typeof EnvironmentSchema>;
//# sourceMappingURL=Environment.schema.d.ts.map