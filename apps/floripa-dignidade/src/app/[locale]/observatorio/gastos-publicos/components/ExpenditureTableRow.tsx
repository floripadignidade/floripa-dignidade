/**
 * @section UI Atom - Expenditure Table Row
 * @description Renderiza una única entrada del ledger presupuestario en la
 * tabla del observatorio.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Functional Atomicity.
 * SANEADO Zenith: Erradicación del extinto búnker 'shared' (Fix TS2307),
 * resolución asíncrona de identidad forense (PII Masking) y Prosa ISO.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/* 1. ADN de Dominio (Verbatim Module Syntax - Clean Paths) */
import type { IPublicExpenditure } from '@floripa-dignidade/pmf-open-data-engine';

/* 2. Infraestructura Transversal (Shared Utility) */
import { MaskSovereignIdentity } from '@floripa-dignidade/shared-utility';

/* 3. Átomos Locales (Internal Swarm) */
import { AiAuditBadge } from './AiAuditBadge';

/**
 * @interface IExpenditureTableRowProperties
 * @description Contrato inmutable para la inyección de datos financieros.
 * Sigue la norma ISO de Objeto + Propiedad + Representación.
 */
interface IExpenditureTableRowProperties {
  readonly expenditureSnapshot: IPublicExpenditure;
}

/**
 * Aparato visual que representa una fila física del gasto gubernamental.
 * 🛡️ LEY ZENITH: Implementado como Server Component asíncrono para
 * permitir la resolución telemétrica de la máscara de privacidad (LGPD).
 *
 * @param propertiesSnapshot - Snapshot inmutable con el ADN del gasto.
 * @returns {Promise<React.JSX.Element>} Fila HTML semántica y auditada.
 */
export async function ExpenditureTableRow(
  propertiesSnapshot: IExpenditureTableRowProperties
): Promise<React.JSX.Element> {
  const { expenditureSnapshot } = propertiesSnapshot;

  /**
   * @section Formateo Institucional
   */
  const formattedAmountLiteral = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(expenditureSnapshot.totalExecutedAmountNumeric);

  const formattedExtractionDateLiteral = new Date(
    expenditureSnapshot.auditMetadata.extractionTimestampISO
  ).toLocaleDateString('pt-BR');

  /**
   * @section Protección de Privacidad (LGPD Compliance)
   * 🛡️ LEY SRE: Resolvemos la máscara de identidad de manera asíncrona
   * consumiendo el orquestador del búnker 'shared-utility'.
   */
  const maskedTaxIdentifierLiteral = await MaskSovereignIdentity({
    rawIdentityLiteral: expenditureSnapshot.providerMetadata.taxIdentificationNumber,
    maskingStrategyLiteral: 'BRAZILIAN_DOCUMENT'
  });

  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors duration-300 group">
      {/* 1. IDENTIDAD SOBERANA Y TRAZA TEMPORAL */}
      <td className="p-6 font-mono text-[10px] text-slate-400">
        <span className="text-slate-900 font-bold block mb-1 group-hover:text-amber-600 transition-colors">
          {expenditureSnapshot.expenditureIdentifier}
        </span>
        {formattedExtractionDateLiteral}
      </td>

      {/* 2. IDENTIDAD FISCAL (Enmascarada) */}
      <td className="p-6">
        <span className="font-bold text-slate-900 block leading-none mb-1">
          {expenditureSnapshot.providerMetadata.legalNameLiteral}
        </span>
        <span className="text-[10px] font-medium text-slate-400" aria-label="Documento fiscal anonimizado">
          CNPJ: {maskedTaxIdentifierLiteral}
        </span>
      </td>

      {/* 3. OBJETO DEL GASTO */}
      <td className="p-6 text-slate-600 max-w-xs">
        <p className="line-clamp-2 leading-relaxed text-xs">
          {expenditureSnapshot.serviceDescriptionLiteral}
        </p>
      </td>

      {/* 4. MONTO EJECUTADO */}
      <td className="p-6 text-right font-black text-slate-900 tabular-nums">
        {formattedAmountLiteral}
      </td>

      {/* 5. AUDITORÍA IA (Neural Sentinel) */}
      <td className="p-6 text-center">
        <AiAuditBadge
          anomalyScoreNumeric={expenditureSnapshot.auditMetadata.lastAnomalyScoreNumeric}
        />
      </td>
    </tr>
  );
}
