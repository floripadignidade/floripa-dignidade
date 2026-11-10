/**
 * @section Tools & Infrastructure - Internationalization Dictionary Weaver Orchestrator
 * @description Orquestador maestro encargado del pipeline de consolidación lingüística.
 * Coordina la secuencia determinista de Higiene previa, Inicialización de directorios,
 * Extracción de silos de traducción y Persistencia física de diccionarios unificados
 * en 'apps/floripa-dignidade/src/app/i18n/dictionaries/'.
 * Emite telemetría forense conforme a ISO/IEC 11179 y garantiza cero dependencias huérfanas.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Confiabilidad) e ISO/IEC 27001 (Seguridad).
 * SANEADO Zenith: Inyección mandatoria de 'occurrenceTimestampISO', resolución estricta con extensiones '.js'
 * y purga definitiva de metáforas informales.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/* 1. Infraestructura Core de Telemetría y Excepciones */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

import { InternalSystemException } from '@floripa-dignidade/exceptions';

/* 2. Configuración y Enjambre Atómico de Construcción (Resolución ESM Estricta) */
import { WEAVER_CONFIGURATION } from './constants/WeaverConfiguration.js';
import { InitializeWeaverInfrastructure } from './atomic/InitializeWeaverInfrastructure.js';
import { ScanAndExtractLinguisticSilos } from './atomic/ScanAndExtractLinguisticSilos.js';
import { PersistDictionariesAndAuditReport } from './atomic/PersistDictionariesAndAuditReport.js';

/* 3. Módulos de Mantenimiento e Higiene de Sistema de Archivos */
import { ExecuteRecursiveEmissionsPurge } from '../maintenance-tools/ExecuteRecursiveEmissionsPurge.js';

/**
 * Ejecuta el pipeline integral de compilación y consolidación de diccionarios multilingües.
 * Aplica el principio de estado limpio purgando emisiones huérfanas y valida la integridad
 * estructural de cada silo JSON antes de generar los diccionarios unificados.
 *
 * @returns {Promise<void>} Operación resuelta cuando los archivos están físicamente en disco.
 * @throws {InternalSystemException} Si cualquier fase del pipeline sufre un colapso irrecuperable.
 */
export const BuildInternationalizationDictionaries = async (): Promise<void> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();
  const weaverEngineIdentifierLiteral =
    WEAVER_CONFIGURATION.WEAVER_ENGINE_IDENTIFIER_LITERAL as ModuleIdentifier;

  return await TraceExecutionTime(
    weaverEngineIdentifierLiteral,
    'DICTIONARY_CONSOLIDATION_PIPELINE' as OperationCode,
    correlationIdentifier,
    async (): Promise<void> => {
      try {
        // --- FASE 0: HIGIENE PREVIA DE DIRECTORIOS (Clean Pre-flight) ---
        await ExecuteRecursiveEmissionsPurge(
          WEAVER_CONFIGURATION.TARGET_OUTPUT_DIRECTORY_LITERAL,
          correlationIdentifier,
        );

        // --- FASE 1: PREPARACIÓN DE INFRAESTRUCTURA Y PERMISOS ---
        await InitializeWeaverInfrastructure();

        // --- FASE 2: ESCANEO Y EXTRACCIÓN DE SILOS LINGÜÍSTICOS ---
        const extractionResultSnapshot = await ScanAndExtractLinguisticSilos(
          correlationIdentifier,
        );

        // --- FASE 3: PERSISTENCIA FÍSICA Y REPORTE DE AUDITORÍA ---
        await PersistDictionariesAndAuditReport(
          extractionResultSnapshot.aggregatedLinguisticDictionaries,
          extractionResultSnapshot.forensicAuditTrail,
          correlationIdentifier,
        );

        // --- FASE 4: CONFIRMACIÓN TELEMÉTRICA NOMINAL (ISO/IEC 11179) ---
        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: weaverEngineIdentifierLiteral,
          operationCodeLiteral:
            'WEAVER_PIPELINE_NOMINAL_SUCCESS' as OperationCode,
          correlationIdentifier,
          messageContentLiteral:
            'Consolidación lingüística finalizada: Diccionarios unificados y sincronizados.',
          semanticIntentTag: 'I18N_COMPILATION_COMPLETE',
          contextMetadataSnapshot: {
            processedModulesQuantity:
              extractionResultSnapshot.forensicAuditTrail.length,
            targetPathLiteral:
              WEAVER_CONFIGURATION.TARGET_OUTPUT_DIRECTORY_LITERAL,
            executionTimestampISO: new Date().toISOString(),
          },
        });
      } catch (caughtExecutionError: unknown) {
        // --- FASE 5: GESTIÓN FORENSE DE COLAPSO (Resilience Layer) ---
        const errorDescriptionLiteral =
          caughtExecutionError instanceof Error
            ? caughtExecutionError.message
            : String(caughtExecutionError);

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: weaverEngineIdentifierLiteral,
          operationCodeLiteral:
            'WEAVER_PIPELINE_CRITICAL_FAULT' as OperationCode,
          correlationIdentifier,
          messageContentLiteral: `Fallo catastrófico en el compilador de diccionarios: ${errorDescriptionLiteral}`,
          semanticIntentTag: 'I18N_COMPILATION_FAULT',
          contextMetadataSnapshot: {
            errorTraceLiteral: errorDescriptionLiteral,
          },
        });

        throw new InternalSystemException(
          'FALLO_EN_PIPELINE_DE_COMPILACION_I18N',
          {
            originalErrorLiteral: errorDescriptionLiteral,
            correlationIdentifier,
          },
        );
      }
    },
  );
};

/**
 * @name InternationalizationDictionaryBuilder
 * @description Alias institucional de compatibilidad histórica para disparadores CLI y scripts.
 */
export const InternationalizationDictionaryBuilder =
  BuildInternationalizationDictionaries;