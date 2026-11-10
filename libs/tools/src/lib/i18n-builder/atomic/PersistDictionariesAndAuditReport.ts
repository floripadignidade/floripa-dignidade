/**
 * @section Tools & Infrastructure - Dictionary & Audit Persistence Atom
 * @description Transforma los diccionarios agregados en memoria en archivos JSON físicos
 * por idioma ('pt-BR.json', 'es-ES.json', 'en-US.json') en el directorio de la aplicación,
 * y emite el reporte de auditoría forense inmutable para pipelines de CI/CD.
 * Implementa telemetría de observabilidad SRE y blindaje ante colapsos de I/O de disco.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Confiabilidad) e ISO/IEC 27001 (Seguridad).
 * SANEADO Zenith: Inyección de telemetría forense estandarizada, captura resiliente de excepciones
 * con InternalSystemException y estandarización ISO del informe de auditoría.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { promises as filesystemPromises } from 'node:fs';
import { join } from 'node:path';

/* 1. Infraestructura Core de Telemetría y Excepciones */
import {
  EmitTelemetrySignal,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

import { InternalSystemException } from '@floripa-dignidade/exceptions';

/* 2. Configuración y Contratos de Weaver (Resolución ESM Estricta) */
import { WEAVER_CONFIGURATION } from '../constants/WeaverConfiguration.js';
import type {
  IForensicAuditEntry,
  ILinguisticModulePayload,
} from '../constants/WeaverConfiguration.js';

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const PERSISTENCE_MODULE_IDENTIFIER =
  'WEAVER_PERSISTENCE_ATOM' as ModuleIdentifier;

/**
 * Persiste físicamente en disco los diccionarios unificados y el informe forense de auditoría.
 *
 * @param aggregatedLinguisticDictionaries - Diccionarios consolidados clasificados por código de idioma.
 * @param forensicAuditTrailCollection - Colección de entradas de auditoría por módulo escaneado.
 * @param correlationIdentifier - Identificador único de correlación para trazabilidad forense.
 * @returns {Promise<void>} Promesa que resuelve una vez completada la escritura física en disco.
 * @throws {InternalSystemException} Si ocurre un error de permisos o colapso de escritura de archivos.
 */
export const PersistDictionariesAndAuditReport = async (
  aggregatedLinguisticDictionaries: Readonly<
    Record<string, ILinguisticModulePayload>
  >,
  forensicAuditTrailCollection: readonly IForensicAuditEntry[],
  correlationIdentifier: string,
): Promise<void> => {
  try {
    // 1. PERSISTENCIA FÍSICA DE DICCIONARIOS CONSOLIDADOS POR IDIOMA
    await Promise.all(
      WEAVER_CONFIGURATION.SUPPORTED_LOCALES_COLLECTION.map(
        async (localeCodeLiteral: string) => {
          const outputFilePathLiteral = join(
            WEAVER_CONFIGURATION.TARGET_OUTPUT_DIRECTORY_LITERAL,
            `${localeCodeLiteral}.json`,
          );

          const localizedDictionarySnapshot =
            aggregatedLinguisticDictionaries[localeCodeLiteral] ?? {};

          await filesystemPromises.writeFile(
            outputFilePathLiteral,
            JSON.stringify(localizedDictionarySnapshot, null, 2),
            'utf-8',
          );
        },
      ),
    );

    // 2. CONSTRUCCIÓN Y PERSISTENCIA DEL INFORME FORENSE DE AUDITORÍA
    const finalReportPayloadSnapshot = Object.freeze({
      generationTimestampISO: new Date().toISOString(),
      correlationIdentifier,
      totalModulesProcessedQuantity: forensicAuditTrailCollection.length,
      auditTrailCollection: forensicAuditTrailCollection,
    });

    const reportFilePathLiteral = join(
      WEAVER_CONFIGURATION.FORENSIC_REPORTS_DIRECTORY_LITERAL,
      'internationalization-audit-report.json',
    );

    await filesystemPromises.writeFile(
      reportFilePathLiteral,
      JSON.stringify(finalReportPayloadSnapshot, null, 2),
      'utf-8',
    );

    // 3. TELEMETRÍA FORENSE NOMINAL (Conforme a TelemetrySignalSchema)
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: PERSISTENCE_MODULE_IDENTIFIER,
      operationCodeLiteral:
        'DICTIONARIES_PERSISTED_NOMINAL' as OperationCode,
      correlationIdentifier,
      messageContentLiteral:
        'Diccionarios unificados y reporte de auditoría lingüística persistidos físicamente en disco.',
      semanticIntentTag: 'I18N_PERSISTENCE_SUCCESS',
      contextMetadataSnapshot: {
        totalLocalesPersistedQuantity:
          WEAVER_CONFIGURATION.SUPPORTED_LOCALES_COLLECTION.length,
        totalModulesProcessedQuantity: forensicAuditTrailCollection.length,
        targetReportFilePathLiteral: reportFilePathLiteral,
      },
    });
  } catch (caughtExecutionError: unknown) {
    // 4. GESTIÓN FORENSE DE FALLO DE I/O DE HARDWARE (Resilience Layer)
    const errorDescriptionLiteral =
      caughtExecutionError instanceof Error
        ? caughtExecutionError.message
        : String(caughtExecutionError);

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'CRITICAL',
      moduleIdentifierLiteral: PERSISTENCE_MODULE_IDENTIFIER,
      operationCodeLiteral:
        'DICTIONARY_PERSISTENCE_FAULT' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: `Fallo crítico al persistir diccionarios en disco: ${errorDescriptionLiteral}`,
      semanticIntentTag: 'I18N_PERSISTENCE_FAULT',
      contextMetadataSnapshot: {
        errorTraceLiteral: errorDescriptionLiteral,
      },
    });

    throw new InternalSystemException(
      'FALLO_EN_PERSISTENCIA_DE_DICCIONARIOS_I18N',
      {
        originalErrorLiteral: errorDescriptionLiteral,
        correlationIdentifier,
      },
    );
  }
};