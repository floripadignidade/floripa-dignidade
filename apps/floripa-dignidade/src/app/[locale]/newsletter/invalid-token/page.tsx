/**
 * @section Newsletter Domain - Invalid Token Contingency Page (Orchestrator)
 * @description Página de contingencia ciudadana ante tokens de confirmación Double Opt-In
 * expirados, ya consumidos o malformados. Valida el segmento `[locale]` contra el catálogo
 * SSOT (`@floripa-dignidade/contracts`), carga su diccionario con cascada resiliente
 * (ADR 0030), valida opcionalmente el identificador `?trace=` con Zod, provee navegación
 * directa hacia la zona de suscripción e inicio (`typedRoutes: true`) y reporta SRE.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179, ISO/IEC 25010 y W3C WCAG 2.2 AAA.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, RefreshCw } from 'lucide-react';

import { DEFAULT_LOCALE_IDENTIFIER, SupportedLocaleSchema } from '@floripa-dignidade/contracts';
import { GlobalActionButton } from '@floripa-dignidade/shared-ui-foundry';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { InvalidTokenIndicator } from './components/InvalidTokenIndicator';
import { ExtractValidatedTraceIdentifier } from './logic/ExtractValidatedTraceIdentifier';
import { LoadNewsletterInvalidTokenDictionary } from './logic/LoadNewsletterInvalidTokenDictionary';

const ORCHESTRATOR_MODULE_IDENTIFIER = 'NEWSLETTER_INVALID_TOKEN_ORCHESTRATOR' as ModuleIdentifier;

interface IInvalidTokenPageProperties {
  readonly params: Promise<{ readonly locale: string }>;
  readonly searchParams: Promise<{ readonly trace?: string | string[] }>;
}

/**
 * Genera metadatos SEO localizados bloqueando indexación en buscadores (`noindex`).
 *
 * @param propertiesSnapshot - Parámetros dinámicos de ruta inyectados por Next.js 16.
 * @returns {Promise<Metadata>} Metadatos localizados y validados.
 */
export async function generateMetadata(
  propertiesSnapshot: IInvalidTokenPageProperties,
): Promise<Metadata> {
  const { locale: rawLocaleIdentifierLiteral } = await propertiesSnapshot.params;
  const localeValidationResult = SupportedLocaleSchema.safeParse(rawLocaleIdentifierLiteral);
  const resolvedLocaleLiteral = localeValidationResult.success
    ? localeValidationResult.data
    : DEFAULT_LOCALE_IDENTIFIER;

  const dictionarySnapshot = await LoadNewsletterInvalidTokenDictionary(resolvedLocaleLiteral);

  return {
    title: `${dictionarySnapshot.metadata.pageTitleLiteral} | Floripa Dignidade`,
    description: dictionarySnapshot.metadata.pageDescriptionLiteral,
    robots: { index: false, follow: true },
  };
}

/**
 * Renderiza la vista de recuperación amigable cuando un enlace de confirmación no es válido.
 *
 * @param propertiesSnapshot - Parámetros de ruta y consulta inyectados por Next.js App Router.
 * @returns {Promise<React.JSX.Element>} Página localizada, accesible y auditada.
 */
export default async function NewsletterInvalidTokenPage(
  propertiesSnapshot: IInvalidTokenPageProperties,
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
  const validatedTraceIdentifier = ExtractValidatedTraceIdentifier(
    resolvedSearchParameters['trace'],
  );
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    ORCHESTRATOR_MODULE_IDENTIFIER,
    'RENDER_NEWSLETTER_INVALID_TOKEN_PAGE' as OperationCode,
    correlationIdentifier,
    async (): Promise<React.JSX.Element> => {
      const dictionarySnapshot =
        await LoadNewsletterInvalidTokenDictionary(validatedLocaleIdentifier);

      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: 'WARNING',
        moduleIdentifierLiteral: ORCHESTRATOR_MODULE_IDENTIFIER,
        operationCodeLiteral: 'INVALID_TOKEN_PAGE_RENDERED' as OperationCode,
        correlationIdentifier,
        messageContentLiteral: `Ciudadano redirigido a página de token inválido en [${validatedLocaleIdentifier}].`,
        semanticIntentTag: 'UI_INVALID_TOKEN_EXPOSURE',
        contextMetadataSnapshot: Object.freeze({
          localeCodeLiteral: validatedLocaleIdentifier,
          hasValidTraceIdentifierBoolean: validatedTraceIdentifier !== null,
          ...(validatedTraceIdentifier !== null && {
            originTraceIdentifier: validatedTraceIdentifier,
          }),
        }),
      });

      return (
        <main className="flex-grow flex flex-col items-center justify-center relative px-4 py-20 lg:py-36 overflow-hidden">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-100/20 via-transparent to-transparent -z-10"
            aria-hidden="true"
          />

          <div className="max-w-3xl w-full text-center animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <InvalidTokenIndicator />

            <p className="inline-block px-5 py-1.5 mb-6 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black uppercase tracking-[0.2em]">
              {dictionarySnapshot.hero.badgeLabelLiteral}
            </p>

            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 leading-tight mb-6 tracking-tighter">
              {dictionarySnapshot.hero.headlineLiteral}
            </h1>

            <p className="text-xl text-slate-600 mb-6 leading-relaxed font-medium">
              {dictionarySnapshot.hero.descriptionLiteral}
            </p>

            <p className="text-base text-slate-500 mb-12 leading-relaxed font-medium max-w-2xl mx-auto">
              {dictionarySnapshot.hero.guidanceHintLiteral}
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <GlobalActionButton
                visualIntentConfigurationLiteral="CONVERSION"
                isPolymorphicBoolean={true}
                actionIdentifierLiteral="INVALID_TOKEN_REQUEST_NEW_LINK"
                forensicTestIdentifier="INVALID_TOKEN_REQUEST_NEW_LINK_CTA"
                externalClassName="w-full sm:w-auto text-lg px-10 py-5"
              >
                <Link
                  href={{
                    pathname: `/${validatedLocaleIdentifier}`,
                    hash: 'conversion-headline',
                  }}
                >
                  <RefreshCw className="w-5 h-5" aria-hidden="true" />
                  <span>{dictionarySnapshot.actions.primaryActionLabelLiteral}</span>
                </Link>
              </GlobalActionButton>

              <GlobalActionButton
                visualIntentConfigurationLiteral="GHOST"
                isPolymorphicBoolean={true}
                actionIdentifierLiteral="INVALID_TOKEN_BACK_HOME"
                forensicTestIdentifier="INVALID_TOKEN_BACK_HOME_CTA"
                externalClassName="w-full sm:w-auto text-lg px-10 py-5 group"
              >
                <Link href={{ pathname: `/${validatedLocaleIdentifier}` }}>
                  <ArrowLeft
                    className="w-4 h-4 transition-transform group-hover:-translate-x-1"
                    aria-hidden="true"
                  />
                  <span>{dictionarySnapshot.actions.secondaryActionLabelLiteral}</span>
                </Link>
              </GlobalActionButton>
            </div>

            {validatedTraceIdentifier !== null && (
              <p className="mt-12 text-xs font-mono text-slate-400">
                {dictionarySnapshot.diagnostics.traceReferenceLabelLiteral}:{' '}
                <span>{validatedTraceIdentifier}</span>
              </p>
            )}
          </div>
        </main>
      );
    },
  );
}
