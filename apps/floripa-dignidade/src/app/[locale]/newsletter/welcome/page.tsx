/**
 * @section Newsletter Domain - Welcome Page (Orchestrator)
 * @description Punto de ensamblaje para la zona de confirmación de ciudadanía.
 * Orquesta la carga de diccionarios localizados y el renderizado de átomos
 * de conversión. Implementa telemetría forense e integridad de contratos.
 *
 * Protocolo OEDP-V17.0 - High Performance UI & Swarm Intelligence.
 * SANEADO Zenith: Erradicación de 'React' importado no utilizado (TS6133) y
 * sincronización de propiedades de contrato (Fix TS2322).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { notFound } from 'next/navigation';

/** 🛡️ LEY DE IDENTIDAD: El tipado ambiental se resuelve vía index.d.ts */
import { ArrowLeft, Newspaper, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';

/* 1. Infraestructura Core & Routing (Sovereign Boundaries) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
} from '@floripa-dignidade/telemetry';

import {
  SupportedLocaleSchema,
  ValidateLinguisticContract,
} from '@floripa-dignidade/routing';

/* 2. Fundición Visual (Foundry Layer - Clean Paths) */
import { GlobalActionButton } from '@floripa-dignidade/shared-ui-foundry';

/* 3. ADN Estructural y Átomos Locales */
import { NewsletterWelcomeI18nSchema } from './schemas/NewsletterWelcomeI18n.schema';
import type { INewsletterWelcomeI18n } from './schemas/NewsletterWelcomeI18n.schema';
import { SuccessCheckmark } from './components/SuccessCheckmark';
import { SupportResourceCard } from './components/SupportResourceCard';

/** Identificador técnico del aparato para el Neural Sentinel. */
const ORCHESTRATOR_IDENTIFIER = 'NEWSLETTER_WELCOME_ORCHESTRATOR';

/**
 * @interface IWelcomePageProperties
 * @description Contrato inmutable para las propiedades de ruta de Next.js.
 */
interface IWelcomePageProperties {
  readonly params: Promise<{ readonly locale: string }>;
}

/**
 * Generador de Metadatos Dinámicos.
 */
export async function generateMetadata(
  propertiesSnapshot: IWelcomePageProperties
): Promise<Metadata> {
  const { locale: rawLocaleIdentifierLiteral } = await propertiesSnapshot.params;

  const titlesMapping: Record<string, string> = {
    'pt-BR': 'Soberania Confirmada | Floripa Dignidade',
    'es-ES': 'Soberanía Confirmada | Floripa Dignidade',
    'en-US': 'Sovereignty Confirmed | Floripa Dignidade',
  };

  return {
    title: titlesMapping[rawLocaleIdentifierLiteral] ?? titlesMapping['pt-BR'],
    robots: { index: false, follow: true }
  };
}

/**
 * Componente principal de la página de éxito de suscripción.
 * Implementa el patrón "Sovereign Shell" con rastro de auditoría.
 */
export default async function NewsletterWelcomePage(
  propertiesSnapshot: IWelcomePageProperties
) {
  const { locale: rawLocaleIdentifierLiteral } = await propertiesSnapshot.params;
  const correlationIdentifier = GenerateCorrelationIdentifier();

  // --- 1. ADUANA DE ADN LINGÜÍSTICO (Security Border) ---
  const localeValidationResultSnapshot = SupportedLocaleSchema.safeParse(rawLocaleIdentifierLiteral);

  if (!localeValidationResultSnapshot.success) {
    return notFound();
  }

  const validatedLocaleIdentifier = localeValidationResultSnapshot.data;

  try {
    // --- 2. CARGA DE ALMA LINGÜÍSTICA (Silo Isomórfico) ---
    const rawDictionarySection = await import(`./i18n/${validatedLocaleIdentifier}.json`);

    ValidateLinguisticContract(
      'WELCOME_PAGE_CONTENT',
      NewsletterWelcomeI18nSchema,
      rawDictionarySection.default,
      validatedLocaleIdentifier as string
    );

    const dictionarySnapshot: INewsletterWelcomeI18n = rawDictionarySection.default;

    // --- 3. REPORTE DE EXPOSICIÓN (SRE Visibility) ---
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
      operationCodeLiteral: 'WELCOME_PAGE_RENDERED',
      correlationIdentifier,
      messageContentLiteral: `Ciudadano alcanzó zona de bienvenida en [${validatedLocaleIdentifier}].`,
      semanticIntentTag: 'UI_CONVERSION_ZONE_REACHED'
    });

    return (
      <div className="flex-grow flex flex-col items-center justify-center relative px-4 py-20 lg:py-40 overflow-hidden">
        {/* GEOMETRÍA DE IDENTIDAD */}
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

          {/* ACCIONES DE CONVERSIÓN SECUNDARIA */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <GlobalActionButton
              visualIntentConfigurationLiteral="STANDARD"
              isPolymorphicBoolean={false}
              actionIdentifierLiteral="WELCOME_VIEW_TRANSPARENCY"
              className="w-full sm:w-auto text-lg px-10 py-5"
            >
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              <span>{dictionarySnapshot.actions.primaryActionLabelLiteral}</span>
            </GlobalActionButton>

            <GlobalActionButton
              visualIntentConfigurationLiteral="GHOST"
              isPolymorphicBoolean={false}
              actionIdentifierLiteral="WELCOME_BACK_HOME"
              className="w-full sm:w-auto text-lg px-10 py-5 group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
              <span>{dictionarySnapshot.actions.secondaryActionLabelLiteral}</span>
            </GlobalActionButton>
          </div>

          {/* RECURSOS DE SOPORTE (Frontera de Contratos) */}
          <div className="mt-24 pt-10 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
            {/* 🛡️ SANEADO Zenith: Inyección de 'graphicIconNode' para cumplir el contrato */}
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
      </div>
    );

  } catch (_caughtError: unknown) {
    /** 🛡️ SANEADO: El error ya es reportado por el integrador de diccionarios. */
    return notFound();
  }
}
