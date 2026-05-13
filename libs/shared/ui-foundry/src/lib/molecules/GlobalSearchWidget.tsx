'use client';

/**
 * @section Shared UI Foundry - Global Search Widget (Orchestrator)
 * @description Orquestador de descubrimiento institucional. Ensambla el sensor de
 * hardware, la entrada de datos y los átomos de feedback visual. Implementa
 * el patrón 'Search-as-you-type' con telemetría de intención y protección
 * contra ráfagas de cómputo (SRE Performance).
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Sincronización con 'inputHardwareReference', erradicación
 * de complejidad ciclomática (11 -> 2) e integridad de Prosa Booleana.
 *
 * @author Neural Sentinel (IA) en colaboración con Raz Podestá
 * @license UNLICENSED
 */

import React, { useCallback, useState } from 'react';
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
 * Componente encargado de la orquestación del descubrimiento universal.
 *
 * @param rawProperties - Propiedades de configuración y etiquetas i18n.
 * @returns {React.ReactElement} Interfaz de búsqueda purificada.
 */
export const GlobalSearchWidget: React.FC<Partial<IGlobalSearchWidgetProperties>> = (
  rawProperties
) => {
  // 1. ADUANA DE ADN: Purificación técnica mediante contrato soberano
  const configurationSnapshot = GlobalSearchWidgetPropertiesSchema.parse(rawProperties);

  // 2. SENSORES DE HARDWARE (Hook Swarm)
  /**
   * 🛡️ SANEADO Zenith: Sincronización nominal con el hook nivelado.
   * Se utiliza 'inputHardwareReference' para cumplir con la norma ISO 11179.
   */
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
   * @section Gestión de Telemetría de Descubrimiento
   * 🛡️ LEY ZENITH: El rastro de la intención del ciudadano es un sensor de impacto.
   */
  const handleInputChangeAction = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextQueryValueLiteral = event.target.value;
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
          /** Clasificación ontológica para el Neural Sentinel */
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
      className={GlobalStyleClassMerger(
        'relative w-full group',
        configurationSnapshot.externalClassName,
      )}
      role="search"
      data-testid={configurationSnapshot.forensicTestIdentifier}
    >
      {/* ÁTOMO A: Marco de Entrada (Input Frame Swarm) */}
      <div
        className={GlobalStyleClassMerger(
          'flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all duration-500',
          isInputFocusedBoolean
            ? 'bg-white border-amber-500 shadow-xl'
            : 'bg-slate-50 border-slate-200',
        )}
      >
        {/* ÁTOMO B: Indicador de Estado (Icon Delegation) */}
        <SearchStatusIcon
          isExecutingBoolean={isAlgorithmExecutingBoolean}
          isFocusedBoolean={isInputFocusedBoolean}
        />

        <input
          ref={inputHardwareReference}
          type="text"
          value={activeQueryLiteral}
          onChange={handleInputChangeAction}
          onFocus={handleFocusAction}
          onBlur={handleBlurAction}
          placeholder={
            configurationSnapshot.labels?.inputPlaceholderLiteral ??
            configurationSnapshot.placeholderTextLiteral
          }
          className="flex-grow bg-transparent border-none outline-none text-sm font-medium text-slate-900 placeholder:text-slate-400"
          aria-label={configurationSnapshot.labels?.accessibilityLabelLiteral}
        />

        {/* ÁTOMO C: Señalética de Atajo (Keyboard Hint Delegation) */}
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

/**
 * @private Component: SearchStatusIcon
 * @description Sub-aparato encargado de la señalética visual dinámica.
 */
const SearchStatusIcon: React.FC<{
  readonly isExecutingBoolean: boolean;
  readonly isFocusedBoolean: boolean;
}> = ({ isExecutingBoolean, isFocusedBoolean }) => {
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
};

/**
 * @private Component: SearchKeyboardHint
 * @description Representación visual de accesibilidad para atajos de hardware.
 */
const SearchKeyboardHint: React.FC<{ readonly isVisibleBoolean: boolean }> = ({
  isVisibleBoolean,
}) => {
  if (!isVisibleBoolean) return null;

  return (
    <div
      className="hidden md:flex items-center gap-1 px-1.5 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-black text-slate-400"
      aria-hidden="true"
    >
      <Command size={10} />
      <span>K</span>
    </div>
  );
};
