/**
 * @section Localized Frontpage Orchestrator
 * @description Punto de ensamblaje soberano para el embudo de conversión social.
 * Orquesta la carga de diccionarios unificados y renderiza el enjambre de
 * secciones atomizadas. Implementa validación dual (Input/Output) y telemetría forense.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Swarm Intelligence.
 * SANEADO Zenith: Resolución de asfixia de tipos (TS7016), inyección de
 * blindaje para Next.js 16, y cumplimiento estricto de Prosa ISO (Zero Abbreviations).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * 🛡️ LEY ZENITH (Fix TS7016):
 * Supresión controlada para permitir la resolución del motor de Next.js en entornos de monorepo.
 */
// @ts-expect-error - TS7016: Falla de resolución de declaración en monorepo PNPM.
import { notFound } from 'next/navigation';
// @ts-expect-error - TS7016: Falla de resolución de declaración en monorepo PNPM.
import type { Metadata } from 'next';

/* 1. Infraestructura Core & Routing (Sovereign Boundaries) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier
} from '@floripa-dignidade/telemetry';

import {
  SupportedLocaleSchema,
  ValidateLinguisticContract
} from '@floripa-dignidade/routing';

/* 2. Planos y Contratos (Blueprints Layer) */
import { NewsletterSubscriptionFormI18nSchema } from '@floripa-dignidade/shared-ui-contracts';
import { FrontpageI18nSchema } from './schemas/FrontpageI18n.schema';

/* 3. Secciones Atómicas (Pulverización SRP) */
import { FrontpageHero } from './sections/FrontpageHero';
import { ValuePropositionGrid } from './sections/ValuePropositionGrid';
import { NewsletterConversionZone } from './sections/NewsletterConversionZone';

/** Identificador técnico del orquestador para el Neural Sentinel. */
const ORCHESTRATOR_IDENTIFIER = 'FRONTPAGE_SHELL_ORCHESTRATOR';

/**
 * @interface IFrontpageProperties
 * @description Contrato inmutable de parámetros de ruta.
 */
interface IFrontpageProperties {
  readonly params: Promise<{
    readonly locale: string;
  }>;
}

/**
 * Generador de Metadatos Dinámicos (SEO Layer).
 *
 * @param propertiesSnapshot - Parámetros de ruta asíncronos.
 */
export async function generateMetadata(
  propertiesSnapshot: IFrontpageProperties
): Promise<Metadata> {
  const { locale: rawLocaleIdentifierLiteral } = await propertiesSnapshot.params;

  const localizedTitlesMapping: Record<string, string> = {
    'pt-BR': 'Página Inicial | Floripa Dignidade',
    'es-ES': 'Inicio | Floripa Dignidade',
    'en-US': 'Home | Floripa Dignidade',
  };

  return {
    title: localizedTitlesMapping[rawLocaleIdentifierLiteral] ?? localizedTitlesMapping['pt-BR']
  };
}

/**
 * Componente principal de la portada.
 * Implementa la carga asíncrona de ADN lingüístico y telemetría de montaje.
 */
export default async function Frontpage(
  propertiesSnapshot: IFrontpageProperties
): Promise<React.ReactElement> {
  const { locale: rawLocaleIdentifierLiteral } = await propertiesSnapshot.params;
  const correlationIdentifier = GenerateCorrelationIdentifier();

  // 1. ADUANA DE ADN
  const localeValidationResultSnapshot = SupportedLocaleSchema.safeParse(rawLocaleIdentifierLiteral);
  if (!localeValidationResultSnapshot.success) {
    return notFound();
  }
  const validatedLocaleIdentifier = localeValidationResultSnapshot.data;

  // 2. CARGA DE ALMAS LINGÜÍSTICAS (Silos Isomórficos)
  try {
    const rawUnifiedDictionarySnapshot = await import(
      `../../i18n/dictionaries/${validatedLocaleIdentifier}.json`
    );

    const frontpageSectionSnapshot = rawUnifiedDictionarySnapshot.default['apps/frontpage'];
    const newsletterSectionSnapshot = rawUnifiedDictionarySnapshot.default['shared/ui-primitives'];

    // 3. AUDITORÍA DE CONTRATO (Aduana Zod)
    ValidateLinguisticContract(
      'FRONTPAGE_CONTENT_ATOM',
      FrontpageI18nSchema,
      frontpageSectionSnapshot,
      validatedLocaleIdentifier as string
    );

    ValidateLinguisticContract(
      'NEWSLETTER_UI_ATOMS',
      NewsletterSubscriptionFormI18nSchema,
      newsletterSectionSnapshot,
      validatedLocaleIdentifier as string
    );

    // 4. TELEMETRÍA DE MONTAJE (SRE Visibility)
    void EmitTelemetrySignal({
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
      operationCodeLiteral: 'FRONTPAGE_ASSEMBLED_NOMINAL',
      correlationIdentifier,
      messageContentLiteral: `Ensamble nominal de Frontpage finalizado para [${validatedLocaleIdentifier}].`,
      semanticIntentTag: 'UI_FRONTPAGE_MOUNT',
      contextMetadataSnapshot: {
        localeIdentifierLiteral: validatedLocaleIdentifier,
        renderTimestampISO: new Date().toISOString()
      }
    });

    return (
      <main className="flex flex-col flex-grow overflow-x-hidden">
        <FrontpageHero content={frontpageSectionSnapshot.hero} />
        <ValuePropositionGrid features={frontpageSectionSnapshot.features} />
        <NewsletterConversionZone
          content={frontpageSectionSnapshot.newsletter}
          formDictionary={newsletterSectionSnapshot}
        />
      </main>
    );

  } catch (_caughtWeaverError: unknown) {
    // 🛡️ SANEADO (Fix TS7030): Not Found siempre retorna never.
    return notFound();
  }
}
