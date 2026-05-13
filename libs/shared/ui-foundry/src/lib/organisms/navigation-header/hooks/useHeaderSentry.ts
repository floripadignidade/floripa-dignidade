'use client';

/**
 * @section UI Logic - Header Sentry (Hook)
 * @description Orquestador sensorial encargado de monitorear la actividad física
 * del hardware (scroll) y gestionar la visibilidad del menú de navegación móvil.
 * Implementa optimización de rendimiento mediante oyentes pasivos.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & ISO Technical Naming.
 * SANEADO Zenith: Erradicación de entropía de importación, inyección de
 * constantes técnicas y blindaje contra ejecución en servidor (SSR).
 *
 * @author  Raz Podestá - Metashark Tech
 * @license UNLICENSED
 */

import { useCallback, useEffect, useState } from 'react';

/* 1. Infraestructura Core (Atmos PascalCase) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier
} from '@floripa-dignidade/telemetry';

/**
 * @interface IUseHeaderSentryResult
 * @description Contrato de salida inmutable para el control del orquestador de navegación.
 */
export interface IUseHeaderSentryResult {
  /** Indica si el menú de navegación móvil está físicamente desplegado. */
  readonly isMobileMenuOpenBoolean: boolean;
  /** Indica si el desplazamiento vertical ha superado el umbral institucional. */
  readonly isScrollThresholdExceededBoolean: boolean;
  /** Acción atómica para alternar la visibilidad del menú móvil. */
  readonly toggleMobileMenuAction: () => void;
}

/**
 * @constant SCROLL_ACTIVATION_THRESHOLD_PIXELS_QUANTITY
 * Umbral técnico (40px) para transicionar el encabezado de transparente a sólido.
 */
const SCROLL_ACTIVATION_THRESHOLD_PIXELS_QUANTITY = 40;

/**
 * Hook de vigilancia para la respuesta del encabezado ante estímulos del ciudadano.
 *
 * @param moduleIdentifierLiteral - Identificador nominal del componente emisor.
 * @returns {IUseHeaderSentryResult} Sensores de estado y controladores de visibilidad.
 */
export const useHeaderSentry = (
  moduleIdentifierLiteral: string
): IUseHeaderSentryResult => {

  // --- 1. ESTADOS DE INTERFAZ (Prosa Booleana) ---
  const [isMobileMenuOpenBoolean, setIsMobileMenuOpenBoolean] = useState(false);
  const [isScrollThresholdExceededBoolean, setIsScrollThresholdExceededBoolean] = useState(false);

  /**
   * @section Gestión de Sensores de Hardware (Scroll)
   */
  useEffect(() => {
    /** 🛡️ ADUANA SRE: Evitamos la vinculación de eventos en entornos de servidor. */
    if (typeof window === 'undefined') return;

    const correlationIdentifier = GenerateCorrelationIdentifier();

    const handleWindowScrollAction = (): void => {
      const currentScrollYPositionQuantity = window.scrollY;

      const hasExceededThresholdBoolean =
        currentScrollYPositionQuantity > SCROLL_ACTIVATION_THRESHOLD_PIXELS_QUANTITY;

      setIsScrollThresholdExceededBoolean(hasExceededThresholdBoolean);
    };

    /**
     * Registro de oyente pasivo para optimizar el Main Thread
     * y mejorar la métrica INP (Interaction to Next Paint).
     */
    window.addEventListener('scroll', handleWindowScrollAction, { passive: true });

    void EmitTelemetrySignal({
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral,
      operationCodeLiteral: 'HEADER_HARDWARE_SENSORS_ACTIVATED',
      correlationIdentifier,
      messageContentLiteral: 'Vigilancia de scroll e interfaz móvil inicializada con éxito.',
      semanticIntentTag: 'UI_SENSOR_VINCULATION'
    });

    return () => window.removeEventListener('scroll', handleWindowScrollAction);
  }, [moduleIdentifierLiteral]);

  /**
   * @section Acciones de Mutación (Controllers)
   */
  const toggleMobileMenuAction = useCallback((): void => {
    setIsMobileMenuOpenBoolean((wasOpenBoolean) => !wasOpenBoolean);
  }, []);

  return {
    isMobileMenuOpenBoolean,
    isScrollThresholdExceededBoolean,
    toggleMobileMenuAction
  };
};
