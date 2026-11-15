'use client';

/**
 * @file apps/floripa-dignidade/src/app/[locale]/transparencia/components/TransparencyHeroCarouselSlide.tsx
 * @section Transparency Gazette UI - Hero Carousel Slide (Atom)
 * @description Renderiza una diapositiva individual del Hero Carrusel editorial con
 * imagen de portada optimizada (AVIF/WebP y prioridad LCP en el índice inicial), velo
 * de contraste WCAG 2.2 Nivel AAA (>= 7:1), soporte para `prefers-reduced-motion`,
 * aislamiento accesible (`inert` / `aria-hidden`) y llamadas a la acción localizadas.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0035).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 y W3C WCAG 2.2 AAA.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

import type {
  ITransparencyHeroCarouselI18n,
  ITransparencyNewsArticleI18n,
} from '../i18n/schemas/TransparencyPage.i18n.schema';
import { TransparencyEditorialStatusBadge } from './TransparencyEditorialStatusBadge';

/**
 * @interface ITransparencyHeroCarouselSlideProperties
 * @description Contrato inmutable de propiedades para una diapositiva del Hero Carrusel.
 */
export interface ITransparencyHeroCarouselSlideProperties {
  readonly slideItemSnapshot: ITransparencyNewsArticleI18n;
  readonly slideIndexNumeric: number;
  readonly totalSlidesCountQuantity: number;
  readonly isCurrentSlideActiveBoolean: boolean;
  readonly carouselDictionary: ITransparencyHeroCarouselI18n;
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
 * Renderiza una diapositiva accesible del carrusel Hero de Transparencia Activa.
 *
 * @param propertiesSnapshot - Datos del boletín, estado activo y diccionario localizado.
 * @returns {React.JSX.Element} Diapositiva semántica con contraste AAA y 120 FPS.
 */
export const TransparencyHeroCarouselSlide: React.FC<ITransparencyHeroCarouselSlideProperties> = ({
  slideItemSnapshot,
  slideIndexNumeric,
  totalSlidesCountQuantity,
  isCurrentSlideActiveBoolean,
  carouselDictionary,
  activeLocaleLiteral,
  statusLabelsDictionary,
}) => {
  const isPrimaryHeroSlideBoolean = slideIndexNumeric === 0;
  const slidePositionLabelLiteral = carouselDictionary.slidePositionTemplateLiteral
    .replace('{current}', String(slideIndexNumeric + 1))
    .replace('{total}', String(totalSlidesCountQuantity));

  const localizedTargetPathnameLiteral = resolveLocalizedTargetHref(
    slideItemSnapshot.targetActionPathLiteral,
    activeLocaleLiteral,
  );

  return (
    <article
      role="group"
      aria-roledescription={carouselDictionary.slideRoleDescriptionLiteral}
      aria-label={slidePositionLabelLiteral}
      aria-hidden={!isCurrentSlideActiveBoolean}
      inert={!isCurrentSlideActiveBoolean ? true : undefined}
      className={`absolute inset-0 transition-opacity duration-700 ease-in-out motion-reduce:transition-none ${
        isCurrentSlideActiveBoolean
          ? 'opacity-100 z-20 pointer-events-auto'
          : 'opacity-0 z-10 pointer-events-none'
      }`}
    >
      {slideItemSnapshot.coverImageUrlLiteral ? (
        <Image
          src={slideItemSnapshot.coverImageUrlLiteral}
          alt={slideItemSnapshot.coverImageAltLiteral ?? slideItemSnapshot.headlineLiteral}
          fill
          loading={isPrimaryHeroSlideBoolean ? 'eager' : 'lazy'}
          fetchPriority={isPrimaryHeroSlideBoolean ? 'high' : 'auto'}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1280px"
          className="object-cover transition-transform duration-1000 scale-100 motion-reduce:transition-none"
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-slate-900"
          aria-hidden="true"
        />
      )}

      <div
        className="absolute inset-0 bg-gradient-to-t from-[#001E3D] via-[#002244]/85 to-[#002244]/65 z-10"
        aria-hidden="true"
      />

      <div className="relative z-20 flex flex-col justify-end p-8 md:p-14 lg:p-16 h-full max-w-4xl">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <TransparencyEditorialStatusBadge
            verificationStatusLiteral={slideItemSnapshot.verificationStatusLiteral}
            statusLabelLiteral={
              statusLabelsDictionary[slideItemSnapshot.verificationStatusLiteral] ??
              slideItemSnapshot.verificationStatusLiteral
            }
          />
          <span className="text-xs font-mono text-slate-300">
            {slideItemSnapshot.publishedDateIsoLiteral} • {slideItemSnapshot.sourceReferenceLiteral}
          </span>
        </div>

        <h2 className="text-2xl md:text-4xl lg:text-5xl font-black font-display tracking-tight text-white mb-4 line-clamp-3 leading-tight">
          {slideItemSnapshot.headlineLiteral}
        </h2>

        <p className="text-sm md:text-base text-slate-200 line-clamp-3 max-w-3xl mb-8 leading-relaxed font-medium">
          {slideItemSnapshot.summaryLiteral}
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={{ pathname: localizedTargetPathnameLiteral }}
            className="min-h-[48px] px-8 py-3.5 rounded-full bg-amber-500 text-navy-950 font-black text-sm uppercase tracking-wider hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 touch-target-min"
          >
            <span>{carouselDictionary.readMoreLabelLiteral}</span>
          </Link>

          <Link
            href={{ pathname: `/${activeLocaleLiteral}/observatorio/gastos-publicos` }}
            className="min-h-[48px] px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm tracking-wide transition-colors flex items-center justify-center gap-2 touch-target-min"
          >
            <ShieldCheck size={18} className="text-amber-400" aria-hidden="true" />
            <span>{carouselDictionary.viewInObservatoryLabelLiteral}</span>
          </Link>
        </div>
      </div>
    </article>
  );
};
