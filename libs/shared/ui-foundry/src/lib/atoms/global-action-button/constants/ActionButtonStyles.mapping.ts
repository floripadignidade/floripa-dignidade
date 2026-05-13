/**
 * @section Shared UI Foundry - Action Button Styles Mapping
 * @description Única Fuente de Verdad (SSOT) para los tokens cromáticos.
 * Protocolo OEDP-V17.0 - Visual DNA Isolation.
 */

export type TVisualIntentConfigurationLiteral = 'CONVERSION' | 'STANDARD' | 'OUTLINE' | 'GHOST';

export const ACTION_BUTTON_VARIANT_STYLES_MAPPING: Record<TVisualIntentConfigurationLiteral, string> = {
  CONVERSION: 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-200',
  STANDARD: 'bg-navy-900 text-white hover:bg-navy-800 shadow-md',
  OUTLINE: 'border-2 border-navy-900 text-navy-900 hover:bg-navy-50',
  GHOST: 'bg-transparent text-slate-600 hover:bg-slate-100',
} as const;

export const ACTION_BUTTON_BASE_STRUCTURAL_STYLES_LITERAL =
  'relative px-8 py-3.5 rounded-full font-bold transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 overflow-hidden touch-target-min';
