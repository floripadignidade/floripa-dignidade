/**
 * @section Environment Logic - Infrastructure Integrity Violation Reporter (Atom)
 * @description Átomo especializado de seguridad y manejo de excepciones encargado de procesar
 * los fallos de validación estructural en las variables de entorno.
 * Realiza el triaje de variables comprometidas, emite una señal telemétrica de severidad
 * CRITICAL conforme a ISO/IEC 11179 y ejecuta el bloqueo inmediato del sistema (Fail-Fast).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Confiabilidad) e ISO/IEC 27001 (Seguridad).
 * SANEADO Zenith: Alineación estricta con TelemetrySignalSchema inyectando occurrenceTimestampISO
 * y purga de propiedades legadas sin sufijo literal.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { ZodError } from 'zod';
import { InternalSystemException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const ENVIRONMENT_VALIDATOR_IDENTIFIER =
  'ENVIRONMENT_INFRASTRUCTURE_VALIDATOR' as ModuleIdentifier;

/**
 * Procesa un error de validación de entorno, emite el reporte forense inmutable y aborta la ejecución.
 *
 * @param zodErrorReference - Instancia inmutable del error de esquema capturado en tiempo de validación.
 * @param correlationIdentifier - Identificador de correlación para trazabilidad cruzada de la transacción.
 * @throws {InternalSystemException} Bloqueo mandatorio de seguridad Fail-Fast.
 * @returns {never} Esta función interrumpe físicamente el flujo de ejecución mediante el lanzamiento de excepción.
 */
export const ReportEnvironmentIntegrityViolation = (
  zodErrorReference: ZodError,
  correlationIdentifier: string,
): never => {
  // 1. TRIAJE FORENSE DE VARIABLES COMPROMETIDAS
  const validationIssuesMetadata = zodErrorReference.flatten().fieldErrors;
  const compromisedVariablesCollection = Object.keys(validationIssuesMetadata);

  // 2. REPORTE DE SEÑAL CRÍTICA AL MONITOR DE SALUD SRE (Alineación con TelemetrySignalSchema)
  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'CRITICAL',
    moduleIdentifierLiteral: ENVIRONMENT_VALIDATOR_IDENTIFIER,
    operationCodeLiteral:
      'ENVIRONMENT_INTEGRITY_VIOLATION' as OperationCode,
    correlationIdentifier,
    messageContentLiteral: 'ENVIRONMENT.LOGS.INTEGRITY_VIOLATION',
    semanticIntentTag: 'INFRASTRUCTURE_VIOLATION_CRITICAL',
    contextMetadataSnapshot: {
      compromisedVariablesCollection,
      forensicDetailsSnapshot: validationIssuesMetadata,
    },
  });

  // 3. BLOQUEO DE SEGURIDAD FAIL-FAST (Bypass Prevention)
  throw new InternalSystemException('FALLO_CRITICO_DE_ENTORNO_DETECTADO', {
    compromisedVariablesCollection,
    resolutionHintLiteral:
      'Sincronice los secretos requeridos en el proveedor Cloud (Supabase/Vercel/Google) antes de reiniciar.',
    correlationIdentifier,
    forensicDetailsSnapshot: validationIssuesMetadata,
  });
};