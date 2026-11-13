/**
 * @section Shared UI Foundry - Header Presentation State Resolver (Atom)
 * @description Átomo de lógica pura encargado de calcular las clases CSS, dimensiones
 * del logotipo y variantes de contraste del encabezado institucional en función del estado
 * de desplazamiento y del tono de fondo subyacente (WCAG 2.2 AAA).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Mantenibilidad) y ADR 0029.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';

/**
 * @name THeaderSurfaceToneLiteral
 * @description Tono de fondo de la página en la posición inicial (scroll = 0).
 */
export type THeaderSurfaceToneLiteral = 'LIGHT' | 'DARK';

/**
 * @interface IResolveHeaderPresentationParameters
 * @description Parámetros inmutables requeridos para calcular el estado visual del encabezado.
 */
export interface IResolveHeaderPresentationParameters {
  readonly isScrollThresholdExceededBoolean: boolean;
  readonly surfaceToneLiteral: THeaderSurfaceToneLiteral;
  readonly externalClassName?: string | undefined;
}

/**
 * @interface IHeaderPresentationState
 * @description Snapshot inmutable con clases compuestas y variantes de contraste seguras.
 */
export interface IHeaderPresentationState {
  readonly containerStylesLiteral: string;
  readonly logoWidthPixelQuantity: number;
  readonly logoVariantLiteral: 'STANDARD' | 'MONOCHROME_WHITE';
  readonly isDarkForegroundRequiredBoolean: boolean;
}

/**
 * Resuelve de forma determinista el estado visual y de accesibilidad de contraste del encabezado.
 * Evita renderizar logotipo blanco o controles blancos sobre lienzos claros en reposo.
 *
 * @param parametersSnapshot - Estado de scroll, tono de superficie y clases externas opcionales.
 * @returns {IHeaderPresentationState} Snapshot inmutable listo para renderizado a 120 FPS.
 */
export const ResolveHeaderPresentationState = (
  parametersSnapshot: IResolveHeaderPresentationParameters,
): IHeaderPresentationState => {
  const { isScrollThresholdExceededBoolean, surfaceToneLiteral, externalClassName } =
    parametersSnapshot;

  const isDarkForegroundRequiredBoolean =
    isScrollThresholdExceededBoolean || surfaceToneLiteral === 'LIGHT';

  const surfaceStylesLiteral = isScrollThresholdExceededBoolean
    ? 'bg-white/95 backdrop-blur-md py-2 shadow-2xl border-slate-200'
    : surfaceToneLiteral === 'LIGHT'
      ? 'bg-white/85 backdrop-blur-md py-4 shadow-sm border-slate-200/70'
      : 'bg-transparent py-6 border-transparent';

  const containerStylesLiteral = GlobalStyleClassMerger(
    'fixed top-0 w-full z-[100] transition-all duration-500 border-b',
    surfaceStylesLiteral,
    externalClassName,
  );

  const logoWidthPixelQuantity = isScrollThresholdExceededBoolean ? 140 : 180;
  const logoVariantLiteral = isDarkForegroundRequiredBoolean ? 'STANDARD' : 'MONOCHROME_WHITE';

  return Object.freeze({
    containerStylesLiteral,
    logoWidthPixelQuantity,
    logoVariantLiteral,
    isDarkForegroundRequiredBoolean,
  });
};
