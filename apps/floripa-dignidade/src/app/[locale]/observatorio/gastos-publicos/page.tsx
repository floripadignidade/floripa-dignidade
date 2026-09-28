/**
 * @section Observatory Shell - Public Expenditure Page (Orchestrator)
 * @description Punto de acceso soberano para la auditoría de recursos públicos.
 * Coordina la captura de datos gubernamentales, la validación de autoridad
 * y el montaje del enjambre visual del dashboard forense.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Swarm Intelligence.
 * SANEADO Zenith: Erradicación de 'any' (ESLint Fix), normalización del rastro
 * de error, blindaje de tipos bridados y sellado de flujo de retorno.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { notFound } from 'next/navigation';

/* 1. Infraestructura Core & Routing (Sovereign Boundaries - Clean Paths) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  ReportForensicException,
} from '@floripa-dignidade/telemetry';

import {
  GlobalBaseException,
  InternalSystemException,
} from '@floripa-dignidade/exceptions';

import {
  SupportedLocaleSchema,
  ValidateLinguisticContract,
} from '@floripa-dignidade/routing';

/* 2. Motores de Datos (PMF Domain - Redirección de ADN) */
/**
 * 🛡️ NOTA SRE: Si el error TS2307 persiste tras esta limpieza, se debe a una
 * desincronización en el 'tsconfig.app.json' que corregiremos en el Paso 3.
 */
import { SyncMunicipalityExpenditure } from '@floripa-dignidade/pmf-open-data-engine';
import type { IPublicExpenditure } from '@floripa-dignidade/pmf-open-data-engine';

/* 3. Enjambre Atómico Local (UI & Logic - Clean Paths) */
import { ObservatoryI18nSchema } from '../i18n/ObservatoryI18n.schema.js';
import { CalculateObservatoryMetrics } from './logic/CalculateObservatoryMetrics.js';
import { ValidateObservatoryAccess } from './logic/ValidateObservatoryAccess.js';
import { ExpenditureTable } from './components/ExpenditureTable.js';
import { ObservatoryHeader } from './components/ObservatoryHeader.js';
import { ObservatoryMetricsGrid } from './components/ObservatoryMetricsGrid.js';

/** Identificador técnico del aparato para el Neural Sentinel. */
const ORCHESTRATOR_IDENTIFIER = 'PUBLIC_EXPENDITURE_OBSERVATORY_SHELL';

/**
 * @interface IObservatoryPageProperties
 * @description Contrato inmutable para las propiedades de la ruta Next.js.
 */
interface IObservatoryPageProperties {
  /** Promesa de parámetros de ruta (Next.js 16 Ready). */
  readonly params: Promise<{ readonly locale: string }>;
}

/**
 * Componente de Servidor principal del Observatorio (SSR).
 * Implementa el patrón "Data Fetching Guard" con RBAC Sentry integral.
 *
 * @param propertiesSnapshot - Snapshot de parámetros inyectado por el App Router.
 */
export default async function PublicExpenditureObservatoryPage(
  propertiesSnapshot: IObservatoryPageProperties,
) {
  const { locale: rawLocaleIdentifierLiteral } = await propertiesSnapshot.params;
  const correlationIdentifier = GenerateCorrelationIdentifier();

  // --- 1. ADUANA DE ADN LINGÜÍSTICO (Security Border) ---
  const localeValidationResultSnapshot = SupportedLocaleSchema.safeParse(rawLocaleIdentifierLiteral);

  if (!localeValidationResultSnapshot.success) {
    return notFound();
  }

  const validatedLocaleIdentifierLiteral = localeValidationResultSnapshot.data;

  try {
    // --- 2. SEGURIDAD PERIMETRAL (RBAC Guard) ---
    /** 🛡️ LEY ZENITH: Validación asíncrona mandatoria antes de la ingesta de datos. */
    await ValidateObservatoryAccess(validatedLocaleIdentifierLiteral as string);

    // --- 3. CARGA DE ALMA LINGÜÍSTICA (Isomorphic Dictionary) ---
    const rawDictionaryDataSnapshot = await import(`../i18n/${validatedLocaleIdentifierLiteral as string}.json`);

    ValidateLinguisticContract(
      'OBSERVATORY_SHELL',
      ObservatoryI18nSchema,
      rawDictionaryDataSnapshot.default,
      validatedLocaleIdentifierLiteral as string,
    );

    const linguisticDictionarySnapshot = rawDictionaryDataSnapshot.default;

    // --- 4. CAPTURA DE DATOS GUBERNAMENTALES (Data Acquisition) ---
    const expenditureCollectionSnapshot: IPublicExpenditure[] = await SyncMunicipalityExpenditure({
      municipalitySlugLiteral: 'florianopolis',
      periodRange: {
        initialMonthYearLiteral: '01/2026',
        finalMonthYearLiteral: '04/2026',
      },
    });

    // --- 5. INTELIGENCIA DE DASHBOARD (Aritmética Pura) ---
    const observatoryMetricsSnapshot = CalculateObservatoryMetrics(expenditureCollectionSnapshot);

    // --- 6. REPORTE DE ÉXITO (SRE Visibility) ---
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
      operationCodeLiteral: 'FORENSIC_DASHBOARD_ASSEMBLED',
      correlationIdentifier,
      messageContentLiteral: `Dashboard del observatorio montado para [${validatedLocaleIdentifierLiteral}].`,
      semanticIntentTag: 'UI_OBSERVATORY_MOUNT',
      contextMetadataSnapshot: {
        recordCountQuantity: expenditureCollectionSnapshot.length,
      },
    });

    // --- 7. ENSAMBLAJE VISUAL (Atomic Assembly) ---
    return (
      <main className="min-h-screen bg-slate-50 p-4 md:p-8 lg:p-12 print:bg-white animate-in fade-in duration-1000">
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
      </main>
    );

  } catch (caughtError: unknown) {
    /**
     * @section Gestión de Resiliencia (SRE Exit)
     * 🛡️ SANEADO Zenith (Fix no-explicit-any): Normalizamos el rastro desconocido.
     */
    const errorDescriptionLiteral = caughtError instanceof Error
      ? caughtError.message
      : 'UNKNOWN_OBSERVATORY_FAULT';

    /**
     * Transformamos el error en una excepción institucional para que el Neural Sentinel
     * posea un contrato de datos íntegro.
     */
    const normalizedException = caughtError instanceof GlobalBaseException
      ? caughtError
      : new InternalSystemException('OBSERVATORY_ORCHESTRATION_COLLAPSE', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier
        });

    void EmitTelemetrySignal({
      severityLevelLiteral: 'CRITICAL',
      moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
      operationCodeLiteral: 'OBSERVATORY_FAULT_TRACE',
      correlationIdentifier,
      messageContentLiteral: 'Fallo crítico al intentar orquestar el observatorio de gastos.',
      contextMetadataSnapshot: { ...normalizedException.runtimeContextSnapshot }
    });

    /** Reporte forense tipado (Zero-Any Compliance). */
    ReportForensicException(normalizedException, correlationIdentifier);

    /** Saneamos el flujo de retorno para cumplir con TS7030. */
    return notFound();
  }
}
