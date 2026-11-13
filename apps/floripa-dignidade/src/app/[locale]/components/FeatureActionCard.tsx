'use client';

/**
 * @section UI Atoms - Feature Action Card
 * @description Tarjeta de presentación de funcionalidades con variantes de
 * intención visual. Implementa rastro telemétrico de exposición (Audit Trail)
 * y validación de contrato estructural mediante Zod.
 *
 * Protocolo OEDP-V17.0 - High Performance UI & SRE Resilience.
 * SANEADO Zenith: Erradicación del alias '@shared', inyección de telemetría
 * de visibilidad, cumplimiento de Prosa ISO y optimización de renderizado.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useEffect, useMemo } from 'react';
import { z } from 'zod';

/* 1. Infraestructura Core y Utilidades (Sovereign Swarm - Clean Paths) */
import { EmitTelemetrySignal, GenerateCorrelationIdentifier } from '@floripa-dignidade/telemetry';

import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';

/**
 * @section Aduana de ADN (Prop Validation)
 * Define el contrato de integridad para este átomo visual.
 */
export const FeatureActionCardPropertiesSchema = z
  .object({
    /** Nodo de iconografía vectorial (Lucide o similar). */
    graphicIconNode: z.custom<React.ReactNode>(),

    /** Título de impacto para la funcionalidad. */
    headlineTitleLiteral: z.string().min(1),

    /** Descripción detallada del valor social o técnico. */
    contentDescriptionLiteral: z.string().min(1),

    /** Variante cromática que define el contexto semántico. */
    visualVariantLiteral: z.enum(['RED', 'BLUE', 'AMBER']).default('BLUE'),

    /** Identificador técnico para el rastro telemétrico forense. */
    featureIdentifierLiteral: z.string().optional(),
  })
  .readonly();

export type IFeatureActionCardProperties = z.infer<typeof FeatureActionCardPropertiesSchema>;

/** Identificador técnico del aparato para el Neural Sentinel. */
const ATOM_IDENTIFIER = 'FEATURE_ACTION_CARD_ATOM';

/**
 * Átomo encargado de la representación visual de pilares estratégicos.
 * Implementa vigilancia sensorial para auditar la atención del ciudadano.
 *
 * @param propertiesSnapshot - Snapshot de propiedades inyectado por el orquestador.
 * @returns {React.ReactElement} Tarjeta visual reactiva y auditada.
 */
export const FeatureActionCard: React.FC<IFeatureActionCardProperties> = (propertiesSnapshot) => {
  // 1. ADUANA DE ADN: Purificación de entrada
  const {
    graphicIconNode,
    headlineTitleLiteral,
    contentDescriptionLiteral,
    visualVariantLiteral,
    featureIdentifierLiteral = 'GENERIC_FEATURE',
  } = FeatureActionCardPropertiesSchema.parse(propertiesSnapshot);

  // 2. TELEMETRÍA DE EXPOSICIÓN (Audit Sentry)
  useEffect(() => {
    const correlationIdentifier = GenerateCorrelationIdentifier();

    void EmitTelemetrySignal({
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: ATOM_IDENTIFIER,
      operationCodeLiteral: 'FEATURE_CARD_EXPOSED',
      correlationIdentifier,
      messageContentLiteral: `Componente visual presentado al ciudadano: [${headlineTitleLiteral}].`,
      semanticIntentTag: 'UI_VISIBILITY_TRACE',
      contextMetadataSnapshot: {
        featureId: featureIdentifierLiteral,
        variantLiteral: visualVariantLiteral,
      },
    });
  }, [headlineTitleLiteral, featureIdentifierLiteral, visualVariantLiteral]);

  /**
   * @section Arquitectura de Estilos (Atomic Performance)
   * 🛡️ LEY SRE: Memoizamos el mapeo de variantes para asegurar 120 FPS
   * durante transiciones de Layout masivas.
   */
  const variantStylesMapping = useMemo(
    () => ({
      RED: 'bg-red-50 text-red-600',
      BLUE: 'bg-blue-50 text-blue-600',
      AMBER: 'bg-amber-50 text-amber-600',
    }),
    [],
  );

  const iconContainerStylesLiteral = GlobalStyleClassMerger(
    'w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110',
    variantStylesMapping[visualVariantLiteral],
  );

  return (
    <article
      className="flex flex-col items-start gap-5 p-6 rounded-3xl transition-all duration-500 hover:bg-white hover:shadow-xl group border border-transparent hover:border-slate-100"
      aria-labelledby={`title-${featureIdentifierLiteral}`}
    >
      {/* ÁREA DE ICONOGRAFÍA (Graphic Identity) */}
      <div className={iconContainerStylesLiteral} aria-hidden="true">
        {graphicIconNode}
      </div>

      {/* ÁREA DE CONTENIDO (Semantic Logic) */}
      <div className="flex flex-col gap-2">
        <h3
          id={`title-${featureIdentifierLiteral}`}
          className="text-2xl font-black text-slate-900 tracking-tight"
        >
          {headlineTitleLiteral}
        </h3>
        <p className="text-slate-500 leading-relaxed font-medium">{contentDescriptionLiteral}</p>
      </div>
    </article>
  );
};
