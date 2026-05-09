/**
 * @section Territorial Logic - IBGE Data Mapper Atom
 * @description Átomo de lógica pura encargado de transformar el ADN crudo
 * gubernamental (IBGE) en entidades territoriales soberanas. Implementa la
 * normalización toponímica, extracción de jerarquía y sellado nominal (Branding).
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & High Performance SRE.
 * SANEADO Zenith: Inyección de Aduana Zod defensiva, telemetría forense integrada
 * y cumplimiento de Prosa ISO (ADR 0002).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier
} from '@floripa-dignidade/telemetry';

import { ValidationException } from '@floripa-dignidade/exceptions';
import { SanitizeTerritoryName } from './SanitizeTerritoryName';

/* 1. ADN Estructural y Protocolos (Verbatim Module Syntax) */
import { IbgeDistrictRawResponseSchema } from '../../schemas/IbgeTerritorialProtocols.schema';
import type { IIbgeDistrictRawResponse } from '../../schemas/IbgeTerritorialProtocols.schema';

import type {
  ITerritorialEntity,
  TTerritorialTechnicalIdentifier
} from '../../schemas/TerritorialEntity.schema';

/** Identificador técnico del aparato para el Neural Sentinel. */
const MAPPER_ATOM_IDENTIFIER = 'TERRITORIAL_IBGE_MAPPER_ATOM';

/**
 * Transforma un registro de distrito del IBGE en una entidad purificada y jerarquizada.
 * Realiza una validación de integridad previa para asegurar la conformidad del protocolo.
 *
 * @param rawDistrictSnapshotSource - Snapshot crudo del proveedor gubernamental.
 * @param correlationIdentifier - Identificador opcional para la cadena de custodia.
 * @returns {ITerritorialEntity} Entidad con identidad brindada e inmutable.
 * @throws {ValidationException} Si el snapshot viola el contrato de la API del IBGE.
 */
export const MapIbgeToTerritorialEntity = (
  rawDistrictSnapshotSource: unknown,
  correlationIdentifier: string = GenerateCorrelationIdentifier()
): ITerritorialEntity => {

  // 1. ADUANA DE ADN: Purificación del rastro gubernamental
  const protocolValidationResult = IbgeDistrictRawResponseSchema.safeParse(rawDistrictSnapshotSource);

  if (!protocolValidationResult.success) {
    throw new ValidationException('PROTOCOLO_IBGE_CORRUPTO_O_MUTADO', {
      structuralIssuesCollection: protocolValidationResult.error.flatten(),
      correlationIdentifier
    });
  }

  const validatedRawDistrict: IIbgeDistrictRawResponse = protocolValidationResult.data;

  /**
   * @section Saneamiento Toponímico
   * Delegación atómica para asegurar la pureza lingüística ISO (Uppercase/ASCII).
   */
  const officialTerritoryNameLiteral = SanitizeTerritoryName(validatedRawDistrict.nome);

  /**
   * @section Extracción de Identidades Técnicas
   * Transmutamos los IDs numéricos a literales técnicos para el Ledger soberano.
   */
  const technicalIdentifierLiteral = validatedRawDistrict.id.toString();
  const parentIdentifierLiteral = validatedRawDistrict.municipio.id.toString();

  /**
   * @section Construcción de Entidad Soberana
   * 🛡️ SOVEREIGN CASTING: Elevamos los strings a tipos bridados nominales.
   */
  const territorialEntitySnapshot: ITerritorialEntity = Object.freeze({
    territorialTechnicalIdentifier: technicalIdentifierLiteral as TTerritorialTechnicalIdentifier,

    parentTerritoryIdentifier: parentIdentifierLiteral as TTerritorialTechnicalIdentifier,

    officialTerritoryNameLiteral,

    /**
     * Clasificación ontológica del nivel administrativo.
     * El búnker asume la procedencia de nivel 'Distrito' según el endpoint del IBGE.
     */
    administrativeHierarchyLevel: 'DISTRICT',

    /** Sincronización de rastro temporal ISO 8601. */
    lastSovereignSyncTimestampISO: new Date().toISOString(),
  });

  // 2. REPORTE DE EJECUCIÓN (DEBUG Visibility)
  void EmitTelemetrySignal({
    severityLevelLiteral: 'DEBUG',
    moduleIdentifierLiteral: MAPPER_ATOM_IDENTIFIER,
    operationCodeLiteral: 'IBGE_RECORD_NORMALIZED',
    correlationIdentifier,
    messageContentLiteral: `Normalización territorial exitosa: [${officialTerritoryNameLiteral}]`,
    contextMetadataSnapshot: {
      ibgeIdentifierLiteral: technicalIdentifierLiteral,
      parentIdentifierLiteral
    }
  });

  return territorialEntitySnapshot;
};
