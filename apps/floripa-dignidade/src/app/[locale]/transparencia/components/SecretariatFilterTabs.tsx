'use client';

/**
 * @file apps/floripa-dignidade/src/app/[locale]/transparencia/components/SecretariatFilterTabs.tsx
 * @section Transparency Gazette UI - Secretariat Filter Tabs (Atom)
 * @description Barra interactiva accesible de filtrado por secretaría municipal para el
 * Periódico de Transparencia Activa. Permite conmutar sin recarga de página (CLS = 0)
 * entre todos los cuadernos o una cartera específica, emitiendo telemetría SRE.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0035).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 y W3C WCAG 2.2 AAA.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type React from 'react';
import { useCallback, useId } from 'react';

import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
} from '@floripa-dignidade/telemetry';

import type { ISecretariatDeskI18n } from '../i18n/schemas/TransparencyPage.i18n.schema';

export const ALL_SECRETARIATS_FILTER_IDENTIFIER = 'ALL';

const FILTER_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'SECRETARIAT_FILTER_TABS_ATOM',
);

const FILTER_INTERACTION_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'SECRETARIAT_FILTER_SELECTED',
);

export interface ISecretariatFilterTabsProperties {
  readonly secretariatsCollection: readonly ISecretariatDeskI18n[];
  readonly activeSecretariatIdentifier: string;
  readonly allSecretariatsLabelLiteral: string;
  readonly filterHeadingLiteral: string;
  readonly totalArticlesCountQuantity: number;
  readonly articlesCountSuffixLiteral: string;
  readonly onSelectSecretariatAction: (selectedIdentifierLiteral: string) => void;
  readonly externalClassName?: string;
}

/**
 * Barra de pestañas interactiva y accesible para segmentar el periódico cívico.
 */
export const SecretariatFilterTabs: React.FC<ISecretariatFilterTabsProperties> = ({
  secretariatsCollection,
  activeSecretariatIdentifier,
  allSecretariatsLabelLiteral,
  filterHeadingLiteral,
  totalArticlesCountQuantity,
  articlesCountSuffixLiteral,
  onSelectSecretariatAction,
  externalClassName,
}) => {
  const componentInstanceIdentifier = useId();
  const isAllSelectedBoolean = activeSecretariatIdentifier === ALL_SECRETARIATS_FILTER_IDENTIFIER;

  const handleTabSelectAction = useCallback(
    (selectedIdentifierLiteral: string): void => {
      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: 'INFO',
        moduleIdentifierLiteral: FILTER_MODULE_IDENTIFIER,
        operationCodeLiteral: FILTER_INTERACTION_OPERATION_CODE,
        correlationIdentifier: GenerateCorrelationIdentifier(),
        messageContentLiteral: `Filtro de secretaría seleccionado en periódico cívico: [${selectedIdentifierLiteral}].`,
        semanticIntentTag: 'UI_FILTER_INTERACTION',
        contextMetadataSnapshot: Object.freeze({ selectedIdentifierLiteral }),
      });

      onSelectSecretariatAction(selectedIdentifierLiteral);
    },
    [onSelectSecretariatAction],
  );

  return (
    <nav
      aria-label={filterHeadingLiteral}
      className={GlobalStyleClassMerger(
        'w-full sticky top-20 z-30 py-4 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all',
        externalClassName,
      )}
    >
      <div className="container mx-auto px-4">
        <div
          role="tablist"
          aria-label={filterHeadingLiteral}
          className="flex items-center gap-3 overflow-x-auto scrollbar-none py-1"
        >
          <button
            type="button"
            role="tab"
            id={`tab-all-${componentInstanceIdentifier}`}
            aria-selected={isAllSelectedBoolean}
            tabIndex={isAllSelectedBoolean ? 0 : -1}
            onClick={() => handleTabSelectAction(ALL_SECRETARIATS_FILTER_IDENTIFIER)}
            className={GlobalStyleClassMerger(
              'min-h-[44px] px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2.5 touch-target-min transition-all duration-300 flex-shrink-0 active:scale-95 border',
              isAllSelectedBoolean
                ? 'bg-navy-900 text-white border-navy-900 shadow-md'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-navy-900 border-slate-200',
            )}
          >
            <span>{allSecretariatsLabelLiteral}</span>
            <span
              className={GlobalStyleClassMerger(
                'px-2 py-0.5 rounded-full text-[11px] font-bold font-mono transition-colors',
                isAllSelectedBoolean ? 'bg-amber-500 text-navy-950' : 'bg-slate-200 text-slate-600',
              )}
            >
              {totalArticlesCountQuantity}
            </span>
          </button>

          {secretariatsCollection.map((secretariatSnapshot) => {
            const isTabActiveBoolean =
              activeSecretariatIdentifier === secretariatSnapshot.secretariatIdentifier;
            const articlesQuantity = secretariatSnapshot.articlesCollection.length;

            return (
              <button
                key={secretariatSnapshot.secretariatIdentifier}
                type="button"
                role="tab"
                id={`tab-${secretariatSnapshot.secretariatIdentifier}-${componentInstanceIdentifier}`}
                aria-selected={isTabActiveBoolean}
                tabIndex={isTabActiveBoolean ? 0 : -1}
                onClick={() => handleTabSelectAction(secretariatSnapshot.secretariatIdentifier)}
                className={GlobalStyleClassMerger(
                  'min-h-[44px] px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2.5 touch-target-min transition-all duration-300 flex-shrink-0 active:scale-95 border',
                  isTabActiveBoolean
                    ? 'bg-navy-900 text-white border-navy-900 shadow-md'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-navy-900 border-slate-200',
                )}
              >
                <span>{secretariatSnapshot.secretariatNameLiteral}</span>
                <span
                  title={`${articlesQuantity} ${articlesCountSuffixLiteral}`}
                  className={GlobalStyleClassMerger(
                    'px-2 py-0.5 rounded-full text-[11px] font-bold font-mono transition-colors',
                    isTabActiveBoolean
                      ? 'bg-amber-500 text-navy-950'
                      : 'bg-slate-200 text-slate-600',
                  )}
                >
                  {articlesQuantity}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
