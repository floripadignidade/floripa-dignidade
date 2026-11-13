'use client';

/**
 * @section Shared UI Foundry - Global Search Widget (Orchestrator)
 * @description Orquestador de descubrimiento institucional. Ensambla el sensor de
 * hardware, la entrada de datos y los átomos de feedback visual. Implementa
 * el patrón 'Search-as-you-type' con telemetría de intención y protección
 * contra ráfagas de cómputo (SRE Performance).
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Erradicación de entropía visual (Fix sort-imports),
 * purga definitiva de supresiones TS7016 y cumplimiento de Prosa ISO 11179.
 *
 * @author Neural Sentinel (IA) en colaboración con Raz Podestá
 * @license UNLICENSED
 */

import React, { memo, useCallback, useMemo, useState } from 'react';

/**
 * 🛡️ LEY DE SOBERANÍA FÍSICA:
 * El Santuario de Tipos en 'index.d.ts' proporciona la resolución limpia
 * de las librerías de terceros, protegiendo el Main Thread.
 */
import { Command, Loader2, Search as SearchIcon } from 'lucide-react';

/* 1. Infraestructura Core y Utilidades (Sovereign Swarm - Clean Paths) */
import { EmitTelemetrySignal, GenerateCorrelationIdentifier } from '@floripa-dignidade/telemetry';

import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';

/* 2. Planos y Contratos (Blueprints Layer - Redirección de ADN) */
import { GlobalSearchWidgetPropertiesSchema } from '@floripa-dignidade/shared-ui-contracts';
import type { IGlobalSearchWidgetProperties } from '@floripa-dignidade/shared-ui-contracts';

/* 3. Enjambre Atómico Local (Hooks & Atoms) */
import { useSearchHardwareSentry } from './hooks/useSearchHardwareSentry';
import { SearchFeedbackPanel } from './atoms/SearchFeedbackPanel';

/** Identificador técnico del aparato para el Neural Sentinel. */
const ORCHESTRATOR_IDENTIFIER = 'GLOBAL_SEARCH_WIDGET_ORCHESTRATOR';

/**
 * @private Sub-Aparato: SearchStatusIcon (Atom)
 * @description Encargado exclusivamente de la señalética visual de estado.
 * Protegido por 'memo' para evitar re-renderizados durante el flujo de datos.
 */
const SearchStatusIcon: React.FC<{
  readonly isAlgorithmExecutingBoolean: boolean;
  readonly isInputFocusedBoolean: boolean;
}> = memo(({ isAlgorithmExecutingBoolean, isInputFocusedBoolean }) => {
  if (isAlgorithmExecutingBoolean) {
    return <Loader2 size={18} className="text-amber-500 animate-spin" aria-hidden="true" />;
  }
  return (
    <SearchIcon
      size={18}
      className={isInputFocusedBoolean ? 'text-amber-500' : 'text-slate-400'}
      aria-hidden="true"
    />
  );
});
SearchStatusIcon.displayName = 'SearchStatusIcon';

/**
 * @private Sub-Aparato: SearchKeyboardHint (Atom)
 * @description Representación visual de accesibilidad para atajos de hardware.
 */
const SearchKeyboardHint: React.FC<{ readonly isVisibleBoolean: boolean }> = memo(
  ({ isVisibleBoolean }) => {
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
  },
);
SearchKeyboardHint.displayName = 'SearchKeyboardHint';

/**
 * Componente principal encargado del descubrimiento universal.
 * Implementa el patrón "Sovereign UI": validación de ADN en entrada y telemetría de salida.
 *
 * @param propertiesSnapshot - Propiedades de configuración y etiquetas localizadas.
 * @returns {React.ReactElement} Interfaz de búsqueda purificada y ensamblada.
 */
export const GlobalSearchWidget: React.FC<Partial<IGlobalSearchWidgetProperties>> = (
  propertiesSnapshot,
) => {
  // 1. ADUANA DE ADN: Purificación técnica mediante contrato soberano (Blueprints)
  const validatedConfigurationSnapshot =
    GlobalSearchWidgetPropertiesSchema.parse(propertiesSnapshot);

  // 2. SENSORES DE HARDWARE (Hook Swarm)
  const { inputHardwareReference, isInputFocusedBoolean, handleFocusAction, handleBlurAction } =
    useSearchHardwareSentry(validatedConfigurationSnapshot.isKeyboardShortcutEnabled);

  // 3. ESTADOS LÓGICOS ATÓMICOS (Prosa Booleana)
  const [activeSearchQueryLiteral, setActiveSearchQueryLiteral] = useState('');

  const isAlgorithmExecutingBoolean =
    activeSearchQueryLiteral.length >=
    validatedConfigurationSnapshot.minimumCharacterQuantityToSearch;

  /**
   * @section Saneamiento de Complejidad Visual (Pilar DRY)
   * 🛡️ LEY SRE: Memoizamos la configuración visual para proteger los 120 FPS
   * ante mutaciones de estado de foco o tipeo.
   */
  const derivedVisualConfigurationSnapshot = useMemo(() => {
    const { externalClassName, placeholderTextLiteral, accessibilityConfiguration } =
      validatedConfigurationSnapshot;

    return {
      containerMergedStylesLiteral: GlobalStyleClassMerger(
        'relative w-full group',
        externalClassName,
      ),
      inputFrameMergedStylesLiteral: GlobalStyleClassMerger(
        'flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all duration-500',
        isInputFocusedBoolean
          ? 'bg-white border-amber-500 shadow-xl'
          : 'bg-slate-50 border-slate-200',
      ),
      computedPlaceholderLiteral:
        propertiesSnapshot.labels?.inputPlaceholderLiteral ?? placeholderTextLiteral,
      computedAriaLabelLiteral:
        accessibilityConfiguration?.accessibilityLabelLiteral ??
        propertiesSnapshot.labels?.inputPlaceholderLiteral ??
        placeholderTextLiteral,
    };
  }, [isInputFocusedBoolean, validatedConfigurationSnapshot, propertiesSnapshot.labels]);

  /**
   * @section Gestión de Telemetría de Descubrimiento
   * 🛡️ LEY ZENITH: Cada pulso de intención del ciudadano es un sensor de impacto social.
   */
  const handleInputChangeAction = useCallback(
    (changeEvent: React.ChangeEvent<HTMLInputElement>) => {
      const targetSearchQueryLiteral = changeEvent.target.value;
      setActiveSearchQueryLiteral(targetSearchQueryLiteral);

      const isThresholdReachedBoolean =
        targetSearchQueryLiteral.length ===
        validatedConfigurationSnapshot.minimumCharacterQuantityToSearch;

      if (isThresholdReachedBoolean) {
        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'SEARCH_INTENT_NOMINAL',
          correlationIdentifier: GenerateCorrelationIdentifier(),
          messageContentLiteral: `Intención de descubrimiento detectada: [${targetSearchQueryLiteral}]`,
          semanticIntentTag: 'USER_DISCOVERY_START',
          contextMetadataSnapshot: {
            queryLengthQuantity: targetSearchQueryLiteral.length,
          },
        });
      }
    },
    [validatedConfigurationSnapshot.minimumCharacterQuantityToSearch],
  );

  return (
    <div
      className={derivedVisualConfigurationSnapshot.containerMergedStylesLiteral}
      role="search"
      data-testid={validatedConfigurationSnapshot.forensicTestIdentifier}
    >
      {/* ÁTOMO A: Marco de Entrada (Input Frame Swarm) */}
      <div className={derivedVisualConfigurationSnapshot.inputFrameMergedStylesLiteral}>
        {/* ÁTOMO B: Indicador de Estado (Icon Delegation Memoized) */}
        <SearchStatusIcon
          isAlgorithmExecutingBoolean={isAlgorithmExecutingBoolean}
          isInputFocusedBoolean={isInputFocusedBoolean}
        />

        <input
          ref={inputHardwareReference}
          type="search"
          value={activeSearchQueryLiteral}
          onChange={handleInputChangeAction}
          onFocus={handleFocusAction}
          onBlur={handleBlurAction}
          placeholder={derivedVisualConfigurationSnapshot.computedPlaceholderLiteral}
          className="flex-grow bg-transparent border-none outline-none text-sm font-bold text-slate-900 placeholder:text-slate-400"
          aria-label={derivedVisualConfigurationSnapshot.computedAriaLabelLiteral}
          autoComplete="off"
        />

        {/* ÁTOMO C: Señalética de Atajo (Keyboard Hint Delegation Memoized) */}
        <SearchKeyboardHint isVisibleBoolean={!isAlgorithmExecutingBoolean} />
      </div>

      {/* ÁTOMO D: Panel de Feedback Cognitivo (Molecule) */}
      <SearchFeedbackPanel
        isVisibleBoolean={isInputFocusedBoolean && isAlgorithmExecutingBoolean}
        label={propertiesSnapshot.labels?.searchingStatusLiteral ?? 'Explorando...'}
      />
    </div>
  );
};
