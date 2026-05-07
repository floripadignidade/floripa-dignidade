/**
 * @section Telemetry DNA - Sovereign Signal Schema (Next-Gen)
 * @description Define el contrato de integridad absoluto para las señales del
 * sistema nervioso central. Implementa soporte para encadenamiento criptográfico
 * (Merkle Chain), rastro de cifrado y etiquetado semántico para IA.
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & Cryptographic Integrity.
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */
import { z } from 'zod';
/**
 * @section ADN Criptográfico (Branded Types)
 */
export declare const CorrelationIdentifierSchema: z.ZodBranded<z.ZodString, "CorrelationIdentifier">;
export type CorrelationIdentifier = z.infer<typeof CorrelationIdentifierSchema>;
export declare const ModuleIdentifierSchema: z.ZodBranded<z.ZodString, "ModuleIdentifier">;
export type ModuleIdentifier = z.infer<typeof ModuleIdentifierSchema>;
export declare const OperationCodeSchema: z.ZodBranded<z.ZodString, "OperationCode">;
export type OperationCode = z.infer<typeof OperationCodeSchema>;
/** 🛡️ SANEADO Zenith: Firma criptográfica para la inalterabilidad Merkle */
export declare const ContentFingerprintSchema: z.ZodBranded<z.ZodString, "ContentFingerprint">;
export type ContentFingerprint = z.infer<typeof ContentFingerprintSchema>;
/**
 * @section Taxonomía de Severidad
 */
export declare const SeverityLevelSchema: z.ZodEnum<["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]>;
export type SeverityLevel = z.infer<typeof SeverityLevelSchema>;
/**
 * @name TelemetrySignalSchema
 * @description Contrato maestro de un pulso telemétrico de alta fidelidad.
 */
export declare const TelemetrySignalSchema: z.ZodReadonly<z.ZodObject<{
    /** Marca temporal inmutable del evento (ISO 8601). */
    occurrenceTimestampISO: z.ZodString;
    /** Prioridad técnica del evento. */
    severityLevelLiteral: z.ZodEnum<["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]>;
    /** Identificador nominal del búnker emisor. */
    moduleIdentifierLiteral: z.ZodBranded<z.ZodString, "ModuleIdentifier">;
    /** Código semántico de la acción. */
    operationCodeLiteral: z.ZodBranded<z.ZodString, "OperationCode">;
    /** Rastro forense cross-module que vincula toda la transacción. */
    correlationIdentifier: z.ZodBranded<z.ZodString, "CorrelationIdentifier">;
    /** Mensaje descriptivo o clave de diccionario i18n. */
    messageContentLiteral: z.ZodString;
    /**
     * @section Capa Merkle (Inalterabilidad)
     * Firma del evento anterior en la cadena para asegurar la no-manipulación.
     */
    previousEventHashFingerprint: z.ZodOptional<z.ZodBranded<z.ZodString, "ContentFingerprint">>;
    /** Firma SHA-256 del contenido actual del log. */
    contentHashFingerprint: z.ZodOptional<z.ZodBranded<z.ZodString, "ContentFingerprint">>;
    /**
     * @section Capa de Privacidad y IA
     */
    isEncryptedPayloadBoolean: z.ZodDefault<z.ZodBoolean>;
    semanticIntentTag: z.ZodOptional<z.ZodString>;
    /** Métrica de rendimiento en tiempo real. */
    executionLatencyInMillisecondsQuantity: z.ZodOptional<z.ZodNumber>;
    /** Captura de estado adicional (Contextual Snapshot). */
    contextMetadataSnapshot: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    occurrenceTimestampISO: string;
    severityLevelLiteral: "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";
    moduleIdentifierLiteral: string & z.BRAND<"ModuleIdentifier">;
    operationCodeLiteral: string & z.BRAND<"OperationCode">;
    correlationIdentifier: string & z.BRAND<"CorrelationIdentifier">;
    messageContentLiteral: string;
    isEncryptedPayloadBoolean: boolean;
    previousEventHashFingerprint?: (string & z.BRAND<"ContentFingerprint">) | undefined;
    contentHashFingerprint?: (string & z.BRAND<"ContentFingerprint">) | undefined;
    semanticIntentTag?: string | undefined;
    executionLatencyInMillisecondsQuantity?: number | undefined;
    contextMetadataSnapshot?: Record<string, unknown> | undefined;
}, {
    occurrenceTimestampISO: string;
    severityLevelLiteral: "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";
    moduleIdentifierLiteral: string;
    operationCodeLiteral: string;
    correlationIdentifier: string;
    messageContentLiteral: string;
    previousEventHashFingerprint?: string | undefined;
    contentHashFingerprint?: string | undefined;
    isEncryptedPayloadBoolean?: boolean | undefined;
    semanticIntentTag?: string | undefined;
    executionLatencyInMillisecondsQuantity?: number | undefined;
    contextMetadataSnapshot?: Record<string, unknown> | undefined;
}>>;
/** 🛡️ ADN Tipado para el Enjambre de Telemetría Zenith */
export type ITelemetrySignal = z.infer<typeof TelemetrySignalSchema>;
//# sourceMappingURL=TelemetrySignal.schema.d.ts.map