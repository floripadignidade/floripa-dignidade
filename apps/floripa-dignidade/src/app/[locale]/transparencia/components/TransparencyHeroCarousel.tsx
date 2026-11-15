'use client';

/**
 * @file apps/floripa-dignidade/src/app/[locale]/transparencia/components/TransparencyHeroCarousel.tsx
 * @section Transparency Gazette UI - Hero News Carousel Organism (Orchestrator)
 * @description Orquestador de primera plana para el Periódico Cívico de Transparencia
 * Activa. Coordina el hook sensorial `useTransparencyHeroCarousel` (rotación cada 5s,
 * pausa WCAG 2.2 SC 2.2.2 y anuncios WAI-ARIA), delegando el renderizado en los átomos
 * `TransparencyHeroCarouselSlide` y `TransparencyHeroCarouselControls`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0035).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 y W3C WCAG 2.2 AAA.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type React from 'react';

import type {
  ITransparencyHeroCarouselI18n,
  ITransparencyNewsArticleI18n,
} from '../i18n/schemas/TransparencyPage.i18n.schema';
import { useTransparencyHeroCarousel } from './hooks/useTransparencyHeroCarousel';
import { TransparencyHeroCarouselControls } from './TransparencyHeroCarouselControls';
import { TransparencyHeroCarouselSlide } from './TransparencyHeroCarouselSlide';

/**
 * @interface ITransparencyHeroCarouselProperties
 * @description Contrato inmutable de propiedades para el carrusel Hero editorial.
 */
export interface ITransparencyHeroCarouselProperties {
  readonly slidesCollection: readonly ITransparencyNewsArticleI18n[];
  readonly carouselDictionary: ITransparencyHeroCarouselI18n;
  readonly activeLocaleLiteral: string;
  readonly statusLabelsDictionary: Readonly<Record<string, string>>;
}

/**
 * Orquestador presentacional y accesible del carrusel Hero de noticias cívicas destacadas.
 *
 * @param propertiesSnapshot - Diapositivas destacadas, diccionario localizado e idioma activo.
 * @returns {React.JSX.Element | null} Región carrusel WAI-ARIA ensamblada o `null` si está vacía.
 */
export const TransparencyHeroCarousel: React.FC<ITransparencyHeroCarouselProperties> = ({
  slidesCollection,
  carouselDictionary,
  activeLocaleLiteral,
  statusLabelsDictionary,
}) => {
  const {
    activeSlideIndexNumeric,
    isManuallyPausedBoolean,
    ariaLiveModeLiteral,
    goToNextSlideAction,
    goToPreviousSlideAction,
    selectSlideAtIndexAction,
    toggleManualPauseAction,
    handlePointerEnterAction,
    handlePointerLeaveAction,
    handleFocusCaptureAction,
    handleBlurCaptureAction,
  } = useTransparencyHeroCarousel({
    totalSlidesCountQuantity: slidesCollection.length,
  });

  if (slidesCollection.length === 0) {
    return null;
  }

  const hasMultipleSlidesBoolean = slidesCollection.length > 1;

  return (
    <section
      role="region"
      aria-roledescription={carouselDictionary.carouselRoleDescriptionLiteral}
      aria-label={carouselDictionary.carouselAriaLabelLiteral}
      aria-live={ariaLiveModeLiteral}
      onPointerEnter={handlePointerEnterAction}
      onPointerLeave={handlePointerLeaveAction}
      onFocusCapture={handleFocusCaptureAction}
      onBlurCapture={handleBlurCaptureAction}
      className="relative w-full min-h-[520px] lg:min-h-[580px] overflow-hidden rounded-[2.5rem] bg-navy-950 text-white shadow-2xl border border-slate-800"
    >
      {slidesCollection.map((slideItemSnapshot, slideIndexNumeric) => (
        <TransparencyHeroCarouselSlide
          key={slideItemSnapshot.articleIdentifier}
          slideItemSnapshot={slideItemSnapshot}
          slideIndexNumeric={slideIndexNumeric}
          totalSlidesCountQuantity={slidesCollection.length}
          isCurrentSlideActiveBoolean={slideIndexNumeric === activeSlideIndexNumeric}
          carouselDictionary={carouselDictionary}
          activeLocaleLiteral={activeLocaleLiteral}
          statusLabelsDictionary={statusLabelsDictionary}
        />
      ))}

      {hasMultipleSlidesBoolean && (
        <TransparencyHeroCarouselControls
          slidesCollection={slidesCollection}
          activeSlideIndexNumeric={activeSlideIndexNumeric}
          isManuallyPausedBoolean={isManuallyPausedBoolean}
          carouselDictionary={carouselDictionary}
          onToggleManualPauseAction={toggleManualPauseAction}
          onGoToPreviousSlideAction={goToPreviousSlideAction}
          onGoToNextSlideAction={goToNextSlideAction}
          onSelectSlideAtIndexAction={selectSlideAtIndexAction}
        />
      )}
    </section>
  );
};
