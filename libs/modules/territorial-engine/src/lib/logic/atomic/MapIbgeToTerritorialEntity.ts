/**
 * @section Territorial Logic - IBGE Data Mapper (Orchestrator)
 * @description Átomo encargado de coordinar la transformación de protocolos
 * gubernamentales (IBGE) a identidades soberanas. Realiza la aduana de ADN,
 * delega el saneamiento toponímico y orquesta el ensamblaje inmutable.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Resolución de TS2353 (Sincronización de Interfaz), resolución
 * de rutas ESM (.js) y cumplimiento estricto de Prosa ISO (Zero Abbreviations).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
} from '@floripa-dignidade/telemetry';

import { ValidationException } from '@floripa-dignidade/exceptions';

/* 1. ADN Estructural y Protocolos (Verbatim Module Syntax) */
/** 🛡️ SANEADO Zenith: Inyección de extensiones '.js' para resolución de Grafo. */
import { IbgeDistrictRawResponseSchema } from '../../schemas/IbgeTerritorialProtocols.schema.js';
import type { IIbgeDistrictRawResponse } from '../../schemas/IbgeTerritorialProtocols.schema.js';
import type { ITerritorialEntity } from '../../schemas/TerritorialEntity.schema.js';

/* 2. Enjambre Atómico Local (Sub-Atoms) */
import { SanitizeTerritoryName } from './SanitizeTerritoryName.js';
import { AssembleTerritorialEntity } from './AssembleTerritorialEntity.js';

/** Identificador técnico del aparato para el Neural Sentinel. */
const MAPPER_ORCHESTRATOR_IDENTIFIER = 'TERRITORIAL_IBGE_MAPPER_ORCHESTRATOR';

/**
 * Transforma un registro de distrito del IBGE en una entidad purificada y jerarquizada.
 * Implementa el patrón "Sovereign Translation": valida el ADN en frontera y
 * reconstruye el objeto bajo el estándar institucional.
 *
 * @param rawDistrictSnapshotSource - Snapshot crudo del proveedor gubernamental.
 * @param correlationIdentifier - Identificador para la cadena de custodia digital.
 * @returns {ITerritorialEntity} Entidad con identidad brindada e inmutable.
 * @throws {ValidationException} Si el rastro de entrada viola el contrato de la API del IBGE.
 */
export const MapIbgeToTerritorialEntity = (
  rawDistrictSnapshotSource: unknown,
  correlationIdentifier: string = GenerateCorrelationIdentifier()
): ITerritorialEntity => {

  /**
   * @section Ejecución con Rastro de Rendimiento (Sync Trace)
   * Aunque la operación es síncrona, medimos su latencia para detectar
   * degradaciones en procesos de ingesta masiva.
   */
  const executionStartTimestampNumeric = performance.now();

  try {
    // --- 1. ADUANA DE ADN: Purificación del protocolo gubernamental ---
    const protocolValidationResult = IbgeDistrictRawResponseSchema.safeParse(rawDistrictSnapshotSource);

    if (!protocolValidationResult.success) {
      void EmitTelemetrySignal({
        severityLevelLiteral: 'CRITICAL',
        moduleIdentifierLiteral: MAPPER_ORCHESTRATOR_IDENTIFIER,
        operationCodeLiteral: 'IBGE_PROTOCOL_VIOLATION',
        correlationIdentifier,
        messageContentLiteral: 'TERRITORIAL.ERRORS.ADN_CORRUPTION',
        contextMetadataSnapshot: {
          issuesCollection: protocolValidationResult.error.flatten(),
          sourceSnapshot: rawDistrictSnapshotSource
        }
      });

      throw new ValidationException('CONTRATO_IBGE_INVALIDO', {
        structuralIssuesCollection: protocolValidationResult.error.flatten()
      });
    }

    const validatedRawDistrictSnapshot: IIbgeDistrictRawResponse = protocolValidationResult.data;

    // --- 2. SANEAMIENTO TOPONÍMICO (Delegación Atómica) ---
    /** Normalizamos el nombre oficial eliminando ruidos y acentos (ISO Standard). */
    const officialTerritoryNameLiteral = SanitizeTerritoryName(validatedRawDistrictSnapshot.nome);

    // --- 3. ENSAMBLAJE SOBERANO (Delegación Atómica) ---
    /**
     * 🛡️ SANEADO Zenith (Fix TS2353): Sincronización con 'ITerritorialAssemblerParameters'.
     * Se utilizan las nuevas llaves nominales con sufijos de magnitud.
     */
    const territorialEntitySnapshot = AssembleTerritorialEntity({
      technicalIdentifierLiteral: validatedRawDistrictSnapshot.id.toString(),
      parentTerritoryIdentifierLiteral: validatedRawDistrictSnapshot.municipio.id.toString(),
      officialTerritoryNameLiteral: officialTerritoryNameLiteral,
      administrativeHierarchyLevelLiteral: 'DISTRICT'
    });

    // --- 4. REPORTE SRE (Visibility) ---
    const executionLatencyInMillisecondsQuantity = performance.now() - executionStartTimestampNumeric;

    void EmitTelemetrySignal({
      severityLevelLiteral: 'DEBUG',
      moduleIdentifierLiteral: MAPPER_ORCHESTRATOR_IDENTIFIER,
      operationCodeLiteral: 'IBGE_NORMALIZATION_NOMINAL',
      correlationIdentifier,
      messageContentLiteral: 'TERRITORIAL.LOGS.DATA_NORMALIZED',
      executionLatencyInMillisecondsQuantity,
      semanticIntentTag: 'TERRITORIAL_DATA_INGESTION',
      contextMetadataSnapshot: {
        territoryIdentifier: territorialEntitySnapshot.territorialTechnicalIdentifier,
        officialName: officialTerritoryNameLiteral
      }
    });

    return territorialEntitySnapshot;

  } catch (caughtError: unknown) {
    /** 🛡️ LEY DE RESILIENCIA: Las excepciones de validación se propagan intactas. */
    if (caughtError instanceof ValidationException) {
      throw caughtError;
    }

    const errorDescriptionLiteral = caughtError instanceof Error
      ? caughtError.message
      : String(caughtError);

    throw new ValidationException('FALLO_EN_MAPEO_TERRITORIAL_COGNITIVO', {
      originalErrorLiteral: errorDescriptionLiteral,
      correlationIdentifier
    });
  }
};
