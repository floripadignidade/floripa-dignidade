'use client';

/**
 * @section Frontpage Section - Newsletter Conversion Organism
 * @description Zona de captación institucional de alta visibilidad para la red cívica.
 * Orquesta la integración del formulario de suscripción institucional y gestiona
 * el rastro telemétrico de exposición en el embudo de conversión social.
 *
 * Protocolo OEDP-V18.1 - High Performance UI & SRE Resilience.
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Calidad y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useEffect, useMemo } from 'react';
import { Mail } from 'lucide-react';

/* 1. Infraestructura Core y Utilidades Transversales */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';

/* 2. Fundición Visual Institucional */
import { NewsletterSubscriptionForm } from '@floripa-dignidade/shared-ui-foundry';

/* 3. Contratos de ADN Estructural de Interfaz */
import type { INewsletterSubscriptionFormI18n } from '@floripa-dignidade/shared-ui-contracts';

/* 4. Contratos de ADN Estructural de Dominio */
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

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const ORGANISM_IDENTIFIER = 'NEWSLETTER_CONVERSION_ZONE_ORGANISM' as ModuleIdentifier;

/**
 * Organismo encargado de la zona de alta conversión en la Frontpage.
 * Implementa vigilancia sensorial para auditar la efectividad del embudo de datos.
 *
 * @param propertiesSnapshot - Snapshot inmutable de configuración y lenguaje.
 * @returns {React.ReactElement} Sección de conversión cívica ensamblada y auditada.
 */
export const NewsletterConversionZone: React.FC<INewsletterConversionZoneProperties> = ({
  contentLinguisticDictionarySnapshot,
  formTranslationDictionarySnapshot,
}) => {
  /**
   * @section Telemetría de Exposición (Conversion Funnel Tracking)
   * Registra el momento exacto en que la zona de captación entra en la vista del ciudadano.
   */
  useEffect(() => {
    const correlationIdentifier = GenerateCorrelationIdentifier();

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: ORGANISM_IDENTIFIER,
      operationCodeLiteral: 'CONVERSION_ZONE_EXPOSED' as OperationCode,
      correlationIdentifier,
      messageContentLiteral:
        'Sección de captación de boletín institucional visible en el hardware del ciudadano.',
      semanticIntentTag: 'UI_VISIBILITY_TRACE',
      contextMetadataSnapshot: {
        sectionHeadlineLiteral: contentLinguisticDictionarySnapshot.sectionHeadlineLiteral,
        timestampISO: new Date().toISOString(),
      },
    });
  }, [contentLinguisticDictionarySnapshot.sectionHeadlineLiteral]);

  /**
   * @section Arquitectura de Estilos Físicos (Atomic Performance)
   * Memoiza la composición de clases para proteger los 120 FPS en el hilo principal.
   */
  const stylesSnapshot = useMemo(
    () => ({
      sectionContainer: GlobalStyleClassMerger(
        'relative py-20 overflow-hidden bg-slate-900 lg:py-32',
      ),
      obliqueElement: GlobalStyleClassMerger(
        'absolute top-0 right-0 w-1/3 h-full translate-x-20 skew-x-12 bg-amber-500/10 pointer-events-none',
      ),
      badgeContainer: GlobalStyleClassMerger(
        'inline-flex items-center gap-2 mb-6 text-xs font-black tracking-[0.2em] uppercase text-amber-500',
      ),
      headlineText: GlobalStyleClassMerger(
        'mb-6 text-4xl font-black leading-tight text-white lg:text-6xl tracking-tighter',
      ),
      descriptionText: GlobalStyleClassMerger(
        'max-w-lg text-lg leading-relaxed text-slate-400 lg:text-xl font-medium',
      ),
    }),
    [],
  );

  return (
    <section className={stylesSnapshot.sectionContainer} aria-labelledby="conversion-headline">
      {/* 1. ELEMENTO GRÁFICO INSTITUCIONAL */}
      <div className={stylesSnapshot.obliqueElement} aria-hidden="true" />

      <div className="container relative z-10 grid items-center grid-cols-1 px-4 mx-auto gap-16 lg:grid-cols-2">
        {/* COLUMNA A: PROPUESTA DE VALOR CÍVICA */}
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

        {/* COLUMNA B: ZONA DE INTERACCIÓN Y CAPTACIÓN */}
        <div className="bg-white/5 p-2 rounded-[2.5rem] backdrop-blur-sm border border-white/10 shadow-2xl">
          <div className="bg-white p-8 lg:p-12 rounded-[2rem] shadow-inner">
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
