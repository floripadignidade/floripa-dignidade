/**
 * @section Observatory Shell - Public Expenditure Page (Orchestrator)
 * @description Punto de acceso institucional para la auditoría ciudadana de recursos
 * públicos. Valida el segmento `[locale]` contra el catálogo único BCP 47
 * (`@floripa-dignidade/contracts`), ejecuta la verificación de acceso fuera del
 * bloque de captura (preservando `NEXT_REDIRECT`), fuerza renderizado dinámico en el servidor
 * para prevenir bloqueos de red en tiempo de compilación, mide latencia con `TraceExecutionTime`,
 * carga diccionarios con cascada resiliente (ADR 0030) y garantiza disponibilidad continua.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179, ISO/IEC 25010 y W3C WCAG 2.2 AAA.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { type IPublicExpenditure, SupportedLocaleSchema } from '@floripa-dignidade/contracts';
import { SyncMunicipalityExpenditure } from '@floripa-dignidade/data-ingestion-engine';
import { GlobalBaseException, InternalSystemException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
  ReportForensicException,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import type { IObservatoryI18n } from '../i18n/ObservatoryI18n.schema';
import { ExpenditureTable } from './components/ExpenditureTable';
import { ObservatoryHeader } from './components/ObservatoryHeader';
import { ObservatoryMetricsGrid } from './components/ObservatoryMetricsGrid';
import { BuildObservatoryMetadata } from './logic/BuildObservatoryMetadata';
import {
  CalculateObservatoryMetrics,
  type IObservatoryMetricsResult,
} from './logic/CalculateObservatoryMetrics';
import { LoadObservatoryDictionary } from './logic/LoadObservatoryDictionary';
import { ResolveObservatoryInMemoryFallback } from './logic/ObservatoryFallbackDictionaries';
import { ValidateObservatoryAccess } from './logic/ValidateObservatoryAccess';

/**
 * Fuerza la ejecución dinámica en el servidor (RSC) para evitar que 'next build'
 * ejecute llamadas de red externas a portales gubernamentales durante la compilación en Vercel.
 */
export const dynamic = 'force-dynamic';

const ORCHESTRATOR_MODULE_IDENTIFIER = 'PUBLIC_EXPENDITURE_OBSERVATORY_SHELL' as ModuleIdentifier;

interface IObservatoryPageProperties {
  readonly params: Promise<{ readonly locale: string }>;
}

/**
 * Genera dinámicamente metadatos SEO, canónicos, OpenGraph y etiquetas `hreflang`
 * para el Observatorio de Gastos Públicos a partir del registro BCP 47 vigente.
 *
 * @param propertiesSnapshot - Parámetros dinámicos inyectados por Next.js App Router.
 * @returns {Promise<Metadata>} Metadatos localizados y validados.
 */
export async function generateMetadata(
  propertiesSnapshot: IObservatoryPageProperties,
): Promise<Metadata> {
  const { locale: rawLocaleIdentifierLiteral } = await propertiesSnapshot.params;
  return await BuildObservatoryMetadata(rawLocaleIdentifierLiteral);
}

const renderObservatoryDashboardView = (
  dictionarySnapshot: IObservatoryI18n,
  metricsSnapshot: IObservatoryMetricsResult,
  expenditureCollectionSnapshot: readonly IPublicExpenditure[],
): React.JSX.Element => (
  <main className="min-h-screen bg-slate-50 p-4 md:p-8 lg:p-12 print:bg-white animate-in fade-in duration-700">
    <div className="container mx-auto max-w-7xl">
      <ObservatoryHeader
        titleLiteral={dictionarySnapshot.metadata.pageTitleLiteral}
        descriptionLiteral={dictionarySnapshot.metadata.pageDescriptionLiteral}
        exportActionLabelLiteral={dictionarySnapshot.actions.exportCsvLabel}
      />

      <ObservatoryMetricsGrid metrics={metricsSnapshot} labels={dictionarySnapshot.dashboard} />

      <ExpenditureTable
        publicExpenditureCollection={expenditureCollectionSnapshot}
        tableHeadlineLiteral={dictionarySnapshot.table.columnEntity}
      />
    </div>
  </main>
);

/**
 * Componente de Servidor principal del Observatorio de Gastos Públicos (RSC).
 *
 * @param propertiesSnapshot - Promesa de parámetros de ruta `[locale]` de Next.js 16.
 * @returns {Promise<React.JSX.Element>} Vista del observatorio auditada y resiliente.
 */
export default async function PublicExpenditureObservatoryPage(
  propertiesSnapshot: IObservatoryPageProperties,
): Promise<React.JSX.Element> {
  const { locale: rawLocaleIdentifierLiteral } = await propertiesSnapshot.params;
  const correlationIdentifier = GenerateCorrelationIdentifier();

  const localeValidationResult = SupportedLocaleSchema.safeParse(rawLocaleIdentifierLiteral);
  if (!localeValidationResult.success) {
    notFound();
  }

  const validatedLocaleLiteral = localeValidationResult.data;

  // Verificación perimetral de acceso fuera de TraceExecutionTime y try/catch para preservar NEXT_REDIRECT
  await ValidateObservatoryAccess(validatedLocaleLiteral);

  return await TraceExecutionTime(
    ORCHESTRATOR_MODULE_IDENTIFIER,
    'ASSEMBLE_OBSERVATORY_DASHBOARD' as OperationCode,
    correlationIdentifier,
    async (): Promise<React.JSX.Element> => {
      try {
        const [linguisticDictionarySnapshot, expenditureCollectionSnapshot] = await Promise.all([
          LoadObservatoryDictionary(validatedLocaleLiteral),
          SyncMunicipalityExpenditure({
            municipalitySlugLiteral: 'florianopolis',
            periodRange: {
              initialMonthYearLiteral: '01/2026',
              finalMonthYearLiteral: '04/2026',
            },
            correlationIdentifier,
          }),
        ]);

        const observatoryMetricsSnapshot = CalculateObservatoryMetrics(
          expenditureCollectionSnapshot,
        );

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: ORCHESTRATOR_MODULE_IDENTIFIER,
          operationCodeLiteral: 'OBSERVATORY_DASHBOARD_ASSEMBLED' as OperationCode,
          correlationIdentifier,
          messageContentLiteral: `Observatorio ensamblado nominalmente en [${validatedLocaleLiteral}].`,
          semanticIntentTag: 'UI_OBSERVATORY_MOUNT',
          contextMetadataSnapshot: {
            recordCountQuantity: expenditureCollectionSnapshot.length,
            localeIdentifierLiteral: validatedLocaleLiteral,
          },
        });

        return renderObservatoryDashboardView(
          linguisticDictionarySnapshot,
          observatoryMetricsSnapshot,
          expenditureCollectionSnapshot,
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
          moduleIdentifierLiteral: ORCHESTRATOR_MODULE_IDENTIFIER,
          operationCodeLiteral: 'OBSERVATORY_FAULT_TRACE' as OperationCode,
          correlationIdentifier,
          messageContentLiteral:
            'Fallo al cargar datos del observatorio; activando vista resiliente en memoria.',
          semanticIntentTag: 'UI_OBSERVATORY_CONTINGENCY_ENGAGED',
          contextMetadataSnapshot: { ...normalizedException.runtimeContextSnapshot },
        });

        ReportForensicException(normalizedException, correlationIdentifier);

        const emergencyDictionarySnapshot =
          ResolveObservatoryInMemoryFallback(validatedLocaleLiteral);
        const emptyMetricsSnapshot = CalculateObservatoryMetrics([]);

        return renderObservatoryDashboardView(
          emergencyDictionarySnapshot,
          emptyMetricsSnapshot,
          [],
        );
      }
    },
  );
}
