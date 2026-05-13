/**
 * @section PMF Engine Logic - Individual Record Processor (Atom)
 * @description Átomo encargado de coordinar la transformación y persistencia de
 * un único registro de gasto gubernamental. Implementa una cápsula de resiliencia
 * para asegurar que fallos en una unidad no comprometan la integridad del enjambre.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Zero Any Standard.
 * SANEADO Zenith: Erradicación de 'any', inyección de extensiones ESM (.js)
 * y cumplimiento de la Prosa ISO (Zero Abbreviations).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { EmitTelemetrySignal } from '@floripa-dignidade/telemetry';

/* 1. ADN Estructural y Contratos (Verbatim Module Syntax) */
import type { IEPublicaExpenseRaw } from '../../../schemas/protocol/EPublicaExpense.schema.js';

/* 2. Enjambre Atómico y Orquestadores Relacionados */
/** 🛡️ SANEADO Zenith: Inyección de extensiones '.js' para resolución Node16/Next16. */
import { ProcessExpenditureRecord } from './ProcessExpenditureRecord.js';
import { SovereignPersistenceSentry } from '../../orchestrators/SovereignPersistenceSentry.js';

/**
 * @interface IIndividualProcessParameters
 * @description Contrato inmutable para la ejecución del procesador unitario.
 */
interface IIndividualProcessParameters {
  /** Snapshot crudo del registro, ya pre-validado por la aduana del lote. */
  readonly rawRecordSnapshot: IEPublicaExpenseRaw;
  /** Identificador del municipio (Tenant) para la generación del hash. */
  readonly tenantMunicipalitySlugLiteral: string;
  /** Identificador de trazabilidad forense del hilo de ejecución. */
  readonly correlationIdentifier: string;
}

/** Identificador técnico del aparato para el Neural Sentinel. */
const ATOM_IDENTIFIER = 'INDIVIDUAL_RECORD_INGESTION_PROCESSOR';

/**
 * Procesa una unidad de datos de transparencia municipal transformándola
 * en una entidad soberana inmutable y persistiendo su estado.
 *
 * @param processParametersSnapshot - Snapshot de datos y contexto de ejecución.
 * @returns {Promise<boolean>} Verdadero si la unidad fue procesada y persistida nominalmente.
 */
export const ProcessIndividualMunicipalityRecord = async (
  processParametersSnapshot: IIndividualProcessParameters
): Promise<boolean> => {

  const {
    rawRecordSnapshot,
    tenantMunicipalitySlugLiteral,
    correlationIdentifier
  } = processParametersSnapshot;

  try {
    /**
     * FASE A: TRANSFORMACIÓN SOBERANA
     * 🛡️ SANEADO Zenith: Erradicado el uso de 'any'. El tipo 'IEPublicaExpenseRaw'
     * garantiza que el mapeador reciba ADN compatible con el protocolo gubernamental.
     */
    const sovereignExpenditureSnapshot = await ProcessExpenditureRecord(
      rawRecordSnapshot,
      tenantMunicipalitySlugLiteral,
      correlationIdentifier
    );

    /**
     * FASE B: PERSISTENCIA INTELIGENTE (Sentry Logic)
     * Delegamos la responsabilidad de la inmutabilidad y detección de mutaciones.
     */
    await SovereignPersistenceSentry(
      sovereignExpenditureSnapshot,
      correlationIdentifier
    );

    return true;

  } catch (caughtError: unknown) {
    /**
     * @section Gestión de Resiliencia Unitaria
     * Un error en este átomo se considera una 'Falla de Unidad'. Reportamos
     * a telemetría pero permitimos que el orquestador maestro continúe
     * con el resto de la colección.
     */
    const errorDescriptionLiteral = caughtError instanceof Error
      ? caughtError.message
      : String(caughtError);

    void EmitTelemetrySignal({
      severityLevelLiteral: 'ERROR',
      moduleIdentifierLiteral: ATOM_IDENTIFIER,
      operationCodeLiteral: 'INDIVIDUAL_UNIT_INGESTION_FAULT',
      correlationIdentifier,
      messageContentLiteral: 'Fallo al procesar registro individual; el enjambre continúa la operación.',
      /** Etiqueta ontológica para el análisis de salud predictivo */
      semanticIntentTag: 'DATA_INGESTION_UNIT_FAULT',
      contextMetadataSnapshot: {
        tenantMunicipalityLiteral: tenantMunicipalitySlugLiteral,
        errorTraceLiteral: errorDescriptionLiteral,
        /** Capturamos el ID gubernamental para triaje manual de datos */
        governmentReferenceLiteral: rawRecordSnapshot.registro.empenho.numero
      }
    });

    return false;
  }
};
