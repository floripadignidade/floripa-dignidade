'use client';

/**
 * @file apps/floripa-dignidade/src/app/[locale]/transparencia/components/hooks/useTransparencyHeroCarousel.ts
 * @section Transparency Gazette Hooks - Hero Carousel Sensory Hook (Atom)
 * @description Hook sensorial puro que orquesta el ciclo de rotación accesible del Hero
 * Carrusel editorial, pausa ante interacciones físicas y visibilidad (WCAG 2.2 SC 2.2.2)
 * y conmutación de anuncios en vivo WAI-ARIA delegando lógica en TransparencyHeroCarouselLogic.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0035).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 y W3C WCAG 2.2 AAA.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  EmitHeroCarouselInteractionTelemetry,
  EvaluateHeroCarouselAutoplayActive,
  HERO_CAROUSEL_AUTOPLAY_INTERVAL_IN_MILLISECONDS_QUANTITY,
  type ITransparencyHeroCarouselParameters,
  ResolveSafeCarouselSlideIndex,
  ResolveSafeHeroCarouselParameters,
  type TAriaLiveMode,
  type TCarouselTransitionDirection,
  TransparencyHeroCarouselParametersSchema as UseTransparencyHeroCarouselParametersSchema,
} from '../../logic/TransparencyHeroCarouselLogic';

export {
  HERO_CAROUSEL_AUTOPLAY_INTERVAL_IN_MILLISECONDS_QUANTITY,
  UseTransparencyHeroCarouselParametersSchema,
  type ITransparencyHeroCarouselParameters,
  type ITransparencyHeroCarouselParameters as IUseTransparencyHeroCarouselParameters,
  type TAriaLiveMode,
  type TCarouselTransitionDirection,
};

export interface IUseTransparencyHeroCarouselResult {
  readonly activeSlideIndexNumeric: number;
  readonly isManuallyPausedBoolean: boolean;
  readonly isAutoplayActiveBoolean: boolean;
  readonly isReducedMotionPreferredBoolean: boolean;
  readonly shouldAnimateSlideMotionBoolean: boolean;
  readonly transitionDirectionLiteral: TCarouselTransitionDirection;
  readonly ariaLiveModeLiteral: TAriaLiveMode;
  readonly goToNextSlideAction: () => void;
  readonly goToPreviousSlideAction: () => void;
  readonly selectSlideAtIndexAction: (targetIndexNumeric: number) => void;
  readonly toggleManualPauseAction: () => void;
  readonly handlePointerEnterAction: () => void;
  readonly handlePointerLeaveAction: () => void;
  readonly handleFocusCaptureAction: () => void;
  readonly handleBlurCaptureAction: (focusEvent: React.FocusEvent<HTMLElement>) => void;
}

/**
 * Orquesta el ciclo de rotación accesible del Hero Carrusel de Transparencia Activa.
 */
export const useTransparencyHeroCarousel = (
  parametersSnapshot: ITransparencyHeroCarouselParameters,
): IUseTransparencyHeroCarouselResult => {
  const { totalSlidesCountQuantity, autoplayIntervalInMillisecondsQuantity } = useMemo(
    () =>
      ResolveSafeHeroCarouselParameters(
        parametersSnapshot.totalSlidesCountQuantity,
        parametersSnapshot.autoplayIntervalInMillisecondsQuantity,
      ),
    [
      parametersSnapshot.totalSlidesCountQuantity,
      parametersSnapshot.autoplayIntervalInMillisecondsQuantity,
    ],
  );

  const [rawSlideIndexNumeric, setRawSlideIndexNumeric] = useState(0);
  const [transitionDirectionLiteral, setTransitionDirectionLiteral] =
    useState<TCarouselTransitionDirection>('FORWARD');
  const [isManualAnnouncementBoolean, setIsManualAnnouncementBoolean] = useState(false);
  const [isManuallyPausedBoolean, setIsManuallyPausedBoolean] = useState(false);
  const [isPointerHoveredBoolean, setIsPointerHoveredBoolean] = useState(false);
  const [isFocusWithinBoolean, setIsFocusWithinBoolean] = useState(false);
  const [isReducedMotionPreferredBoolean, setIsReducedMotionPreferredBoolean] = useState(false);
  const [isDocumentHiddenBoolean, setIsDocumentHiddenBoolean] = useState(false);

  const activeSlideIndexNumeric = ResolveSafeCarouselSlideIndex(
    rawSlideIndexNumeric,
    totalSlidesCountQuantity,
  );

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotionPreferredBoolean(query.matches);
    const onChange = (event: MediaQueryListEvent) =>
      setIsReducedMotionPreferredBoolean(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    setIsDocumentHiddenBoolean(document.visibilityState === 'hidden');
    const onVisibility = () => setIsDocumentHiddenBoolean(document.visibilityState === 'hidden');
    document.addEventListener('visibilitychange', onVisibility, { passive: true });
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const isAutoplayActiveBoolean = EvaluateHeroCarouselAutoplayActive(
    totalSlidesCountQuantity,
    isManuallyPausedBoolean || isReducedMotionPreferredBoolean,
    isPointerHoveredBoolean,
    isFocusWithinBoolean,
    isDocumentHiddenBoolean,
  );

  useEffect(() => {
    if (!isAutoplayActiveBoolean) return;
    const timer = setTimeout(() => {
      setIsManualAnnouncementBoolean(false);
      setTransitionDirectionLiteral('FORWARD');
      setRawSlideIndexNumeric((activeSlideIndexNumeric + 1) % totalSlidesCountQuantity);
    }, autoplayIntervalInMillisecondsQuantity);
    return () => clearTimeout(timer);
  }, [
    isAutoplayActiveBoolean,
    activeSlideIndexNumeric,
    totalSlidesCountQuantity,
    autoplayIntervalInMillisecondsQuantity,
  ]);

  const navigateToSlideAction = useCallback(
    (targetIndex: number, direction: TCarouselTransitionDirection, actionTag: string) => {
      const safeIndex = ResolveSafeCarouselSlideIndex(targetIndex, totalSlidesCountQuantity);
      setTransitionDirectionLiteral(direction);
      setIsManualAnnouncementBoolean(true);
      setRawSlideIndexNumeric(safeIndex);
      EmitHeroCarouselInteractionTelemetry(actionTag, safeIndex);
    },
    [totalSlidesCountQuantity],
  );

  const goToNextSlideAction = useCallback(() => {
    if (totalSlidesCountQuantity > 1) {
      navigateToSlideAction(
        (activeSlideIndexNumeric + 1) % totalSlidesCountQuantity,
        'FORWARD',
        'NEXT_SLIDE',
      );
    }
  }, [activeSlideIndexNumeric, totalSlidesCountQuantity, navigateToSlideAction]);

  const goToPreviousSlideAction = useCallback(() => {
    if (totalSlidesCountQuantity > 1) {
      navigateToSlideAction(
        (activeSlideIndexNumeric - 1 + totalSlidesCountQuantity) % totalSlidesCountQuantity,
        'BACKWARD',
        'PREVIOUS_SLIDE',
      );
    }
  }, [activeSlideIndexNumeric, totalSlidesCountQuantity, navigateToSlideAction]);

  const selectSlideAtIndexAction = useCallback(
    (targetIndex: number) => {
      if (totalSlidesCountQuantity > 0) {
        const floored = Math.floor(targetIndex);
        navigateToSlideAction(
          floored,
          floored >= activeSlideIndexNumeric ? 'FORWARD' : 'BACKWARD',
          'SELECT_DOT',
        );
      }
    },
    [activeSlideIndexNumeric, totalSlidesCountQuantity, navigateToSlideAction],
  );

  const toggleManualPauseAction = useCallback(() => {
    const willBePausedBoolean = !isManuallyPausedBoolean;
    setIsManuallyPausedBoolean(willBePausedBoolean);
    if (!willBePausedBoolean) setIsManualAnnouncementBoolean(false);
    EmitHeroCarouselInteractionTelemetry(
      willBePausedBoolean ? 'PAUSE_ROTATION' : 'RESUME_ROTATION',
      activeSlideIndexNumeric,
    );
  }, [isManuallyPausedBoolean, activeSlideIndexNumeric]);

  const handlePointerEnterAction = useCallback(() => setIsPointerHoveredBoolean(true), []);
  const handlePointerLeaveAction = useCallback(() => setIsPointerHoveredBoolean(false), []);
  const handleFocusCaptureAction = useCallback(() => setIsFocusWithinBoolean(true), []);
  const handleBlurCaptureAction = useCallback((event: React.FocusEvent<HTMLElement>) => {
    const nextTarget = event.relatedTarget;
    if (!(nextTarget instanceof Node && event.currentTarget.contains(nextTarget))) {
      setIsFocusWithinBoolean(false);
    }
  }, []);

  return useMemo(
    () => ({
      activeSlideIndexNumeric,
      isManuallyPausedBoolean,
      isAutoplayActiveBoolean,
      isReducedMotionPreferredBoolean,
      shouldAnimateSlideMotionBoolean: !isReducedMotionPreferredBoolean,
      transitionDirectionLiteral,
      ariaLiveModeLiteral: isManualAnnouncementBoolean ? 'polite' : 'off',
      goToNextSlideAction,
      goToPreviousSlideAction,
      selectSlideAtIndexAction,
      toggleManualPauseAction,
      handlePointerEnterAction,
      handlePointerLeaveAction,
      handleFocusCaptureAction,
      handleBlurCaptureAction,
    }),
    [
      activeSlideIndexNumeric,
      isManuallyPausedBoolean,
      isAutoplayActiveBoolean,
      isReducedMotionPreferredBoolean,
      transitionDirectionLiteral,
      isManualAnnouncementBoolean,
      goToNextSlideAction,
      goToPreviousSlideAction,
      selectSlideAtIndexAction,
      toggleManualPauseAction,
      handlePointerEnterAction,
      handlePointerLeaveAction,
      handleFocusCaptureAction,
      handleBlurCaptureAction,
    ],
  );
};
