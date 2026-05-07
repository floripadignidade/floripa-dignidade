/**
 * @section PMF Engine Logic - E-Pública to Sovereign Mapper (Orchestrator)
 * @description Átomo de lógica pura encargado de la homogenización de datos.
 * Coordina el enjambre de sub-mapeadores para transformar registros gubernamentales
 * en inteligencia civil inmutable y validada por Zod.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & ISO Technical Naming.
 * SANEADO Zenith: Sincronización de orden alfabético y normalización de excepciones.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { InternalSystemException } from '@floripa-dignidade/exceptions';
import { EmitTelemetrySignal, TraceExecutionTime } from '@floripa-dignidade/telemetry';

/* 1. ADN de Entrada y Salida (Verbatim Module Syntax - RUTAS LIMPIAS) */
import {
  type IPublicExpenditure,
  PublicExpenditureSchema,
  type TPublicExpenditureIdentifier,
  type TTerritorialTechnicalIdentifier,
} from '../../../schemas/sovereign/PublicExpenditure.schema';

import type { IEPublicaExpenseRaw } from '../../../schemas/protocol/EPublicaExpense.schema';

/* 2. Enjambre Atómico de Soporte (Mappers especializados) */
import { CalculateExecutedFinancialBalance } from './CalculateExecutedFinancialBalance';
import { MapBudgetTaxonomy } from './MapBudgetTaxonomy';
import { MapProviderIdentity } from './MapProviderIdentity';

/** Identificador técnico del aparato para el Neural Sentinel. */
const DATA_MAPPER_IDENTIFIER = 'EPUBLICA_SOVEREIGN_MAPPER';

/**
 * Mapea y purifica un registro individual de la Prefeitura de Florianópolis.
 * Realiza la conversión de protocolos gubernamentales al estándar de integridad de la ONG.
 *
 * @param rawExpenseSnapshot - Registro extraído de la API de red de E-Pública.
 * @param correlationIdentifier - Identificador de trazabilidad del hilo superior.
 * @returns {Promise<IPublicExpenditure>} Entidad homogenizada y validada por la aduana Zod.
 * @throws {InternalSystemException} Si el mapeo viola el contrato de ADN soberano.
 */
export const MapEPublicaToSovereign = async (
  rawExpenseSnapshot: IEPublicaExpenseRaw,
  correlationIdentifier: string,
): Promise<IPublicExpenditure> => {
  return await TraceExecutionTime(
    DATA_MAPPER_IDENTIFIER,
    'MAP_GOVERNMENT_RECORD_TO_SOVEREIGN_ADN',
    correlationIdentifier,
    async () => {
      const { registro } = rawExpenseSnapshot;

      /**
       * FASE 1: INTELIGENCIA FINANCIERA Y FISCAL
       * Delegamos los cálculos y limpiezas a los átomos correspondientes para cumplir con SRP.
       */
      const totalExecutedAmountNumeric = CalculateExecutedFinancialBalance(
        registro.listMovimentos,
        correlationIdentifier,
      );

      const providerMetadata = MapProviderIdentity(
        registro.fornecedor.pessoa.nome,
        registro.fornecedor.pessoa.cpfCnpj,
      );

      const functionalCategory = MapBudgetTaxonomy(
        registro.despesa.funcao.denominacao,
        registro.despesa.subfuncao.denominacao,
        registro.despesa.programa.denominacao,
      );

      /**
       * FASE 2: ENSAMBLAJE DE LA ENTIDAD SOBERANA
       * Construimos el snapshot inmutable para el Data Lake institucional.
       */
      const sovereignExpenditureSnapshot = {
        /** 🛡️ CASTING SOBERANO: Vinculación con los tipos bridados nominales */
        expenditureIdentifier: `PMF-EXP-${registro.empenho.numero}` as TPublicExpenditureIdentifier,
        governmentTechnicalReferenceLiteral: registro.empenho.numero.toString(),

        /**
         * @future_integration
         * Vinculación geográfica basada en el rastro del IBGE (Fase 8).
         * Actualmente centralizado en el municipio de Florianópolis.
         */
        targetTerritoryIdentifier: '4205407' as TTerritorialTechnicalIdentifier,

        totalExecutedAmountNumeric,
        providerMetadata,
        functionalCategory,
        serviceDescriptionLiteral: registro.empenho.objetoResumido.trim(),

        auditMetadata: {
          sourceSoftwareLiteral: 'E-PUBLICA',
          extractionTimestampISO: new Date().toISOString(),
          lastAnomalyScoreNumeric: 0,
        },
      };

      // 3. ADUANA DE ADN (Validación de Integridad Estructural)
      const validationResult = PublicExpenditureSchema.safeParse(sovereignExpenditureSnapshot);

      if (!validationResult.success) {
        // Reporte de violación de contrato al sistema de telemetría
        void EmitTelemetrySignal({
          severityLevel: 'CRITICAL',
          moduleIdentifier: DATA_MAPPER_IDENTIFIER,
          operationCode: 'SOVEREIGN_MAPPING_VIOLATION',
          correlationIdentifier,
          message: 'PMF_ENGINE.ERRORS.MAPPING_TRANSFORMATION_FAULT',
          contextMetadataSnapshot: {
            structuralIssuesCollection: validationResult.error.flatten(),
            sourceRecordIdentifier: registro.empenho.numero
          },
        });

        throw new InternalSystemException('FALLO_EN_HOMOGENIZACION_DE_GASTO_PUBLICO', {
          validationIssues: validationResult.error.flatten(),
          governmentReference: registro.empenho.numero
        });
      }

      // 4. REPORTE DE ÉXITO (SRE Visibility)
      void EmitTelemetrySignal({
        severityLevel: 'INFO',
        moduleIdentifier: DATA_MAPPER_IDENTIFIER,
        operationCode: 'RECORD_NORMALIZATION_SUCCESS',
        correlationIdentifier,
        message: 'PMF_ENGINE.LOGS.RECORD_MAPPED',
        contextMetadataSnapshot: { id: sovereignExpenditureSnapshot.expenditureIdentifier },
      });

      return validationResult.data;
    },
  );
};
