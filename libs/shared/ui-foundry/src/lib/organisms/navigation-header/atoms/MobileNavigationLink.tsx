'use client';

/**
 * @section Shared UI Foundry - Mobile Navigation Link (Atom)
 * @description Elemento de enlace optimizado para la navegación táctil en el Drawer.
 * Implementa rastro telemétrico de la intención de navegación y estados de hover.
 *
 * Protocolo OEDP-V17.0 - High Performance UI & Prosa ISO.
 * SANEADO Zenith: Inyección de exportación nominal, validación de ADN Zod,
 * cumplimiento de Rutas Limpias y Prosa Booleana.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useCallback } from 'react';
import Link from 'next/link';
import { z } from 'zod';

/* 1. Infraestructura Core (Atmos PascalCase - Clean Paths) */
import { EmitTelemetrySignal, GenerateCorrelationIdentifier } from '@floripa-dignidade/telemetry';

/**
 * @section Aduana de ADN (Prop Validation)
 */
const MobileNavigationLinkPropertiesSchema = z
  .object({
    /** Ruta física absoluta o relativa del destino. */
    hrefLiteral: z.string().min(1),
    /** Etiqueta textual visible para el ciudadano. */
    labelLiteral: z.string().min(1),
    /** Icono vectorial de la librería Lucide o componente React. */
    iconNode: z.custom<React.ReactNode>(),
  })
  .readonly();

export type IMobileNavigationLinkProperties = z.infer<typeof MobileNavigationLinkPropertiesSchema>;

/** Identificador técnico del aparato para el Neural Sentinel. */
const ATOM_IDENTIFIER = 'MOBILE_NAVIGATION_LINK_ATOM';

/**
 * Aparato encargado de la navegación táctil unitaria.
 * Implementa el patrón "Touch-First" (44px) y telemetría de salida del cajón.
 *
 * @param propertiesSnapshot - Snapshot de configuración y contenido.
 * @returns {React.ReactElement} Enlace táctil auditado.
 */
export const MobileNavigationLink: React.FC<IMobileNavigationLinkProperties> = (
  propertiesSnapshot,
) => {
  // 1. ADUANA DE ADN: Purificación de entrada
  const { hrefLiteral, labelLiteral, iconNode } =
    MobileNavigationLinkPropertiesSchema.parse(propertiesSnapshot);

  /**
   * @section Gestión de Telemetría de Interacción
   * 🛡️ LEY ZENITH: Registramos el punto de entrada al búnker de destino.
   */
  const handleNavigationTriggerAction = useCallback((): void => {
    const correlationIdentifier = GenerateCorrelationIdentifier();

    void EmitTelemetrySignal({
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: ATOM_IDENTIFIER,
      operationCodeLiteral: 'MOBILE_LINK_CLICKED',
      correlationIdentifier,
      messageContentLiteral: `Ciudadano navegando en móvil hacia: [${hrefLiteral}]`,
      semanticIntentTag: 'UI_NAVIGATION_DRAWER_EXIT',
      contextMetadataSnapshot: {
        destinationPathLiteral: hrefLiteral,
        labelLiteral,
      },
    });
  }, [hrefLiteral, labelLiteral]);

  return (
    <Link
      href={hrefLiteral}
      onClick={handleNavigationTriggerAction}
      className="flex items-center gap-5 p-5 rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-navy-900 transition-all group active:scale-[0.98] touch-target-min"
    >
      <div
        className="text-slate-400 group-hover:text-amber-500 transition-colors"
        aria-hidden="true"
      >
        {iconNode}
      </div>
      <span className="font-bold text-base">{labelLiteral}</span>
    </Link>
  );
};
