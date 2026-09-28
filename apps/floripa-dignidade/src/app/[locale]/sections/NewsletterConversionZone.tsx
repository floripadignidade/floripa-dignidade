'use client';

/**
 * @section Frontpage Section - Newsletter Conversion (Organism)
 * @description Zona de captación institucional de alta saliencia visual.
 * Orquesta la integración del formulario de suscripción soberano y gestiona
 * el rastro telemétrico de exposición en el embudo de conversión social.
 *
 * Protocolo OEDP-V17.0 - High Performance UI & SRE Resilience.
 * SANEADO Zenith: Resolución de TS7016 (Lucide Bridge), inyección de orquestador
 * de estilos, cumplimiento de Prosa ISO 11179 e integridad de contratos Blueprints.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useEffect, useMemo } from 'react';

/**
 * 🛡️ LEY DE SOBERANÍA (Fix TS7016):
 * Suprimimos la alerta del compilador para la librería de iconografía. La identidad
 * del miembro (Mail) está garantizada por el Santuario Global 'index.d.ts'.
 */
 - TS7016: Falla de resolución de declaración de tipos en entornos monorepo.
import { Mail } from 'lucide-react';

/* 1. Infraestructura Core y Utilidades (Sovereign Swarm - Clean Paths) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
} from '@floripa-dignidade/telemetry';

import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';

/* 2. Fundición Visual (Foundry Layer - Clean Paths) */
import { NewsletterSubscriptionForm } from '@floripa-dignidade/shared-ui-foundry';

/* 3. Planos y Contratos (Blueprints Layer - Redirección de ADN) */
import type { INewsletterSubscriptionFormI18n } from '@floripa-dignidade/shared-ui-contracts';

/* 4. ADN Estructural de Dominio */
import type { IFrontpageI18n } from '../schemas/FrontpageI18n.schema';

/**
 * @interface INewsletterConversionZoneProperties
 * @description Contrato inmutable para la parametrización de la zona de captación.
 * Sigue la norma ISO de Objeto + Propiedad + Representación.
 */
interface INewsletterConversionZoneProperties {
  /** Snapshot del diccionario lingüístico dedicado a los titulares de esta sección. */
  readonly contentLinguisticDictionarySnapshot: IFrontpageI18n['newsletter'];
  /** Diccionario íntegro validado para el contrato del formulario de suscripción. */
  readonly formTranslationDictionarySnapshot: INewsletterSubscriptionFormI18n;
}

/** Identificador técnico del aparato para el Neural Sentinel. */
const ORGANISM_IDENTIFIER = 'NEWSLETTER_CONVERSION_ZONE_ORGANISM';

/**
 * Organismo encargado de la zona de alta conversión en la Frontpage.
 * Implementa vigilancia sensorial para auditar la efectividad del embudo de datos.
 *
 * @param propertiesSnapshot - Snapshot de configuración y lenguaje.
 * @returns {React.ReactElement} Sección de conversión ensamblada y auditada.
 */
export const NewsletterConversionZone: React.FC<INewsletterConversionZoneProperties> = ({
  contentLinguisticDictionarySnapshot,
  formTranslationDictionarySnapshot
}) => {

  // --- 1. TELEMETRÍA DE EXPOSICIÓN (Conversion Funnel Tracking) ---
  useEffect(() => {
    const correlationIdentifier = GenerateCorrelationIdentifier();

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: ORGANISM_IDENTIFIER,
      operationCodeLiteral: 'CONVERSION_ZONE_EXPOSED',
      correlationIdentifier,
      messageContentLiteral: 'Sección de captación de Newsletter visible en el hardware del ciudadano.',
      semanticIntentTag: 'UI_VISIBILITY_TRACE',
      contextMetadataSnapshot: {
        sectionHeadlineLiteral: contentLinguisticDictionarySnapshot.sectionHeadlineLiteral,
        timestampISO: new Date().toISOString()
      }
    });
  }, [contentLinguisticDictionarySnapshot.sectionHeadlineLiteral]);

  /**
   * @section Arquitectura de Estilos (Atomic Performance)
   * 🛡️ LEY SRE: Memoizamos la composición de clases para proteger los 120 FPS.
   */
  const stylesSnapshot = useMemo(() => ({
    sectionContainer: GlobalStyleClassMerger(
      "relative py-20 overflow-hidden bg-slate-900 lg:py-32"
    ),
    obliqueElement: GlobalStyleClassMerger(
      "absolute top-0 right-0 w-1/3 h-full translate-x-20 skew-x-12 bg-amber-500/10"
    ),
    badgeContainer: GlobalStyleClassMerger(
      "inline-flex items-center gap-2 mb-6 text-xs font-black tracking-[0.2em] uppercase text-amber-500"
    ),
    headlineText: GlobalStyleClassMerger(
      "mb-6 text-4xl font-black leading-tight text-white lg:text-6xl tracking-tighter"
    ),
    descriptionText: GlobalStyleClassMerger(
      "max-w-lg text-lg leading-relaxed text-slate-400 lg:text-xl font-medium"
    )
  }), []);

  return (
    <section
      className={stylesSnapshot.sectionContainer}
      aria-labelledby="conversion-headline"
    >
      {/* 2. IDENTIDAD VISUAL (Oblique Design Element) */}
      <div className={stylesSnapshot.obliqueElement} aria-hidden="true" />

      <div className="container relative z-10 grid items-center grid-cols-1 px-4 mx-auto gap-16 lg:grid-cols-2">

        {/* COLUMNA A: PROPUESTA DE VALOR LINGÜÍSTICA */}
        <article className="flex flex-col items-start text-left">
          <div className={stylesSnapshot.badgeContainer}>
            <Mail size={16} aria-hidden="true" />
            <span>Transparência em tempo real</span>
          </div>

          <h2 id="conversion-headline" className={stylesSnapshot.headlineText}>
            {contentLinguisticDictionarySnapshot.sectionHeadlineLiteral}
          </h2>

          <p className={stylesSnapshot.descriptionText}>
            {contentLinguisticDictionarySnapshot.sectionDescriptionLiteral}
          </p>
        </article>

        {/* COLUMNA B: ADUANA DE INTERACCIÓN (Sovereign Form Matrix) */}
        <div className="bg-white/5 p-2 rounded-[2.5rem] backdrop-blur-sm border border-white/10 shadow-2xl">
          <div className="bg-white p-8 lg:p-12 rounded-[2rem] shadow-inner">
            {/*
                🛡️ LEY ZENITH: Inyección de componentes de la Fundición Visual.
                Consumimos el contrato unificado de UI-Contracts para el éxito de la aduana.
            */}
            <NewsletterSubscriptionForm
              translationDictionary={formTranslationDictionarySnapshot}
              visualVariantLiteral="STANDARD"
              forensicTestIdentifier="FRONTPAGE_CONVERSION_FORM"
            />
          </div>
        </div>

      </div>
    </section>
  );
};
