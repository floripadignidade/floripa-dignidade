/**
 * @section Observatory Logic - Institutional In-Memory Fallback Dictionaries (Atom)
 * @description Proveedor de respaldos lingüísticos inmutables en memoria validados contra
 * `ObservatoryI18nSchema` para garantizar disponibilidad continua (cero errores 404 ni
 * pantalla en blanco) en el Observatorio de Gastos Públicos ante ausencia parcial de
 * diccionarios compilados en tiempo de ejecución (ADR 0030).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010 (Disponibilidad y Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { DEFAULT_LOCALE_IDENTIFIER } from '@floripa-dignidade/contracts';

import { type IObservatoryI18n, ObservatoryI18nSchema } from '../../i18n/ObservatoryI18n.schema';

const DEFAULT_LANGUAGE_CODE_LITERAL = DEFAULT_LOCALE_IDENTIFIER.split('-')[0] ?? 'pt';

const PORTUGUESE_OBSERVATORY_FALLBACK: IObservatoryI18n = ObservatoryI18nSchema.parse({
  metadata: {
    pageTitleLiteral: 'Observatório de Gastos Públicos',
    pageDescriptionLiteral:
      'Auditoria algorítmica e transparência ativa da execução orçamentária municipal de Florianópolis.',
  },
  dashboard: {
    totalInvestedLabel: 'Total Auditado',
    anomalyCountLabel: 'Anomalias Suspeitas',
    territorialReachLabel: 'Distritos Cobertos',
    aiAuditStatusLabel: 'Integridade da IA',
  },
  table: {
    columnEntity: 'Despesas Públicas e Contratos',
    columnAmount: 'Valor Executado',
    columnIntegrityHash: 'Identificador Forense',
    columnAiScore: 'Saúde Cognitiva',
  },
  actions: {
    exportCsvLabel: 'Exportar Relatório',
    printReportLabel: 'Imprimir Certificado',
    restrictAccessToggle: 'Filtrar por Gravidade',
  },
});

const SPANISH_OBSERVATORY_FALLBACK: IObservatoryI18n = ObservatoryI18nSchema.parse({
  metadata: {
    pageTitleLiteral: 'Observatorio de Gastos Públicos',
    pageDescriptionLiteral:
      'Auditoría algorítmica y transparencia activa de la ejecución presupuestaria municipal de Florianópolis.',
  },
  dashboard: {
    totalInvestedLabel: 'Total Auditado',
    anomalyCountLabel: 'Anomalías Sospechosas',
    territorialReachLabel: 'Distritos Cubiertos',
    aiAuditStatusLabel: 'Integridad de la IA',
  },
  table: {
    columnEntity: 'Gastos Públicos y Contratos',
    columnAmount: 'Valor Ejecutado',
    columnIntegrityHash: 'Identificador Forense',
    columnAiScore: 'Salud Cognitiva',
  },
  actions: {
    exportCsvLabel: 'Exportar Reporte',
    printReportLabel: 'Imprimir Certificado',
    restrictAccessToggle: 'Filtrar por Severidad',
  },
});

const ENGLISH_OBSERVATORY_FALLBACK: IObservatoryI18n = ObservatoryI18nSchema.parse({
  metadata: {
    pageTitleLiteral: 'Public Expenditure Observatory',
    pageDescriptionLiteral:
      'Algorithmic audit and proactive transparency of municipal budget execution in Florianópolis.',
  },
  dashboard: {
    totalInvestedLabel: 'Total Audited',
    anomalyCountLabel: 'Suspicious Anomalies',
    territorialReachLabel: 'Covered Districts',
    aiAuditStatusLabel: 'AI Integrity',
  },
  table: {
    columnEntity: 'Public Expenditures & Contracts',
    columnAmount: 'Executed Amount',
    columnIntegrityHash: 'Forensic Identifier',
    columnAiScore: 'Cognitive Health',
  },
  actions: {
    exportCsvLabel: 'Export Report',
    printReportLabel: 'Print Certificate',
    restrictAccessToggle: 'Filter by Severity',
  },
});

const OBSERVATORY_FALLBACKS_BY_LANGUAGE: Readonly<Record<string, IObservatoryI18n>> = Object.freeze(
  {
    pt: PORTUGUESE_OBSERVATORY_FALLBACK,
    es: SPANISH_OBSERVATORY_FALLBACK,
    en: ENGLISH_OBSERVATORY_FALLBACK,
  },
);

/**
 * Resuelve el diccionario de respaldo inmutable en memoria para un código BCP 47 solicitado.
 * Prioriza la subetiqueta base ISO 639 y conmuta al idioma fuente por defecto del ecosistema.
 *
 * @param requestedLocaleLiteral - Código BCP 47 solicitado en la ruta del observatorio.
 * @returns {IObservatoryI18n} Diccionario validado por `ObservatoryI18nSchema` e inmutable.
 */
export const ResolveObservatoryInMemoryFallback = (
  requestedLocaleLiteral: string,
): IObservatoryI18n => {
  const baseLanguageCodeLiteral =
    requestedLocaleLiteral.split('-')[0]?.toLowerCase() ?? DEFAULT_LANGUAGE_CODE_LITERAL;

  return (
    OBSERVATORY_FALLBACKS_BY_LANGUAGE[baseLanguageCodeLiteral] ??
    OBSERVATORY_FALLBACKS_BY_LANGUAGE[DEFAULT_LANGUAGE_CODE_LITERAL] ??
    PORTUGUESE_OBSERVATORY_FALLBACK
  );
};
