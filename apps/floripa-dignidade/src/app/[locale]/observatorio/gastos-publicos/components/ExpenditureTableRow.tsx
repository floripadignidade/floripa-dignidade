/**
 * @section UI Atom - Expenditure Table Row
 * @description Renderiza una única entrada del ledger presupuestario.
 * Protocolo OEDP-V17.0 - High Performance SRE & Functional Atomicity.
 * SANEADO Zenith: Inyección de tipo explícito React.JSX.Element para fix TS17004.
 */

import React from 'react';
import type { IPublicExpenditure } from '@floripa-dignidade/pmf-open-data-engine';
import { MaskSovereignIdentity } from '@floripa-dignidade/shared';
import { AiAuditBadge } from './AiAuditBadge';

interface IExpenditureTableRowProperties {
  readonly expenditureSnapshot: IPublicExpenditure;
}

/**
 * 🛡️ SANEADO Zenith: Retorno explícito para evitar ambigüedad de JSX.
 */
export const ExpenditureTableRow = ({
  expenditureSnapshot,
}: IExpenditureTableRowProperties): React.JSX.Element => {

  const formattedAmountLiteral = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(expenditureSnapshot.totalExecutedAmountNumeric);

  const formattedExtractionDateLiteral = new Date(
    expenditureSnapshot.auditMetadata.extractionTimestampISO
  ).toLocaleDateString('pt-BR');

  const maskedTaxIdentifierLiteral = MaskSovereignIdentity({
    rawIdentityLiteral: expenditureSnapshot.providerMetadata.taxIdentificationNumber,
    maskingStrategyLiteral: 'BRAZILIAN_DOCUMENT'
  });

  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors duration-300 group">
      <td className="p-6 font-mono text-[10px] text-slate-400">
        <span className="text-slate-900 font-bold block mb-1 group-hover:text-amber-600 transition-colors">
          {expenditureSnapshot.expenditureIdentifier}
        </span>
        {formattedExtractionDateLiteral}
      </td>

      <td className="p-6">
        <span className="font-bold text-slate-900 block leading-none mb-1">
          {expenditureSnapshot.providerMetadata.legalNameLiteral}
        </span>
        <span className="text-[10px] font-medium text-slate-400" aria-label="Documento fiscal anonimizado">
          CNPJ: {maskedTaxIdentifierLiteral}
        </span>
      </td>

      <td className="p-6 text-slate-600 max-w-xs">
        <p className="line-clamp-2 leading-relaxed text-xs">
          {expenditureSnapshot.serviceDescriptionLiteral}
        </p>
      </td>

      <td className="p-6 text-right font-black text-slate-900 tabular-nums">
        {formattedAmountLiteral}
      </td>

      <td className="p-6 text-center">
        <AiAuditBadge
          anomalyScoreNumeric={expenditureSnapshot.auditMetadata.lastAnomalyScoreNumeric}
        />
      </td>
    </tr>
  );
};
