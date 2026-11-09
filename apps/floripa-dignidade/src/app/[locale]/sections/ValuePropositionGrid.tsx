'use client';

/**
 * @section Frontpage Section - Value Proposition Grid Organism
 * @description Orquestador visual encargado de renderizar los pilares estratégicos
 * institucionales. Distribuye una colección de tarjetas de impacto y gestiona
 * el rastro telemétrico de exposición de la propuesta de valor en el viewport del ciudadano.
 *
 * Protocolo OEDP-V18.1 - High Performance UI & SRE Resilience.
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Calidad y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useEffect, useMemo } from 'react';
import { Heart, Newspaper, ShieldCheck } from 'lucide-react';
import { z } from 'zod';

/* 1. Infraestructura Core y Utilidades Transversales */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';

/* 2. Átomos Visuales Locales */
import { FeatureActionCard } from '../components/FeatureActionCard';

/* 3. Contratos de ADN Estructural de Dominio */
import type { IFrontpageI18n } from '../schemas/FrontpageI18n.schema';

/**
 * @interface IValuePropositionGridProperties
 * @description Contrato inmutable para la sección de pilares estratégicos.
 * Preserva compatibilidad absoluta con el orquestador Frontpage (page.tsx).
 */
interface IValuePropositionGridProperties {
  /** Colección inmutable de pilares estratégicos extraídos del diccionario institucional. */
  readonly pilarStrategyFeatureCollectionSnapshot: IFrontpageI18n['features'];
}

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const ORGANISM_IDENTIFIER = 'VALUE_PROPOSITION_GRID_ORGANISM' as ModuleIdentifier;

/**
 * @name PillarVisualConfigurationSchema
 * @description Contrato Zod interno para el mapeo de iconografía y variantes cromáticas.
 * Certifica que la configuración visual sea conforme al diseño institucional.
 */
const PillarVisualConfigurationSchema = z
  .object({
    graphicIconNode: z.custom<React.ReactNode>(),
    visualVariantLiteral: z.enum(['RED', 'BLUE', 'AMBER']),
  })
  .readonly();

type IPillarVisualConfiguration = z.infer<typeof PillarVisualConfigurationSchema>;

/**
 * Organismo encargado de la comunicación visual de los pilares estratégicos.
 * Implementa el patrón de composición atómica delegando la presentación en FeatureActionCard.
 *
 * @param propertiesSnapshot - Snapshot inmutable de datos inyectado por el orquestador.
 * @returns {React.ReactElement} Grilla de pilares validada, auditada y responsiva.
 */
export const ValuePropositionGrid: React.FC<IValuePropositionGridProperties> = ({
  pilarStrategyFeatureCollectionSnapshot,
}) => {
  /**
   * @section Telemetría de Exposición (Audit Trail)
   * Registra el impacto visual de los pilares cívicos en el hardware del ciudadano.
   */
  useEffect(() => {
    const correlationIdentifier = GenerateCorrelationIdentifier();

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: ORGANISM_IDENTIFIER,
      operationCodeLiteral: 'PROPOSITION_GRID_EXPOSED' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: 'La grilla de pilares estratégicos ha entrado en el viewport del ciudadano.',
      semanticIntentTag: 'UI_VISIBILITY_TRACE',
      contextMetadataSnapshot: {
        pilarCountQuantity: pilarStrategyFeatureCollectionSnapshot.length,
        renderTimestampISO: new Date().toISOString(),
      },
    });
  }, [pilarStrategyFeatureCollectionSnapshot.length]);

  /**
   * @section Mapeo de Configuración Visual Memoizado (Rendimiento 120 FPS)
   * Valida estructuralmente la iconografía y variantes para evitar re-cálculos en el render loop.
   */
  const strategyVisualMappingCollection = useMemo(() => {
    const rawMapping: Record<string, IPillarVisualConfiguration> = {
      TRANSPARENCY: {
        graphicIconNode: <ShieldCheck size={32} aria-hidden="true" />,
        visualVariantLiteral: 'RED',
      },
      ALERTS: {
        graphicIconNode: <Newspaper size={32} aria-hidden="true" />,
        visualVariantLiteral: 'BLUE',
      },
      ACTION: {
        graphicIconNode: <Heart size={32} aria-hidden="true" />,
        visualVariantLiteral: 'AMBER',
      },
    };

    const validatedMapping: Record<string, IPillarVisualConfiguration> = {};

    Object.entries(rawMapping).forEach(([key, config]) => {
      validatedMapping[key] = PillarVisualConfigurationSchema.parse(config);
    });

    return validatedMapping;
  }, []);

  /**
   * @section Arquitectura de Estilos Físicos
   * Centraliza la composición de clases para la sección de grilla.
   */
  const gridContainerStylesLiteral = GlobalStyleClassMerger(
    'py-24 bg-white border-y border-slate-100',
  );

  return (
    <section
      className={gridContainerStylesLiteral}
      aria-label="Pilares estratégicos e impacto social"
    >
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
          {pilarStrategyFeatureCollectionSnapshot.map((pilarSnapshot) => {
            /**
             * @section Fallback Resiliente
             * Si una clave lingüística nueva carece de variante explícita, se asigna el estado seguro.
             */
            const visualConfigurationSnapshot =
              strategyVisualMappingCollection[pilarSnapshot.identifier] ?? {
                graphicIconNode: <ShieldCheck size={32} aria-hidden="true" />,
                visualVariantLiteral: 'BLUE',
              };

            return (
              <FeatureActionCard
                key={pilarSnapshot.identifier}
                featureIdentifierLiteral={pilarSnapshot.identifier}
                graphicIconNode={visualConfigurationSnapshot.graphicIconNode}
                headlineTitleLiteral={pilarSnapshot.titleLiteral}
                contentDescriptionLiteral={pilarSnapshot.descriptionLiteral}
                visualVariantLiteral={visualConfigurationSnapshot.visualVariantLiteral}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};
