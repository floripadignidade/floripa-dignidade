/**
 * @section Exception DNA - Structural Integrity Schema
 * @description Define el contrato de Verdad Única (SSOT) para la taxonomía de errores.
 * Implementa Branded Types para evitar la polución de códigos y asegurar que
 * solo literales autorizados circulen por el sistema nervioso central.
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & ISO Standard Naming.
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */
import { z } from 'zod';
/**
 * @section Tipado Nominal (Branded Types)
 * @description Protege los códigos de error de colisiones semánticas.
 */
export declare const ErrorCodeSchema: z.ZodBranded<z.ZodEnum<["VALIDATION_FAILED", "UNAUTHORIZED_ACCESS", "INTERNAL_SYSTEM_FAILURE", "RESOURCE_NOT_FOUND", "EXTERNAL_SERVICE_TIMEOUT", "INFRASTRUCTURE_BOOTSTRAP_FAULT", "CRYPTOGRAPHIC_SIGNATURE_MISMATCH", "PAYLOAD_TOO_LARGE"]>, "ErrorCode">;
/** Representación en tiempo de compilación del código de error sellado. */
export type ErrorCode = z.infer<typeof ErrorCodeSchema>;
/**
 * @name RuntimeSnapshotSchema
 * @description Aduana de ADN para la captura forense de metadatos en el momento del fallo.
 */
export declare const RuntimeSnapshotSchema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
/** Interfaz inmutable para el rastro forense. */
export type IRuntimeSnapshot = z.infer<typeof RuntimeSnapshotSchema>;
/**
 * @name ExceptionContractSchema
 * @description Esquema de validación para la estructura interna de cualquier excepción.
 */
export declare const ExceptionContractSchema: z.ZodReadonly<z.ZodObject<{
    operationalErrorCodeLiteral: z.ZodBranded<z.ZodEnum<["VALIDATION_FAILED", "UNAUTHORIZED_ACCESS", "INTERNAL_SYSTEM_FAILURE", "RESOURCE_NOT_FOUND", "EXTERNAL_SERVICE_TIMEOUT", "INFRASTRUCTURE_BOOTSTRAP_FAULT", "CRYPTOGRAPHIC_SIGNATURE_MISMATCH", "PAYLOAD_TOO_LARGE"]>, "ErrorCode">;
    httpStatusCodeNumeric: z.ZodNumber;
    occurrenceTimestampISO: z.ZodString;
    runtimeContextSnapshot: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    occurrenceTimestampISO: string;
    operationalErrorCodeLiteral: ("VALIDATION_FAILED" | "UNAUTHORIZED_ACCESS" | "INTERNAL_SYSTEM_FAILURE" | "RESOURCE_NOT_FOUND" | "EXTERNAL_SERVICE_TIMEOUT" | "INFRASTRUCTURE_BOOTSTRAP_FAULT" | "CRYPTOGRAPHIC_SIGNATURE_MISMATCH" | "PAYLOAD_TOO_LARGE") & z.BRAND<"ErrorCode">;
    httpStatusCodeNumeric: number;
    runtimeContextSnapshot: Record<string, unknown>;
}, {
    occurrenceTimestampISO: string;
    operationalErrorCodeLiteral: "VALIDATION_FAILED" | "UNAUTHORIZED_ACCESS" | "INTERNAL_SYSTEM_FAILURE" | "RESOURCE_NOT_FOUND" | "EXTERNAL_SERVICE_TIMEOUT" | "INFRASTRUCTURE_BOOTSTRAP_FAULT" | "CRYPTOGRAPHIC_SIGNATURE_MISMATCH" | "PAYLOAD_TOO_LARGE";
    httpStatusCodeNumeric: number;
    runtimeContextSnapshot: Record<string, unknown>;
}>>;
/** Interfaz de validación interna para el Neural Sentinel. */
export type IExceptionContract = z.infer<typeof ExceptionContractSchema>;
//# sourceMappingURL=Exception.schema.d.ts.map