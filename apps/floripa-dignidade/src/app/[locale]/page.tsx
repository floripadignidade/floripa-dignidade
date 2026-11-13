/**
 * @section Application Shell - Localized Frontpage Orchestrator
 * @description Punto de ensamblaje maestro para la página principal localizada del portal.
 * Valida la legitimidad BCP 47 del segmento `[locale]` contra el SSOT (`@floripa-dignidade/contracts`),
 * mide latencia mediante `TraceExecutionTime`, carga diccionarios con cascada resiliente de
 * ADR 0030 (cero 404 por ausencia secundaria de traducciones) y delega metadatos SEO dinámicos.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179, ISO/IEC 25010 y W3C WCAG 2.2.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { SupportedLocaleSchema } from '@floripa-dignidade/contracts';
import { GlobalBaseException, InternalSystemException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
  ReportForensicException,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { FrontpageHero } from './sections/FrontpageHero';
import { NewsletterConversionZone } from './sections/NewsletterConversionZone';
import { ValuePropositionGrid } from './sections/ValuePropositionGrid';
import { BuildFrontpageMetadata } from './logic/BuildFrontpageMetadata';
import { ResolveFrontpageInMemoryFallback } from './logic/FrontpageFallbackDictionaries';
import { LoadFrontpageDictionaries } from './logic/LoadFrontpageDictionaries';

const ORCHESTRATOR_IDENTIFIER = 'FRONTPAGE_SHELL_ORCHESTRATOR' as ModuleIdentifier;

interface IFrontpageProperties {
  readonly params: Promise<{ readonly locale: string }>;
}

/**
 * Generador dinámico de metadatos SEO y `hreflang` para cada idioma activo del catálogo SSOT.
 *
 * @param propertiesSnapshot - Parámetros dinámicos inyectados por Next.js App Router.
 * @returns {Promise<Metadata>} Metadatos localizados para SEO institucional.
 */
export async function generateMetadata(
  propertiesSnapshot: IFrontpageProperties,
): Promise<Metadata> {
  const { locale: rawLocaleIdentifierLiteral } = await propertiesSnapshot.params;
  return await BuildFrontpageMetadata(rawLocaleIdentifierLiteral);
}

/**
 * Componente de Servidor encargado del montaje de la Frontpage localizada (RSC).
 *
 * @param propertiesSnapshot - Parámetros de ruta inyectados por Next.js App Router.
 * @returns {Promise<React.JSX.Element>} Interfaz de impacto social ensamblada con inmunidad ante 404.
 */
export default async function Frontpage(
  propertiesSnapshot: IFrontpageProperties,
): Promise<React.JSX.Element> {
  const { locale: rawLocaleIdentifierLiteral } = await propertiesSnapshot.params;
  const localeValidationResult = SupportedLocaleSchema.safeParse(rawLocaleIdentifierLiteral);

  if (!localeValidationResult.success) {
    notFound();
  }

  const validatedLocaleLiteral = localeValidationResult.data;
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    ORCHESTRATOR_IDENTIFIER,
    'ASSEMBLE_LOCALIZED_FRONTPAGE' as OperationCode,
    correlationIdentifier,
    async (): Promise<React.JSX.Element> => {
      try {
        const { localizedContent, newsletterUi } =
          await LoadFrontpageDictionaries(validatedLocaleLiteral);

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'FRONTPAGE_ASSEMBLY_SUCCESS' as OperationCode,
          correlationIdentifier,
          messageContentLiteral: `Ensamble de Frontpage finalizado para [${validatedLocaleLiteral}].`,
          semanticIntentTag: 'UI_ASSEMBLY_NOMINAL',
          contextMetadataSnapshot: {
            localeCodeLiteral: validatedLocaleLiteral,
          },
        });

        return (
          <main className="flex flex-col flex-grow overflow-x-hidden">
            <FrontpageHero contentDictionarySnapshot={localizedContent.hero} />
            <ValuePropositionGrid
              pilarStrategyFeatureCollectionSnapshot={localizedContent.features}
            />
            <NewsletterConversionZone
              contentLinguisticDictionarySnapshot={localizedContent.newsletter}
              formTranslationDictionarySnapshot={newsletterUi}
            />
          </main>
        );
      } catch (caughtError: unknown) {
        const errorDescriptionLiteral =
          caughtError instanceof Error ? caughtError.message : 'UNKNOWN_ORCHESTRATION_FAULT';

        const normalizedException =
          caughtError instanceof GlobalBaseException
            ? caughtError
            : new InternalSystemException('FRONTPAGE_ORCHESTRATION_COLLAPSE', {
                originalErrorLiteral: errorDescriptionLiteral,
                correlationIdentifier,
              });

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'FRONTPAGE_MOUNT_FAULT' as OperationCode,
          correlationIdentifier,
          messageContentLiteral:
            'Fallo imprevisto al cargar diccionarios de Frontpage; activando respaldo institucional en memoria.',
          semanticIntentTag: 'UI_FRONTPAGE_CONTINGENCY_ENGAGED',
          contextMetadataSnapshot: { ...normalizedException.runtimeContextSnapshot },
        });

        ReportForensicException(normalizedException, correlationIdentifier);

        const emergencyFallbackBundle = ResolveFrontpageInMemoryFallback(validatedLocaleLiteral);

        return (
          <main className="flex flex-col flex-grow overflow-x-hidden">
            <FrontpageHero
              contentDictionarySnapshot={emergencyFallbackBundle.localizedContent.hero}
            />
            <ValuePropositionGrid
              pilarStrategyFeatureCollectionSnapshot={
                emergencyFallbackBundle.localizedContent.features
              }
            />
            <NewsletterConversionZone
              contentLinguisticDictionarySnapshot={
                emergencyFallbackBundle.localizedContent.newsletter
              }
              formTranslationDictionarySnapshot={emergencyFallbackBundle.newsletterUi}
            />
          </main>
        );
      }
    },
  );
}
