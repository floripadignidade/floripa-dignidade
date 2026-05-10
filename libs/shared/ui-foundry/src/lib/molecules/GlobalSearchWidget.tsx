'use client';

/**
 * @section UI Molecule - Global Search Widget
 * @description Orquestador de descubrimiento institucional. Ensambla el sensor de
 * hardware, la entrada de datos y los átomos de feedback visual.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & DRY.
 * SANEADO Zenith: Atomización extrema, resolución de TS2307 y telemetría de intención.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useCallback, useState } from 'react';
import { Command, Loader2, Search as SearchIcon } from 'lucide-react';

/* 1. Infraestructura Core y Utilidades */
import { EmitTelemetrySignal, GenerateCorrelationIdentifier } from '@floripa-dignidade/telemetry';
import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';

/* 2. Planos y Contratos (Sovereign Blueprints) */
import { GlobalSearchWidgetPropertiesSchema } from '@floripa-dignidade/shared-ui-contracts';
import type { IGlobalSearchWidgetProperties } from '@floripa-dignidade/shared-ui-contracts';

/* 3. Enjambre Atómico Local (Hooks & Atoms) */
import { useSearchHardwareSentry } from './hooks/useSearchHardwareSentry';
import { SearchFeedbackPanel } from './atoms/SearchFeedbackPanel';

/** Identificador técnico para el Neural Sentinel. */
const SEARCH_MODULE_IDENTIFIER = 'GLOBAL_SEARCH_WIDGET_MOLECULE';

export const GlobalSearchWidget: React.FC<Partial<IGlobalSearchWidgetProperties>> = (rawProperties) => {

  // 1. ADUANA DE ADN: Purificación técnica
  const config = GlobalSearchWidgetPropertiesSchema.parse(rawProperties);

  // 2. SENSORES DE HARDWARE (Hook Swarm)
  const {
    inputReference,
    isInputFocusedBoolean,
    handleFocusAction,
    handleBlurAction
  } = useSearchHardwareSentry(config.isKeyboardShortcutEnabled);

  // 3. ESTADOS LÓGICOS
  const [activeQueryLiteral, setActiveQueryLiteral] = useState('');
  const isAlgorithmExecutingBoolean = activeQueryLiteral.length >= config.minimumCharacterQuantityToSearch;

  /**
   * @section Gestión de Telemetría de Descubrimiento
   */
  const handleInputChangeAction = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value;
    setActiveQueryLiteral(newQuery);

    if (newQuery.length === config.minimumCharacterQuantityToSearch) {
      void EmitTelemetrySignal({
        severityLevelLiteral: 'INFO',
        moduleIdentifierLiteral: SEARCH_MODULE_IDENTIFIER,
        operationCodeLiteral: 'SEARCH_INTENT_DETECTED',
        correlationIdentifier: GenerateCorrelationIdentifier(),
        messageContentLiteral: `Intención de descubrimiento detectada: [${newQuery}]`,
        semanticIntentTag: 'USER_DISCOVERY_START',
        contextMetadataSnapshot: { queryLengthQuantity: newQuery.length }
      });
    }
  }, [config.minimumCharacterQuantityToSearch]);

  return (
    <div
      className={GlobalStyleClassMerger('relative w-full group', config.externalClassName)}
      role="search"
      data-testid={config.forensicTestIdentifier}
    >
      <div className={GlobalStyleClassMerger(
        'flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all duration-500',
        isInputFocusedBoolean ? 'bg-white border-amber-500 shadow-xl' : 'bg-slate-50 border-slate-200'
      )}>

        {/* ICONOGRAFÍA DE ESTADO */}
        {isAlgorithmExecutingBoolean ? (
          <Loader2 size={18} className="text-amber-500 animate-spin" />
        ) : (
          <SearchIcon size={18} className={isInputFocusedBoolean ? 'text-amber-500' : 'text-slate-400'} />
        )}

        <input
          ref={inputReference}
          type="text"
          value={activeQueryLiteral}
          onChange={handleInputChangeAction}
          onFocus={handleFocusAction}
          onBlur={handleBlurAction}
          placeholder={config.labels?.inputPlaceholderLiteral ?? config.placeholderTextLiteral}
          className="flex-grow bg-transparent border-none outline-none text-sm font-medium text-slate-900 placeholder:text-slate-400"
          aria-label={config.labels?.accessibilityLabelLiteral}
        />

        {/* INDICADOR DE ATAJO (Desktop Only) */}
        {!isAlgorithmExecutingBoolean && (
          <div className="hidden md:flex items-center gap-1 px-1.5 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-black text-slate-400">
            <Command size={10} />
            <span>K</span>
          </div>
        )}
      </div>

      <SearchFeedbackPanel
        isVisibleBoolean={isInputFocusedBoolean && isAlgorithmExecutingBoolean}
        label={config.labels?.searchingStatusLiteral ?? 'Explorando...'}
      />
    </div>
  );
};
