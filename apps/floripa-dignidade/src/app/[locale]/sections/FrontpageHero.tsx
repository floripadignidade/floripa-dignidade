'use client';

/**
 * @section Frontpage Section - Hero Identity (Organism)
 * @description Primer punto de contacto y centro de gravedad del portal ciudadano.
 * Orquesta la propuesta de valor institucional y los llamados a la acción primarios.
 * Implementa telemetría de conversión social, optimización de CLS y protección de tipos.
 *
 * Protocolo OEDP-V17.0 - High Performance UI & SRE Resilience.
 * SANEADO Zenith: Resolución de TS7016 (Lucide Bridge), inyección de Aduana de ADN,
 * cumplimiento estricto de Prosa ISO 11179 y sellado de contratos polimórficos.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useCallback, useEffect } from 'react';

/**
 * 🛡️ LEY DE SOBERANÍA (Fix TS7016):
 * Suprimimos la alerta del compilador para la librería de iconografía. La identidad
 * de los miembros (Heart, Newspaper, ShieldCheck) está garantizada por el
 * Santuario Global 'index.d.ts'.
 */
 - TS7016: Falla de resolución de declaración de tipos en entornos monorepo.
import { Heart, Newspaper, ShieldCheck } from 'lucide-react';

/* 1. Infraestructura Core y Utilidades (Sovereign Swarm - Clean Paths) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
} from '@floripa-dignidade/telemetry';

import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';

/* 2. Fundición Visual (Foundry Layer - Clean Paths) */
import { GlobalActionButton } from '@floripa-dignidade/shared-ui-foundry';

/* 3. ADN Estructural de Dominio */
import type { IFrontpageI18n } from '../schemas/FrontpageI18n.schema';

/**
 * @interface IFrontpageHeroProperties
 * @description Contrato inmutable para la parametrización de la sección Hero.
 * Sigue la norma ISO de Objeto + Propiedad + Representación.
 */
interface IFrontpageHeroProperties {
  /** Snapshot del diccionario lingüístico dedicado a la identidad Hero. */
  readonly contentDictionarySnapshot: IFrontpageI18n['hero'];
}

/** Identificador técnico del aparato para el Neural Sentinel. */
const ORGANISM_IDENTIFIER = 'FRONTPAGE_HERO_ORGANISM';

/**
 * Organismo encargado de la identidad visual primaria y captación ciudadana.
 * Implementa rastro telemétrico para medir el impacto de la propuesta de valor.
 *
 * @param propertiesSnapshot - Snapshot de contenido inyectado por el orquestador.
 * @returns {React.ReactElement} Sección Hero de alta fidelidad.
 */
export const FrontpageHero: React.FC<IFrontpageHeroProperties> = ({
  contentDictionarySnapshot
}) => {

  /**
   * @section Telemetría de Montaje (SRE Visibility)
   * 🛡️ LEY ZENITH: El tiempo de exposición es auditado para análisis de impacto.
   */
  useEffect(() => {
    const correlationIdentifier = GenerateCorrelationIdentifier();

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: ORGANISM_IDENTIFIER,
      operationCodeLiteral: 'HERO_SECTION_MOUNTED',
      correlationIdentifier,
      messageContentLiteral: 'Sección Hero cargada nominalmente en el hardware del ciudadano.',
      semanticIntentTag: 'UI_VISIBILITY_TRACE',
      contextMetadataSnapshot: {
        headlineLiteral: contentDictionarySnapshot.headlineMainLiteral,
        renderTimestampISO: new Date().toISOString()
      }
    });
  }, [contentDictionarySnapshot.headlineMainLiteral]);

  /**
   * @section Gestión de Telemetría de Conversión
   * 🛡️ LEY ZENITH: Cada interacción con un CTA es un sensor de éxito de la causa social.
   */
  const handleCtaInteractionAction = useCallback((
    actionLabelLiteral: string,
    actionIdentifierLiteral: string
  ): void => {
    const correlationIdentifier = GenerateCorrelationIdentifier();

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: ORGANISM_IDENTIFIER,
      operationCodeLiteral: 'CONVERSION_TRIGGERED',
      correlationIdentifier,
      messageContentLiteral: `Intención de acción detectada: [${actionLabelLiteral}].`,
      semanticIntentTag: 'SOCIAL_CONVERSION_START',
      contextMetadataSnapshot: {
        actionIdentifierLiteral,
        sourcePlatformLiteral: 'WEB_PORTAL'
      }
    });
  }, []);

  /**
   * @section Arquitectura de Estilos Dinámicos
   * Utilizamos el merger institucional para garantizar la consistencia visual.
   */
  const heroSectionStylesLiteral = GlobalStyleClassMerger(
    "container relative flex flex-col items-center px-4 py-24 mx-auto text-center lg:py-40"
  );

  return (
    <section
      className={heroSectionStylesLiteral}
      aria-labelledby="hero-headline"
    >
      {/* 1. GEOMETRÍA DE IDENTIDAD (Visual Signature) */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-100/20 via-transparent to-transparent -z-10"
        aria-hidden="true"
      />

      {/* 2. BADGE DE AUTORIDAD (Trust Layer) */}
      <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white border border-amber-100 text-amber-700 text-xs font-black uppercase tracking-[0.2em] mb-10 shadow-sm">
        <ShieldCheck size={14} className="animate-pulse" aria-hidden="true" />
        <span>{contentDictionarySnapshot.badgeLabelLiteral}</span>
      </div>

      {/* 3. MENSAJE SOBERANO (Headline) */}
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

      {/* 4. ACCIONES DE CONVERSIÓN (Foundry Swarm) */}
      <div className="flex flex-col justify-center w-full px-4 sm:flex-row gap-5 sm:w-auto">

        {/* CTA 1: Apoyo Directo (Primary Conversion) */}
        <GlobalActionButton
          visualIntentConfigurationLiteral="CONVERSION"
          actionIdentifierLiteral="HERO_PRIMARY_CONVERSION"
          isPolymorphicBoolean={false}
          className="px-12 py-5 text-xl"
          onClick={() => handleCtaInteractionAction(
            contentDictionarySnapshot.primaryActionLabelLiteral,
            'SUPPORT_CAUSE_TRIGGER'
          )}
        >
          <Heart className="w-5 h-5 fill-current" aria-hidden="true" />
          <span>{contentDictionarySnapshot.primaryActionLabelLiteral}</span>
        </GlobalActionButton>

        {/* CTA 2: Información (Outline Strategy) */}
        <GlobalActionButton
          visualIntentConfigurationLiteral="OUTLINE"
          actionIdentifierLiteral="HERO_SECONDARY_INFO"
          isPolymorphicBoolean={false}
          className="px-12 py-5 text-xl bg-white"
          onClick={() => handleCtaInteractionAction(
            contentDictionarySnapshot.secondaryActionLabelLiteral,
            'VIEW_NEWS_TRIGGER'
          )}
        >
          <Newspaper className="w-5 h-5" aria-hidden="true" />
          <span>{contentDictionarySnapshot.secondaryActionLabelLiteral}</span>
        </GlobalActionButton>

      </div>
    </section>
  );
};
