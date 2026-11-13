'use client';

/**
 * @section Shared UI Foundry - Navigation Link (Atom)
 * @description Elemento de enlace para la barra de navegación institucional en escritorio.
 * Resuelve rutas localizadas BCP 47 mediante `ResolveLocalizedNavigationPath`, garantiza
 * compatibilidad con Next.js 16 `typedRoutes: true` vía `UrlObject`, expone `aria-current="page"`
 * mediante Radix UI (`asChild`) y emite telemetría conforme a `TelemetrySignalSchema`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & W3C WCAG 2.2 AAA).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad y Rendimiento).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { z } from 'zod';

import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

import { ResolveLocalizedNavigationPath } from '../logic/ResolveLocalizedNavigationPath';

/**
 * @name NavigationLinkPropertiesSchema
 * @description Contrato Zod inmutable para validar las propiedades de entrada del enlace.
 */
export const NavigationLinkPropertiesSchema = z
  .object({
    /** Ruta física relativa o localizada de destino. */
    hrefLiteral: z.string().trim().min(1),
    /** Etiqueta textual visible para el ciudadano. */
    labelLiteral: z.string().trim().min(1),
    /** Identificador técnico opcional para trazabilidad forense. */
    linkIdentifierLiteral: z.string().optional(),
    /** Clases CSS externas para ajustes de diseño perimetral. */
    externalClassName: z.string().optional(),
  })
  .readonly();

export type INavigationLinkProperties = z.infer<typeof NavigationLinkPropertiesSchema>;

const ATOM_MODULE_IDENTIFIER = 'NAVIGATION_LINK_ATOM' as ModuleIdentifier;

/**
 * Enlace de navegación atómico con accesibilidad WAI-ARIA y preservación de idioma activo.
 *
 * @param rawProperties - Propiedades de navegación y etiquetas validadas por contrato.
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

  const localizedDestinationPathnameLiteral = useMemo(
    () => ResolveLocalizedNavigationPath(hrefLiteral, currentPathnameLiteral),
    [hrefLiteral, currentPathnameLiteral],
  );

  const isLinkActiveBoolean = useMemo(() => {
    if (!currentPathnameLiteral) {
      return false;
    }

    if (currentPathnameLiteral === localizedDestinationPathnameLiteral) {
      return true;
    }

    if (hrefLiteral.trim() === '/') {
      return false;
    }

    return currentPathnameLiteral.startsWith(`${localizedDestinationPathnameLiteral}/`);
  }, [currentPathnameLiteral, localizedDestinationPathnameLiteral, hrefLiteral]);

  const handleNavigationTriggerAction = useCallback((): void => {
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: ATOM_MODULE_IDENTIFIER,
      operationCodeLiteral: 'NAVIGATION_LINK_CLICKED' as OperationCode,
      correlationIdentifier: GenerateCorrelationIdentifier(),
      messageContentLiteral: `Navegación de escritorio hacia: [${localizedDestinationPathnameLiteral}]`,
      semanticIntentTag: 'UI_NAVIGATION_LINK_CLICK',
      contextMetadataSnapshot: {
        destinationPathLiteral: localizedDestinationPathnameLiteral,
        labelLiteral,
        linkIdentifierLiteral,
      },
    });
  }, [localizedDestinationPathnameLiteral, labelLiteral, linkIdentifierLiteral]);

  const composedLinkStylesLiteral = useMemo(
    () =>
      GlobalStyleClassMerger(
        'group inline-flex items-center px-1 pt-1 pb-1.5 text-sm font-bold transition-all duration-300 relative outline-none',
        isLinkActiveBoolean
          ? 'text-navy-900'
          : 'text-slate-500 hover:text-navy-800 focus-visible:text-navy-900',
        externalClassName,
      ),
    [isLinkActiveBoolean, externalClassName],
  );

  return (
    <NavigationMenu.Item className="list-none">
      <NavigationMenu.Link
        asChild
        active={isLinkActiveBoolean}
        className={composedLinkStylesLiteral}
      >
        <Link
          href={{ pathname: localizedDestinationPathnameLiteral }}
          onClick={handleNavigationTriggerAction}
          aria-current={isLinkActiveBoolean ? 'page' : undefined}
        >
          <span>{labelLiteral}</span>

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
