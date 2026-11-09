'use client';

/**
 * @section Frontpage Section - Hero Identity Organism
 * @description Primer punto de contacto y centro de gravedad del portal ciudadano.
 * Orquesta la propuesta de valor institucional y las acciones primarias de conversión social.
 * Implementa telemetría de exposición, optimización de CLS y tipado nominal estricto.
 *
 * Protocolo OEDP-V18.1 - High Performance UI & SRE Resilience.
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Calidad y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useCallback, useEffect } from 'react';
import { Heart, Newspaper, ShieldCheck } from 'lucide-react';

/* 1. Infraestructura Core y Utilidades Transversales */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';

/* 2. Fundición Visual Institucional */
import { GlobalActionButton } from '@floripa-dignidade/shared-ui-foundry';

/* 3. Contratos de ADN Estructural de Dominio */
import type { IFrontpageI18n } from '../schemas/FrontpageI18n.schema';

/**
 * @interface IFrontpageHeroProperties
 * @description Contrato inmutable para la parametrización de la sección Hero.
 * Sigue la norma ISO de Objeto + Propiedad + Representación.
 */
interface IFrontpageHeroProperties {
  /** Snapshot del diccionario lingüístico dedicado a la identidad de la sección Hero. */
  readonly contentDictionarySnapshot: IFrontpageI18n['hero'];
}

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const ORGANISM_IDENTIFIER = 'FRONTPAGE_HERO_ORGANISM' as ModuleIdentifier;

/**
 * Organismo encargado de la identidad visual primaria y captación cívica.
 * Implementa vigilancia sensorial para auditar la exposición de la propuesta de valor.
 *
 * @param propertiesSnapshot - Snapshot inmutable de contenido inyectado por el orquestador.
 * @returns {React.ReactElement} Sección Hero de alta fidelidad y rendimiento a 120 FPS.
 */
export const FrontpageHero: React.FC<IFrontpageHeroProperties> = ({
  contentDictionarySnapshot,
}) => {
  /**
   * @section Telemetría de Montaje e Inicialización (SRE Visibility)
   * Audita la presencia física de la sección Hero en el dispositivo del ciudadano.
   */
  useEffect(() => {
    const correlationIdentifier = GenerateCorrelationIdentifier();

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: ORGANISM_IDENTIFIER,
      operationCodeLiteral: 'HERO_SECTION_MOUNTED' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: 'Sección Hero montada nominalmente en el hardware del ciudadano.',
      semanticIntentTag: 'UI_VISIBILITY_TRACE',
      contextMetadataSnapshot: {
        headlineLiteral: contentDictionarySnapshot.headlineMainLiteral,
        renderTimestampISO: new Date().toISOString(),
      },
    });
  }, [contentDictionarySnapshot.headlineMainLiteral]);

  /**
   * @section Gestión de Telemetría de Interacción Cívica
   * Registra cada estímulo de conversión como un sensor de impacto social.
   */
  const handleCallToActionInteractionAction = useCallback(
    (actionLabelLiteral: string, actionIdentifierLiteral: string): void => {
      const correlationIdentifier = GenerateCorrelationIdentifier();

      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: 'INFO',
        moduleIdentifierLiteral: ORGANISM_IDENTIFIER,
        operationCodeLiteral: 'CONVERSION_TRIGGERED' as OperationCode,
        correlationIdentifier,
        messageContentLiteral: `Intención de acción detectada: [${actionLabelLiteral}].`,
        semanticIntentTag: 'SOCIAL_CONVERSION_START',
        contextMetadataSnapshot: {
          actionIdentifierLiteral,
          sourcePlatformLiteral: 'WEB_PORTAL',
        },
      });
    },
    [],
  );

  /**
   * @section Arquitectura de Estilos Físicos
   * Centraliza la composición de clases mediante el módulo unificado de fusión.
   */
  const heroSectionStylesLiteral = GlobalStyleClassMerger(
    'container relative flex flex-col items-center px-4 py-24 mx-auto text-center lg:py-40',
  );

  return (
    <section className={heroSectionStylesLiteral} aria-labelledby="hero-headline">
      {/* 1. GEOMETRÍA DE IDENTIDAD INSTITUCIONAL */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-100/20 via-transparent to-transparent -z-10 pointer-events-none"
        aria-hidden="true"
      />

      {/* 2. INSIGNIA DE AUTORIDAD Y CONFIANZA */}
      <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white border border-amber-100 text-amber-700 text-xs font-black uppercase tracking-[0.2em] mb-10 shadow-sm">
        <ShieldCheck size={14} className="animate-pulse" aria-hidden="true" />
        <span>{contentDictionarySnapshot.badgeLabelLiteral}</span>
      </div>

      {/* 3. MENSAJE INSTITUCIONAL PRINCIPAL */}
      <h1
        id="hero-headline"
        className="text-6xl lg:text-8xl font-black text-slate-900 leading-[1.1] mb-8 max-w-5xl tracking-tighter"
      >
        {contentDictionarySnapshot.headlineMainLiteral}{' '}
        <span className="italic text-amber-500">
          {contentDictionarySnapshot.headlineAccentLiteral}
        </span>
        .
      </h1>

      <p className="max-w-2xl mb-14 text-xl font-medium leading-relaxed text-slate-600">
        {contentDictionarySnapshot.descriptionLiteral}
      </p>

      {/* 4. ACCIONES DE INTERACCIÓN Y CONVERSIÓN */}
      <div className="flex flex-col justify-center w-full px-4 sm:flex-row gap-5 sm:w-auto">
        {/* ACCIÓN 1: Apoyo y Participación Directa */}
        <GlobalActionButton
          visualIntentConfigurationLiteral="CONVERSION"
          actionIdentifierLiteral="HERO_PRIMARY_CONVERSION"
          isPolymorphicBoolean={false}
          externalClassName="px-12 py-5 text-xl"
          onClick={() =>
            handleCallToActionInteractionAction(
              contentDictionarySnapshot.primaryActionLabelLiteral,
              'SUPPORT_CAUSE_TRIGGER',
            )
          }
        >
          <Heart className="w-5 h-5 fill-current" aria-hidden="true" />
          <span>{contentDictionarySnapshot.primaryActionLabelLiteral}</span>
        </GlobalActionButton>

        {/* ACCIÓN 2: Acceso a Prensa y Transparencia */}
        <GlobalActionButton
          visualIntentConfigurationLiteral="OUTLINE"
          actionIdentifierLiteral="HERO_SECONDARY_INFO"
          isPolymorphicBoolean={false}
          externalClassName="px-12 py-5 text-xl bg-white"
          onClick={() =>
            handleCallToActionInteractionAction(
              contentDictionarySnapshot.secondaryActionLabelLiteral,
              'VIEW_NEWS_TRIGGER',
            )
          }
        >
          <Newspaper className="w-5 h-5" aria-hidden="true" />
          <span>{contentDictionarySnapshot.secondaryActionLabelLiteral}</span>
        </GlobalActionButton>
      </div>
    </section>
  );
};
