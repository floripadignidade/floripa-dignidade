/**
 * @section Tools & Infrastructure - Scanning & Extraction Atom
 * @description Rastreador recursivo de silos de traducción y módulos lingüísticos.
 * Extrae, valida la sintaxis y agrega los diccionarios de internacionalización del monorepo
 * para la compilación del Weaver en 'apps/floripa-dignidade/src/app/i18n/dictionaries/'.
 * Emite telemetría forense conforme a ISO/IEC 11179 e ISO/IEC 25010.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Confiabilidad) e ISO/IEC 27001 (Seguridad).
 * SANEADO Zenith: Inyección obligatoria de 'occurrenceTimestampISO', resolución estricta
 * con extensiones '.js', alineación con TelemetrySignalSchema y purga de metáforas informales.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { promises as filesystemPromises } from 'node:fs';
import { join, normalize, relative, sep } from 'node:path';

/* 1. Infraestructura Core de Telemetría */
import {
  EmitTelemetrySignal,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

/* 2. Configuración y Contratos de Weaver (Resolución ESM Estricta) */
import { WEAVER_CONFIGURATION } from '../constants/WeaverConfiguration.js';
import type {
  IForensicAuditEntry,
  ILinguisticModulePayload,
} from '../constants/WeaverConfiguration.js';

/**
 * @interface IExtractionResult
 * @description Contrato inmutable de salida con los diccionarios agregados y el rastro forense.
 */
export interface IExtractionResult {
  readonly aggregatedLinguisticDictionaries: Record<string, ILinguisticModulePayload>;
  readonly forensicAuditTrail: IForensicAuditEntry[];
}

/**
 * Escanea recursivamente el monorepo en busca de carpetas 'i18n' y consolida los diccionarios.
 *
 * @param correlationIdentifier - Identificador único de correlación para trazabilidad forense.
 * @returns {Promise<IExtractionResult>} Resultado integral de la extracción lingüística.
 */
export const ScanAndExtractLinguisticSilos = async (
  correlationIdentifier: string,
): Promise<IExtractionResult> => {
  const weaverEngineIdentifierLiteral =
    WEAVER_CONFIGURATION.WEAVER_ENGINE_IDENTIFIER_LITERAL as ModuleIdentifier;

  const aggregatedLinguisticDictionaries: Record<string, ILinguisticModulePayload> =
    Object.fromEntries(
      WEAVER_CONFIGURATION.SUPPORTED_LOCALES_COLLECTION.map(
        (localeIdentifierLiteral: string) => [localeIdentifierLiteral, {}],
      ),
    );

  const forensicAuditTrailCollection: IForensicAuditEntry[] = [];

  /**
   * Explorador recursivo del árbol de directorios del monorepo.
   *
   * @param currentDirectoryPathLiteral - Ruta absoluta del directorio bajo escaneo.
   */
  const scanDirectoryRecursivelyAction = async (
    currentDirectoryPathLiteral: string,
  ): Promise<void> => {
    const directoryEntriesCollection = await filesystemPromises.readdir(
      currentDirectoryPathLiteral,
      { withFileTypes: true },
    );

    for (const directoryEntry of directoryEntriesCollection) {
      const entryFullPathLiteral = join(
        currentDirectoryPathLiteral,
        directoryEntry.name,
      );

      if (directoryEntry.isDirectory()) {
        // DETECCIÓN DE CARPETA i18n
        if (directoryEntry.name === 'i18n') {
          const relativePathFromLibrariesRootLiteral = relative(
            WEAVER_CONFIGURATION.LIBRARIES_SOURCE_DIRECTORY_LITERAL,
            entryFullPathLiteral,
          );

          const moduleIdentifierLiteral = relativePathFromLibrariesRootLiteral
            .split(sep)
            .slice(0, 2)
            .join('/');

          const processedLocalesForThisModuleCollection: string[] = [];

          // Procesamiento paralelo de locales soportadas
          await Promise.all(
            WEAVER_CONFIGURATION.SUPPORTED_LOCALES_COLLECTION.map(
              async (localeIdentifierLiteral: string) => {
                const translationFilePathLiteral = join(
                  entryFullPathLiteral,
                  `${localeIdentifierLiteral}.json`,
                );

                try {
                  const rawFileContentLiteral =
                    await filesystemPromises.readFile(
                      translationFilePathLiteral,
                      'utf-8',
                    );

                  const parsedContentSnapshot = JSON.parse(
                    rawFileContentLiteral,
                  ) as Record<string, unknown>;

                  const targetDictionary =
                    aggregatedLinguisticDictionaries[localeIdentifierLiteral];

                  if (targetDictionary) {
                    targetDictionary[moduleIdentifierLiteral] =
                      parsedContentSnapshot;
                    processedLocalesForThisModuleCollection.push(
                      localeIdentifierLiteral,
                    );
                  }
                } catch (caughtError: unknown) {
                  // Reporte de corrupción si el JSON es inválido, silencio si el archivo no existe.
                  if (caughtError instanceof SyntaxError) {
                    void EmitTelemetrySignal({
                      occurrenceTimestampISO: new Date().toISOString(),
                      severityLevelLiteral: 'ERROR',
                      moduleIdentifierLiteral: weaverEngineIdentifierLiteral,
                      operationCodeLiteral:
                        'LINGUISTIC_CORRUPTION_DETECTED' as OperationCode,
                      correlationIdentifier,
                      messageContentLiteral: `Sintaxis JSON lingüística inválida en: [${translationFilePathLiteral}]`,
                      semanticIntentTag: 'I18N_SYNTAX_ERROR',
                      contextMetadataSnapshot: {
                        errorDetailsLiteral: caughtError.message,
                        translationFilePathLiteral,
                      },
                    });
                  }
                }
              },
            ),
          );

          // Consolidación de entrada en la auditoría forense
          forensicAuditTrailCollection.push({
            moduleIdentifierLiteral,
            filesystemPathLiteral: normalize(entryFullPathLiteral),
            processedLocalesCollection:
              processedLocalesForThisModuleCollection,
          });

          // Emisión de telemetría de integración por módulo conforme a TelemetrySignalSchema
          void EmitTelemetrySignal({
            occurrenceTimestampISO: new Date().toISOString(),
            severityLevelLiteral: 'INFO',
            moduleIdentifierLiteral: weaverEngineIdentifierLiteral,
            operationCodeLiteral: 'SILO_WEAVED' as OperationCode,
            correlationIdentifier,
            messageContentLiteral: `Módulo lingüístico integrado: [${moduleIdentifierLiteral}]`,
            semanticIntentTag: 'I18N_SILO_DISCOVERY',
            contextMetadataSnapshot: {
              localesCollection:
                processedLocalesForThisModuleCollection,
              moduleIdentifierLiteral,
            },
          });
        } else if (
          directoryEntry.name !== 'node_modules' &&
          !directoryEntry.name.startsWith('.')
        ) {
          // Inmersión recursiva protegiendo fronteras físicas
          await scanDirectoryRecursivelyAction(entryFullPathLiteral);
        }
      }
    }
  };

  // Inicio de la operación sobre el directorio raíz de librerías
  await scanDirectoryRecursivelyAction(
    normalize(WEAVER_CONFIGURATION.LIBRARIES_SOURCE_DIRECTORY_LITERAL),
  );

  return {
    aggregatedLinguisticDictionaries,
    forensicAuditTrail: forensicAuditTrailCollection,
  };
};