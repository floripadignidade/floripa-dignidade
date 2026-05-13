/**
 * @section Observatory Shell - Public Expenditure Page (Orchestrator)
 * @description Punto de acceso soberano para la auditoría de recursos públicos.
 * Coordina la captura de datos gubernamentales, la validación de autoridad
 * y el montaje del enjambre visual del dashboard forense.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Swarm Intelligence.
 * SANEADO Zenith: Resolución de TS2454 (Asignación Insegura), TS2345 (Branded Types),
 * TS6133 (Rastro de React) y alineación estricta de contratos de parámetros PMF.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { notFound } from 'next/navigation';

/* 1. Infraestructura Core & Routing (Sovereign Boundaries) */
import {
  SupportedLocaleSchema,
  ValidateLinguisticContract
} from '@floripa-dignidade/routing';

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier
} from '@floripa-dignidade/telemetry';

/* 2. Motores de Datos (PMF Domain) */
import { SyncMunicipalityExpenditure } from '@floripa-dignidade/pmf-open-data-engine';
import type { IPublicExpenditure } from '@floripa-dignidade/pmf-open-data-engine';

/* 3. Enjambre Atómico Local (UI & Logic) */
import { ObservatoryI18nSchema } from '../i18n/ObservatoryI18n.schema';
import { CalculateObservatoryMetrics } from './logic/CalculateObservatoryMetrics';
import { ValidateObservatoryAccess } from './logic/ValidateObservatoryAccess';
import { ExpenditureTable } from './components/ExpenditureTable';
import { ObservatoryHeader } from './components/ObservatoryHeader';
import { ObservatoryMetricsGrid } from './components/ObservatoryMetricsGrid';

/** Identificador técnico del aparato para el Neural Sentinel. */
const ORCHESTRATOR_IDENTIFIER = 'PUBLIC_EXPENDITURE_OBSERVATORY_SHELL';

/**
 * @interface IObservatoryPageProperties
 * @description Contrato inmutable de parámetros de ruta para el App Router.
 */
interface IObservatoryPageProperties {
  readonly params: Promise<{
    readonly locale: string;
  }>;
}

/**
 * Componente de Servidor principal del Observatorio (SSR).
 * Implementa el patrón de ingesta "Data Fetching Guard" con RBAC Sentry.
 *
 * @param propertiesSnapshot - Snapshot inmutable con los parámetros de ruta.
 */
export default async function PublicExpenditureObservatoryPage(
  propertiesSnapshot: IObservatoryPageProperties
) {
  const { locale: rawLocaleIdentifierLiteral } = await propertiesSnapshot.params;
  const correlationIdentifier = GenerateCorrelationIdentifier();

  // --- 1. ADUANA DE ADN LINGÜÍSTICO ---
  const localeValidationResultSnapshot = SupportedLocaleSchema.safeParse(rawLocaleIdentifierLiteral);

  if (!localeValidationResultSnapshot.success) {
    notFound();
  }

  const validatedLocaleIdentifier = localeValidationResultSnapshot.data;

  // --- 2. SEGURIDAD PERIMETRAL (RBAC Guard) ---
  /**
   * 🛡️ SANEADO Zenith: 'await' mandatorio y casting soberano 'as string'
   * para cumplir con el contrato sin perder el Branded Type.
   */
  await ValidateObservatoryAccess(validatedLocaleIdentifier as string);

  try {
    // --- 3. CARGA DE ALMA LINGÜÍSTICA (Isomorphic Dictionary) ---
    const rawDictionaryData = await import(`../i18n/${validatedLocaleIdentifier}.json`);

    ValidateLinguisticContract(
      'OBSERVATORY_SHELL',
      ObservatoryI18nSchema,
      rawDictionaryData.default,
      validatedLocaleIdentifier as string
    );

    const linguisticDictionarySnapshot = rawDictionaryData.default;

    // --- 4. CAPTURA DE DATOS GUBERNAMENTALES (Data Acquisition) ---
    /**
     * 🛡️ LEY ZENITH: Sincronización de llaves con el contrato 'ISyncMunicipalityExpenditureParameters'.
     */
    const publicExpenditureCollection: IPublicExpenditure[] = await SyncMunicipalityExpenditure({
      municipalitySlugLiteral: 'florianopolis',
      periodRange: {
        initialMonthYearLiteral: '01/2026',
        finalMonthYearLiteral: '04/2026'
      }
    });

    // --- 5. INTELIGENCIA DE DASHBOARD (Aritmética Pura) ---
    const calculatedMetricsSnapshot = CalculateObservatoryMetrics(publicExpenditureCollection);

    // --- 6. REPORTE DE ESTADO (SRE Visibility) ---
    void EmitTelemetrySignal({
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
      operationCodeLiteral: 'FORENSIC_DASHBOARD_ASSEMBLED',
      correlationIdentifier,
      messageContentLiteral: `Dashboard del observatorio montado para [${validatedLocaleIdentifier}].`,
      semanticIntentTag: 'UI_OBSERVATORY_MOUNT',
      contextMetadataSnapshot: {
        recordCountQuantity: publicExpenditureCollection.length
      }
    });

    // --- 7. ENSAMBLAJE VISUAL ---
    return (
      <main className="min-h-screen bg-slate-50 p-4 md:p-8 lg:p-12 print:bg-white animate-in fade-in duration-1000">
        <ObservatoryHeader
          titleLiteral={linguisticDictionarySnapshot.metadata.pageTitleLiteral}
          descriptionLiteral={linguisticDictionarySnapshot.metadata.pageDescriptionLiteral}
          exportActionLabelLiteral={linguisticDictionarySnapshot.actions.exportCsvLabel}
        />

        <ObservatoryMetricsGrid
          metrics={calculatedMetricsSnapshot}
          labels={linguisticDictionarySnapshot.dashboard}
        />

        <ExpenditureTable
          publicExpenditureCollection={publicExpenditureCollection}
          tableHeadlineLiteral={linguisticDictionarySnapshot.table.columnEntity}
        />
      </main>
    );

  } catch (_caughtError: unknown) {
    /**
     * @section Resiliencia de Fallo
     * Si la carga del diccionario o la adquisición de datos de la PMF sufren un
     * colapso no controlado, derivamos al ciudadano a un estado seguro (404/Fallback)
     * en lugar de renderizar componentes huérfanos.
     */
    notFound();
  }
}
