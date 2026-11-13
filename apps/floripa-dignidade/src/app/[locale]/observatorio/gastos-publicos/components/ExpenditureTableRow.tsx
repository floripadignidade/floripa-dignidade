/**
 * @section UI Atom - Public Expenditure Table Row
 * @description Renderiza una única entrada del libro presupuestario en la tabla
 * del observatorio ciudadano. Resuelve de forma asíncrona el enmascaramiento de
 * privacidad de datos fiscales (LGPD) y presenta el estado de auditoría algorítmica.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Seguridad y Mantenibilidad).
 * SANEADO: Conexión canónica con @floripa-dignidade/contracts, exportación formal de contrato de propiedades
 * y purga de terminología informal.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';

/* 1. Contratos Centralizados de Dominio (Single Source of Truth) */
import type { IPublicExpenditure } from '@floripa-dignidade/contracts';

/* 2. Infraestructura de Privacidad y Utilidades */
import { MaskSovereignIdentity } from '@floripa-dignidade/shared-utility';

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

  /**
   * @section Formateo Institucional
   * Conversión a moneda brasileña (BRL) y fecha regional con API nativa Intl.
   */
  const formattedAmountLiteral = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(expenditureSnapshot.totalExecutedAmountNumeric);

  const formattedExtractionDateLiteral = new Date(
    expenditureSnapshot.auditMetadata.extractionTimestampISO,
  ).toLocaleDateString('pt-BR');

  /**
   * @section Protección de Privacidad (Cumplimiento LGPD)
   * Enmascaramiento asíncrono de la identidad fiscal del proveedor (CNPJ).
   */
  const maskedTaxIdentifierLiteral = await MaskSovereignIdentity({
    rawIdentityLiteral: expenditureSnapshot.providerMetadata.taxIdentificationNumber,
    maskingStrategyLiteral: 'BRAZILIAN_DOCUMENT',
  });

  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors duration-300 group">
      {/* 1. IDENTIFICADOR Y TRAZABILIDAD TEMPORAL */}
      <td className="p-6 font-mono text-[10px] text-slate-400">
        <span className="text-slate-900 font-bold block mb-1 group-hover:text-amber-600 transition-colors">
          {expenditureSnapshot.expenditureIdentifier}
        </span>
        {formattedExtractionDateLiteral}
      </td>

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
