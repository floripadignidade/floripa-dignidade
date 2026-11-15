/**
 * @file apps/floripa-dignidade/src/app/[locale]/error/page.tsx
 * @section Contingency Domain - Localized Operational Error Page (Orchestrator)
 * @description Página de contingencia operativa y recuperación segura del portal ciudadano
 * ante fallos en gateways de comunicación, confirmaciones o transacciones de red.
 * Valida el segmento `[locale]` contra el catálogo SSOT (`@floripa-dignidade/contracts`),
 * sanitiza parámetros de diagnóstico (`?code=` y `?trace=`), carga diccionarios mediante
 * cascada resiliente (ADR 0030), emite telemetría SRE y provee navegación libre de ciclos 404.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0029 / ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179, ISO/IEC 25010 y W3C WCAG 2.2 AAA.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

import { DEFAULT_LOCALE_IDENTIFIER, SupportedLocaleSchema } from '@floripa-dignidade/contracts';
import { GlobalActionButton } from '@floripa-dignidade/shared-ui-foundry';
import {
  type CorrelationIdentifier,
  CorrelationIdentifierSchema,
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { ErrorStatusIndicator } from './components/ErrorStatusIndicator';
import {
  ExtractValidatedErrorContext,
  ResolveLocalizedErrorDescription,
} from './logic/ExtractValidatedErrorContext';
import { LoadErrorPageDictionary } from './logic/LoadErrorPageDictionary';

const ORCHESTRATOR_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'LOCALIZED_ERROR_PAGE_ORCHESTRATOR',
);

const RENDER_ERROR_PAGE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'RENDER_OPERATIONAL_ERROR_PAGE',
);

const ERROR_PAGE_RENDERED_OPERATION_CODE: OperationCode =
  OperationCodeSchema.parse('ERROR_PAGE_RENDERED');

interface IOperationalErrorPageProperties {
  readonly params: Promise<{ readonly locale: string }>;
  readonly searchParams: Promise<{
    readonly code?: string | string[];
    readonly trace?: string | string[];
  }>;
}

const resolveSafeCorrelationIdentifier = (
  candidateIdentifier: string | null,
): CorrelationIdentifier => {
  if (candidateIdentifier) {
    const validationResult = CorrelationIdentifierSchema.safeParse(candidateIdentifier);
    if (validationResult.success) {
      return validationResult.data;
    }
  }

  return GenerateCorrelationIdentifier();
};

/**
 * Genera metadatos SEO localizados para la página de contingencia bloqueando indexación (`noindex`).
 *
 * @param propertiesSnapshot - Parámetros dinámicos de ruta inyectados por Next.js 16.
 * @returns {Promise<Metadata>} Metadatos localizados y sellados.
 */
export async function generateMetadata(
  propertiesSnapshot: IOperationalErrorPageProperties,
): Promise<Metadata> {
  const { locale: rawLocaleIdentifierLiteral } = await propertiesSnapshot.params;
  const localeValidationResult = SupportedLocaleSchema.safeParse(rawLocaleIdentifierLiteral);
  const resolvedLocaleLiteral = localeValidationResult.success
    ? localeValidationResult.data
    : DEFAULT_LOCALE_IDENTIFIER;

  const dictionarySnapshot = await LoadErrorPageDictionary(resolvedLocaleLiteral);

  return {
    title: `${dictionarySnapshot.metadata.pageTitleLiteral} | Floripa Dignidade`,
    description: dictionarySnapshot.metadata.pageDescriptionLiteral,
    robots: { index: false, follow: true },
  };
}

/**
 * Renderiza la interfaz de contingencia operativa con orientación y retorno seguro para el ciudadano.
 *
 * @param propertiesSnapshot - Promesa de parámetros de ruta y de consulta de Next.js App Router.
 * @returns {Promise<React.JSX.Element>} Vista de contingencia accesible, localizada y auditada.
 */
export default async function OperationalErrorPage(
  propertiesSnapshot: IOperationalErrorPageProperties,
): Promise<React.JSX.Element> {
  const [{ locale: rawLocaleIdentifierLiteral }, resolvedSearchParameters] = await Promise.all([
    propertiesSnapshot.params,
    propertiesSnapshot.searchParams,
  ]);

  const localeValidationResult = SupportedLocaleSchema.safeParse(rawLocaleIdentifierLiteral);
  if (!localeValidationResult.success) {
    notFound();
  }

  const validatedLocaleIdentifier = localeValidationResult.data;
  const { validatedErrorCodeLiteral, validatedTraceIdentifier } =
    ExtractValidatedErrorContext(resolvedSearchParameters);

  const correlationIdentifier = resolveSafeCorrelationIdentifier(validatedTraceIdentifier);

  return await TraceExecutionTime(
    ORCHESTRATOR_MODULE_IDENTIFIER,
    RENDER_ERROR_PAGE_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<React.JSX.Element> => {
      const dictionarySnapshot = await LoadErrorPageDictionary(validatedLocaleIdentifier);
      const contextualDescriptionLiteral = ResolveLocalizedErrorDescription(
        validatedErrorCodeLiteral,
        dictionarySnapshot,
      );

      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: 'WARNING',
        moduleIdentifierLiteral: ORCHESTRATOR_MODULE_IDENTIFIER,
        operationCodeLiteral: ERROR_PAGE_RENDERED_OPERATION_CODE,
        correlationIdentifier,
        messageContentLiteral: `Ciudadano presentado con pantalla de contingencia en [${validatedLocaleIdentifier}] por incidente [${validatedErrorCodeLiteral}].`,
        semanticIntentTag: 'UI_OPERATIONAL_CONTINGENCY_EXPOSURE',
        contextMetadataSnapshot: Object.freeze({
          localeCodeLiteral: validatedLocaleIdentifier,
          errorCodeLiteral: validatedErrorCodeLiteral,
          hasOriginTraceIdentifierBoolean: validatedTraceIdentifier !== null,
          ...(validatedTraceIdentifier !== null && {
            originTraceIdentifier: validatedTraceIdentifier,
          }),
        }),
      });

      return (
        <main className="flex-grow flex flex-col items-center justify-center relative px-4 py-20 lg:py-36 overflow-hidden">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-100/20 via-transparent to-transparent -z-10"
            aria-hidden="true"
          />

          <div className="max-w-3xl w-full text-center animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <ErrorStatusIndicator />

            <p className="inline-block px-5 py-1.5 mb-6 rounded-full bg-red-50 border border-red-200 text-red-800 text-xs font-black uppercase tracking-[0.2em]">
              {dictionarySnapshot.hero.badgeLabelLiteral}
            </p>

            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 leading-tight mb-6 tracking-tighter">
              {dictionarySnapshot.hero.headlineLiteral}
            </h1>

            <p className="text-xl text-slate-600 mb-6 leading-relaxed font-medium">
              {contextualDescriptionLiteral}
            </p>

            <p className="text-base text-slate-500 mb-12 leading-relaxed font-medium max-w-2xl mx-auto">
              {dictionarySnapshot.hero.guidanceHintLiteral}
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <GlobalActionButton
                visualIntentConfigurationLiteral="STANDARD"
                isPolymorphicBoolean={true}
                actionIdentifierLiteral="ERROR_PAGE_BACK_HOME"
                forensicTestIdentifier="ERROR_PAGE_BACK_HOME_CTA"
                externalClassName="w-full sm:w-auto text-lg px-10 py-5 group"
              >
                <Link href={{ pathname: `/${validatedLocaleIdentifier}` }}>
                  <ArrowLeft
                    className="w-4 h-4 transition-transform group-hover:-translate-x-1"
                    aria-hidden="true"
                  />
                  <span>{dictionarySnapshot.actions.primaryActionLabelLiteral}</span>
                </Link>
              </GlobalActionButton>

              <GlobalActionButton
                visualIntentConfigurationLiteral="OUTLINE"
                isPolymorphicBoolean={true}
                actionIdentifierLiteral="ERROR_PAGE_OPEN_OBSERVATORY"
                forensicTestIdentifier="ERROR_PAGE_OPEN_OBSERVATORY_CTA"
                externalClassName="w-full sm:w-auto text-lg px-10 py-5 bg-white"
              >
                <Link
                  href={{
                    pathname: `/${validatedLocaleIdentifier}/observatorio/gastos-publicos`,
                  }}
                >
                  <ShieldCheck className="w-5 h-5 text-amber-500" aria-hidden="true" />
                  <span>{dictionarySnapshot.actions.secondaryActionLabelLiteral}</span>
                </Link>
              </GlobalActionButton>
            </div>

            <div className="mt-12 flex flex-col gap-1 text-xs font-mono text-slate-400">
              <p>
                {dictionarySnapshot.diagnostics.errorCodeLabelLiteral}:{' '}
                <span>{validatedErrorCodeLiteral}</span>
              </p>
              <p>
                {dictionarySnapshot.diagnostics.traceReferenceLabelLiteral}:{' '}
                <span>{validatedTraceIdentifier ?? correlationIdentifier}</span>
              </p>
            </div>
          </div>
        </main>
      );
    },
  );
}
