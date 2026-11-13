/**
 * @section Newsletter Domain - Welcome Page (Orchestrator)
 * @description Página de confirmación ciudadana tras verificación Double Opt-In.
 * Valida el idioma contra el catálogo SSOT (`@floripa-dignidade/contracts`), carga su
 * diccionario con inmunidad ante 404 (ADR 0030), conecta enlaces reales de retorno y
 * observatorio, y mide la ejecución mediante `TraceExecutionTime`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179, ISO/IEC 25010 y W3C WCAG 2.2.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, Newspaper, ShieldCheck } from 'lucide-react';

import { DEFAULT_LOCALE_IDENTIFIER, SupportedLocaleSchema } from '@floripa-dignidade/contracts';
import { GlobalActionButton } from '@floripa-dignidade/shared-ui-foundry';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { SuccessCheckmark } from './components/SuccessCheckmark';
import { SupportResourceCard } from './components/SupportResourceCard';
import { LoadNewsletterWelcomeDictionary } from './logic/LoadNewsletterWelcomeDictionary';

const ORCHESTRATOR_IDENTIFIER = 'NEWSLETTER_WELCOME_ORCHESTRATOR' as ModuleIdentifier;

interface IWelcomePageProperties {
  readonly params: Promise<{ readonly locale: string }>;
}

/**
 * Genera dinámicamente los metadatos SEO localizados a partir del diccionario resuelto.
 *
 * @param propertiesSnapshot - Parámetros dinámicos inyectados por Next.js App Router.
 * @returns {Promise<Metadata>} Metadatos localizados con `robots` `noindex`.
 */
export async function generateMetadata(
  propertiesSnapshot: IWelcomePageProperties,
): Promise<Metadata> {
  const { locale: rawLocaleIdentifierLiteral } = await propertiesSnapshot.params;
  const localeValidationResult = SupportedLocaleSchema.safeParse(rawLocaleIdentifierLiteral);
  const resolvedLocaleLiteral = localeValidationResult.success
    ? localeValidationResult.data
    : DEFAULT_LOCALE_IDENTIFIER;

  const dictionarySnapshot = await LoadNewsletterWelcomeDictionary(resolvedLocaleLiteral);

  return {
    title: `${dictionarySnapshot.metadata.pageTitleLiteral} | Floripa Dignidade`,
    description: dictionarySnapshot.hero.descriptionLiteral,
    robots: { index: false, follow: true },
  };
}

/**
 * Renderiza la vista de confirmación ciudadana con navegación directa al observatorio e inicio.
 *
 * @param propertiesSnapshot - Parámetros de ruta inyectados por Next.js App Router.
 * @returns {Promise<React.JSX.Element>} Página de bienvenida localizada y resiliente.
 */
export default async function NewsletterWelcomePage(
  propertiesSnapshot: IWelcomePageProperties,
): Promise<React.JSX.Element> {
  const { locale: rawLocaleIdentifierLiteral } = await propertiesSnapshot.params;
  const localeValidationResult = SupportedLocaleSchema.safeParse(rawLocaleIdentifierLiteral);

  if (!localeValidationResult.success) {
    notFound();
  }

  const validatedLocaleIdentifier = localeValidationResult.data;
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    ORCHESTRATOR_IDENTIFIER,
    'RENDER_NEWSLETTER_WELCOME_PAGE' as OperationCode,
    correlationIdentifier,
    async (): Promise<React.JSX.Element> => {
      const dictionarySnapshot = await LoadNewsletterWelcomeDictionary(validatedLocaleIdentifier);

      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: 'INFO',
        moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
        operationCodeLiteral: 'WELCOME_PAGE_RENDERED' as OperationCode,
        correlationIdentifier,
        messageContentLiteral: `Ciudadano alcanzó zona de bienvenida en [${validatedLocaleIdentifier}].`,
        semanticIntentTag: 'UI_CONVERSION_ZONE_REACHED',
        contextMetadataSnapshot: {
          localeCodeLiteral: validatedLocaleIdentifier,
        },
      });

      return (
        <main className="flex-grow flex flex-col items-center justify-center relative px-4 py-20 lg:py-40 overflow-hidden">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-100/20 via-transparent to-transparent -z-10"
            aria-hidden="true"
          />

          <div className="max-w-3xl w-full text-center animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <SuccessCheckmark />

            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-tight mb-8 tracking-tighter">
              {dictionarySnapshot.hero.headlineLiteral}
            </h1>

            <p className="text-xl text-slate-500 mb-14 leading-relaxed font-medium">
              {dictionarySnapshot.hero.descriptionLiteral}
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <GlobalActionButton
                visualIntentConfigurationLiteral="STANDARD"
                isPolymorphicBoolean={true}
                actionIdentifierLiteral="WELCOME_VIEW_TRANSPARENCY"
                className="w-full sm:w-auto text-lg px-10 py-5"
              >
                <Link
                  href={{ pathname: `/${validatedLocaleIdentifier}/observatorio/gastos-publicos` }}
                >
                  <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                  <span>{dictionarySnapshot.actions.primaryActionLabelLiteral}</span>
                </Link>
              </GlobalActionButton>

              <GlobalActionButton
                visualIntentConfigurationLiteral="GHOST"
                isPolymorphicBoolean={true}
                actionIdentifierLiteral="WELCOME_BACK_HOME"
                className="w-full sm:w-auto text-lg px-10 py-5 group"
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

            <div className="mt-24 pt-10 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
              <SupportResourceCard
                graphicIconNode={<Newspaper size={24} aria-hidden="true" />}
                headlineTitleLiteral={dictionarySnapshot.supportSection.newsHeadlineLiteral}
                contentDescriptionLiteral={dictionarySnapshot.supportSection.newsDescriptionLiteral}
                visualVariantLiteral="AMBER"
              />

              <SupportResourceCard
                graphicIconNode={<ShieldCheck size={24} aria-hidden="true" />}
                headlineTitleLiteral={dictionarySnapshot.supportSection.dataHeadlineLiteral}
                contentDescriptionLiteral={dictionarySnapshot.supportSection.dataDescriptionLiteral}
                visualVariantLiteral="BLUE"
              />
            </div>
          </div>
        </main>
      );
    },
  );
}
