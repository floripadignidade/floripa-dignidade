/**
 * @section Application Bootstrap - Instrumentation Orchestrator
 * @description Sensor de frontera encargado de la secuencia de arranque del servidor.
 * Ejecuta la auditoría de integridad de infraestructura (Aduana de Entorno)
 * antes de habilitar el procesamiento de tráfico ciudadano en Next.js 16+.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Async Bootstrap Integrity.
 * SANEADO Zenith: Erradicación de acceso directo a 'process.env', blindaje ante
 * entornos de cliente y reporte forense de colapsos estructurales.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
} from '@floripa-dignidade/telemetry';

import {
  GatherEnvironmentMetadata,
  ValidateEnvironmentAduana
} from '@floripa-dignidade/environment-validator';

/**
 * Función soberana de registro invocada por el motor de Next.js al inicializar el nodo.
 * Implementa un bloqueo preventivo: si el ADN del entorno es inválido, el proceso
 * de arranque colapsa con rastro forense, protegiendo la integridad del sistema.
 *
 * 🛡️ LEY ZENITH: Esta función es el único punto de entrada permitido para
 * validaciones de hardware antes de la hidratación de rutas.
 *
 * @returns {Promise<void>} Promesa que se resuelve únicamente si la infraestructura es nominal.
 */
export async function register(): Promise<void> {
  /**
   * @section Validación de Ámbito de Ejecución
   * SANEADO Zenith: Determinación isomórfica del entorno.
   * La instrumentación es exclusiva de la capa de servidor (Node/Edge).
   */
  const environmentMetadataSnapshot = GatherEnvironmentMetadata();
  const executionRuntimeIdentifierLiteral = environmentMetadataSnapshot['NEXT_RUNTIME'] ?? 'nodejs';

  const isServerEnvironmentBoolean =
    executionRuntimeIdentifierLiteral === 'nodejs' ||
    executionRuntimeIdentifierLiteral === 'edge';

  if (!isServerEnvironmentBoolean) {
    return;
  }

  const bootstrapCorrelationIdentifier = GenerateCorrelationIdentifier();

  // 1. REPORTE DE INICIO DE SECUENCIA (SRE Visibility)
  void EmitTelemetrySignal({
    severityLevelLiteral: 'INFO',
    moduleIdentifierLiteral: 'APPLICATION_BOOTSTRAP',
    operationCodeLiteral: 'BOOTSTRAP_SEQUENCE_STARTED',
    correlationIdentifier: bootstrapCorrelationIdentifier,
    messageContentLiteral: 'Iniciando secuencia de instrumentación Zenith: Auditoría de cimientos en curso.',
    contextMetadataSnapshot: { runtimeIdentifierLiteral: executionRuntimeIdentifierLiteral }
  });

  try {
    /**
     * 2. ACTIVACIÓN DE LA ADUANA DE ENTORNO (Integrity Guardian)
     * Realiza el chequeo de ADN de todos los secretos cloud (Supabase, Resend, etc).
     */
    await ValidateEnvironmentAduana();

    // 3. REPORTE DE ESTADO NOMINAL (Ready for Traffic)
    void EmitTelemetrySignal({
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: 'APPLICATION_BOOTSTRAP',
      operationCodeLiteral: 'BOOTSTRAP_SEQUENCE_NOMINAL',
      correlationIdentifier: bootstrapCorrelationIdentifier,
      messageContentLiteral: 'Aduanas de infraestructura superadas con éxito. El enjambre está listo para operar.'
    });

  } catch (caughtBootstrapError: unknown) {
    /**
     * @section Gestión de Colapso de Arranque
     * Capturamos la excepción para el rastro forense antes de forzar el fallo del nodo.
     */
    const errorDescriptionLiteral = caughtBootstrapError instanceof Error
      ? caughtBootstrapError.message
      : String(caughtBootstrapError);

    void EmitTelemetrySignal({
      severityLevelLiteral: 'CRITICAL',
      moduleIdentifierLiteral: 'APPLICATION_BOOTSTRAP',
      operationCodeLiteral: 'BOOTSTRAP_CRITICAL_COLLAPSE',
      correlationIdentifier: bootstrapCorrelationIdentifier,
      messageContentLiteral: `El arranque del sistema ha sido bloqueado por seguridad: ${errorDescriptionLiteral}`,
      contextMetadataSnapshot: {
        runtimeIdentifierLiteral: executionRuntimeIdentifierLiteral,
        errorTypeLiteral: caughtBootstrapError instanceof Error ? caughtBootstrapError.name : 'UnknownFault'
      }
    });

    /**
     * Propagamos el error para asegurar que Vercel marque el despliegue
     * como fallido, impidiendo la publicación de un portal con cimientos rotos.
     */
    throw caughtBootstrapError;
  }
}
