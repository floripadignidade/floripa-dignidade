/**
 * @section Observatory Shell - Public Expenditure Page (Orchestrator)
 * @description Punto de acceso institucional para la auditoría de recursos públicos.
 * Coordina la verificación de acceso perimetral, la captura de datos fiscales gubernamentales,
 * la auditoría de contratos lingüísticos y el montaje del dashboard forense.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Rendimiento).
 * SANEADO Turbopack: Resolvedor lingüístico determinista y generación de metadatos SEO.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

/* 1. Infraestructura Core y Ruteo Institucional */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
  ReportForensicException,
} from '@floripa-dignidade/telemetry';

import { GlobalBaseException, InternalSystemException } from '@floripa-dignidade/exceptions';

import { SupportedLocaleSchema, ValidateLinguisticContract } from '@floripa-dignidade/routing';

/* 2. Contratos y Motores Canónicos de Datos Fiscales */
import { SyncMunicipalityExpenditure } from '@floripa-dignidade/data-ingestion-engine';
import type { IPublicExpenditure } from '@floripa-dignidade/contracts';

/* 3. Componentes y Lógica Local del Observatorio */
import { type IObservatoryI18n, ObservatoryI18nSchema } from '../i18n/ObservatoryI18n.schema';
import { CalculateObservatoryMetrics } from './logic/CalculateObservatoryMetrics';
import { ValidateObservatoryAccess } from './logic/ValidateObservatoryAccess';
import { ExpenditureTable } from './components/ExpenditureTable';
import { ObservatoryHeader } from './components/ObservatoryHeader';
import { ObservatoryMetricsGrid } from './components/ObservatoryMetricsGrid';

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const ORCHESTRATOR_IDENTIFIER = 'PUBLIC_EXPENDITURE_OBSERVATORY_SHELL' as ModuleIdentifier;

/**
 * @interface IObservatoryPageProperties
 * @description Contrato inmutable para las propiedades de la ruta Next.js App Router.
 */
interface IObservatoryPageProperties {
  readonly params: Promise<{ readonly locale: string }>;
}

/**
 * Generador de Metadatos Institucionales Dinámicos (SEO E-E-A-T).
 */
export async function generateMetadata(
  propertiesSnapshot: IObservatoryPageProperties,
): Promise<Metadata> {
  const { locale: rawLocaleIdentifierLiteral } = await propertiesSnapshot.params;
  const titlesMapping: Record<string, string> = {
    'pt-BR': 'Observatório de Gastos Públicos | Floripa Dignidade',
    'es-ES': 'Observatorio de Gastos Públicos | Floripa Dignidade',
    'en-US': 'Public Expenditure Observatory | Floripa Dignidade',
  };

  return {
    title: titlesMapping[rawLocaleIdentifierLiteral] ?? titlesMapping['pt-BR'],
    description: 'Transparência ativa e auditoria cidadã das contas públicas de Florianópolis.',
  };
}

/**
 * Resolvedor determinista de diccionarios para Turbopack (Next.js 16).
 */
const loadObservatoryDictionary = async (localeIdentifier: string): Promise<IObservatoryI18n> => {
  switch (localeIdentifier) {
    case 'es-ES':
      return (await import('../i18n/es-ES.json')).default;
    case 'en-US':
      return (await import('../i18n/en-US.json')).default;
    case 'pt-BR':
    default:
      return (await import('../i18n/pt-BR.json')).default;
  }
};

/**
 * Componente de Servidor principal del Observatorio de Gastos Públicos (RSC).
 */
export default async function PublicExpenditureObservatoryPage(
  propertiesSnapshot: IObservatoryPageProperties,
): Promise<React.JSX.Element> {
  const { locale: rawLocaleIdentifierLiteral } = await propertiesSnapshot.params;
  const correlationIdentifier = GenerateCorrelationIdentifier();

  // 1. VALIDACIÓN PERIMETRAL DE IDIOMA
  const localeValidationResult = SupportedLocaleSchema.safeParse(rawLocaleIdentifierLiteral);
  if (!localeValidationResult.success) notFound();
  const validatedLocaleLiteral = localeValidationResult.data;

  // 2. CONTROL DE ACCESO INSTITUCIONAL (RBAC Guard - Flujo Libre de Redirección)
  await ValidateObservatoryAccess(validatedLocaleLiteral);

  try {
    // 3. CARGA Y VALIDACIÓN DE CONTRATO LINGÜÍSTICO (Turbopack Deterministic)
    const rawDictionary = await loadObservatoryDictionary(validatedLocaleLiteral);
    ValidateLinguisticContract(
      'OBSERVATORY_SHELL',
      ObservatoryI18nSchema,
      rawDictionary,
      validatedLocaleLiteral,
    );
    const linguisticDictionarySnapshot: IObservatoryI18n = rawDictionary;

    // 4. CAPTURA Y NORMALIZACIÓN DE PARTIDAS FISCALES
    const expenditureCollectionSnapshot: IPublicExpenditure[] = await SyncMunicipalityExpenditure({
      municipalitySlugLiteral: 'florianopolis',
      periodRange: {
        initialMonthYearLiteral: '01/2026',
        finalMonthYearLiteral: '04/2026',
      },
      correlationIdentifier,
    });

    // 5. CÁLCULO DE INDICADORES Y ANOMALÍAS
    const observatoryMetricsSnapshot = CalculateObservatoryMetrics(expenditureCollectionSnapshot);

    // 6. REPORTE DE TELEMETRÍA FORENSE
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
      operationCodeLiteral: 'FORENSIC_DASHBOARD_ASSEMBLED' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: `Dashboard montado nominalmente en [${validatedLocaleLiteral}].`,
      semanticIntentTag: 'UI_OBSERVATORY_MOUNT',
      contextMetadataSnapshot: {
        recordCountQuantity: expenditureCollectionSnapshot.length,
        localeIdentifierLiteral: validatedLocaleLiteral,
      },
    });

    // 7. ENSAMBLAJE VISUAL DE ALTA FIDELIDAD
    return (
      <main className="min-h-screen bg-slate-50 p-4 md:p-8 lg:p-12 print:bg-white animate-in fade-in duration-700">
        <div className="container mx-auto max-w-7xl">
          <ObservatoryHeader
            titleLiteral={linguisticDictionarySnapshot.metadata.pageTitleLiteral}
            descriptionLiteral={linguisticDictionarySnapshot.metadata.pageDescriptionLiteral}
            exportActionLabelLiteral={linguisticDictionarySnapshot.actions.exportCsvLabel}
          />

          <ObservatoryMetricsGrid
            metrics={observatoryMetricsSnapshot}
            labels={linguisticDictionarySnapshot.dashboard}
          />

          <ExpenditureTable
            publicExpenditureCollection={expenditureCollectionSnapshot}
            tableHeadlineLiteral={linguisticDictionarySnapshot.table.columnEntity}
          />
        </div>
      </main>
    );
  } catch (caughtError: unknown) {
    const errorDescriptionLiteral =
      caughtError instanceof Error ? caughtError.message : 'UNKNOWN_OBSERVATORY_FAULT';

    const normalizedException =
      caughtError instanceof GlobalBaseException
        ? caughtError
        : new InternalSystemException('OBSERVATORY_ORCHESTRATION_COLLAPSE', {
            originalErrorLiteral: errorDescriptionLiteral,
            correlationIdentifier,
          });

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'CRITICAL',
      moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
      operationCodeLiteral: 'OBSERVATORY_FAULT_TRACE' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: 'Fallo crítico al orquestar el observatorio de gastos públicos.',
      semanticIntentTag: 'UI_OBSERVATORY_COLLAPSE',
      contextMetadataSnapshot: { ...normalizedException.runtimeContextSnapshot },
    });

    ReportForensicException(normalizedException, correlationIdentifier);
    return notFound();
  }
}
