/**
 * @file apps/floripa-dignidade/src/app/[locale]/identidad/page.tsx
 * @section Institutional Identity - Localized Page (Orchestrator)
 * @description Orquestador de la página institucional de Floripa Dignidade.
 * Ensambla el Hero de misión, el marco MROSC, la tríada de impacto y los disparadores
 * de conversión cívica bajo responsabilidad única (SRP) y límite estricto de líneas.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179, ISO/IEC 25010 y W3C WCAG 2.2 AAA.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Scale, ShieldCheck } from 'lucide-react';

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

import { IdentityFrameworkCard } from './components/IdentityFrameworkCard';
import { IdentityPillarsSection } from './components/IdentityPillarsSection';
import { BuildIdentityPageMetadata } from './logic/BuildIdentityPageMetadata';
import { LoadIdentityPageDictionary } from './logic/LoadIdentityPageDictionary';

const PAGE_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'INSTITUTIONAL_IDENTITY_PAGE_ORCHESTRATOR',
);

const RENDER_PAGE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'RENDER_INSTITUTIONAL_IDENTITY_PAGE',
);

const PAGE_RENDERED_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'INSTITUTIONAL_IDENTITY_PAGE_RENDERED',
);

interface IIdentityPageProperties {
  readonly params: Promise<{ readonly locale: string }>;
}

export async function generateMetadata(
  propertiesSnapshot: IIdentityPageProperties,
): Promise<Metadata> {
  const { locale: rawLocaleIdentifierLiteral } = await propertiesSnapshot.params;
  return await BuildIdentityPageMetadata(rawLocaleIdentifierLiteral);
}

export default async function InstitutionalIdentityPage(
  propertiesSnapshot: IIdentityPageProperties,
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
      const dictionarySnapshot = await LoadIdentityPageDictionary(validatedLocaleIdentifier);

      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: 'INFO',
        moduleIdentifierLiteral: PAGE_MODULE_IDENTIFIER,
        operationCodeLiteral: PAGE_RENDERED_OPERATION_CODE,
        correlationIdentifier,
        messageContentLiteral: `Página institucional de identidad renderizada en [${validatedLocaleIdentifier}].`,
        semanticIntentTag: 'UI_INSTITUTIONAL_IDENTITY_VISIT',
        contextMetadataSnapshot: Object.freeze({
          localeCodeLiteral: validatedLocaleIdentifier,
        }),
      });

      return (
        <main className="flex-grow flex flex-col items-center justify-start relative px-4 py-16 lg:py-24 overflow-hidden">
          <section className="max-w-4xl w-full text-center mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="inline-flex items-center gap-2 px-5 py-2 mb-6 rounded-full bg-navy-50 border border-navy-100 text-navy-900 text-xs font-black uppercase tracking-[0.2em]">
              <ShieldCheck size={16} aria-hidden="true" />
              <span>{dictionarySnapshot.hero.badgeLabelLiteral}</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 leading-tight mb-6 tracking-tighter">
              {dictionarySnapshot.hero.headlineMainLiteral}{' '}
              <span className="italic text-amber-500">
                {dictionarySnapshot.hero.headlineAccentLiteral}
              </span>
              .
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed font-medium max-w-3xl mx-auto">
              {dictionarySnapshot.hero.descriptionLiteral}
            </p>
          </section>

          <IdentityFrameworkCard frameworkDictionary={dictionarySnapshot.framework} />

          <IdentityPillarsSection pillarsSectionDictionary={dictionarySnapshot.pillarsSection} />

          <section className="max-w-2xl w-full text-center flex flex-col sm:flex-row gap-5 justify-center items-center">
            <GlobalActionButton
              visualIntentConfigurationLiteral="CONVERSION"
              isPolymorphicBoolean={true}
              actionIdentifierLiteral="IDENTITY_PAGE_EXPLORE_OBSERVATORY"
              forensicTestIdentifier="IDENTITY_EXPLORE_OBSERVATORY_CTA"
              externalClassName="w-full sm:w-auto text-lg px-8 py-5"
            >
              <Link
                href={{ pathname: `/${validatedLocaleIdentifier}/observatorio/gastos-publicos` }}
              >
                <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                <span>{dictionarySnapshot.actions.primaryCtaLabelLiteral}</span>
              </Link>
            </GlobalActionButton>

            <GlobalActionButton
              visualIntentConfigurationLiteral="OUTLINE"
              isPolymorphicBoolean={true}
              actionIdentifierLiteral="IDENTITY_PAGE_DENUNCIAS_CTA"
              forensicTestIdentifier="IDENTITY_DENUNCIAS_CTA"
              externalClassName="w-full sm:w-auto text-lg px-8 py-5 bg-white"
            >
              <Link href={{ pathname: `/${validatedLocaleIdentifier}/denuncia` }}>
                <Scale className="w-5 h-5 text-amber-500" aria-hidden="true" />
                <span>{dictionarySnapshot.actions.secondaryCtaLabelLiteral}</span>
              </Link>
            </GlobalActionButton>
          </section>
        </main>
      );
    },
  );
}
