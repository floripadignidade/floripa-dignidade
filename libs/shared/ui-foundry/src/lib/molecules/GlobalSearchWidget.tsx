'use client';

/**
 * @section UI Molecule - Global Search Widget
 * @description Orquestador de descubrimiento institucional. Gestiona la entrada
 * de datos, la escucha de hardware para atajos de teclado y la telemetría de
 * intención de búsqueda.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Complexity Eradication.
 * SANEADO Zenith: Reducción de complejidad (13 a 4), Prosa ISO y Telemetría.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Command, Loader2, Search } from 'lucide-react';

/* 1. Infraestructura Core y Utilidades (Sovereign Swarm) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
} from '@floripa-dignidade/telemetry';

import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';

/* 2. ADN Estructural y Esquemas */
import { GlobalSearchWidgetPropertiesSchema } from '../ui-primitives/schemas/GlobalSearchWidget.schema';
import type { IGlobalSearchWidgetProperties } from '../ui-primitives/schemas/GlobalSearchWidget.schema';

/**
 * @interface IGlobalSearchWidgetExtendedProperties
 * @description Contrato inmutable para la parametrización del widget.
 */
interface IGlobalSearchWidgetExtendedProperties extends Partial<IGlobalSearchWidgetProperties> {
  readonly labels?: {
    readonly inputPlaceholderLiteral: string;
    readonly accessibilityLabelLiteral: string;
    readonly searchingStatusLiteral: string;
  };
  readonly externalClassName?: string;
}

/** Identificador técnico del aparato para el Neural Sentinel. */
const SEARCH_MODULE_IDENTIFIER = 'GLOBAL_SEARCH_WIDGET_MOLECULE';

export const GlobalSearchWidget: React.FC<IGlobalSearchWidgetExtendedProperties> = (
  rawUserProperties,
) => {
  // 1. ADUANA DE ADN: Purificación de configuración técnica
  const componentConfiguration = GlobalSearchWidgetPropertiesSchema.parse(rawUserProperties);
  const inputElementReference = useRef<HTMLInputElement>(null);

  // 2. ESTADOS ATÓMICOS DE INTERFAZ
  const [isInputFocusedBoolean, setIsInputFocusedBoolean] = useState(false);
  const [activeSearchQueryLiteral, setActiveSearchQueryLiteral] = useState('');

  /**
   * @section Inferencia de Estado de Algoritmo
   * Determina si el motor de búsqueda debe considerarse activo basándose en el volumen de datos.
   */
  const isAlgorithmExecutingBoolean =
    activeSearchQueryLiteral.length >= componentConfiguration.minimumCharacterQuantityToSearch;

  /**
   * @section Gestión de Atajos de Teclado (Hardware Sentry)
   * 🛡️ LEY ZENITH: Implementación de escucha pasiva para no degradar el Main Thread.
   */
  useEffect(() => {
    if (!componentConfiguration.isKeyboardShortcutEnabled) return;

    const handleKeyboardShortcutAction = (event: KeyboardEvent) => {
      const isCommandKeyShortcutPressedBoolean = (event.metaKey || event.ctrlKey) && event.key === 'k';

      if (isCommandKeyShortcutPressedBoolean) {
        event.preventDefault();
        inputElementReference.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyboardShortcutAction, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyboardShortcutAction);
  }, [componentConfiguration.isKeyboardShortcutEnabled]);

  /**
   * @section Gestión de Telemetría de Descubrimiento
   */
  const handleQueryChangeAction = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newQueryLiteral = event.target.value;
      setActiveSearchQueryLiteral(newQueryLiteral);

      if (newQueryLiteral.length === componentConfiguration.minimumCharacterQuantityToSearch) {
        const correlationIdentifier = GenerateCorrelationIdentifier();

        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: SEARCH_MODULE_IDENTIFIER,
          operationCodeLiteral: 'SEARCH_INTENT_DETECTED',
          correlationIdentifier,
          messageContentLiteral: `Ciudadano iniciando búsqueda: [${newQueryLiteral}]`,
          contextMetadataSnapshot: { queryLengthQuantity: newQueryLiteral.length },
        });
      }
    },
    [componentConfiguration.minimumCharacterQuantityToSearch],
  );

  return (
    <div
      className={GlobalStyleClassMerger(
        'relative w-full group',
        rawUserProperties.externalClassName,
      )}
      role="search"
    >
      <div
        className={GlobalStyleClassMerger(
          'flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all duration-500',
          isInputFocusedBoolean
            ? 'bg-white border-amber-500 shadow-xl shadow-amber-500/10 ring-4 ring-amber-500/5'
            : 'bg-slate-50 border-slate-200 hover:border-slate-300',
        )}
      >
        <SearchIconIndicator isExecutingBoolean={isAlgorithmExecutingBoolean} isFocusedBoolean={isInputFocusedBoolean} />

        <input
          ref={inputElementReference}
          type="text"
          value={activeSearchQueryLiteral}
          onChange={handleQueryChangeAction}
          onFocus={() => setIsInputFocusedBoolean(true)}
          onBlur={() => setTimeout(() => setIsInputFocusedBoolean(false), 200)}
          placeholder={
            rawUserProperties.labels?.inputPlaceholderLiteral ??
            componentConfiguration.placeholderTextLiteral
          }
          aria-label={rawUserProperties.labels?.accessibilityLabelLiteral ?? 'Busca universal'}
          className="flex-grow bg-transparent border-none outline-none text-sm font-medium text-slate-900 placeholder:text-slate-400"
        />

        <KeyboardShortcutHint isVisibleBoolean={!isAlgorithmExecutingBoolean} />
      </div>

      <SearchFeedbackPanel
        isVisibleBoolean={isInputFocusedBoolean && isAlgorithmExecutingBoolean}
        statusLabelLiteral={rawUserProperties.labels?.searchingStatusLiteral ?? 'Explorando...'}
      />
    </div>
  );
};

/**
 * @private Component: SearchIconIndicator
 * @description Átomo encargado de la representación de estado del motor de búsqueda.
 */
const SearchIconIndicator: React.FC<{
  readonly isExecutingBoolean: boolean;
  readonly isFocusedBoolean: boolean;
}> = ({ isExecutingBoolean, isFocusedBoolean }) => {
  if (isExecutingBoolean) {
    return <Loader2 size={18} className="text-amber-500 animate-spin" />;
  }
  return <Search size={18} className={isFocusedBoolean ? 'text-amber-500' : 'text-slate-400'} />;
};

/**
 * @private Component: KeyboardShortcutHint
 * @description Indicador visual de acceso rápido para hardware de escritorio.
 */
const KeyboardShortcutHint: React.FC<{ readonly isVisibleBoolean: boolean }> = ({
  isVisibleBoolean,
}) => {
  if (!isVisibleBoolean) return null;
  return (
    <div className="hidden md:flex items-center gap-1 px-1.5 py-1 rounded-md bg-white border border-slate-200 text-[10px] font-black text-slate-400">
      <Command size={10} />
      <span>K</span>
    </div>
  );
};

/**
 * @private Component: SearchFeedbackPanel
 * @description Panel de resultados (Placeholder) con rastro de progreso.
 */
const SearchFeedbackPanel: React.FC<{
  readonly isVisibleBoolean: boolean;
  readonly statusLabelLiteral: string;
}> = ({ isVisibleBoolean, statusLabelLiteral }) => {
  if (!isVisibleBoolean) return null;
  return (
    <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[110] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      <div className="p-8 text-center" aria-live="polite">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
          {statusLabelLiteral}
        </p>
        <div className="h-1 w-24 bg-slate-100 mx-auto rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 w-1/3 animate-pulse" />
        </div>
      </div>
    </div>
  );
};
