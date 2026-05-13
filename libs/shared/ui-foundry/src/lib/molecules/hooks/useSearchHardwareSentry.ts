'use client';

/**
 * @section UI Logic - Search Hardware Sentry (Hook)
 * @description Orquestador sensorial encargado de monitorear atajos de teclado
 * (Ctrl/Cmd + K) y gestionar los estados de foco del hardware de entrada.
 * Implementa estabilidad de referencias mediante memoización para optimizar
 * el rendimiento del enjambre visual.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & ISO Technical Naming.
 * SANEADO Zenith: Estabilización de referencias (useCallback), higiene de
 * importaciones (sort-imports) y blindaje de ciclo de vida.
 *
 * @author Neural Sentinel (IA) en colaboración con Raz Podestá
 * @license UNLICENSED
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/* 1. Infraestructura Core (Atmos PascalCase) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
} from '@floripa-dignidade/telemetry';

/**
 * @interface IUseSearchHardwareSentryResult
 * @description Contrato de salida inmutable para el control del hardware de entrada.
 * Sigue la norma ISO de Objeto + Propiedad + Representación.
 */
interface IUseSearchHardwareSentryResult {
  /** Referencia física al elemento input del DOM para control directo. */
  readonly inputHardwareReference: React.RefObject<HTMLInputElement | null>;
  /** Indica si el hardware de entrada posee el foco de interacción activo. */
  readonly isInputFocusedBoolean: boolean;
  /** Acción estable para forzar el estado de foco en el hardware. */
  readonly handleFocusAction: () => void;
  /** Acción estable para desactivar el foco con retardo de seguridad SRE. */
  readonly handleBlurAction: () => void;
}

/** Identificador técnico del aparato para el Neural Sentinel. */
const SENSOR_IDENTIFIER = 'SEARCH_HARDWARE_SENTRY_HOOK';

/**
 * Hook de vigilancia para la interacción física con el motor de descubrimiento.
 *
 * @param isShortcutEnabledBoolean - Define si la escucha del teclado debe activarse.
 * @returns {IUseSearchHardwareSentryResult} Sensores y acciones de hardware memoizadas.
 */
export const useSearchHardwareSentry = (
  isShortcutEnabledBoolean: boolean,
): IUseSearchHardwareSentryResult => {
  const inputHardwareReference = useRef<HTMLInputElement>(null);
  const blurTimeoutReference = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isInputFocusedBoolean, setIsInputFocusedBoolean] = useState(false);

  /**
   * @section Gestión de Atajos de Teclado (Hardware Listener)
   * 🛡️ LEY ZENITH: El registro de oyentes globales emite rastro de montaje.
   */
  useEffect(() => {
    if (!isShortcutEnabledBoolean) return;

    const correlationIdentifier = GenerateCorrelationIdentifier();

    const handleKeyDownAction = (event: KeyboardEvent): void => {
      /**
       * 🛡️ SANEADO Zenith: Detección multiformato (MacOS/Windows)
       * con cumplimiento estricto de Prosa Booleana.
       */
      const isCommandActiveBoolean = (event.metaKey || event.ctrlKey) && event.key === 'k';

      if (isCommandActiveBoolean) {
        event.preventDefault();

        // REPORTE DE INTERACCIÓN FÍSICA
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: SENSOR_IDENTIFIER,
          operationCodeLiteral: 'KEYBOARD_SHORTCUT_DETECTED',
          correlationIdentifier,
          messageContentLiteral: 'Atajo de hardware [Ctrl/Cmd + K] activado. Delegando foco.',
          semanticIntentTag: 'UI_HARDWARE_INTERACTION',
        });

        inputHardwareReference.current?.focus();
      }
    };

    /** 🛡️ SRE GUARD: Listener no pasivo para permitir preventDefault(). */
    window.addEventListener('keydown', handleKeyDownAction, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDownAction);
    };
  }, [isShortcutEnabledBoolean]);

  /**
   * @section Acciones de Ciclo de Vida del Foco (Memoized)
   * 🛡️ LEY DE PERFORMANCE: Se utiliza useCallback para evitar que las
   * moléculas consumidoras re-rendericen al pasar estas funciones como props.
   */

  const handleFocusAction = useCallback((): void => {
    if (blurTimeoutReference.current) {
      clearTimeout(blurTimeoutReference.current);
      blurTimeoutReference.current = null;
    }
    setIsInputFocusedBoolean(true);
  }, []);

  const handleBlurAction = useCallback((): void => {
    /**
     * Retardo SRE (200ms): Permite que eventos de clic en el panel de
     * resultados ocurran antes de que el componente sea desmontado o movido.
     */
    blurTimeoutReference.current = setTimeout(() => {
      setIsInputFocusedBoolean(false);
      blurTimeoutReference.current = null;
    }, 200);
  }, []);

  /**
   * @section Limpieza de Hardware
   * Garantiza la destrucción de temporizadores para evitar fugas de memoria.
   */
  useEffect(() => {
    return () => {
      if (blurTimeoutReference.current) {
        clearTimeout(blurTimeoutReference.current);
      }
    };
  }, []);

  return {
    inputHardwareReference,
    isInputFocusedBoolean,
    handleFocusAction,
    handleBlurAction,
  };
};
