'use client';

/**
 * @section Shared UI Foundry - Mobile Navigation Link (Atom)
 * @description Elemento de enlace optimizado para la navegación táctil en el menú lateral
 * móvil. Resuelve rutas localizadas BCP 47 mediante `ResolveLocalizedNavigationPath`,
 * garantiza compatibilidad con `typedRoutes: true`, expone `aria-current="page"` y
 * emite telemetría conforme a `TelemetrySignalSchema`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 y W3C WCAG 2.2 AAA.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
 * @name MobileNavigationLinkPropertiesSchema
 * @description Contrato Zod inmutable para validar los parámetros del enlace táctil móvil.
 */
export const MobileNavigationLinkPropertiesSchema = z
  .object({
    /** Ruta física relativa o localizada del destino institucional. */
    hrefLiteral: z.string().trim().min(1),
    /** Etiqueta textual visible para el ciudadano. */
    labelLiteral: z.string().trim().min(1),
    /** Icono vectorial de la librería Lucide o elemento React de apoyo visual. */
    iconNode: z.custom<React.ReactNode>(),
    /** Callback opcional invocado tras pulsar el enlace (por ejemplo, cerrar el cajón móvil). */
    onNavigateAction: z.function().args().returns(z.void()).optional(),
  })
  .readonly();

export type IMobileNavigationLinkProperties = z.infer<typeof MobileNavigationLinkPropertiesSchema>;

const ATOM_MODULE_IDENTIFIER = 'MOBILE_NAVIGATION_LINK_ATOM' as ModuleIdentifier;

/**
 * Renderiza un enlace táctil unitario con área mínima de contacto WCAG (44x44px).
 *
 * @param propertiesSnapshot - Ruta destino, etiqueta localizada, ícono y callback opcional.
 * @returns {React.ReactElement} Enlace móvil accesible, localizado y auditado.
 */
export const MobileNavigationLink: React.FC<IMobileNavigationLinkProperties> = (
  propertiesSnapshot,
) => {
  const { hrefLiteral, labelLiteral, iconNode, onNavigateAction } =
    MobileNavigationLinkPropertiesSchema.parse(propertiesSnapshot);

  const currentPathnameLiteral = usePathname();

  const localizedDestinationPathnameLiteral = useMemo(
    () => ResolveLocalizedNavigationPath(hrefLiteral, currentPathnameLiteral),
    [hrefLiteral, currentPathnameLiteral],
  );

  const isLinkActiveBoolean = useMemo(() => {
    if (!currentPathnameLiteral) {
      return false;
    }

    return currentPathnameLiteral === localizedDestinationPathnameLiteral;
  }, [currentPathnameLiteral, localizedDestinationPathnameLiteral]);

  const handleNavigationTriggerAction = useCallback((): void => {
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: ATOM_MODULE_IDENTIFIER,
      operationCodeLiteral: 'MOBILE_LINK_CLICKED' as OperationCode,
      correlationIdentifier: GenerateCorrelationIdentifier(),
      messageContentLiteral: `Navegación móvil hacia: [${localizedDestinationPathnameLiteral}]`,
      semanticIntentTag: 'UI_NAVIGATION_DRAWER_EXIT',
      contextMetadataSnapshot: {
        destinationPathLiteral: localizedDestinationPathnameLiteral,
        labelLiteral,
      },
    });

    onNavigateAction?.();
  }, [localizedDestinationPathnameLiteral, labelLiteral, onNavigateAction]);

  const linkStylesLiteral = useMemo(
    () =>
      GlobalStyleClassMerger(
        'flex items-center gap-5 p-5 rounded-2xl transition-all group active:scale-[0.98] touch-target-min',
        isLinkActiveBoolean
          ? 'bg-slate-50 text-navy-900 font-black'
          : 'text-slate-600 hover:bg-slate-50 hover:text-navy-900',
      ),
    [isLinkActiveBoolean],
  );

  return (
    <Link
      href={{ pathname: localizedDestinationPathnameLiteral }}
      onClick={handleNavigationTriggerAction}
      aria-current={isLinkActiveBoolean ? 'page' : undefined}
      className={linkStylesLiteral}
    >
      <div
        className={GlobalStyleClassMerger(
          'transition-colors',
          isLinkActiveBoolean ? 'text-amber-500' : 'text-slate-400 group-hover:text-amber-500',
        )}
        aria-hidden="true"
      >
        {iconNode}
      </div>
      <span className="font-bold text-base">{labelLiteral}</span>
    </Link>
  );
};
