/**
 * @section Scripts - Internationalization Weaver Trigger
 * @description Disparador de ejecución CLI para el compilador de diccionarios.
 * Orquesta la unificación física de silos lingüísticos antes de la fase de
 * construcción en producción, garantizando la soberanía de los datos de traducción.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad y Calidad).
 * SANEADO Zenith: Nivelación integral de la signatura de telemetría con el esquema
 * TelemetrySignalSchema, erradicando advertencias de validación en tiempo de ejecución.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

import { BuildInternationalizationDictionaries } from '@floripa-dignidade/tools';

/** Identificador técnico del disparador para el monitor de salud y telemetría forense. */
const WEAVER_TRIGGER_IDENTIFIER = 'I18N_WEAVER_CLI_TRIGGER' as ModuleIdentifier;

/**
 * Ejecuta la secuencia de tejido y consolidación de diccionarios multilingües.
 * Implementa un patrón de salida determinista para integración continua (Vercel / GitHub Actions).
 *
 * @returns {Promise<void>}
 */
const ExecuteWeaverTriggerAction = async (): Promise<void> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  try {
    console.warn('\n--- [ZENITH WEAVER]: INICIANDO TEJIDO DE SOBERANÍA LINGÜÍSTICA ---');

    // 1. REPORTE DE INICIO DE SECUENCIA (Contrato Estricto ISO 11179)
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: WEAVER_TRIGGER_IDENTIFIER,
      operationCodeLiteral: 'WEAVER_START_SIGNAL' as OperationCode,
      correlationIdentifier,
      messageContentLiteral:
        'Iniciando proceso de consolidación de diccionarios desde el disparador CLI.',
      semanticIntentTag: 'I18N_WEAVER_TRIGGER_START',
    });

    // 2. EJECUCIÓN DEL ORQUESTADOR DE HERRAMIENTAS
    await BuildInternationalizationDictionaries();

    console.warn('--- [ZENITH WEAVER]: DICCIONARIOS CONSOLIDADOS EXITOSAMENTE ---\n');

    // 3. REPORTE DE ÉXITO NOMINAL (Contrato Estricto ISO 11179)
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: WEAVER_TRIGGER_IDENTIFIER,
      operationCodeLiteral: 'WEAVER_SUCCESS_SIGNAL' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: 'El tejido lingüístico ha finalizado de forma nominal.',
      semanticIntentTag: 'I18N_WEAVER_TRIGGER_SUCCESS',
    });

    process.exit(0);
  } catch (caughtExecutionError: unknown) {
    const errorDescriptionLiteral =
      caughtExecutionError instanceof Error
        ? caughtExecutionError.message
        : String(caughtExecutionError);

    console.error(`\n[CRITICAL_INFRASTRUCTURE_FAILURE]: El tejido lingüístico ha colapsado.`);
    console.error(`Rastro del fallo: ${errorDescriptionLiteral}`);

    // 4. REPORTE DE COLAPSO (Contrato Estricto ISO 11179)
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'CRITICAL',
      moduleIdentifierLiteral: WEAVER_TRIGGER_IDENTIFIER,
      operationCodeLiteral: 'WEAVER_CRITICAL_COLLAPSE' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: 'Falla catastrófica durante el tejido de diccionarios.',
      semanticIntentTag: 'I18N_WEAVER_TRIGGER_COLLAPSE',
      contextMetadataSnapshot: { errorDescriptionLiteral },
    });

    process.exit(1);
  }
};

/** Disparo físico del proceso CLI con contención de promesa flotante */
void ExecuteWeaverTriggerAction();
