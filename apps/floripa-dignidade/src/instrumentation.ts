/**
 * @section Application Bootstrap - Instrumentation Hook Orchestrator
 * @description Sensor perimetral encargado de la secuencia de arranque del servidor.
 * Ejecuta la verificación de integridad de infraestructura y secretos cloud
 * antes de habilitar el procesamiento de tráfico ciudadano en Next.js 16+.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & SRE Observability).
 * Normas: ISO/IEC 11179 (Nomenclatura Técnica) e ISO/IEC 25010 (Confiabilidad y Seguridad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  GatherEnvironmentMetadata,
  ValidateEnvironmentContract,
} from '@floripa-dignidade/environment-validator';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const BOOTSTRAP_MODULE_IDENTIFIER = 'APPLICATION_BOOTSTRAP' as ModuleIdentifier;

/**
 * Función primaria de registro invocada por el motor de Next.js al inicializar el nodo.
 * Implementa un bloqueo preventivo Fail-Fast: si la configuración de entorno es inválida,
 * el proceso de arranque colapsa con rastro forense, protegiendo la integridad del sistema.
 *
 * @returns {Promise<void>} Promesa que se resuelve únicamente si la infraestructura es nominal.
 */
export async function register(): Promise<void> {
  /**
   * @section Validación de Ámbito de Ejecución
   * Determinación isomórfica del entorno: la instrumentación es exclusiva
   * de la capa de servidor (Node.js o Edge Runtime).
   */
  const environmentMetadataSnapshot = GatherEnvironmentMetadata();
  const executionRuntimeIdentifierLiteral = environmentMetadataSnapshot['NEXT_RUNTIME'] ?? 'nodejs';

  const isServerEnvironmentBoolean =
    executionRuntimeIdentifierLiteral === 'nodejs' || executionRuntimeIdentifierLiteral === 'edge';

  if (!isServerEnvironmentBoolean) {
    return;
  }

  const bootstrapCorrelationIdentifier = GenerateCorrelationIdentifier();

  // 1. REPORTE DE INICIO DE SECUENCIA (SRE Visibility)
  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'INFO',
    moduleIdentifierLiteral: BOOTSTRAP_MODULE_IDENTIFIER,
    operationCodeLiteral: 'BOOTSTRAP_SEQUENCE_STARTED' as OperationCode,
    correlationIdentifier: bootstrapCorrelationIdentifier,
    messageContentLiteral:
      'Iniciando secuencia de instrumentación técnica: Auditoría de cimientos en curso.',
    semanticIntentTag: 'SERVER_BOOTSTRAP_START',
    contextMetadataSnapshot: {
      runtimeIdentifierLiteral: executionRuntimeIdentifierLiteral,
    },
  });

  try {
    /**
     * 2. AUDITORÍA DE INFRAESTRUCTURA Y SECRETOS (Fail-Fast Guardian)
     * Verifica la integridad estructural de todos los secretos cloud requeridos.
     */
    await ValidateEnvironmentContract();

    // 3. REPORTE DE ESTADO NOMINAL (Ready for Traffic)
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: BOOTSTRAP_MODULE_IDENTIFIER,
      operationCodeLiteral: 'BOOTSTRAP_SEQUENCE_NOMINAL' as OperationCode,
      correlationIdentifier: bootstrapCorrelationIdentifier,
      messageContentLiteral:
        'Cimientos de infraestructura validados con éxito. El portal está listo para operar.',
      semanticIntentTag: 'SERVER_BOOTSTRAP_READY',
      contextMetadataSnapshot: {
        runtimeIdentifierLiteral: executionRuntimeIdentifierLiteral,
      },
    });
  } catch (caughtBootstrapError: unknown) {
    /**
     * @section Gestión Forense de Colapso de Arranque
     * Captura el rastro de la falla en telemetría antes de propagar la interrupción del nodo.
     */
    const errorDescriptionLiteral =
      caughtBootstrapError instanceof Error
        ? caughtBootstrapError.message
        : String(caughtBootstrapError);

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'CRITICAL',
      moduleIdentifierLiteral: BOOTSTRAP_MODULE_IDENTIFIER,
      operationCodeLiteral: 'BOOTSTRAP_CRITICAL_COLLAPSE' as OperationCode,
      correlationIdentifier: bootstrapCorrelationIdentifier,
      messageContentLiteral: `El arranque del sistema ha sido bloqueado por seguridad: ${errorDescriptionLiteral}`,
      semanticIntentTag: 'SERVER_BOOTSTRAP_COLLAPSE',
      contextMetadataSnapshot: {
        runtimeIdentifierLiteral: executionRuntimeIdentifierLiteral,
        errorTypeLiteral:
          caughtBootstrapError instanceof Error
            ? caughtBootstrapError.name
            : 'UnknownBootstrapFault',
      },
    });

    /**
     * Propagación de la excepción para asegurar que Vercel marque el despliegue
     * como fallido en caso de que falten variables críticas en producción.
     */
    throw caughtBootstrapError;
  }
}
