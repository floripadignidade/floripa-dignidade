/**
 * @file apps/floripa-dignidade/src/app/[locale]/transparencia/page.tsx
 * @section Transparency Gazette - Localized Civic Newspaper Page (Orchestrator)
 * @description Orquestador Server Component (RSC) del Periódico Cívico de Transparencia
 * Activa por Secretarías. Valida el segmento `[locale]` contra el SSOT, mide latencia con
 * `TraceExecutionTime`, carga diccionarios bajo cascada resiliente ADR 0030, emite
 * telemetría SRE y ensambla el Hero Carrusel (o portada destacada), filtros interactivos
 * sin recarga (`CLS = 0`), cuadernos sectoriales y banner metodológico LAI/MROSC/LGPD.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030 / ADR 0035).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179, ISO/IEC 25010 y W3C WCAG 2.2 AAA.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowUpRight, Newspaper, ShieldAlert, ShieldCheck } from 'lucide-react';

import { SupportedLocaleSchema } from '@floripa-dignidade/contracts';
import { GlobalActionButton } from '@floripa-dignidade/shared-ui-foundry';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { TransparencyEditorialStatusBadge } from './components/TransparencyEditorialStatusBadge';
import { TransparencyHeroCarousel } from './components/TransparencyHeroCarousel';
import { TransparencyMethodologyBanner } from './components/TransparencyMethodologyBanner';
import { TransparencySecretariatsExplorer } from './components/TransparencySecretariatsExplorer';
import { BuildTransparencyPageMetadata } from './logic/BuildTransparencyPageMetadata';
import { LoadTransparencyPageDictionary } from './logic/LoadTransparencyPageDictionary';

const PAGE_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'TRANSPARENCY_GAZETTE_PAGE_ORCHESTRATOR',
);
const RENDER_PAGE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'RENDER_TRANSPARENCY_GAZETTE_PAGE',
);
const PAGE_RENDERED_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'TRANSPARENCY_GAZETTE_PAGE_RENDERED',
);

interface ITransparencyPageProperties {
  readonly params: Promise<{ readonly locale: string }>;
}

export async function generateMetadata(
  propertiesSnapshot: ITransparencyPageProperties,
): Promise<Metadata> {
  const { locale: rawLocaleIdentifierLiteral } = await propertiesSnapshot.params;
  return await BuildTransparencyPageMetadata(rawLocaleIdentifierLiteral);
}

export default async function TransparencyGazettePage(
  propertiesSnapshot: ITransparencyPageProperties,
): Promise<React.JSX.Element> {
  const { locale: rawLocaleIdentifierLiteral } = await propertiesSnapshot.params;
  const localeValidationResult = SupportedLocaleSchema.safeParse(rawLocaleIdentifierLiteral);

  if (!localeValidationResult.success) {
    notFound();
  }

  const validatedLocaleIdentifier = localeValidationResult.data;
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    PAGE_MODULE_IDENTIFIER,
    RENDER_PAGE_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<React.JSX.Element> => {
      const dictionarySnapshot = await LoadTransparencyPageDictionary(validatedLocaleIdentifier);
      const heroCarouselDictionary = dictionarySnapshot.heroCarousel;
      const featuredArticleSnapshot = dictionarySnapshot.featuredLead.article;

      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: 'INFO',
        moduleIdentifierLiteral: PAGE_MODULE_IDENTIFIER,
        operationCodeLiteral: PAGE_RENDERED_OPERATION_CODE,
        correlationIdentifier,
        messageContentLiteral: `Periódico de Transparencia Activa renderizado en [${validatedLocaleIdentifier}].`,
        semanticIntentTag: 'UI_TRANSPARENCY_GAZETTE_VISIT',
        contextMetadataSnapshot: Object.freeze({
          localeCodeLiteral: validatedLocaleIdentifier,
          secretariatsCountQuantity:
            dictionarySnapshot.secretariatsSection.secretariatsCollection.length,
          hasHeroCarouselBoolean: Boolean(heroCarouselDictionary),
        }),
      });

      return (
        <main className="flex-grow flex flex-col pb-20 lg:pb-28 overflow-x-hidden">
          <section className="container mx-auto px-4 pt-12 pb-10 lg:pt-16 lg:pb-12 text-center max-w-5xl">
            <div className="inline-flex items-center gap-2 px-5 py-2 mb-6 rounded-full bg-navy-50 border border-navy-100 text-navy-950 text-xs font-black uppercase tracking-[0.18em]">
              <Newspaper size={16} aria-hidden="true" />
              <span>{dictionarySnapshot.hero.editionBadgeLiteral}</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-black font-display text-navy-950 leading-tight mb-6 tracking-tighter">
              {dictionarySnapshot.hero.headlineMainLiteral}{' '}
              <span className="italic text-amber-900 underline decoration-amber-500 decoration-4 underline-offset-8">
                {dictionarySnapshot.hero.headlineAccentLiteral}
              </span>
            </h1>

            <p className="text-lg lg:text-xl text-slate-800 leading-relaxed font-medium max-w-3xl mx-auto mb-10">
              {dictionarySnapshot.hero.leadDescriptionLiteral}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <GlobalActionButton
                visualIntentConfigurationLiteral="CONVERSION"
                isPolymorphicBoolean={true}
                actionIdentifierLiteral="TRANSPARENCY_OPEN_OBSERVATORY"
                forensicTestIdentifier="TRANSPARENCY_OPEN_OBSERVATORY_CTA"
                externalClassName="w-full sm:w-auto text-base px-8 py-4"
              >
                <Link
                  href={{ pathname: `/${validatedLocaleIdentifier}/observatorio/gastos-publicos` }}
                >
                  <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                  <span>{dictionarySnapshot.hero.primaryCtaLabelLiteral}</span>
                </Link>
              </GlobalActionButton>

              <GlobalActionButton
                visualIntentConfigurationLiteral="OUTLINE"
                isPolymorphicBoolean={true}
                actionIdentifierLiteral="TRANSPARENCY_OPEN_REPORT"
                forensicTestIdentifier="TRANSPARENCY_OPEN_REPORT_CTA"
                externalClassName="w-full sm:w-auto text-base px-8 py-4 bg-white"
              >
                <Link href={{ pathname: `/${validatedLocaleIdentifier}/denuncia` }}>
                  <ShieldAlert className="w-5 h-5 text-navy-900" aria-hidden="true" />
                  <span>{dictionarySnapshot.hero.secondaryCtaLabelLiteral}</span>
                </Link>
              </GlobalActionButton>
            </div>
          </section>

          <div className="container mx-auto px-4 mb-10">
            {heroCarouselDictionary ? (
              <TransparencyHeroCarousel
                slidesCollection={
                  heroCarouselDictionary.featuredSlidesCollection ?? [featuredArticleSnapshot]
                }
                carouselDictionary={heroCarouselDictionary}
                activeLocaleLiteral={validatedLocaleIdentifier}
                statusLabelsDictionary={dictionarySnapshot.statusLabels}
              />
            ) : (
              <article className="p-8 md:p-12 rounded-[2.5rem] bg-navy-950 text-white border border-navy-800 shadow-2xl">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <TransparencyEditorialStatusBadge
                    verificationStatusLiteral={featuredArticleSnapshot.verificationStatusLiteral}
                    statusLabelLiteral={
                      dictionarySnapshot.statusLabels[
                        featuredArticleSnapshot.verificationStatusLiteral
                      ] ?? featuredArticleSnapshot.verificationStatusLiteral
                    }
                  />
                  <span className="text-xs font-mono text-slate-200">
                    {dictionarySnapshot.featuredLead.sectionBadgeLiteral} •{' '}
                    {featuredArticleSnapshot.publishedDateIsoLiteral}
                  </span>
                </div>
                <h2 className="text-2xl md:text-4xl font-black font-display text-white tracking-tight mb-4">
                  {featuredArticleSnapshot.headlineLiteral}
                </h2>
                <p className="text-sm md:text-base text-slate-100 leading-relaxed font-medium max-w-4xl mb-6">
                  {featuredArticleSnapshot.summaryLiteral}
                </p>
                <Link
                  href={{
                    pathname: `/${validatedLocaleIdentifier}${featuredArticleSnapshot.targetActionPathLiteral}`,
                  }}
                  className="inline-flex min-h-[48px] items-center gap-2 px-7 py-3 rounded-full bg-amber-500 text-navy-950 font-black text-sm uppercase tracking-wider hover:bg-amber-400 transition-colors touch-target-min"
                >
                  <span>{dictionarySnapshot.featuredLead.readInObservatoryLabelLiteral}</span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </article>
            )}
          </div>

          <TransparencySecretariatsExplorer
            navigationDictionary={dictionarySnapshot.navigation}
            secretariatsSectionDictionary={dictionarySnapshot.secretariatsSection}
            statusLabelsDictionary={dictionarySnapshot.statusLabels}
            activeLocaleLiteral={validatedLocaleIdentifier}
          />

          <div className="container mx-auto px-4 mt-12">
            <TransparencyMethodologyBanner
              methodologyBannerDictionary={dictionarySnapshot.methodologyBanner}
            />
          </div>
        </main>
      );
    },
  );
}
