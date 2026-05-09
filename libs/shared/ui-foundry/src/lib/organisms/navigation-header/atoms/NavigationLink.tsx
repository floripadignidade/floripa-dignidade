'use client';

/**
 * @section UI Atom - Navigation Link
 * @description Elemento de enlace optimizado para menús institucionales.
 * Implementa gestión de estados activos, accesibilidad WAI-ARIA y rastro
 * telemétrico de la intención de navegación del ciudadano.
 *
 * Protocolo OEDP-V17.0 - High Performance & Atomic Design.
 * 🛡️ LEY ZENITH: Uso de Radix UI para cumplimiento de estándares de teclado
 * e inyección de telemetría de flujo.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { z } from 'zod';

/* 1. Infraestructura Core y Utilidades (Sovereign Swarm) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier
} from '@floripa-dignidade/telemetry';

import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';

/**
 * @section Aduana de ADN (Prop Validation)
 */
export const NavigationLinkPropertiesSchema = z.object({
  /** Ruta física absoluta o relativa del destino. */
  hrefLiteral: z.string().min(1),
  /** Etiqueta textual visible para el ciudadano. */
  labelLiteral: z.string().min(1),
  /** Identificador técnico opcional para trazabilidad forense. */
  linkIdentifierLiteral: z.string().optional(),
  /** Clases CSS externas para ajustes de diseño específicos. */
  externalClassName: z.string().optional(),
}).readonly();

export type INavigationLinkProperties = z.infer<typeof NavigationLinkPropertiesSchema>;

/** Identificador técnico del aparato para el Neural Sentinel */
const ATOM_IDENTIFIER = 'NAVIGATION_LINK_ATOM';

export const NavigationLink: React.FC<INavigationLinkProperties> = (rawProperties) => {

  // 1. ADUANA DE ADN: Purificación de entrada
  const {
    hrefLiteral,
    labelLiteral,
    linkIdentifierLiteral = 'GENERIC_NAV_LINK',
    externalClassName,
  } = NavigationLinkPropertiesSchema.parse(rawProperties);

  const currentPathnameLiteral = usePathname();
  const isLinkActiveBoolean = currentPathnameLiteral === hrefLiteral;

  /**
   * @section Gestión de Interacción Telemétrica
   * 🛡️ SANEADO Zenith: El tránsito entre búnkeres se registra para análisis de UX.
   */
  const handleNavigationTriggerAction = useCallback(() => {
    const correlationIdentifier = GenerateCorrelationIdentifier();

    void EmitTelemetrySignal({
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: ATOM_IDENTIFIER,
      operationCodeLiteral: 'NAVIGATION_LINK_CLICKED',
      correlationIdentifier,
      messageContentLiteral: `Ciudadano navegando hacia: [${hrefLiteral}]`,
      contextMetadataSnapshot: {
        destinationPathLiteral: hrefLiteral,
        labelLiteral,
        linkIdentifierLiteral
      }
    });
  }, [hrefLiteral, labelLiteral, linkIdentifierLiteral]);

  // 2. ARQUITECTURA DE ESTILOS (Atomic Consistency)
  const baseLinkStylesLiteral = "group inline-flex items-center px-1 pt-1 text-sm font-bold transition-all duration-300 relative";

  const stateLinkStylesLiteral = isLinkActiveBoolean
    ? "text-navy-900"
    : "text-slate-500 hover:text-navy-800";

  return (
    <NavigationMenu.Item className="list-none">
      <Link
        href={hrefLiteral}
        passHref
        legacyBehavior
        onClick={handleNavigationTriggerAction}
      >
        <NavigationMenu.Link
          active={isLinkActiveBoolean}
          className={GlobalStyleClassMerger(
            baseLinkStylesLiteral,
            stateLinkStylesLiteral,
            externalClassName
          )}
        >
          {/* TEXTO DEL ENLACE */}
          <span>{labelLiteral}</span>

          {/* INDICADOR VISUAL DE ESTADO (Underline) */}
          <span className={GlobalStyleClassMerger(
            "absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 transition-transform duration-500 origin-left",
            isLinkActiveBoolean ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100 group-hover:bg-slate-200"
          )} aria-hidden="true" />
        </NavigationMenu.Link>
      </Link>
    </NavigationMenu.Item>
  );
};
