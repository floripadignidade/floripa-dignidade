/**
 * @section Exception DNA - Structural Integrity Schema
 * @description Define el contrato de Verdad Única (SSOT) para la taxonomía de errores.
 * Implementa Branded Types para blindar códigos y asegurar que el rastro forense
 * sea inmutable y procesable por el Neural Sentinel.
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & ISO Standard Naming.
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @section Tipado Nominal (Branded Types)
 * @description Protege los códigos de error de colisiones semánticas y polución de tipos.
 */
export const ErrorCodeSchema = z
  .enum([
    'VALIDATION_FAILED', // Datos violan el contrato Zod.
    'UNAUTHORIZED_ACCESS', // Falla de jerarquía RBAC.
    'INTERNAL_SYSTEM_FAILURE', // Colapso lógico o excepción no controlada.
    'RESOURCE_NOT_FOUND', // Entidad inexistente en el Ledger.
    'EXTERNAL_SERVICE_TIMEOUT', // Latencia excedida en proveedores (Tier Zero).
    'INFRASTRUCTURE_BOOTSTRAP_FAULT', // Fallo en la aduana de entorno al arrancar.
    'CRYPTOGRAPHIC_SIGNATURE_MISMATCH', // Error de integridad en firmas Meta/Supabase.
    'PAYLOAD_TOO_LARGE', // Exceso de volumen en I/O.
    'RATE_LIMIT_EXCEEDED', // Bloqueo por cuotas de Cloud-Sovereign.
    'CONFLICT_DUPLICATE_RESOURCE', // Violación de unicidad en persistencia.
  ])
  .describe('Catálogo soberano de códigos operativos para el triaje de la IA.')
  .brand<'ErrorCode'>();

/** Representación técnica del código de error sellado. */
export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

/**
 * @name RuntimeSnapshotSchema
 * @description Aduana de ADN para la captura forense de metadatos.
 * Garantiza que el contexto del fallo sea inalterable.
 */
export const RuntimeSnapshotSchema = z
  .record(z.string(), z.unknown())
  .describe('Snapshot inmutable del contexto de ejecución (Variables, Estados, IDs).')
  .readonly();

/** Interfaz inmutable para el rastro de auditoría. */
export type IRuntimeSnapshot = z.infer<typeof RuntimeSnapshotSchema>;

/**
 * @name ExceptionContractSchema
 * @description Esquema maestro que define la anatomía de una excepción nivelada.
 */
export const ExceptionContractSchema = z
  .object({
    /** Código semántico registrado en el catálogo. */
    operationalErrorCodeLiteral: ErrorCodeSchema,

    /** Código de estado físico para el transporte HTTP/Edge. */
    httpStatusCodeNumeric: z
      .number()
      .int()
      .min(400)
      .max(599)
      .describe('Código de estado según estándar RFC 9110.'),

    /** Marca temporal de precisión ISO 8601. */
    occurrenceTimestampISO: z
      .string()
      .datetime()
      .describe('Timestamp exacto de la captura del fallo.'),

    /** Colección de evidencia técnica del entorno. */
    runtimeContextSnapshot: RuntimeSnapshotSchema,
  })
  .readonly(); // Inmutabilidad forzada para proteger el flujo sanguíneo digital.

/** Interfaz de validación para procesos de telemetría y auditoría. */
export type IExceptionContract = z.infer<typeof ExceptionContractSchema>;
