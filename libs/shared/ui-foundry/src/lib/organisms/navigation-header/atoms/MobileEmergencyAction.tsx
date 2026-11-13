'use client';

/**
 * @section Shared UI Foundry - Mobile Emergency Action (Atom)
 * @description Átomo de alta jerarquía visual diseñado para el acceso inmediato al
 * canal de denuncias ciudadanas desde la navegación móvil. Preserva el idioma BCP 47
 * activo, cumple con Next.js 16 `typedRoutes: true` mediante `UrlObject`, respeta
 * semántica WAI-ARIA/WCAG 2.2 y emite telemetría conforme a `TelemetrySignalSchema`.
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
import { ShieldCheck } from 'lucide-react';
import { z } from 'zod';

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

import { ResolveLocalizedNavigationPath } from '../logic/ResolveLocalizedNavigationPath';

/**
 * @name MobileEmergencyActionPropertiesSchema
 * @description Contrato Zod inmutable para validar las propiedades de entrada del botón de auxilio.
 */
export const MobileEmergencyActionPropertiesSchema = z
  .object({
    /** Etiqueta textual localizada para la acción de emergencia. */
    labelLiteral: z.string().trim().min(1),
    /** Ruta destino relativa al dominio institucional (por defecto `/denuncia`). */
    hrefLiteral: z.string().trim().min(1).default('/denuncia'),
    /** Identificador forense para trazabilidad telemétrica de conversión cívica. */
    actionIdentifierLiteral: z.string().trim().min(1).default('MOBILE_EMERGENCY_TRIGGER'),
  })
  .readonly();

export type IMobileEmergencyActionProperties = z.input<
  typeof MobileEmergencyActionPropertiesSchema
>;

const ATOM_MODULE_IDENTIFIER = 'MOBILE_EMERGENCY_ACTION_ATOM' as ModuleIdentifier;

/**
 * Renderiza el acceso prioritario al canal de denuncias con área táctil mínima WCAG (44x44px).
 *
 * @param propertiesSnapshot - Etiqueta localizada e identificadores de acción opcionales.
 * @returns {React.ReactElement} Enlace de acción prioritaria accesible y auditado.
 */
export const MobileEmergencyAction: React.FC<IMobileEmergencyActionProperties> = (
  propertiesSnapshot,
) => {
  const validatedPropertiesSnapshot =
    MobileEmergencyActionPropertiesSchema.parse(propertiesSnapshot);

  const { labelLiteral, hrefLiteral, actionIdentifierLiteral } = validatedPropertiesSnapshot;
  const currentPathnameLiteral = usePathname();

  const localizedDestinationPathnameLiteral = useMemo(
    () => ResolveLocalizedNavigationPath(hrefLiteral, currentPathnameLiteral),
    [hrefLiteral, currentPathnameLiteral],
  );

  const handleEmergencyTriggerAction = useCallback((): void => {
    const occurrenceTimestampISO = new Date().toISOString();

    void EmitTelemetrySignal({
      occurrenceTimestampISO,
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: ATOM_MODULE_IDENTIFIER,
      operationCodeLiteral: 'EMERGENCY_CHANNEL_ACTIVATED' as OperationCode,
      correlationIdentifier: GenerateCorrelationIdentifier(),
      messageContentLiteral: `Activación del canal de denuncias desde el menú móvil: [${labelLiteral}].`,
      semanticIntentTag: 'HUMAN_RIGHTS_CONVERSION',
      contextMetadataSnapshot: {
        actionIdentifierLiteral,
        destinationPathnameLiteral: localizedDestinationPathnameLiteral,
        occurrenceTimestampISO,
      },
    });
  }, [labelLiteral, actionIdentifierLiteral, localizedDestinationPathnameLiteral]);

  return (
    <Link
      href={{ pathname: localizedDestinationPathnameLiteral }}
      onClick={handleEmergencyTriggerAction}
      className="mt-4 flex items-center justify-between p-5 rounded-2xl bg-red-50 text-red-700 border border-red-100 active:scale-95 transition-all group touch-target-min"
      aria-label={labelLiteral}
    >
      <div className="flex items-center gap-4">
        <ShieldCheck
          size={24}
          className="group-hover:animate-pulse transition-transform group-hover:scale-110"
          aria-hidden="true"
        />
        <span className="font-black text-sm uppercase tracking-wider">{labelLiteral}</span>
      </div>
    </Link>
  );
};
