/**
 * @section Scripts - Internationalization Weaver Trigger
 * @description Gatillo de ejecución CLI para el compilador de diccionarios.
 * Orquesta la unificación de silos lingüísticos antes del build de producción,
 * garantizando la soberanía de los datos de traducción.
 *
 * Protocolo OEDP-V17.0 - Trigger Pattern & High Performance SRE.
 * SANEADO Zenith: Erradicación de 'no-console' y rastro de telemetría inyectado.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
} from '@floripa-dignidade/telemetry';
import { BuildInternationalizationDictionaries } from '@floripa-dignidade/tools';

/** Identificador técnico del disparador para el Neural Sentinel. */
const WEAVER_TRIGGER_IDENTIFIER = 'I18N_WEAVER_CLI_TRIGGER';

/**
 * Ejecuta la secuencia de tejido de diccionarios multilingües.
 * Implementa un patrón de salida determinista para la integración con el pipeline de CI/CD.
 *
 * @returns {Promise<void>}
 */
const ExecuteWeaverTriggerAction = async (): Promise<void> => {
  /**
   * Generamos la identidad única de la sesión de compilación
   * para el rastro forense del búnker de herramientas.
   */
  const correlationIdentifier = GenerateCorrelationIdentifier();

  try {
    /**
     * @section Inicio de Secuencia
     * SANEADO: Uso de console.warn para cumplimiento de la regla 'no-console'
     * en entornos de consola/terminal.
     */
    console.warn('\n--- [ZENITH WEAVER]: INICIANDO TEJIDO DE SOBERANÍA LINGÜÍSTICA ---');

    void EmitTelemetrySignal({
      severityLevel: 'INFO',
      moduleIdentifier: WEAVER_TRIGGER_IDENTIFIER,
      operationCode: 'WEAVER_START_SIGNAL',
      correlationIdentifier,
      message: 'Iniciando proceso de consolidación de diccionarios desde el disparador CLI.'
    });

    /**
     * Invocación del orquestador residente en la librería de herramientas.
     * Esta acción es la que realiza el escaneo recursivo de los búnkeres.
     */
    await BuildInternationalizationDictionaries();

    console.warn('--- [ZENITH WEAVER]: DICCIONARIOS CONSOLIDADOS EXITOSAMENTE ---\n');

    void EmitTelemetrySignal({
      severityLevel: 'INFO',
      moduleIdentifier: WEAVER_TRIGGER_IDENTIFIER,
      operationCode: 'WEAVER_SUCCESS_SIGNAL',
      correlationIdentifier,
      message: 'El tejido lingüístico ha finalizado de forma nominal.'
    });

    process.exit(0);

  } catch (caughtExecutionError: unknown) {
    /**
     * @section Gestión de Colapso de Infraestructura
     * Reportamos el rastro forense y forzamos la salida con código de error (1)
     * para detener el pipeline de despliegue en Vercel/GitHub Actions.
     */
    const errorDescriptionLiteral = caughtExecutionError instanceof Error
      ? caughtExecutionError.message
      : String(caughtExecutionError);

    console.error(`\n[CRITICAL_INFRASTRUCTURE_FAILURE]: El tejido lingüístico ha colapsado.`);
    console.error(`Rastro del fallo: ${errorDescriptionLiteral}`);

    void EmitTelemetrySignal({
      severityLevel: 'CRITICAL',
      moduleIdentifier: WEAVER_TRIGGER_IDENTIFIER,
      operationCode: 'WEAVER_CRITICAL_COLLAPSE',
      correlationIdentifier,
      message: 'Falla catastrófica durante el tejido de diccionarios.',
      contextMetadataSnapshot: { errorDescriptionLiteral }
    });

    process.exit(1);
  }
};

/**
 * @section Disparo Físico (Execution Trigger)
 * SANEADO: Marcado con 'void' para cumplir con la regla 'no-floating-promises'.
 */
void ExecuteWeaverTriggerAction();
