/**
 * @section Observatory Shell - Public Expenditure Page (Orchestrator)
 * @description Punto de acceso institucional para la auditoría de recursos públicos.
 * Coordina la verificación de acceso perimetral, la captura de datos fiscales gubernamentales,
 * la auditoría de contratos lingüísticos y el montaje de los componentes del dashboard forense.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Mantenibilidad).
 * SANEADO: Conexión canónica con data-ingestion-engine, inmunización de redirección perimetral
 * y tipado estricto de retorno para React 19 / Next.js 16.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';
import { notFound } from 'next/navigation';

/* 1. Infraestructura Core y Ruteo Institucional */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
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

/* 2. Contratos y Motores Canónicos de Datos Fiscales */
import { SyncMunicipalityExpenditure } from '@floripa-dignidade/data-ingestion-engine';
import type { IPublicExpenditure } from '@floripa-dignidade/contracts';

/* 3. Componentes y Lógica Local del Observatorio */
import { ObservatoryI18nSchema } from '../i18n/ObservatoryI18n.schema';
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
 * Sigue la norma ISO de Objeto + Propiedad + Representación.
 */
interface IObservatoryPageProperties {
  /** Promesa asíncrona de parámetros de ruta (Next.js 16 Standard). */
  readonly params: Promise<{ readonly locale: string }>;
}

/**
 * Componente de Servidor principal del Observatorio de Gastos Públicos (RSC).
 * Implementa el patrón de acceso protegido con guardia de autoridad institucional.
 *
 * @param propertiesSnapshot - Snapshot inmutable de parámetros inyectados por el enrutador.
 * @returns {Promise<React.JSX.Element>} Interfaz del observatorio renderizada en el servidor.
 */
export default async function PublicExpenditureObservatoryPage(
  propertiesSnapshot: IObservatoryPageProperties,
): Promise<React.JSX.Element> {
  const { locale: rawLocaleIdentifierLiteral } = await propertiesSnapshot.params;
  const correlationIdentifier = GenerateCorrelationIdentifier();

  // --- 1. VALIDACIÓN PERIMETRAL DE IDIOMA ---
  const localeValidationResultSnapshot = SupportedLocaleSchema.safeParse(rawLocaleIdentifierLiteral);

  if (!localeValidationResultSnapshot.success) {
    return notFound();
  }

  const validatedLocaleIdentifierLiteral = localeValidationResultSnapshot.data;

  // --- 2. CONTROL DE ACCESO INSTITUCIONAL (RBAC Guard) ---
  /**
   * 🛡️ LEY DE FLUJO DE CONTROL SRE:
   * Se ejecuta fuera del bloque try/catch para permitir que las señales de redirección
   * perimetral (NEXT_REDIRECT) fluyan libremente sin ser capturadas como excepciones de falla.
   */
  await ValidateObservatoryAccess(validatedLocaleIdentifierLiteral);

  try {
    // --- 3. CARGA DE DICCIONARIO LINGÜÍSTICO LOCALIZADO ---
    const rawDictionaryDataSnapshot = await import(
      `../i18n/${validatedLocaleIdentifierLiteral}.json`
    );

    ValidateLinguisticContract(
      'OBSERVATORY_SHELL',
      ObservatoryI18nSchema,
      rawDictionaryDataSnapshot.default,
      validatedLocaleIdentifierLiteral,
    );

    const linguisticDictionarySnapshot = rawDictionaryDataSnapshot.default;

    // --- 4. CAPTURA Y NORMALIZACIÓN DE PARTIDAS FISCALES ---
    const expenditureCollectionSnapshot: IPublicExpenditure[] = await SyncMunicipalityExpenditure({
      municipalitySlugLiteral: 'florianopolis',
      periodRange: {
        initialMonthYearLiteral: '01/2026',
        finalMonthYearLiteral: '04/2026',
      },
      correlationIdentifier,
    });

    // --- 5. CÁLCULO DE INDICADORES DE RENDIMIENTO Y ANOMALÍAS ---
    const observatoryMetricsSnapshot = CalculateObservatoryMetrics(expenditureCollectionSnapshot);

    // --- 6. REPORTE DE TELEMETRÍA FORENSE (SRE Visibility) ---
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
      operationCodeLiteral: 'FORENSIC_DASHBOARD_ASSEMBLED' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: `Dashboard del observatorio montado nominalmente para [${validatedLocaleIdentifierLiteral}].`,
      semanticIntentTag: 'UI_OBSERVATORY_MOUNT',
      contextMetadataSnapshot: {
        recordCountQuantity: expenditureCollectionSnapshot.length,
        localeIdentifierLiteral: validatedLocaleIdentifierLiteral,
      },
    });

    // --- 7. ENSAMBLAJE VISUAL DE COMPONENTES ---
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
    // --- 8. GESTIÓN FORENSE DE RESILIENCIA ---
    const errorDescriptionLiteral = caughtError instanceof Error
      ? caughtError.message
      : 'UNKNOWN_OBSERVATORY_FAULT';

    const normalizedException = caughtError instanceof GlobalBaseException
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
      messageContentLiteral: 'Fallo crítico al intentar orquestar el observatorio de gastos públicos.',
      semanticIntentTag: 'UI_OBSERVATORY_COLLAPSE',
      contextMetadataSnapshot: { ...normalizedException.runtimeContextSnapshot },
    });

    ReportForensicException(normalizedException, correlationIdentifier);

    return notFound();
  }
}