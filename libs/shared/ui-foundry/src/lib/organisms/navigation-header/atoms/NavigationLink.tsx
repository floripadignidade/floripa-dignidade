'use client';

/**
 * @section Shared UI Foundry - Navigation Link (Atom)
 * @description Elemento de enlace optimizado para la barra de navegación institucional.
 * Implementa gestión de estados activos resiliente a rutas localizadas, accesibilidad WAI-ARIA
 * mediante composición Radix UI (`asChild`) sin `legacyBehavior`, y telemetría de intención.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & W3C WCAG 2.2 AAA).
 * Normas: ISO/IEC 11179 (Nomenclatura Técnica) e ISO/IEC 25010 (Mantenibilidad y Rendimiento).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { z } from 'zod';

/* 1. Infraestructura Core y Utilidades */
import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

/**
 * @section Contrato Zod de Entrada (Aduana de ADN)
 */
export const NavigationLinkPropertiesSchema = z
  .object({
    /** Ruta física absoluta o relativa de destino. */
    hrefLiteral: z.string().min(1),
    /** Etiqueta textual visible para el ciudadano. */
    labelLiteral: z.string().min(1),
    /** Identificador técnico opcional para trazabilidad forense. */
    linkIdentifierLiteral: z.string().optional(),
    /** Clases CSS externas para ajustes de diseño perimetral. */
    externalClassName: z.string().optional(),
  })
  .readonly();

export type INavigationLinkProperties = z.infer<typeof NavigationLinkPropertiesSchema>;

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const ATOM_IDENTIFIER = 'NAVIGATION_LINK_ATOM' as ModuleIdentifier;

/**
 * Normaliza una ruta eliminando el prefijo de idioma BCP 47 (ej. `/pt-BR/identidad` -> `/identidad`).
 *
 * @param rawPathnameLiteral - Ruta actual capturada por `usePathname()`.
 * @returns {string} Ruta normalizada sin el segmento de localización.
 */
const normalizePathnameWithoutLocaleLiteral = (rawPathnameLiteral: string): string => {
  const sanitizedPathnameLiteral = rawPathnameLiteral.replace(
    /^\/[a-z]{2}(?:-[A-Za-z0-9]{2,8})?/,
    '',
  );
  return sanitizedPathnameLiteral.startsWith('/')
    ? sanitizedPathnameLiteral
    : `/${sanitizedPathnameLiteral}`;
};

/**
 * Enlace de navegación atómico con accesibilidad WAI-ARIA y soporte de rutas localizadas.
 *
 * @param rawProperties - Propiedades de navegación y etiquetas validadas.
 * @returns {React.ReactElement} Elemento de navegación institucional interactivo.
 */
export const NavigationLink: React.FC<INavigationLinkProperties> = (rawProperties) => {
  const {
    hrefLiteral,
    labelLiteral,
    linkIdentifierLiteral = 'GENERIC_NAV_LINK',
    externalClassName,
  } = NavigationLinkPropertiesSchema.parse(rawProperties);

  const currentPathnameLiteral = usePathname();

  /**
   * @section Determinación Resiliente de Estado Activo
   * Evalúa coincidencia exacta o coincidencia relativa omitiendo el prefijo `/[locale]`.
   */
  const isLinkActiveBoolean = useMemo(() => {
    if (!currentPathnameLiteral) return false;
    if (currentPathnameLiteral === hrefLiteral) return true;

    const currentNormalizedPathname = normalizePathnameWithoutLocaleLiteral(currentPathnameLiteral);
    const targetNormalizedHref = normalizePathnameWithoutLocaleLiteral(hrefLiteral);

    return currentNormalizedPathname === targetNormalizedHref;
  }, [currentPathnameLiteral, hrefLiteral]);

  /**
   * @section Gestión de Telemetría de Interacción (SRE Visibility)
   */
  const handleNavigationTriggerAction = useCallback(() => {
    const correlationIdentifier = GenerateCorrelationIdentifier();

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: ATOM_IDENTIFIER,
      operationCodeLiteral: 'NAVIGATION_LINK_CLICKED' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: `Ciudadano navegando hacia: [${hrefLiteral}]`,
      semanticIntentTag: 'UI_NAVIGATION_LINK_CLICK',
      contextMetadataSnapshot: {
        destinationPathLiteral: hrefLiteral,
        labelLiteral,
        linkIdentifierLiteral,
      },
    });
  }, [hrefLiteral, labelLiteral, linkIdentifierLiteral]);

  const baseLinkStylesLiteral =
    'group inline-flex items-center px-1 pt-1 text-sm font-bold transition-all duration-300 relative outline-none';

  const stateLinkStylesLiteral = isLinkActiveBoolean
    ? 'text-navy-900'
    : 'text-slate-500 hover:text-navy-800 focus-visible:text-navy-900';

  return (
    <NavigationMenu.Item className="list-none">
      <NavigationMenu.Link
        asChild
        active={isLinkActiveBoolean}
        className={GlobalStyleClassMerger(
          baseLinkStylesLiteral,
          stateLinkStylesLiteral,
          externalClassName,
        )}
      >
        <Link href={hrefLiteral} onClick={handleNavigationTriggerAction}>
          <span>{labelLiteral}</span>

          {/* INDICADOR VISUAL DE ESTADO ACTIVO (Underline animado) */}
          <span
            className={GlobalStyleClassMerger(
              'absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 transition-transform duration-500 origin-left',
              isLinkActiveBoolean
                ? 'scale-x-100'
                : 'scale-x-0 group-hover:scale-x-100 group-hover:bg-slate-200',
            )}
            aria-hidden="true"
          />
        </Link>
      </NavigationMenu.Link>
    </NavigationMenu.Item>
  );
};
