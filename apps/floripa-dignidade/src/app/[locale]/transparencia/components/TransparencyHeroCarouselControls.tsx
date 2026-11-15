'use client';

/**
 * @file apps/floripa-dignidade/src/app/[locale]/transparencia/components/TransparencyHeroCarouselControls.tsx
 * @section Transparency Gazette UI - Hero Carousel Controls (Atom)
 * @description Renderiza los controles de navegación lateral, el botón de pausa
 * obligatoria (WCAG 2.2 SC 2.2.2) y el grupo de indicadores de posición WAI-ARIA para
 * el carrusel Hero editorial, con áreas táctiles >= 44x44px / 48x48px y soporte de
 * movimiento reducido (`prefers-reduced-motion`).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0035).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 y W3C WCAG 2.2 AAA.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type React from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

import type {
  ITransparencyHeroCarouselI18n,
  ITransparencyNewsArticleI18n,
} from '../i18n/schemas/TransparencyPage.i18n.schema';

const LATERAL_CONTROL_BUTTON_CLASSES_LITERAL =
  'min-w-[48px] min-h-[48px] p-3 rounded-full bg-navy-900/80 hover:bg-navy-900 text-white border border-white/20 backdrop-blur-md transition-colors motion-reduce:transition-none touch-target-min flex items-center justify-center';

/**
 * @interface ITransparencyHeroCarouselControlsProperties
 * @description Contrato inmutable de propiedades para los controles e indicadores del carrusel.
 */
export interface ITransparencyHeroCarouselControlsProperties {
  readonly slidesCollection: readonly ITransparencyNewsArticleI18n[];
  readonly activeSlideIndexNumeric: number;
  readonly isManuallyPausedBoolean: boolean;
  readonly carouselDictionary: ITransparencyHeroCarouselI18n;
  readonly onToggleManualPauseAction: () => void;
  readonly onGoToPreviousSlideAction: () => void;
  readonly onGoToNextSlideAction: () => void;
  readonly onSelectSlideAtIndexAction: (targetIndexNumeric: number) => void;
}

/**
 * Renderiza la botonera accesible de reproducción e indicadores circulares de posición.
 *
 * @param propertiesSnapshot - Estado activo del carrusel, diccionario y manejadores de acción.
 * @returns {React.JSX.Element} Controles superiores e indicadores inferiores WAI-ARIA.
 */
export const TransparencyHeroCarouselControls: React.FC<
  ITransparencyHeroCarouselControlsProperties
> = ({
  slidesCollection,
  activeSlideIndexNumeric,
  isManuallyPausedBoolean,
  carouselDictionary,
  onToggleManualPauseAction,
  onGoToPreviousSlideAction,
  onGoToNextSlideAction,
  onSelectSlideAtIndexAction,
}) => {
  const pauseToggleAriaLabelLiteral = isManuallyPausedBoolean
    ? carouselDictionary.resumeRotationLabelLiteral
    : carouselDictionary.pauseRotationLabelLiteral;

  return (
    <>
      <div className="absolute top-6 right-6 z-30 flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleManualPauseAction}
          aria-label={pauseToggleAriaLabelLiteral}
          className={LATERAL_CONTROL_BUTTON_CLASSES_LITERAL}
        >
          {isManuallyPausedBoolean ? (
            <Play size={18} aria-hidden="true" />
          ) : (
            <Pause size={18} aria-hidden="true" />
          )}
        </button>

        <button
          type="button"
          onClick={onGoToPreviousSlideAction}
          aria-label={carouselDictionary.previousSlideLabelLiteral}
          className={LATERAL_CONTROL_BUTTON_CLASSES_LITERAL}
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onGoToNextSlideAction}
          aria-label={carouselDictionary.nextSlideLabelLiteral}
          className={LATERAL_CONTROL_BUTTON_CLASSES_LITERAL}
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>

      <div
        role="group"
        aria-label={carouselDictionary.dotNavigationAriaLabelLiteral}
        className="absolute bottom-6 right-6 z-30 flex items-center gap-2"
      >
        {slidesCollection.map((slideItemSnapshot, dotIndexNumeric) => {
          const isDotActiveBoolean = dotIndexNumeric === activeSlideIndexNumeric;
          const dotPositionLabelLiteral = carouselDictionary.slidePositionTemplateLiteral
            .replace('{current}', String(dotIndexNumeric + 1))
            .replace('{total}', String(slidesCollection.length));

          return (
            <button
              key={slideItemSnapshot.articleIdentifier}
              type="button"
              onClick={() => onSelectSlideAtIndexAction(dotIndexNumeric)}
              aria-label={dotPositionLabelLiteral}
              aria-current={isDotActiveBoolean ? 'true' : undefined}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-all motion-reduce:transition-none touch-target-min ${
                isDotActiveBoolean ? 'text-amber-500' : 'text-white/50 hover:text-white'
              }`}
            >
              <span
                className={`h-2.5 rounded-full transition-all motion-reduce:transition-none ${
                  isDotActiveBoolean ? 'w-8 bg-amber-500' : 'w-2.5 bg-white/40'
                }`}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    </>
  );
};
