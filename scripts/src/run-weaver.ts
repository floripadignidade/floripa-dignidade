/**
 * @section Scripts - Internationalization Weaver Trigger
 * @description Disparador de ejecución CLI para el compilador de diccionarios lingüísticos.
 * Orquesta la consolidación física de silos en `libs/` y `apps/` con validación Fail-Fast
 * de paridad estructural entre idiomas (ADR 0030) antes de la fase de compilación en
 * producción, propagando trazabilidad unificada y códigos de salida deterministas.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Mantenibilidad y Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import process from 'node:process';

import { GlobalBaseException } from '@floripa-dignidade/exceptions';
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
 * Ejecuta la secuencia de compilación y auditoría de paridad de diccionarios multilingües.
 * Implementa salida determinista (`0` o `1`) para pipelines locales y de integración continua.
 *
 * @returns {Promise<void>} Promesa que finaliza el proceso tras emitir telemetría.
 */
const ExecuteWeaverTriggerAction = async (): Promise<void> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  try {
    console.warn('\n--- [ENTERPRISE WEAVER]: INICIANDO CONSOLIDACIÓN LINGÜÍSTICA ---');

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: WEAVER_TRIGGER_IDENTIFIER,
      operationCodeLiteral: 'WEAVER_START_SIGNAL' as OperationCode,
      correlationIdentifier,
      messageContentLiteral:
        'Iniciando proceso Fail-Fast de consolidación de diccionarios desde el disparador CLI.',
      semanticIntentTag: 'I18N_WEAVER_TRIGGER_START',
    });

    const auditReportSnapshot = await BuildInternationalizationDictionaries({
      isFailFastOnParityViolationBoolean: true,
      correlationIdentifier,
    });

    console.warn(
      `--- [ENTERPRISE WEAVER]: ${auditReportSnapshot.totalModulesProcessedQuantity} MÓDULOS CONSOLIDADOS (${auditReportSnapshot.activeLocalesCollection.join(', ')}) ---\n`,
    );

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: WEAVER_TRIGGER_IDENTIFIER,
      operationCodeLiteral: 'WEAVER_SUCCESS_SIGNAL' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: 'La consolidación lingüística ha finalizado con paridad certificada.',
      semanticIntentTag: 'I18N_WEAVER_TRIGGER_SUCCESS',
      contextMetadataSnapshot: {
        totalModulesProcessedQuantity: auditReportSnapshot.totalModulesProcessedQuantity,
        activeLocalesCollection: auditReportSnapshot.activeLocalesCollection,
        isParityVerifiedBoolean: auditReportSnapshot.isParityVerifiedBoolean,
      },
    });

    process.exit(0);
  } catch (caughtExecutionError: unknown) {
    const errorDescriptionLiteral =
      caughtExecutionError instanceof Error
        ? caughtExecutionError.message
        : String(caughtExecutionError);

    const forensicContextSnapshot =
      caughtExecutionError instanceof GlobalBaseException
        ? caughtExecutionError.runtimeContextSnapshot
        : undefined;

    console.error(`\n[CRITICAL_INFRASTRUCTURE_FAILURE]: ${errorDescriptionLiteral}`);
    if (forensicContextSnapshot !== undefined) {
      console.error(JSON.stringify(forensicContextSnapshot, null, 2));
    }

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'CRITICAL',
      moduleIdentifierLiteral: WEAVER_TRIGGER_IDENTIFIER,
      operationCodeLiteral: 'WEAVER_CRITICAL_COLLAPSE' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: 'Falla crítica durante la consolidación de diccionarios.',
      semanticIntentTag: 'I18N_WEAVER_TRIGGER_COLLAPSE',
      contextMetadataSnapshot: {
        errorDescriptionLiteral,
        ...(forensicContextSnapshot !== undefined && { forensicContextSnapshot }),
      },
    });

    process.exit(1);
  }
};

/** Disparo físico del proceso CLI con contención de promesa flotante. */
void ExecuteWeaverTriggerAction();
