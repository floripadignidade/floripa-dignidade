/**
 * @section Security Contingency - Localized Unauthorized Page (Orchestrator)
 * @description Página de acceso restringido (destino de `ValidateObservatoryAccess.ts`).
 * Valida `[locale]` contra `@floripa-dignidade/contracts`, sanitiza `?trace=` y `?from=`,
 * dispara la alerta de seguridad hacia telemetría/auditoría con marca de integración
 * futura (`messaging-engine` + `gov.br` OIDC), renderiza banner de alerta institucional
 * accesible (WCAG 2.2 AAA) y provee navegación libre de ciclos 404 (`typedRoutes: true`).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0025 / ADR 0029 / ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179, ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, Mail } from 'lucide-react';

import { DEFAULT_LOCALE_IDENTIFIER, SupportedLocaleSchema } from '@floripa-dignidade/contracts';
import { GlobalActionButton } from '@floripa-dignidade/shared-ui-foundry';
import {
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { UnauthorizedAccessAlertBanner } from './components/UnauthorizedAccessAlertBanner';
import { UnauthorizedShieldIndicator } from './components/UnauthorizedShieldIndicator';
import { DispatchUnauthorizedAccessSecurityAlert } from './logic/DispatchUnauthorizedAccessSecurityAlert';
import { ExtractValidatedUnauthorizedContext } from './logic/ExtractValidatedUnauthorizedContext';
import { LoadUnauthorizedPageDictionary } from './logic/LoadUnauthorizedPageDictionary';

const ORCHESTRATOR_MODULE_IDENTIFIER =
  'LOCALIZED_UNAUTHORIZED_PAGE_ORCHESTRATOR' as ModuleIdentifier;

interface IUnauthorizedPageProperties {
  readonly params: Promise<{ readonly locale: string }>;
  readonly searchParams: Promise<{
    readonly trace?: string | string[];
    readonly from?: string | string[];
  }>;
}

/**
 * Genera metadatos SEO localizados bloqueando indexación en buscadores (`noindex`).
 *
 * @param propertiesSnapshot - Parámetros dinámicos de ruta inyectados por Next.js 16.
 * @returns {Promise<Metadata>} Metadatos localizados y validados.
 */
export async function generateMetadata(
  propertiesSnapshot: IUnauthorizedPageProperties,
): Promise<Metadata> {
  const { locale: rawLocaleIdentifierLiteral } = await propertiesSnapshot.params;
  const localeValidationResult = SupportedLocaleSchema.safeParse(rawLocaleIdentifierLiteral);
  const resolvedLocaleLiteral = localeValidationResult.success
    ? localeValidationResult.data
    : DEFAULT_LOCALE_IDENTIFIER;

  const dictionarySnapshot = await LoadUnauthorizedPageDictionary(resolvedLocaleLiteral);

  return {
    title: `${dictionarySnapshot.metadata.pageTitleLiteral} | Floripa Dignidade`,
    description: dictionarySnapshot.metadata.pageDescriptionLiteral,
    robots: { index: false, follow: true },
  };
}

/**
 * Renderiza la vista de acceso restringido con alerta de seguridad y retorno seguro.
 *
 * @param propertiesSnapshot - Parámetros de ruta y consulta inyectados por Next.js App Router.
 * @returns {Promise<React.JSX.Element>} Página localizada, accesible y auditada.
 */
export default async function UnauthorizedPage(
  propertiesSnapshot: IUnauthorizedPageProperties,
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
  const { validatedTraceIdentifier, validatedOriginRouteLiteral } =
    ExtractValidatedUnauthorizedContext(resolvedSearchParameters);
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    ORCHESTRATOR_MODULE_IDENTIFIER,
    'RENDER_UNAUTHORIZED_PAGE' as OperationCode,
    correlationIdentifier,
    async (): Promise<React.JSX.Element> => {
      const dictionarySnapshot = await LoadUnauthorizedPageDictionary(validatedLocaleIdentifier);

      DispatchUnauthorizedAccessSecurityAlert({
        localeCodeLiteral: validatedLocaleIdentifier,
        correlationIdentifier,
        originTraceIdentifier: validatedTraceIdentifier,
        originRouteLiteral: validatedOriginRouteLiteral,
      });

      return (
        <main className="flex-grow flex flex-col items-center justify-center relative px-4 py-20 lg:py-32 overflow-hidden">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-navy-100/25 via-transparent to-transparent -z-10"
            aria-hidden="true"
          />

          <div className="max-w-3xl w-full text-center animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <UnauthorizedShieldIndicator />

            <p className="inline-block px-5 py-1.5 mb-6 rounded-full bg-navy-50 border border-navy-100 text-navy-900 text-xs font-black uppercase tracking-[0.2em]">
              {dictionarySnapshot.hero.badgeLabelLiteral}
            </p>

            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 leading-tight mb-6 tracking-tighter">
              {dictionarySnapshot.hero.headlineLiteral}
            </h1>

            <p className="text-xl text-slate-600 mb-6 leading-relaxed font-medium">
              {dictionarySnapshot.hero.descriptionLiteral}
            </p>

            <p className="text-base text-slate-500 mb-10 leading-relaxed font-medium max-w-2xl mx-auto">
              {dictionarySnapshot.hero.guidanceHintLiteral}
            </p>

            <UnauthorizedAccessAlertBanner systemAlertDictionary={dictionarySnapshot.systemAlert} />

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <GlobalActionButton
                visualIntentConfigurationLiteral="STANDARD"
                isPolymorphicBoolean={true}
                actionIdentifierLiteral="UNAUTHORIZED_PAGE_BACK_HOME"
                forensicTestIdentifier="UNAUTHORIZED_PAGE_BACK_HOME_CTA"
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
                visualIntentConfigurationLiteral="CONVERSION"
                isPolymorphicBoolean={true}
                actionIdentifierLiteral="UNAUTHORIZED_PAGE_SUBSCRIBE_ALERTS"
                forensicTestIdentifier="UNAUTHORIZED_PAGE_SUBSCRIBE_ALERTS_CTA"
                externalClassName="w-full sm:w-auto text-lg px-10 py-5"
              >
                <Link
                  href={{
                    pathname: `/${validatedLocaleIdentifier}`,
                    hash: 'conversion-headline',
                  }}
                >
                  <Mail className="w-5 h-5" aria-hidden="true" />
                  <span>{dictionarySnapshot.actions.secondaryActionLabelLiteral}</span>
                </Link>
              </GlobalActionButton>
            </div>

            <div className="mt-12 flex flex-col gap-1 text-xs font-mono text-slate-400">
              {validatedOriginRouteLiteral !== null && (
                <p>
                  {dictionarySnapshot.diagnostics.originRouteLabelLiteral}:{' '}
                  <span>{validatedOriginRouteLiteral}</span>
                </p>
              )}
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
