/**
 * @file apps/floripa-dignidade/src/app/[locale]/transparencia/logic/TransparencyHeroCarouselLogic.ts
 * @section Transparency Gazette Logic - Hero Carousel Pure Logic & Telemetry (Atom)
 * @description Átomo de lógica pura encargado de validar mediante Zod las opciones del
 * carrusel Hero editorial (`>= 4000 ms` según ADR 0035), acotar índices de diapositiva,
 * evaluar deterministamente el estado activo de rotación y emitir telemetría SRE.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0035).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 y W3C WCAG 2.2 AAA.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
} from '@floripa-dignidade/telemetry';

/** Duración canónica de cada diapositiva en rotación automática según ADR 0035 (5 segundos). */
export const HERO_CAROUSEL_AUTOPLAY_INTERVAL_IN_MILLISECONDS_QUANTITY = 5000;

const CAROUSEL_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'TRANSPARENCY_HERO_CAROUSEL_HOOK',
);

const CAROUSEL_INTERACTION_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'TRANSPARENCY_HERO_CAROUSEL_INTERACTION',
);

const CAROUSEL_FALLBACK_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'TRANSPARENCY_HERO_CAROUSEL_PARAMETERS_FALLBACK',
);

/** Dirección visual de transición aplicada por el carrusel (120 FPS GPU). */
export type TCarouselTransitionDirection = 'FORWARD' | 'BACKWARD';

/** Modo WAI-ARIA de anuncios en vivo para evitar saturar lectores de pantalla en auto-avance. */
export type TAriaLiveMode = 'off' | 'polite';

/**
 * @name TransparencyHeroCarouselParametersSchema
 * @description Aduana Zod inmutable para parametrización segura del carrusel editorial.
 */
export const TransparencyHeroCarouselParametersSchema = z
  .object({
    totalSlidesCountQuantity: z.number().int().nonnegative(),
    autoplayIntervalInMillisecondsQuantity: z
      .number()
      .int()
      .min(4000)
      .max(30000)
      .default(HERO_CAROUSEL_AUTOPLAY_INTERVAL_IN_MILLISECONDS_QUANTITY),
  })
  .readonly();

export interface ITransparencyHeroCarouselParameters {
  readonly totalSlidesCountQuantity: number;
  readonly autoplayIntervalInMillisecondsQuantity?: number | undefined;
}

export interface IValidatedHeroCarouselParameters {
  readonly totalSlidesCountQuantity: number;
  readonly autoplayIntervalInMillisecondsQuantity: number;
}

/**
 * Valida perimetralmente los parámetros de entrada del carrusel y aplica respaldo seguro sin bloquear UI.
 *
 * @param totalSlidesCountQuantity - Cantidad total de diapositivas disponibles.
 * @param autoplayIntervalInMillisecondsQuantity - Intervalo opcional (>= 4000 ms).
 * @returns {IValidatedHeroCarouselParameters} Parámetros normalizados e inmutables.
 */
export const ResolveSafeHeroCarouselParameters = (
  totalSlidesCountQuantity: number,
  autoplayIntervalInMillisecondsQuantity: number | undefined,
): IValidatedHeroCarouselParameters => {
  const validationResult = TransparencyHeroCarouselParametersSchema.safeParse({
    totalSlidesCountQuantity,
    autoplayIntervalInMillisecondsQuantity,
  });

  if (validationResult.success) {
    return validationResult.data;
  }

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'WARNING',
    moduleIdentifierLiteral: CAROUSEL_MODULE_IDENTIFIER,
    operationCodeLiteral: CAROUSEL_FALLBACK_OPERATION_CODE,
    correlationIdentifier: GenerateCorrelationIdentifier(),
    messageContentLiteral:
      'Parámetros inválidos en carrusel editorial; aplicando valores de respaldo seguros.',
    semanticIntentTag: 'UI_CAROUSEL_CONTRACT_FALLBACK',
    contextMetadataSnapshot: Object.freeze({
      validationIssuesCollection: validationResult.error.flatten(),
    }),
  });

  const safeCountQuantity = Number.isFinite(totalSlidesCountQuantity)
    ? Math.max(0, Math.floor(totalSlidesCountQuantity))
    : 0;

  return Object.freeze({
    totalSlidesCountQuantity: safeCountQuantity,
    autoplayIntervalInMillisecondsQuantity:
      HERO_CAROUSEL_AUTOPLAY_INTERVAL_IN_MILLISECONDS_QUANTITY,
  });
};

/**
 * Acota deterministamente un índice candidato al rango válido `[0, totalCountQuantity - 1]`.
 *
 * @param candidateIndexNumeric - Índice numérico solicitado.
 * @param totalCountQuantity - Cantidad total de diapositivas activas.
 * @returns {number} Índice seguro dentro de rango.
 */
export const ResolveSafeCarouselSlideIndex = (
  candidateIndexNumeric: number,
  totalCountQuantity: number,
): number =>
  totalCountQuantity <= 0
    ? 0
    : Math.min(Math.max(0, candidateIndexNumeric), totalCountQuantity - 1);

/**
 * Evalúa si la rotación automática cada 5s puede ejecutarse respetando WCAG 2.2 SC 2.2.2.
 *
 * @param totalCountQuantity - Total de diapositivas del carrusel.
 * @param isUserOrMotionPausedBoolean - Pausa manual o preferencia `prefers-reduced-motion`.
 * @param isPointerHoveredBoolean - Cursor posicionado sobre el carrusel.
 * @param isFocusWithinBoolean - Foco de teclado contenido dentro del carrusel.
 * @param isDocumentHiddenBoolean - Pestaña oculta o minimizada en segundo plano.
 * @returns {boolean} Verdadero únicamente cuando todas las condiciones permiten rotar.
 */
export const EvaluateHeroCarouselAutoplayActive = (
  totalCountQuantity: number,
  isUserOrMotionPausedBoolean: boolean,
  isPointerHoveredBoolean: boolean,
  isFocusWithinBoolean: boolean,
  isDocumentHiddenBoolean: boolean,
): boolean => {
  if (totalCountQuantity <= 1 || isUserOrMotionPausedBoolean) {
    return false;
  }

  if (isPointerHoveredBoolean || isFocusWithinBoolean) {
    return false;
  }

  return !isDocumentHiddenBoolean;
};

/**
 * Emite una señal telemétrica SRE ante interacciones manuales del ciudadano sobre el carrusel.
 *
 * @param interactionTypeLiteral - Acción ejecutada (`NEXT_SLIDE`, `PREVIOUS_SLIDE`, `SELECT_DOT`, etc.).
 * @param slideIndexNumeric - Índice de diapositiva resultante.
 */
export const EmitHeroCarouselInteractionTelemetry = (
  interactionTypeLiteral: string,
  slideIndexNumeric: number,
): void => {
  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'INFO',
    moduleIdentifierLiteral: CAROUSEL_MODULE_IDENTIFIER,
    operationCodeLiteral: CAROUSEL_INTERACTION_OPERATION_CODE,
    correlationIdentifier: GenerateCorrelationIdentifier(),
    messageContentLiteral: `Interacción en carrusel editorial: [${interactionTypeLiteral}] -> índice [${slideIndexNumeric}].`,
    semanticIntentTag: 'UI_CAROUSEL_INTERACTION',
    contextMetadataSnapshot: Object.freeze({
      interactionTypeLiteral,
      slideIndexNumeric,
    }),
  });
};
