/**
 * @file apps/floripa-dignidade/src/app/[locale]/transparencia/logic/fallbacks/FallbackArticleSpecifications.ts
 * @section Transparency Gazette - In-Memory Fallback Specifications (Atom)
 * @description Constantes estructurales inmutables compartidas por los respaldos de idiomas
 * (fechas ISO, identificadores técnicos y rutas) para evitar duplicación de literales.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { TEditorialVerificationStatus } from '../../i18n/schemas/TransparencyPage.i18n.schema';

export interface IFallbackArticleSpecificationItem {
  readonly articleIdentifier: string;
  readonly secretariatIdentifier: string;
  readonly publishedDateIsoLiteral: string;
  readonly verificationStatusLiteral: TEditorialVerificationStatus;
  readonly targetActionPathLiteral: string;
}

/**
 * @name FALLBACK_ARTICLE_SPECIFICATIONS
 * @description Especificaciones inmutables compartidas para los artículos de respaldo.
 */
export const FALLBACK_ARTICLE_SPECIFICATIONS: Readonly<
  Record<string, IFallbackArticleSpecificationItem>
> = Object.freeze({
  lead: {
    articleIdentifier: 'lead-passarela-acolhimento-2026',
    secretariatIdentifier: 'SOCIAL_ASSISTANCE',
    publishedDateIsoLiteral: '2026-11-12',
    verificationStatusLiteral: 'VERIFIED_AUDIT',
    targetActionPathLiteral: '/observatorio/gastos-publicos',
  },
  social: {
    articleIdentifier: 'soc-acolhimento-inverno-2026',
    secretariatIdentifier: 'SOCIAL_ASSISTANCE',
    publishedDateIsoLiteral: '2026-11-10',
    verificationStatusLiteral: 'VERIFIED_AUDIT',
    targetActionPathLiteral: '/observatorio/gastos-publicos',
  },
  health: {
    articleIdentifier: 'sau-consultorio-rua-2026',
    secretariatIdentifier: 'PUBLIC_HEALTH',
    publishedDateIsoLiteral: '2026-11-09',
    verificationStatusLiteral: 'VERIFIED_AUDIT',
    targetActionPathLiteral: '/observatorio/gastos-publicos',
  },
  infrastructure: {
    articleIdentifier: 'inf-agua-pontos-criticos-2026',
    secretariatIdentifier: 'INFRASTRUCTURE_SANITATION',
    publishedDateIsoLiteral: '2026-11-02',
    verificationStatusLiteral: 'CRITICAL_ALERT',
    targetActionPathLiteral: '/denuncia',
  },
});
