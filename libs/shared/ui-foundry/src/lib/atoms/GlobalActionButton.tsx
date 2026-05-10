'use client';

/**
 * @section Component: GlobalActionButton
 * @description Elemento de interacción primaria del ecosistema. Implementa el
 * patrón de "Hardware Barrier" (bloqueo por carga), telemetría de intención
 * y cumplimiento estricto de accesibilidad ISO/IEC 40500.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Integración de 'shared-ui-contracts', mapeo de accesibilidad
 * ARIA y erradicación de dependencia circular de ADN.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useCallback } from 'react';

/* 1. Infraestructura Core y Utilidades (Sovereign Boundaries) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier
} from '@floripa-dignidade/telemetry';

import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';

/* 2. Planos y Contratos (Blueprints Layer) */
import type { IUiPrimitives } from '@floripa-dignidade/shared-ui-contracts';

/**
 * @name TVisualIntentConfigurationLiteral
 * @description Variantes de intención visual alineadas con el Design System.
 */
export type TVisualIntentConfigurationLiteral = 'CONVERSION' | 'STANDARD' | 'OUTLINE' | 'GHOST';

/**
 * @name VARIANT_STYLES_MAPPING
 * @description Mapa inmutable de tokens cromáticos procesados por Tailwind.
 */
const VARIANT_STYLES_MAPPING: Record<TVisualIntentConfigurationLiteral, string> = {
  CONVERSION: "bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-200",
  STANDARD: "bg-navy-900 text-white hover:bg-navy-800 shadow-md",
  OUTLINE: "border-2 border-navy-900 text-navy-900 hover:bg-navy-50",
  GHOST: "bg-transparent text-slate-600 hover:bg-slate-100"
};

/**
 * @interface IGlobalActionButtonProperties
 * @description Contrato inmutable que fusiona los Primitivos de UI con los
 * atributos nativos del hardware de botón.
 */
export interface IGlobalActionButtonProperties extends
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  IUiPrimitives
{
  /** Define el lenguaje visual y el color del búnker de diseño aplicado. */
  readonly visualIntentConfigurationLiteral?: TVisualIntentConfigurationLiteral;
  /** Estado de ejecución asíncrona; muestra el sensor de carga y bloquea el hardware. */
  readonly isExecutionLoadingBoolean?: boolean;
  /** Identificador técnico para trazabilidad forense (Prosa ISO). */
  readonly actionIdentifierLiteral?: string;
}

/** Identificador técnico del aparato para el Neural Sentinel. */
const ATOM_IDENTIFIER = 'GLOBAL_ACTION_BUTTON_ATOM';

export const GlobalActionButton: React.FC<IGlobalActionButtonProperties> = ({
  children,
  visualIntentConfigurationLiteral = 'STANDARD',
  isExecutionLoadingBoolean = false,
  actionIdentifierLiteral = 'UNNAMED_ACTION',

  /* Propiedades del Contrato de UI Primitives */
  externalClassName,
  forensicTestIdentifier,
  accessibilityConfiguration,

  /* Propiedades Nativas */
  disabled,
  onClick,
  type = 'button',
  ...nativeButtonProperties
}) => {

  /**
   * @section Gestión de Interacción Telemétrica
   * 🛡️ LEY ZENITH: Cada interacción física emite un pulso al sistema nervioso central.
   */
  const handleInteractionAction = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const correlationIdentifier = GenerateCorrelationIdentifier();

    void EmitTelemetrySignal({
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: ATOM_IDENTIFIER,
      operationCodeLiteral: 'USER_INTERACTION_TRIGGERED',
      correlationIdentifier,
      messageContentLiteral: `Interacción detectada en botón:[${actionIdentifierLiteral}]`,
      contextMetadataSnapshot: {
        intentLiteral: visualIntentConfigurationLiteral,
        actionId: actionIdentifierLiteral,
        timestampISO: new Date().toISOString()
      }
    });

    if (onClick) {
      onClick(event);
    }
  }, [onClick, actionIdentifierLiteral, visualIntentConfigurationLiteral]);

  /**
   * @section Arquitectura de Estilos (Atomic Consistency)
   */
  const baseStructuralStylesLiteral = "relative px-8 py-3.5 rounded-full font-bold transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 overflow-hidden touch-target-min";

  const mergedComponentStylesLiteral = GlobalStyleClassMerger(
    baseStructuralStylesLiteral,
    VARIANT_STYLES_MAPPING[visualIntentConfigurationLiteral],
    externalClassName // 🛡️ SANEADO: Uso del campo estandarizado en IUiPrimitives
  );

  return (
    <button
      {...nativeButtonProperties}
      type={type}
      className={mergedComponentStylesLiteral}
      disabled={isExecutionLoadingBoolean || disabled}
      onClick={handleInteractionAction}

      /* Mapeo de Contrato de Accesibilidad (AriaContract) */
      aria-label={accessibilityConfiguration?.accessibilityLabelLiteral}
      aria-busy={isExecutionLoadingBoolean}
      aria-live="polite"
      aria-expanded={accessibilityConfiguration?.isAriaExpandedBoolean}
      aria-controls={accessibilityConfiguration?.ariaControlsReference}

      /* Rastro de Auditoría Forense */
      data-testid={forensicTestIdentifier}
      id={nativeButtonProperties.id}
    >
      {/* 1. SENSOR DE CARGA (SRE Barrier) */}
      {isExecutionLoadingBoolean && (
        <span className="flex items-center justify-center absolute inset-0 bg-inherit pointer-events-none">
          <svg
            className="animate-spin h-5 w-5 text-current"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </span>
      )}

      {/* 2. CAPA DE CONTENIDO (Atomic Swarm) */}
      <span className={GlobalStyleClassMerger(
        "flex items-center gap-2 transition-opacity duration-500",
        isExecutionLoadingBoolean ? "opacity-0" : "opacity-100"
      )}>
        {children}
      </span>
    </button>
  );
};
