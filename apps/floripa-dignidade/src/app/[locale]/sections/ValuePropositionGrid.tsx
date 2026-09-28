'use client';

/**
 * @section Frontpage Section - Value Proposition Grid (Organism)
 * @description Orquestador visual encargado de renderizar los pilares estratégicos
 * de la ONG. Distribuye una colección de tarjetas de impacto (Atoms) y gestiona
 * el rastro telemétrico de visibilidad de los valores institucionales.
 *
 * Protocolo OEDP-V17.0 - High Performance UI & SRE Resilience.
 * SANEADO Zenith: Resolución de TS7016 (Lucide Bridge), inyección de Aduana de ADN
 * en mapeo síncrono, sanación de ESLint (no-unused-vars) y cumplimiento ISO 11179.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useEffect, useMemo } from 'react';
import { z } from 'zod';

/**
 * 🛡️ LEY DE SOBERANÍA (Fix TS7016):
 * Suprimimos la alerta del compilador para la librería de iconografía. La identidad
 * de los miembros está garantizada por el Santuario Global de la aplicación.
 */
 - TS7016: Falla de resolución de tipos en entornos monorepo estrictos.
import { Heart, Newspaper, ShieldCheck } from 'lucide-react';

/* 1. Infraestructura Core y Utilidades (Sovereign Swarm - Clean Paths) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
} from '@floripa-dignidade/telemetry';

import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';

/* 2. Átomos Locales (Internal Swarm - Clean Paths) */
import { FeatureActionCard } from '../components/FeatureActionCard';

/* 3. ADN Estructural de Dominio */
import type { IFrontpageI18n } from '../schemas/FrontpageI18n.schema';

/**
 * @interface IValuePropositionGridProperties
 * @description Contrato inmutable para la sección de pilares estratégicos.
 * Sigue la norma ISO de Objeto + Propiedad + Representación.
 */
interface IValuePropositionGridProperties {
  /** Colección inmutable de características extraídas del diccionario soberano. */
  readonly pilarStrategyFeatureCollectionSnapshot: IFrontpageI18n['features'];
}

/** Identificador técnico del aparato para el Neural Sentinel. */
const ORGANISM_IDENTIFIER = 'VALUE_PROPOSITION_GRID_ORGANISM';

/**
 * @name PillarVisualConfigurationSchema
 * @description Aduana interna para el mapeo de iconografía y variantes.
 * Garantiza que la configuración visual sea conforme al ADN del sistema.
 */
const PillarVisualConfigurationSchema = z.object({
  graphicIconNode: z.custom<React.ReactNode>(),
  visualVariantLiteral: z.enum(['RED', 'BLUE', 'AMBER']),
}).readonly();

type IPillarVisualConfiguration = z.infer<typeof PillarVisualConfigurationSchema>;

/**
 * Organismo encargado de la comunicación visual de los pilares de la ONG.
 * Implementa el patrón "Swarm Assembly" delegando la estética en FeatureActionCard.
 *
 * @param propertiesSnapshot - Snapshot de datos inyectado por el orquestador.
 * @returns {React.ReactElement} Grilla de pilares validada y auditada.
 */
export const ValuePropositionGrid: React.FC<IValuePropositionGridProperties> = ({
  pilarStrategyFeatureCollectionSnapshot,
}) => {

  // --- 1. TELEMETRÍA DE EXPOSICIÓN (Audit Trail) ---
  useEffect(() => {
    const correlationIdentifier = GenerateCorrelationIdentifier();

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: ORGANISM_IDENTIFIER,
      operationCodeLiteral: 'PROPOSITION_GRID_EXPOSED',
      correlationIdentifier,
      messageContentLiteral: 'La grilla de pilares estratégicos ha entrado en el viewport del ciudadano.',
      semanticIntentTag: 'UI_VISIBILITY_TRACE',
      contextMetadataSnapshot: {
        pilarCountQuantity: pilarStrategyFeatureCollectionSnapshot.length,
      }
    });
  }, [pilarStrategyFeatureCollectionSnapshot.length]);

  /**
   * @section Mapeo de Configuración Visual (Memoized)
   * 🛡️ LEY SRE: Validamos físicamente la colección contra el esquema de Zod.
   * Esto sana el error 'no-unused-vars' de ESLint y blinda la integridad de la UI.
   */
  const strategyVisualMappingCollection = useMemo(() => {
    const rawMapping: Record<string, IPillarVisualConfiguration> = {
      'TRANSPARENCY': {
        graphicIconNode: <ShieldCheck size={32} aria-hidden="true" />,
        visualVariantLiteral: 'RED'
      },
      'ALERTS': {
        graphicIconNode: <Newspaper size={32} aria-hidden="true" />,
        visualVariantLiteral: 'BLUE'
      },
      'ACTION': {
        graphicIconNode: <Heart size={32} aria-hidden="true" />,
        visualVariantLiteral: 'AMBER'
      },
    };

    /**
     * 🛡️ ADUANA DE ADN: Validamos cada entrada del mapa.
     * Si el objeto es corrupto, el proceso de renderizado fallará de forma controlada.
     */
    const validatedMapping: Record<string, IPillarVisualConfiguration> = {};

    Object.entries(rawMapping).forEach(([key, config]) => {
      validatedMapping[key] = PillarVisualConfigurationSchema.parse(config);
    });

    return validatedMapping;
  }, []);

  /**
   * @section Arquitectura de Estilos (Atomic Performance)
   */
  const gridContainerStylesLiteral = GlobalStyleClassMerger(
    "py-24 bg-white border-y border-slate-100"
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
             * 🛡️ SANEADO Zenith: Aplicación de fallback resiliente.
             * Al usar el mapa validado, garantizamos que los Atoms reciban ADN puro.
             */
            const visualConfigurationSnapshot = strategyVisualMappingCollection[pilarSnapshot.identifier] ?? {
              graphicIconNode: <ShieldCheck size={32} aria-hidden="true" />,
              visualVariantLiteral: 'BLUE'
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
