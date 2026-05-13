'use client';

/**
 * @section Shared UI Foundry - Global Search Widget (Orchestrator)
 * @description Orquestador de descubrimiento institucional. Ensambla el sensor de
 * hardware, la entrada de datos y los átomos de feedback visual. Implementa
 * el patrón 'Search-as-you-type' con telemetría de intención y protección
 * contra ráfagas de cómputo (SRE Performance).
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Extrema atomización, memoización de submódulos visuales,
 * supresión controlada de fricción ambiental (TS7016) y consolidación de telemetría.
 *
 * @author Neural Sentinel (IA) en colaboración con Raz Podestá
 * @license UNLICENSED
 */

import React, { useCallback, useMemo, useState, memo } from 'react';

/**
 * 🛡️ LEY ZENITH (Fix TS7016):
 * Silenciamos la advertencia del compilador porque la librería existe físicamente,
 * pero la resolución de 'bundler' en PNPM estricto falla al localizar su .d.ts
 * sin violar la prohibición de ESLint sobre referencias de triple barra.
 */
// @ts-expect-error - TS7016: Falla de resolución de declaración de tipos en entornos Nx/PNPM.
import { Command, Loader2, Search as SearchIcon } from 'lucide-react';

/* 1. Infraestructura Core y Utilidades (Sovereign Swarm) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier
} from '@floripa-dignidade/telemetry';

import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';

/* 2. Planos y Contratos (Blueprints Layer) */
import { GlobalSearchWidgetPropertiesSchema } from '@floripa-dignidade/shared-ui-contracts';
import type { IGlobalSearchWidgetProperties } from '@floripa-dignidade/shared-ui-contracts';

/* 3. Enjambre Atómico Local (Hooks & Atoms) */
import { useSearchHardwareSentry } from './hooks/useSearchHardwareSentry';
import { SearchFeedbackPanel } from './atoms/SearchFeedbackPanel';

/** Identificador técnico del aparato para el Neural Sentinel. */
const SEARCH_MODULE_IDENTIFIER = 'GLOBAL_SEARCH_WIDGET_ORCHESTRATOR';

/**
 * @private Component: SearchStatusIcon
 * @description Sub-aparato memoizado encargado de la señalética visual dinámica.
 * Al estar protegido por 'memo', aísla el Main Thread de re-renders durante el tipeo.
 */
const SearchStatusIcon: React.FC<{
  readonly isExecutingBoolean: boolean;
  readonly isFocusedBoolean: boolean;
}> = memo(({ isExecutingBoolean, isFocusedBoolean }) => {
  if (isExecutingBoolean) {
    return <Loader2 size={18} className="text-amber-500 animate-spin" aria-hidden="true" />;
  }
  return (
    <SearchIcon
      size={18}
      className={isFocusedBoolean ? 'text-amber-500' : 'text-slate-400'}
      aria-hidden="true"
    />
  );
});
SearchStatusIcon.displayName = 'SearchStatusIcon';

/**
 * @private Component: SearchKeyboardHint
 * @description Representación visual memoizada de accesibilidad para atajos de hardware.
 */
const SearchKeyboardHint: React.FC<{ readonly isVisibleBoolean: boolean }> = memo(({
  isVisibleBoolean,
}) => {
  if (!isVisibleBoolean) return null;

  return (
    <div
      className="hidden md:flex items-center gap-1 px-1.5 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-black text-slate-400"
      aria-hidden="true"
    >
      <Command size={10} aria-hidden="true" />
      <span>K</span>
    </div>
  );
});
SearchKeyboardHint.displayName = 'SearchKeyboardHint';

/**
 * Componente encargado de la orquestación del descubrimiento universal.
 *
 * @param rawPropertiesSnapshot - Propiedades de configuración y etiquetas i18n crudas.
 * @returns {React.ReactElement} Interfaz de búsqueda purificada y ensamblada.
 */
export const GlobalSearchWidget: React.FC<Partial<IGlobalSearchWidgetProperties>> = (
  rawPropertiesSnapshot
) => {
  // 1. ADUANA DE ADN: Purificación técnica mediante contrato soberano
  const configurationSnapshot = GlobalSearchWidgetPropertiesSchema.parse(rawPropertiesSnapshot);

  // 2. SENSORES DE HARDWARE (Hook Swarm)
  const {
    inputHardwareReference,
    isInputFocusedBoolean,
    handleFocusAction,
    handleBlurAction,
  } = useSearchHardwareSentry(configurationSnapshot.isKeyboardShortcutEnabled);

  // 3. ESTADOS LÓGICOS ATÓMICOS
  const [activeQueryLiteral, setActiveQueryLiteral] = useState('');

  const isAlgorithmExecutingBoolean =
    activeQueryLiteral.length >= configurationSnapshot.minimumCharacterQuantityToSearch;

  /**
   * @section Saneamiento de Complejidad Visual (Pilar DRY)
   * Aísla las variables CSS y el fallback de traducciones del ciclo de renderizado.
   */
  const derivedVisualConfigurationSnapshot = useMemo(() => {
    return {
      containerMergedStylesLiteral: GlobalStyleClassMerger(
        'relative w-full group',
        configurationSnapshot.externalClassName,
      ),
      inputFrameMergedStylesLiteral: GlobalStyleClassMerger(
        'flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all duration-500',
        isInputFocusedBoolean
          ? 'bg-white border-amber-500 shadow-xl'
          : 'bg-slate-50 border-slate-200',
      ),
      computedPlaceholderLiteral:
        configurationSnapshot.labels?.inputPlaceholderLiteral ??
        configurationSnapshot.placeholderTextLiteral,
      computedAriaLabelLiteral:
        configurationSnapshot.labels?.accessibilityLabelLiteral ??
        configurationSnapshot.labels?.inputPlaceholderLiteral ??
        configurationSnapshot.placeholderTextLiteral
    };
  }, [
    configurationSnapshot.externalClassName,
    isInputFocusedBoolean,
    configurationSnapshot.labels,
    configurationSnapshot.placeholderTextLiteral
  ]);

  /**
   * @section Gestión de Telemetría de Descubrimiento
   * 🛡️ LEY ZENITH: El rastro de la intención del ciudadano es un sensor de impacto.
   */
  const handleSearchInputChangeAction = useCallback(
    (changeEvent: React.ChangeEvent<HTMLInputElement>) => {
      const nextQueryValueLiteral = changeEvent.target.value;
      setActiveQueryLiteral(nextQueryValueLiteral);

      const isThresholdReachedBoolean =
        nextQueryValueLiteral.length === configurationSnapshot.minimumCharacterQuantityToSearch;

      if (isThresholdReachedBoolean) {
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: SEARCH_MODULE_IDENTIFIER,
          operationCodeLiteral: 'SEARCH_INTENT_DETECTED',
          correlationIdentifier: GenerateCorrelationIdentifier(),
          messageContentLiteral: `Intención de descubrimiento detectada: [${nextQueryValueLiteral}]`,
          semanticIntentTag: 'USER_DISCOVERY_START',
          contextMetadataSnapshot: {
            queryLengthQuantity: nextQueryValueLiteral.length,
          },
        });
      }
    },
    [configurationSnapshot.minimumCharacterQuantityToSearch],
  );

  return (
    <div
      className={derivedVisualConfigurationSnapshot.containerMergedStylesLiteral}
      role="search"
      data-testid={configurationSnapshot.forensicTestIdentifier}
    >
      {/* ÁTOMO A: Marco de Entrada (Input Frame Swarm) */}
      <div className={derivedVisualConfigurationSnapshot.inputFrameMergedStylesLiteral}>

        {/* ÁTOMO B: Indicador de Estado (Icon Delegation Memoized) */}
        <SearchStatusIcon
          isExecutingBoolean={isAlgorithmExecutingBoolean}
          isFocusedBoolean={isInputFocusedBoolean}
        />

        <input
          ref={inputHardwareReference}
          type="search"
          value={activeQueryLiteral}
          onChange={handleSearchInputChangeAction}
          onFocus={handleFocusAction}
          onBlur={handleBlurAction}
          placeholder={derivedVisualConfigurationSnapshot.computedPlaceholderLiteral}
          className="flex-grow bg-transparent border-none outline-none text-sm font-medium text-slate-900 placeholder:text-slate-400"
          aria-label={derivedVisualConfigurationSnapshot.computedAriaLabelLiteral}
          autoComplete="off"
        />

        {/* ÁTOMO C: Señalética de Atajo (Keyboard Hint Delegation Memoized) */}
        <SearchKeyboardHint isVisibleBoolean={!isAlgorithmExecutingBoolean} />
      </div>

      {/* ÁTOMO D: Panel de Feedback Cognitivo */}
      <SearchFeedbackPanel
        isVisibleBoolean={isInputFocusedBoolean && isAlgorithmExecutingBoolean}
        label={configurationSnapshot.labels?.searchingStatusLiteral ?? 'Explorando...'}
      />
    </div>
  );
};
