/**
 * @section PMF Engine Logic - Sovereign Persistence Sentry (Orchestrator)
 * @description Orquestador supremo de persistencia. Gestiona la inmutabilidad
 * de los registros mediante la detección de mutaciones (Content Hashing).
 * Garantiza que solo los cambios reales impacten el Ledger, optimizando el Tier de Datos.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Swarm Intelligence.
 * SANEADO Zenith: Resolución de TS2307 (ESM Extension), validación de ADN en frontera
 * e inyección de telemetría forense para el Neural Sentinel.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ValidateEnvironmentAduana } from '@floripa-dignidade/environment-validator';
import { InternalSystemException, ValidationException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  ReportForensicException,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 1. ADN de Dominio (Verbatim Module Syntax) */
import { PERSISTENCE_SENTRY_CONFIGURATION } from '../../constants/PersistenceSentry.config.js';
import { PublicExpenditureSchema } from '../../schemas/sovereign/PublicExpenditure.schema.js';
import type { IPublicExpenditure } from '../../schemas/sovereign/PublicExpenditure.schema.js';

/* 2. Enjambre Atómico de Soporte (Internal Swarm) */
/**
 * 🛡️ SANEADO Zenith (Fix TS2307): Inclusión obligatoria de extensiones '.js'
 * para garantizar la resolución en el motor de ejecución ESM.
 */
import { CalculateContentSignature } from '../atomic/persistence/CalculateContentSignature.js';
import { FetchExpenditureState } from '../atomic/persistence/FetchExpenditureState.js';
import { UpdateExpenditureHeartbeat } from '../atomic/persistence/UpdateExpenditureHeartbeat.js';
import { TransmitSovereignExpenditureToCloud } from '../atomic/persistence/TransmitSovereignExpenditureToCloud.js';

/** Identificador técnico del aparato para el Neural Sentinel. */
const ORCHESTRATOR_IDENTIFIER = PERSISTENCE_SENTRY_CONFIGURATION.MODULE_IDENTIFIER_LITERAL;

/**
 * Gestiona el ciclo de vida de un gasto público en la nube soberana.
 * Implementa el patrón "Smart Ingestion" para evitar redundancia de datos.
 *
 * @param publicExpenditurePayload - Gasto normalizado a ser auditado para persistencia.
 * @param correlationIdentifier - Identificador de trazabilidad digital.
 */
export const SovereignPersistenceSentry = async (
  publicExpenditurePayload: IPublicExpenditure,
  correlationIdentifier: string = GenerateCorrelationIdentifier(),
): Promise<void> => {

  /**
   * 🛡️ LEY ZENITH: Resolución obligatoria de infraestructura.
   * Garantiza que los secretos del hardware estén disponibles antes de la decisión.
   */
  const infrastructureMetadata = await ValidateEnvironmentAduana();

  return await TraceExecutionTime(
    ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_SMART_PERSISTENCE_TRANSACTION',
    correlationIdentifier,
    async () => {
      try {
        // --- FASE 1: ADUANA DE ADN (Pre-flight Validation) ---
        /**
         * Validamos el payload en la frontera del orquestador para asegurar
         * que no procesamos ADN corrupto antes del hashing.
         */
        const aduanaValidationResult = PublicExpenditureSchema.safeParse(publicExpenditurePayload);

        if (!aduanaValidationResult.success) {
          throw new ValidationException('CONTRATO_DE_GASTO_PARA_PERSISTENCIA_INVALIDO', {
            structuralIssuesCollection: aduanaValidationResult.error.flatten(),
            correlationIdentifier
          });
        }

        const validatedExpenditure = aduanaValidationResult.data;

        // --- FASE 2: GENERACIÓN DE HUELLA DIGITAL (Content Fingerprint) ---
        /**
         * Creamos una firma SHA-256 inalterable basada en los datos técnicos.
         */
        const currentContentHashFingerprint = await CalculateContentSignature({
          totalAmountNumeric: validatedExpenditure.totalExecutedAmountNumeric,
          serviceDescriptionLiteral: validatedExpenditure.serviceDescriptionLiteral,
          providerTaxIdentifier: validatedExpenditure.providerMetadata.taxIdentificationNumber,
          managementUnitTechnicalCode: validatedExpenditure.managementUnitTechnicalCode
        }, correlationIdentifier);

        // --- FASE 3: CONSULTA DE ESTADO (Sovereign Cache Check) ---
        const previousStateSnapshot = await FetchExpenditureState(
          infrastructureMetadata.SUPABASE_URL,
          infrastructureMetadata.SUPABASE_SERVICE_ROLE_KEY,
          validatedExpenditure.expenditureIdentifier
        );

        // --- FASE 4: TRIÁJE DE MUTACIÓN (Decision Logic) ---
        const isDataIdenticalBoolean = previousStateSnapshot?.contentHash === currentContentHashFingerprint;

        if (isDataIdenticalBoolean) {
          /**
           * CASO A: Registro Íntegro (Sin Cambios).
           * Refrescamos el latido de vigencia para confirmar que el gasto sigue activo.
           */
          await UpdateExpenditureHeartbeat(
            infrastructureMetadata.SUPABASE_URL,
            infrastructureMetadata.SUPABASE_SERVICE_ROLE_KEY,
            validatedExpenditure.expenditureIdentifier
          );

          void EmitTelemetrySignal({
            severityLevelLiteral: 'DEBUG',
            moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
            operationCodeLiteral: 'EXPENDITURE_IDEMPOTENCY_CONFIRMED',
            correlationIdentifier,
            messageContentLiteral: 'Gasto idêntico detectado; ignorando persistência redundante.',
            contextMetadataSnapshot: { id: validatedExpenditure.expenditureIdentifier }
          });

          return;
        }

        /**
         * CASO B: Registro Nuevo o Mutado.
         * Ensamblamos el payload de persistencia física.
         */
        const cloudPersistencePayload = {
          ibge_id: validatedExpenditure.expenditureIdentifier,
          name_literal: validatedExpenditure.governmentTechnicalReferenceLiteral,
          metadata_snapshot: {
            ...validatedExpenditure,
            contentHash: currentContentHashFingerprint
          },
          last_sync_at: new Date().toISOString()
        };

        // --- FASE 5: DESPACHO FÍSICO (I/O Delegation) ---
        await TransmitSovereignExpenditureToCloud({
          cloudUrlLiteral: infrastructureMetadata.SUPABASE_URL,
          cloudKeySecret: infrastructureMetadata.SUPABASE_SERVICE_ROLE_KEY,
          payloadSnapshot: cloudPersistencePayload
        });

        // --- FASE 6: REPORTE DE ÉXITO (SRE Visibility) ---
        const operationModeLiteral = previousStateSnapshot ? 'EXPENDITURE_MUTATED' : 'NEW_EXPENDITURE_CREATED';

        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: operationModeLiteral,
          correlationIdentifier,
          messageContentLiteral: 'Sincronização de transparência fiscal consolidada no Ledger.',
          semanticIntentTag: 'DATA_LAKE_SYNCHRONIZATION',
          contextMetadataSnapshot: {
            expenditureIdentifier: validatedExpenditure.expenditureIdentifier,
            isMutationBoolean: !!previousStateSnapshot,
            contentHash: currentContentHashFingerprint
          }
        });

      } catch (caughtError: unknown) {
        // --- FASE 7: GESTIÓN FORENSE DE COLAPSO (Resilience) ---
        if (caughtError instanceof ValidationException) throw caughtError;

        const errorDescriptionLiteral = caughtError instanceof Error
          ? caughtError.message
          : 'UNKNOWN_PERSISTENCE_FAULT';

        const normalizedException = new InternalSystemException('FALLO_EN_PERSISTENCIA_DE_DATOS_ABIERTOS_SRE', {
          originalErrorLiteral: errorDescriptionLiteral,
          expenditureIdentifier: publicExpenditurePayload.expenditureIdentifier,
          correlationIdentifier
        });

        ReportForensicException(normalizedException, correlationIdentifier);
        throw normalizedException;
      }
    }
  );
};
