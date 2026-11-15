'use client';

/**
 * @file apps/floripa-dignidade/src/app/[locale]/transparencia/components/SecretariatDeskSection.tsx
 * @section Transparency Gazette UI - Sectoral Secretariat Desks Section (Atom)
 * @description Renderiza los cuadernos periodísticos por secretaría municipal, incluyendo
 * el resumen ejecutivo del período fiscal, el eje prioritario vigilado y las tarjetas de
 * noticias y boletines con insignia documental, fecha, fuente oficial y enlace directo.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0035).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 y W3C WCAG 2.2 AAA.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type React from 'react';
import { useCallback, useId } from 'react';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, FileCheck } from 'lucide-react';

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
} from '@floripa-dignidade/telemetry';

import type { ISecretariatDeskI18n } from '../i18n/schemas/TransparencyPage.i18n.schema';
import { TransparencyEditorialStatusBadge } from './TransparencyEditorialStatusBadge';

const DESK_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'SECRETARIAT_DESK_SECTION_ATOM',
);

const ARTICLE_CLICK_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'SECRETARIAT_ARTICLE_LINK_CLICKED',
);

export interface ISecretariatDeskSectionProperties {
  readonly displayedSecretariatsCollection: readonly ISecretariatDeskI18n[];
  readonly summaryHeadingLiteral: string;
  readonly sourcePrefixLiteral: string;
  readonly activeLocaleLiteral: string;
  readonly statusLabelsDictionary: Readonly<Record<string, string>>;
}

const resolveLocalizedTargetHref = (
  rawPathLiteral: string,
  activeLocaleLiteral: string,
): string => {
  const trimmedPathLiteral = rawPathLiteral.trim();
  if (trimmedPathLiteral === '' || trimmedPathLiteral === '/') {
    return `/${activeLocaleLiteral}`;
  }
  if (trimmedPathLiteral.startsWith(`/${activeLocaleLiteral}`)) {
    return trimmedPathLiteral;
  }
  return `/${activeLocaleLiteral}${trimmedPathLiteral.startsWith('/') ? trimmedPathLiteral : `/${trimmedPathLiteral}`}`;
};

/**
 * Renderiza los cuadernos sectoriales con resumen ejecutivo y boletines verificados.
 */
export const SecretariatDeskSection: React.FC<ISecretariatDeskSectionProperties> = ({
  displayedSecretariatsCollection,
  summaryHeadingLiteral,
  sourcePrefixLiteral,
  activeLocaleLiteral,
  statusLabelsDictionary,
}) => {
  const instanceIdentifier = useId();

  const handleArticleClickAction = useCallback(
    (articleIdentifier: string, destinationPathLiteral: string): void => {
      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: 'INFO',
        moduleIdentifierLiteral: DESK_MODULE_IDENTIFIER,
        operationCodeLiteral: ARTICLE_CLICK_OPERATION_CODE,
        correlationIdentifier: GenerateCorrelationIdentifier(),
        messageContentLiteral: `Ciudadano accedió al boletín [${articleIdentifier}] -> [${destinationPathLiteral}].`,
        semanticIntentTag: 'UI_CIVIC_ARTICLE_NAVIGATION',
        contextMetadataSnapshot: Object.freeze({
          articleIdentifier,
          destinationPathLiteral,
        }),
      });
    },
    [],
  );

  return (
    <div className="w-full flex flex-col gap-16 lg:gap-24 my-12">
      {displayedSecretariatsCollection.map((secretariatSnapshot) => {
        const secretariatHeadingIdentifier = `desk-heading-${secretariatSnapshot.secretariatIdentifier}-${instanceIdentifier}`;

        return (
          <section
            key={secretariatSnapshot.secretariatIdentifier}
            aria-labelledby={secretariatHeadingIdentifier}
            className="w-full flex flex-col gap-8 pb-12 border-b border-slate-200 last:border-b-0"
          >
            <header className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3.5 py-1 rounded-full bg-navy-50 text-navy-900 border border-navy-100 text-xs font-black uppercase tracking-wider">
                  {secretariatSnapshot.keyFocusAreaLiteral}
                </span>
              </div>

              <h2
                id={secretariatHeadingIdentifier}
                className="text-3xl lg:text-4xl font-black font-display text-navy-950 tracking-tight"
              >
                {secretariatSnapshot.secretariatNameLiteral}
              </h2>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed font-medium">
                <p className="text-xs font-black uppercase tracking-wider text-navy-900 mb-1 flex items-center gap-2">
                  <BookOpen size={16} className="text-amber-500" aria-hidden="true" />
                  <span>{summaryHeadingLiteral}</span>
                </p>
                <p className="text-sm lg:text-base m-0 text-slate-700">
                  {secretariatSnapshot.executiveSummaryLiteral}
                </p>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {secretariatSnapshot.articlesCollection.map((articleSnapshot) => {
                const localizedTargetHref = resolveLocalizedTargetHref(
                  articleSnapshot.targetActionPathLiteral,
                  activeLocaleLiteral,
                );

                return (
                  <article
                    key={articleSnapshot.articleIdentifier}
                    className="p-8 rounded-[2rem] bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <TransparencyEditorialStatusBadge
                          verificationStatusLiteral={articleSnapshot.verificationStatusLiteral}
                          statusLabelLiteral={
                            statusLabelsDictionary[articleSnapshot.verificationStatusLiteral] ??
                            articleSnapshot.verificationStatusLiteral
                          }
                        />
                        <span className="text-xs font-mono text-slate-400">
                          {articleSnapshot.publishedDateIsoLiteral}
                        </span>
                      </div>

                      <h3 className="text-xl lg:text-2xl font-black text-navy-900 tracking-tight leading-tight mb-3 group-hover:text-amber-600 transition-colors">
                        {articleSnapshot.headlineLiteral}
                      </h3>

                      <p className="text-sm text-slate-600 leading-relaxed font-medium mb-6 line-clamp-3">
                        {articleSnapshot.summaryLiteral}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                      <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5 truncate">
                        <FileCheck
                          size={14}
                          className="text-slate-400 flex-shrink-0"
                          aria-hidden="true"
                        />
                        <span className="truncate">
                          {sourcePrefixLiteral} {articleSnapshot.sourceReferenceLiteral}
                        </span>
                      </span>

                      <Link
                        href={{ pathname: localizedTargetHref }}
                        onClick={() =>
                          handleArticleClickAction(
                            articleSnapshot.articleIdentifier,
                            localizedTargetHref,
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider text-navy-900 bg-slate-100 hover:bg-amber-500 hover:text-navy-950 transition-colors flex-shrink-0 touch-target-min"
                      >
                        <span>Acessar</span>
                        <ArrowUpRight size={14} aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};
