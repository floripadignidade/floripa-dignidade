/**
 * @section Tools - Internationalization Dictionary Weaver Orchestrator
 * @description Orquestador soberano del pipeline de compilación lingüística.
 * Coordina la secuencia de Higiene, Inicialización, Extracción y Persistencia.
 * Garantiza que la red de transparencia lingüística sea pura, determinista y
 * auditable por el Neural Sentinel.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Swarm Intelligence.
 * SANEADO Zenith: Inyección de espera atómica (Await Pipeline), normalización
 * de rastro forense y consolidación de contratos de integridad (Prosa ISO).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime
} from '@floripa-dignidade/telemetry';

import { InternalSystemException } from '@floripa-dignidade/exceptions';

/* 1. ADN Estructural y Configuración (Rutas Limpias) */
import { WEAVER_CONFIGURATION } from './constants/WeaverConfiguration';
import { InitializeWeaverInfrastructure } from './atomic/InitializeWeaverInfrastructure';
import { ScanAndExtractLinguisticSilos } from './atomic/ScanAndExtractLinguisticSilos';
import { PersistDictionariesAndAuditReport } from './atomic/PersistDictionariesAndAuditReport';

/* 2. Enjambre de Soporte (Mantenimiento de Hardware) */
import { ExecuteRecursiveEmissionsPurge } from '../maintenance-tools/ExecuteRecursiveEmissionsPurge';

/**
 * Ejecuta el pipeline integral de consolidación de diccionarios multilingües.
 * Implementa la doctrina de "Estado Limpio" mediante la purga proactiva de emisiones
 * y garantiza la integridad física de los archivos antes de la persistencia.
 *
 * @returns {Promise<void>} Operación resuelta cuando el rastro lingüístico está en disco.
 * @throws {InternalSystemException} Si cualquier fase del pipeline sufre un colapso.
 */
export const BuildInternationalizationDictionaries = async (): Promise<void> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    WEAVER_CONFIGURATION.WEAVER_ENGINE_IDENTIFIER_LITERAL,
    'DICTIONARY_CONSOLIDATION_PIPELINE',
    correlationIdentifier,
    async () => {
      try {
        /**
         * @section FASE 0: Higiene de Jurisdicción (Clean Pre-flight)
         * 🛡️ LEY ZENITH: Eliminamos artefactos antiguos en el directorio de salida
         * para evitar la persistencia de traducciones fantasma o corruptas en producción.
         */
        await ExecuteRecursiveEmissionsPurge(
          WEAVER_CONFIGURATION.TARGET_OUTPUT_DIRECTORY_LITERAL,
          correlationIdentifier
        );

        // FASE 1: Preparación (Aduana de Infraestructura y Permisos)
        await InitializeWeaverInfrastructure();

        // FASE 2: Extracción (Navegación Recursiva y Auditoría de ADN)
        const extractionResultSnapshot = await ScanAndExtractLinguisticSilos(correlationIdentifier);

        // FASE 3: Volcado y Reporte (Persistencia Física y Generación de Evidencia)
        await PersistDictionariesAndAuditReport(
          extractionResultSnapshot.aggregatedLinguisticDictionaries,
          extractionResultSnapshot.forensicAuditTrail,
          correlationIdentifier
        );

        /**
         * @section Reporte de Cierre Nominal
         * Notificamos al Neural Sentinel el éxito de la compilación con métricas detalladas.
         */
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: WEAVER_CONFIGURATION.WEAVER_ENGINE_IDENTIFIER_LITERAL,
          operationCodeLiteral: 'WEAVER_PIPELINE_NOMINAL_SUCCESS',
          correlationIdentifier,
          messageContentLiteral: 'Tejido lingüístico finalizado: Diccionarios sincronizados con el enjambre.',
          semanticIntentTag: 'I18N_COMPILATION_COMPLETE',
          contextMetadataSnapshot: {
            processedModulesQuantity: extractionResultSnapshot.forensicAuditTrail.length,
            targetPathLiteral: WEAVER_CONFIGURATION.TARGET_OUTPUT_DIRECTORY_LITERAL,
            executionTimestampISO: new Date().toISOString()
          }
        });

      } catch (caughtError: unknown) {
        /**
         * @section Gestión Forense de Colapso de Pipeline
         * Centralizamos la captura para asegurar que el rastro del fallo llegue a telemetría.
         */
        const errorDescriptionLiteral = caughtError instanceof Error
          ? caughtError.message
          : String(caughtError);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: WEAVER_CONFIGURATION.WEAVER_ENGINE_IDENTIFIER_LITERAL,
          operationCodeLiteral: 'WEAVER_PIPELINE_CRITICAL_FAULT',
          correlationIdentifier,
          messageContentLiteral: `Fallo catastrófico en el compilador de diccionarios: ${errorDescriptionLiteral}`,
          contextMetadataSnapshot: { errorTraceLiteral: errorDescriptionLiteral }
        });

        /** Propagación de excepción nivelada para el disparador CLI. */
        throw new InternalSystemException('FALLO_EN_PIPELINE_DE_COMPILACION_I18N', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier
        });
      }
    }
  );
};
