/**
 * @section PMF Engine Logic - Expenditure Record Processor
 * @description Orquestador atómico que transforma un registro crudo de la PMF
 * en una entidad de Gasto Público soberana con integridad territorial, fiscal
 * y presupuestaria. Coordina el enjambre de mappers y generadores de firmas.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Functional Atomicity.
 * SANEADO Zenith: Inyección de Unidad Gestora, Trace de rendimiento y erradicación de redundancia.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  GenerateCorrelationIdentifier,
  TraceExecutionTime
} from '@floripa-dignidade/telemetry';

/* 1. ADN del Dominio y Tipos Bridados (Rutas Limpias) */
import type { IEPublicaExpenseRaw } from '../../../schemas/protocol/EPublicaExpense.schema';
import { PublicExpenditureSchema } from '../../../schemas/sovereign/PublicExpenditure.schema';
import type {
  IPublicExpenditure,
  TPublicExpenditureIdentifier,
  TTerritorialTechnicalIdentifier
} from '../../../schemas/sovereign/PublicExpenditure.schema';

/* 2. Enjambre Atómico de Soporte (Internal Swarm) */
import { MapEPublicaToSovereign } from './MapEPublicaToSovereign';
import { LinkExpenditureToTerritory } from '../cross-reference/LinkExpenditureToTerritory';
import { GenerateExpenditureHashIdentifier } from './GenerateExpenditureHashIdentifier';
import { CalculateExecutedFinancialBalance } from './CalculateExecutedFinancialBalance';

/** Identificador técnico del aparato para el Neural Sentinel. */
const PROCESSOR_IDENTIFIER = 'EXPENDITURE_RECORD_ORCHESTRATOR';

/**
 * Procesa un registro individual inyectando integridad forense y contexto geográfico.
 * Garantiza que el producto final cumpla estrictamente con el PublicExpenditureSchema.
 *
 * @param rawGovernmentExpenditureSnapshot - Datos crudos capturados del proveedor E-Publica.
 * @param municipalitySlugLiteral - Slug para la generación del hash determinista (identidad).
 * @param correlationIdentifier - ID para el rastro de sangre digital del Neural Sentinel.
 * @returns {Promise<IPublicExpenditure>} Entidad homogenizada, firmada y validada.
 */
export const ProcessExpenditureRecord = async (
  rawGovernmentExpenditureSnapshot: IEPublicaExpenseRaw,
  municipalitySlugLiteral: string,
  correlationIdentifier: string = GenerateCorrelationIdentifier()
): Promise<IPublicExpenditure> => {

  return await TraceExecutionTime(
    PROCESSOR_IDENTIFIER,
    'EXECUTE_RECORD_SOVEREIGN_TRANSFORMATION',
    correlationIdentifier,
    async () => {
      const { registro } = rawGovernmentExpenditureSnapshot;

      // 1. INFERENCIA GEOGRÁFICA (Linkage con el Territorial-Engine)
      const detectedTerritoryIdLiteral = await LinkExpenditureToTerritory(
        registro.empenho.objetoResumido,
        correlationIdentifier
      );

      // 2. CÁLCULO DE PRECISIÓN FINANCIERA (Aritmética Protegida)
      /** 🛡️ SANEADO Zenith: El balance se calcula una sola vez y se inyecta al final. */
      const executedBalanceNumeric = CalculateExecutedFinancialBalance(
        registro.listMovimentos,
        correlationIdentifier
      );

      // 3. GENERACIÓN DE IDENTIDAD SOBERANA (SHA-256 Hash)
      const fiscalYearNumeric = new Date(registro.empenho.emissao).getFullYear();
      const forensicExpenditureIdentifier = await GenerateExpenditureHashIdentifier({
        municipalitySlugLiteral,
        fiscalYearNumeric,
        governmentReferenceLiteral: registro.empenho.numero.toString()
      }, correlationIdentifier);

      // 4. MAPEO DE BASE (Data Homogenization)
      /** Delegamos la limpieza de nombres y taxonomía al mapper de base. */
      const baseMappedEntity = await MapEPublicaToSovereign(
        rawGovernmentExpenditureSnapshot,
        correlationIdentifier
      );

      /**
       * 5. ENSAMBLAJE FINAL Y CASTING SOBERANO
       * 🛡️ SANEADO Zenith: Inyección del 'managementUnitTechnicalCode' requerido por el esquema.
       * Consolidamos todas las piezas de inteligencia en el objeto final.
       */
      const finalExpenditureSnapshot: IPublicExpenditure = {
        ...baseMappedEntity,
        expenditureIdentifier: forensicExpenditureIdentifier as TPublicExpenditureIdentifier,
        targetTerritoryIdentifier: detectedTerritoryIdLiteral as TTerritorialTechnicalIdentifier,
        totalExecutedAmountNumeric: executedBalanceNumeric,
        /** Extraemos el código de la unidad gestora desde la jerarquía presupuestaria. */
        managementUnitTechnicalCode: registro.despesa.funcao.codigo,
      };

      // 6. ADUANA DE INTEGRIDAD FINAL (Double-Check)
      /**
       * Validamos que el ensamble final sea 100% conforme al ADN institucional
       * antes de que toque el Ledger de persistencia.
       */
      return PublicExpenditureSchema.parse(finalExpenditureSnapshot);
    }
  );
};
