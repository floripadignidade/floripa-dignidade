/**
 * @file apps/floripa-dignidade/src/app/[locale]/transparencia/components/TransparencyEditorialStatusBadge.tsx
 * @section Transparency Gazette UI - Editorial Status Badge (Atom)
 * @description Insignia visual accesible que representa el estado de verificación
 * documental de cada boletín periodístico (`VERIFIED_AUDIT`, `MONITORING_ACTIVE`,
 * `CRITICAL_ALERT`) cumpliendo con ratios de contraste WCAG 2.2 Nivel AAA.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0029).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 y W3C WCAG 2.2 AAA.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';
import { AlertTriangle, CheckCircle2, Eye } from 'lucide-react';

import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';

import type { TEditorialVerificationStatus } from '../i18n/schemas/TransparencyPage.i18n.schema';

interface IStatusPresentationDescriptor {
  readonly containerStylesLiteral: string;
  readonly iconNode: React.ReactNode;
}

/**
 * @interface ITransparencyEditorialStatusBadgeProperties
 * @description Contrato inmutable de propiedades para la insignia de verificación editorial.
 */
export interface ITransparencyEditorialStatusBadgeProperties {
  readonly verificationStatusLiteral: TEditorialVerificationStatus;
  readonly statusLabelLiteral: string;
  readonly externalClassName?: string;
}

const STATUS_PRESENTATION_MAPPING: Readonly<
  Record<TEditorialVerificationStatus, IStatusPresentationDescriptor>
> = Object.freeze({
  VERIFIED_AUDIT: {
    containerStylesLiteral: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    iconNode: <CheckCircle2 size={14} className="text-emerald-700" aria-hidden="true" />,
  },
  MONITORING_ACTIVE: {
    containerStylesLiteral: 'bg-amber-50 text-navy-950 border-amber-300',
    iconNode: <Eye size={14} className="text-amber-700" aria-hidden="true" />,
  },
  CRITICAL_ALERT: {
    containerStylesLiteral: 'bg-red-50 text-red-900 border-red-200',
    iconNode: <AlertTriangle size={14} className="text-status-error" aria-hidden="true" />,
  },
});

/**
 * Renderiza la insignia de estado de auditoría documental con contraste AAA garantizado.
 *
 * @param propertiesSnapshot - Estado editorial, etiqueta localizada y clases opcionales.
 * @returns {React.ReactElement} Insignia visual semántica y accesible.
 */
export const TransparencyEditorialStatusBadge: React.FC<
  ITransparencyEditorialStatusBadgeProperties
> = ({ verificationStatusLiteral, statusLabelLiteral, externalClassName }) => {
  const presentationSnapshot = STATUS_PRESENTATION_MAPPING[verificationStatusLiteral];

  return (
    <span
      className={GlobalStyleClassMerger(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-extrabold tracking-wide',
        presentationSnapshot.containerStylesLiteral,
        externalClassName,
      )}
    >
      {presentationSnapshot.iconNode}
      <span>{statusLabelLiteral}</span>
    </span>
  );
};
