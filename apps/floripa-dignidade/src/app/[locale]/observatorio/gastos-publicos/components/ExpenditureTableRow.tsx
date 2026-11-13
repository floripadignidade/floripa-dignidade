/**
 * @section UI Atom - Public Expenditure Table Row
 * @description Renderiza una única entrada del libro presupuestario en la tabla
 * del observatorio ciudadano. Resuelve de forma asíncrona la anonimización
 * de datos fiscales conforme a la LGPD (Lei 13.709/2018) mediante `MaskCitizenIdentity`
 * y presenta el estado de auditoría algorítmica.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Seguridad y Mantenibilidad) y W3C WCAG 2.2 AAA.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';

/* 1. Contratos Centralizados de Dominio (Single Source of Truth) */
import type { IPublicExpenditure } from '@floripa-dignidade/contracts';

/* 2. Infraestructura de Privacidad y Utilidades (Nomenclatura Formal) */
import { MaskCitizenIdentity } from '@floripa-dignidade/shared-utility';

/* 3. Componentes Visuales Locales */
import { AiAuditBadge } from './AiAuditBadge';

/**
 * @interface IExpenditureTableRowProperties
 * @description Contrato inmutable para la inyección de datos financieros en la fila tabular.
 * Sigue la norma ISO 11179 de Objeto + Propiedad + Representación.
 */
export interface IExpenditureTableRowProperties {
  readonly expenditureSnapshot: IPublicExpenditure;
}

/**
 * Formateador de moneda corriente brasileña (BRL) inmutable a nivel de módulo.
 */
const BRAZILIAN_CURRENCY_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/**
 * Formateador de fecha institucional fijado en el huso horario oficial de Brasil.
 */
const BRAZILIAN_DATE_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

/**
 * Componente de Servidor asíncrono que representa una fila física del gasto público municipal.
 * Resuelve la protección de privacidad (LGPD) en el servidor antes de emitir HTML al cliente.
 *
 * @param propertiesSnapshot - Snapshot inmutable con el contrato de la partida presupuestaria.
 * @returns {Promise<React.JSX.Element>} Fila semántica de tabla HTML auditada.
 */
export async function ExpenditureTableRow(
  propertiesSnapshot: IExpenditureTableRowProperties,
): Promise<React.JSX.Element> {
  const { expenditureSnapshot } = propertiesSnapshot;

  const formattedAmountLiteral = BRAZILIAN_CURRENCY_FORMATTER.format(
    expenditureSnapshot.totalExecutedAmountNumeric,
  );

  const parsedExtractionDate = new Date(expenditureSnapshot.auditMetadata.extractionTimestampISO);
  const formattedExtractionDateLiteral = Number.isNaN(parsedExtractionDate.getTime())
    ? 'DATA_INDISPONÍVEL'
    : BRAZILIAN_DATE_FORMATTER.format(parsedExtractionDate);

  /**
   * @section Protección de Privacidad (Cumplimiento LGPD)
   * Enmascaramiento asíncrono de la identidad fiscal del proveedor (CNPJ).
   */
  const maskedTaxIdentifierLiteral = await MaskCitizenIdentity({
    rawIdentityLiteral: expenditureSnapshot.providerMetadata.taxIdentificationNumber,
    maskingStrategyLiteral: 'BRAZILIAN_DOCUMENT',
  });

  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors duration-300 group">
      {/* 1. IDENTIFICADOR Y TRAZABILIDAD TEMPORAL */}
      <th scope="row" className="p-6 font-mono text-[10px] text-slate-400 font-normal text-left">
        <span className="text-slate-900 font-bold block mb-1 group-hover:text-amber-600 transition-colors">
          {expenditureSnapshot.expenditureIdentifier}
        </span>
        {formattedExtractionDateLiteral}
      </th>

      {/* 2. IDENTIDAD FISCAL (Enmascarada bajo LGPD) */}
      <td className="p-6">
        <span className="font-bold text-slate-900 block leading-none mb-1">
          {expenditureSnapshot.providerMetadata.legalNameLiteral}
        </span>
        <span
          className="text-[10px] font-medium text-slate-400"
          aria-label="Documento fiscal anonimizado"
        >
          CNPJ: {maskedTaxIdentifierLiteral}
        </span>
      </td>

      {/* 3. OBJETO Y CONTEXTO DEL GASTO */}
      <td className="p-6 text-slate-600 max-w-xs">
        <p className="line-clamp-2 leading-relaxed text-xs">
          {expenditureSnapshot.serviceDescriptionLiteral}
        </p>
      </td>

      {/* 4. MONTO FINANCIERO EJECUTADO */}
      <td className="p-6 text-right font-black text-slate-900 tabular-nums">
        {formattedAmountLiteral}
      </td>

      {/* 5. AUDITORÍA ALGORÍTMICA (Inference Health Status) */}
      <td className="p-6 text-center">
        <AiAuditBadge
          anomalyScoreNumeric={expenditureSnapshot.auditMetadata.lastAnomalyScoreNumeric}
        />
      </td>
    </tr>
  );
}
