'use client';

/**
 * @section Shared UI Foundry - Header Hardware Sentry Hook (Atom)
 * @description Hook sensorial encargado de monitorear el desplazamiento vertical (scroll)
 * mediante oyentes pasivos y administrar el estado de apertura del menú móvil.
 * Sincroniza el estado inicial en montaje, estabiliza referencias con `useMemo` y emite
 * telemetría conforme a `TelemetrySignalSchema`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Rendimiento y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

/**
 * @interface IUseHeaderSentryResult
 * @description Contrato de salida inmutable para el control de estado del encabezado.
 */
export interface IUseHeaderSentryResult {
  /** Indica si el cajón de navegación móvil está actualmente desplegado. */
  readonly isMobileMenuOpenBoolean: boolean;
  /** Indica si el desplazamiento vertical superó el umbral de transición visual. */
  readonly isScrollThresholdExceededBoolean: boolean;
  /** Alterna el estado de visibilidad del menú móvil. */
  readonly toggleMobileMenuAction: () => void;
  /** Cierra explícitamente el menú móvil tras navegación o cancelación. */
  readonly closeMobileMenuAction: () => void;
}

/** Umbral técnico en píxeles (40px) para activar el modo compacto del encabezado. */
const SCROLL_ACTIVATION_THRESHOLD_PIXELS_QUANTITY = 40;
const FALLBACK_SENSOR_MODULE_IDENTIFIER = 'HEADER_HARDWARE_SENTRY_HOOK' as ModuleIdentifier;

/**
 * Monitorea el scroll del navegador con listeners pasivos y gestiona el menú móvil.
 *
 * @param moduleIdentifierLiteral - Identificador técnico del componente consumidor.
 * @returns {IUseHeaderSentryResult} Sensores de estado y acciones memoizadas.
 */
export const useHeaderSentry = (moduleIdentifierLiteral: string): IUseHeaderSentryResult => {
  const [isMobileMenuOpenBoolean, setIsMobileMenuOpenBoolean] = useState(false);
  const [isScrollThresholdExceededBoolean, setIsScrollThresholdExceededBoolean] = useState(false);
  const hasTelemetryActivatedBooleanReference = useRef(false);

  const validatedModuleIdentifier = useMemo((): ModuleIdentifier => {
    const parseResult = ModuleIdentifierSchema.safeParse(moduleIdentifierLiteral);
    return parseResult.success ? parseResult.data : FALLBACK_SENSOR_MODULE_IDENTIFIER;
  }, [moduleIdentifierLiteral]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleWindowScrollAction = (): void => {
      const hasExceededThresholdBoolean =
        window.scrollY > SCROLL_ACTIVATION_THRESHOLD_PIXELS_QUANTITY;

      setIsScrollThresholdExceededBoolean(hasExceededThresholdBoolean);
    };

    window.addEventListener('scroll', handleWindowScrollAction, { passive: true });
    handleWindowScrollAction();

    if (!hasTelemetryActivatedBooleanReference.current) {
      hasTelemetryActivatedBooleanReference.current = true;

      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: 'INFO',
        moduleIdentifierLiteral: validatedModuleIdentifier,
        operationCodeLiteral: 'HEADER_HARDWARE_SENSORS_ACTIVATED' as OperationCode,
        correlationIdentifier: GenerateCorrelationIdentifier(),
        messageContentLiteral: 'Vigilancia de scroll e interfaz móvil inicializada con éxito.',
        semanticIntentTag: 'UI_SENSOR_VINCULATION',
      });
    }

    return () => {
      window.removeEventListener('scroll', handleWindowScrollAction);
    };
  }, [validatedModuleIdentifier]);

  const toggleMobileMenuAction = useCallback((): void => {
    setIsMobileMenuOpenBoolean((wasOpenBoolean) => !wasOpenBoolean);
  }, []);

  const closeMobileMenuAction = useCallback((): void => {
    setIsMobileMenuOpenBoolean(false);
  }, []);

  return useMemo(
    () => ({
      isMobileMenuOpenBoolean,
      isScrollThresholdExceededBoolean,
      toggleMobileMenuAction,
      closeMobileMenuAction,
    }),
    [
      isMobileMenuOpenBoolean,
      isScrollThresholdExceededBoolean,
      toggleMobileMenuAction,
      closeMobileMenuAction,
    ],
  );
};
