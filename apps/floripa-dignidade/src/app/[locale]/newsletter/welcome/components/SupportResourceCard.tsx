'use client';

/**
 * @section UI Molecule - Support Resource Card
 * @description Tarjeta de navegación secundaria para la re-inyección de ciudadanos
 * tras hitos de conversión. Orquesta la visualización de recursos de apoyo
 * con rastro telemétrico de exposición y cumplimiento de privacidad.
 *
 * Protocolo OEDP-V17.0 - High Performance UI & SRE Resilience.
 * SANEADO Zenith: Resolución de TS2307 (Re-vinculación con shared-utility),
 * inyección de Aduana Zod, telemetría forense y optimización de 120 FPS.
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
 * Define el contrato de integridad para esta molécula visual.
 */
export const SupportResourceCardPropertiesSchema = z
  .object({
    /** Nodo de iconografía vectorial (Lucide). */
    graphicIconNode: z.custom<React.ReactNode>(),
    /** Título de la sección de soporte. */
    headlineTitleLiteral: z.string().min(1),
    /** Descripción breve del valor del recurso. */
    contentDescriptionLiteral: z.string().min(1),
    /** Variante cromática institucional. */
    visualVariantLiteral: z.enum(['AMBER', 'BLUE']).default('BLUE'),
    /** Identificador técnico para analítica de clics/interés. */
    resourceIdentifierLiteral: z.string().optional(),
  })
  .readonly();

export type ISupportResourceCardProperties = z.infer<typeof SupportResourceCardPropertiesSchema>;

/** Identificador técnico del aparato para el Neural Sentinel. */
const MOLECULE_IDENTIFIER = 'SUPPORT_RESOURCE_CARD_MOLECULE';

/**
 * Aparato encargado de la redirección estratégica del ciudadano.
 *
 * @param propertiesSnapshot - Snapshot inmutable de configuración y contenido.
 * @returns {React.ReactElement} Tarjeta visual reactiva y auditada.
 */
export const SupportResourceCard: React.FC<ISupportResourceCardProperties> = (
  propertiesSnapshot,
) => {
  // 1. ADUANA DE ADN: Purificación técnica de entrada.
  const {
    graphicIconNode,
    headlineTitleLiteral,
    contentDescriptionLiteral,
    visualVariantLiteral,
    resourceIdentifierLiteral = 'GENERIC_RESOURCE',
  } = SupportResourceCardPropertiesSchema.parse(propertiesSnapshot);

  // 2. TELEMETRÍA DE EXPOSICIÓN (Audit Trail)
  useEffect(() => {
    const correlationIdentifier = GenerateCorrelationIdentifier();

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: MOLECULE_IDENTIFIER,
      operationCodeLiteral: 'SUPPORT_RESOURCE_EXPOSED',
      correlationIdentifier,
      messageContentLiteral: `Recurso de apoyo presentado: [${headlineTitleLiteral}].`,
      semanticIntentTag: 'UI_VISIBILITY_TRACE',
      contextMetadataSnapshot: {
        resourceId: resourceIdentifierLiteral,
        variantLiteral: visualVariantLiteral,
      },
    });
  }, [headlineTitleLiteral, resourceIdentifierLiteral, visualVariantLiteral]);

  /**
   * @section Arquitectura de Estilos (Atomic Performance)
   * 🛡️ LEY SRE: Externalizamos el mapeo para proteger el Main Thread.
   */
  const variantStylesMapping = useMemo(
    () => ({
      AMBER: 'bg-amber-50 text-amber-600',
      BLUE: 'bg-blue-50 text-blue-600',
    }),
    [],
  );

  const iconContainerStylesLiteral = GlobalStyleClassMerger(
    'w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 shadow-inner',
    variantStylesMapping[visualVariantLiteral],
  );

  return (
    <article
      className="flex gap-5 p-6 rounded-[2rem] hover:bg-white hover:shadow-xl transition-all duration-500 group border border-transparent hover:border-slate-100"
      aria-labelledby={`res-title-${resourceIdentifierLiteral}`}
    >
      {/* ÁREA GRÁFICA (Visual Identity) */}
      <div className={iconContainerStylesLiteral} aria-hidden="true">
        {graphicIconNode}
      </div>

      {/* ÁREA DE TEXTO (Semantic Content) */}
      <div className="flex flex-col justify-center">
        <h4
          id={`res-title-${resourceIdentifierLiteral}`}
          className="font-black text-slate-900 mb-1 tracking-tight leading-tight uppercase text-sm"
        >
          {headlineTitleLiteral}
        </h4>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">
          {contentDescriptionLiteral}
        </p>
      </div>
    </article>
  );
};
