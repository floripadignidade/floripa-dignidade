/**
 * @section Territorial Logic - Territorial Entity Assembler (Atom)
 * @description Átomo de lógica pura encargado de la construcción, validación
 * y sellado de la entidad territorial soberana. Garantiza la inmutabilidad
 * absoluta del rastro geográfico mediante sellado de memoria (Object.freeze).
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Sovereign Data.
 * SANEADO Zenith: Corrección de 'sort-imports', inyección de Aduana de ADN,
 * telemetría forense y cumplimiento de Prosa ISO (Zero Abbreviations).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';
import { EmitTelemetrySignal, GenerateCorrelationIdentifier } from '@floripa-dignidade/telemetry';

/* 1. ADN Estructural y Esquemas (Verbatim Module Syntax) */
/**
 * 🛡️ SANEADO Zenith: Ordenamiento alfabético estricto de miembros.
 * I (Entity) < T (Hierarchy) < T (Identifier).
 */
import {
  type ITerritorialEntity,
  type TAdministrativeHierarchy,
  type TTerritorialTechnicalIdentifier,
} from '../../schemas/TerritorialEntity.schema.js';

/**
 * @name AssembleTerritorialEntityParametersSchema
 * @description Aduana de ADN local para los parámetros de ensamblaje.
 * Protege al átomo contra ruidos de memoria o parámetros nulos.
 */
const AssembleTerritorialEntityParametersSchema = z
  .object({
    technicalIdentifierLiteral: z.string().min(1),
    parentTerritoryIdentifierLiteral: z.string().nullable(),
    officialTerritoryNameLiteral: z.string().min(2),
    administrativeHierarchyLevelLiteral: z.string(), // Validado por el casting de tipo
  })
  .readonly();

/**
 * @interface ITerritorialAssemblerParameters
 * @description Contrato inmutable para la generación del nodo territorial.
 * Sigue la norma ISO 11179 de Objeto + Propiedad + Representación.
 */
export interface ITerritorialAssemblerParameters {
  readonly technicalIdentifierLiteral: string;
  readonly parentTerritoryIdentifierLiteral: string | null;
  readonly officialTerritoryNameLiteral: string;
  readonly administrativeHierarchyLevelLiteral: TAdministrativeHierarchy;
}

/** Identificador técnico del aparato para el Neural Sentinel. */
const ATOM_IDENTIFIER = 'TERRITORIAL_ENTITY_ASSEMBLER_ATOM';

/**
 * Construye un snapshot inmutable de territorio bajo el estándar de Floripa Dignidade.
 * Implementa el patrón "Lost Artifact": el objeto devuelto es inalterable.
 *
 * @param parametersSnapshot - Diccionario de datos purificados y normalizados.
 * @returns {ITerritorialEntity} Entidad sellada y lista para el Ledger geográfico.
 */
export const AssembleTerritorialEntity = (
  parametersSnapshot: ITerritorialAssemblerParameters,
): ITerritorialEntity => {
  // 1. ADUANA DE ADN (Input Validation)
  const validationResult = AssembleTerritorialEntityParametersSchema.safeParse(parametersSnapshot);

  if (!validationResult.success) {
    /**
     * @section Gestión de Fallo Crítico de ADN
     * Al ser un átomo de ensamblaje síncrono, un error aquí indica corrupción
     * en la lógica del enjambre superior.
     */
    void EmitTelemetrySignal({
      severityLevelLiteral: 'CRITICAL',
      moduleIdentifierLiteral: ATOM_IDENTIFIER,
      operationCodeLiteral: 'ASSEMBLER_CONTRACT_VIOLATION',
      correlationIdentifier: GenerateCorrelationIdentifier(),
      messageContentLiteral: 'Se intentó ensamblar un territorio con ADN incompleto o corrupto.',
      contextMetadataSnapshot: { issuesCollection: validationResult.error.flatten() },
    });

    throw new Error(`[${ATOM_IDENTIFIER}]: ADN_CORRUPTO_DETECTADO`);
  }

  const {
    technicalIdentifierLiteral,
    parentTerritoryIdentifierLiteral,
    officialTerritoryNameLiteral,
    administrativeHierarchyLevelLiteral,
  } = validationResult.data;

  /**
   * @section Construcción del Lost Artifact
   * 🛡️ SOVEREIGN CASTING: Elevamos los literales a tipos bridados nominales.
   * Aplicamos Object.freeze para asegurar la inalterabilidad en el bus de datos.
   */
  const finalTerritorialEntity: ITerritorialEntity = Object.freeze({
    territorialTechnicalIdentifier: technicalIdentifierLiteral as TTerritorialTechnicalIdentifier,

    parentTerritoryIdentifier: parentTerritoryIdentifierLiteral
      ? (parentTerritoryIdentifierLiteral as TTerritorialTechnicalIdentifier)
      : null,

    officialTerritoryNameLiteral: officialTerritoryNameLiteral,

    administrativeHierarchyLevel: administrativeHierarchyLevelLiteral as TAdministrativeHierarchy,

    /** Sincronización de rastro temporal ISO 8601 en el momento exacto del ensamble. */
    lastSovereignSyncTimestampISO: new Date().toISOString(),
  });

  // 2. REPORTE SRE (Visibility)
  void EmitTelemetrySignal({
    severityLevelLiteral: 'DEBUG',
    moduleIdentifierLiteral: ATOM_IDENTIFIER,
    operationCodeLiteral: 'ENTITY_ASSEMBLY_NOMINAL',
    correlationIdentifier: GenerateCorrelationIdentifier(),
    messageContentLiteral: 'Ensamblaje inmutable de territorio finalizado exitosamente.',
    semanticIntentTag: 'TERRITORIAL_DATA_NORMALIZATION',
    contextMetadataSnapshot: {
      technicalIdentifierLiteral,
      hierarchyLiteral: administrativeHierarchyLevelLiteral,
    },
  });

  return finalTerritorialEntity;
};
