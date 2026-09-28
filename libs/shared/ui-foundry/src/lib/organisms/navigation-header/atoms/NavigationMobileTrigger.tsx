'use client';

/**
 * @section Shared UI Foundry - Navigation Mobile Trigger (Atom)
 * @description Átomo encargado exclusivamente de la interacción física para el despliegue
 * del menú móvil. Implementa el patrón "Touch-First" con un área de contacto mínima de
 * 44px (ISO/IEC 40500) y rastro telemétrico de activación sensorial.
 *
 * Protocolo OEDP-V17.0 - High Performance UI & SRE Resilience.
 * SANEADO Zenith: Erradicación de directivas de supresión obsoletas (Fix TS2578),
 * cumplimiento de Prosa ISO 11179 e integridad de tipos de iconografía.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useCallback } from 'react';
import { Menu, X } from 'lucide-react';

/* 1. Infraestructura Core y Utilidades (Sovereign Swarm - Clean Paths) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
} from '@floripa-dignidade/telemetry';

import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';

/** Identificador técnico del aparato para el Neural Sentinel. */
const ATOM_IDENTIFIER = 'NAVIGATION_MOBILE_TRIGGER_ATOM';

/**
 * @interface INavigationMobileTriggerProperties
 * @description Contrato inmutable para la parametrización del disparador táctil.
 * Sigue la norma ISO 11179 de Objeto + Propiedad + Representación.
 */
export interface INavigationMobileTriggerProperties {
  /** Indica si el cajón de navegación está actualmente desplegado. */
  readonly isOpenBoolean: boolean;
  /** Indica si el encabezado posee un estado sólido por desplazamiento de scroll. */
  readonly isScrolledBoolean: boolean;
  /** Acción atómica para alternar el estado de visibilidad en el orquestador superior. */
  readonly toggleAction: () => void;
  /** Etiqueta de accesibilidad localizada para lectores de pantalla (WCAG). */
  readonly ariaLabelLiteral: string;
}

/**
 * Aparato encargado de la señalética visual y disparador de navegación móvil.
 * Implementa micro-interacciones de escala y rastro de intención de descubrimiento.
 *
 * @param propertiesSnapshot - Snapshot de estado inyectado por el orquestador.
 * @returns {React.ReactElement} Botón táctil optimizado y auditado.
 */
export const NavigationMobileTrigger: React.FC<INavigationMobileTriggerProperties> = (
  propertiesSnapshot,
) => {
  const { isOpenBoolean, isScrolledBoolean, toggleAction, ariaLabelLiteral } = propertiesSnapshot;

  /**
   * @section Gestión de Telemetría de Interacción
   * 🛡️ LEY ZENITH: Cada toque en el menú móvil es un sensor de intención de descubrimiento.
   */
  const handleInternalClickAction = useCallback((): void => {
    const correlationIdentifier = GenerateCorrelationIdentifier();

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: ATOM_IDENTIFIER,
      operationCodeLiteral: 'MOBILE_TRIGGER_INTERACTED',
      correlationIdentifier,
      messageContentLiteral: `Interacción táctil detectada: Menú móvil transicionando a [${!isOpenBoolean}].`,
      semanticIntentTag: 'UI_NAVIGATION_TOGGLE',
      contextMetadataSnapshot: {
        targetStateBoolean: !isOpenBoolean,
        isHeaderSolidBoolean: isScrolledBoolean,
      },
    });

    // Ejecución de la acción delegada por el orquestador superior (Header).
    toggleAction();
  }, [isOpenBoolean, isScrolledBoolean, toggleAction]);

  /**
   * @section Arquitectura de Estilos (Atomic Consistency)
   * SANEADO Zenith: Uso de 'GlobalStyleClassMerger' para evitar colisiones de Tailwind.
   * Se garantiza la clase 'touch-target-min' para cumplimiento de la norma WCAG.
   */
  const composedTriggerStylesLiteral = GlobalStyleClassMerger(
    'lg:hidden p-3 rounded-2xl backdrop-blur shadow-sm border transition-all active:scale-90 touch-target-min',
    isScrolledBoolean
      ? 'text-navy-900 bg-slate-50 border-slate-200'
      : 'text-white bg-white/10 border-white/20',
  );

  return (
    <button
      type="button"
      className={composedTriggerStylesLiteral}
      onClick={handleInternalClickAction}
      aria-expanded={isOpenBoolean}
      aria-label={ariaLabelLiteral}
      aria-haspopup="menu"
    >
      {/* SEÑALÉTICA VISUAL DINÁMICA */}
      {isOpenBoolean ? (
        <X size={28} className="animate-in spin-in-90 duration-300" aria-hidden="true" />
      ) : (
        <Menu size={28} className="animate-in fade-in zoom-in-95 duration-300" aria-hidden="true" />
      )}
    </button>
  );
};
