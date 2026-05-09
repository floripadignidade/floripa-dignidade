'use client';

/**
 * @section Component: GlobalActionButton
 * @description Elemento de interacción primaria optimizado para la conversión social.
 * Actúa como un sensor de intención que reporta telemetría en cada interacción.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & ISO Technical Naming.
 * SANEADO Zenith: Resolución de fronteras Shared-Utility, inyección de rastro
 * telemétrico, exportación nominal (Fix TS2459) y Prosa Booleana Estricta.
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

/**
 * @name TVisualIntentConfigurationLiteral
 * @description Variantes de intención visual alineadas con el Design System.
 * 🛡️ SANEADO Zenith: Exportado para permitir tipado estricto en consumidores superiores.
 */
export type TVisualIntentConfigurationLiteral = 'CONVERSION' | 'STANDARD' | 'OUTLINE' | 'GHOST';

/**
 * @name VARIANT_STYLES_MAPPING
 * @description Mapa inmutable de tokens cromáticos. Extraído del render para performance.
 */
const VARIANT_STYLES_MAPPING: Record<TVisualIntentConfigurationLiteral, string> = {
  CONVERSION: "bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-200",
  STANDARD: "bg-navy-900 text-white hover:bg-navy-800 shadow-md",
  OUTLINE: "border-2 border-navy-900 text-navy-900 hover:bg-navy-50",
  GHOST: "bg-transparent text-slate-600 hover:bg-slate-100"
};

/**
 * @interface IGlobalActionButtonProperties
 * @description Contrato de propiedades inmutables para el aparato de botón.
 * 🛡️ SANEADO Zenith: Exportado para resolver el error TS2459 en el index.ts.
 */
export interface IGlobalActionButtonProperties extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Define el lenguaje visual y el color del búnker de diseño aplicado. */
  readonly visualIntentConfigurationLiteral?: TVisualIntentConfigurationLiteral;
  /** Estado de ejecución asíncrona; muestra el sensor de carga y bloquea el hardware. */
  readonly isExecutionLoadingBoolean?: boolean;
  /** Identificador técnico opcional para trazabilidad forense específica. */
  readonly actionIdentifierLiteral?: string;
}

export const GlobalActionButton: React.FC<IGlobalActionButtonProperties> = ({
  children,
  visualIntentConfigurationLiteral = 'STANDARD',
  isExecutionLoadingBoolean = false,
  actionIdentifierLiteral = 'UNNAMED_ACTION',
  className,
  disabled,
  onClick,
  type = 'button',
  ...buttonProperties
}) => {

  /**
   * @section Gestión de Interacción Telemétrica
   * 🛡️ SANEADO Zenith: Cada clic es un pulso en el sistema nervioso.
   */
  const handleInteractionAction = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const correlationIdentifier = GenerateCorrelationIdentifier();

    void EmitTelemetrySignal({
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: 'GLOBAL_ACTION_BUTTON_ATOM',
      operationCodeLiteral: 'USER_INTERACTION_TRIGGERED',
      correlationIdentifier,
      messageContentLiteral: `Interacción detectada en botón:[${actionIdentifierLiteral}]`,
      contextMetadataSnapshot: {
        intentLiteral: visualIntentConfigurationLiteral,
        actionId: actionIdentifierLiteral
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

  const mergedComponentStyles = GlobalStyleClassMerger(
    baseStructuralStylesLiteral,
    VARIANT_STYLES_MAPPING[visualIntentConfigurationLiteral],
    className
  );

  return (
    <button
      className={mergedComponentStyles}
      disabled={isExecutionLoadingBoolean || disabled}
      onClick={handleInteractionAction}
      type={type}
      aria-busy={isExecutionLoadingBoolean}
      aria-live="polite"
      {...buttonProperties}
    >
      {/* CAPA DE CARGA (SRE Resilience) */}
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

      {/* CONTENIDO DEL APARATO */}
      <span className={GlobalStyleClassMerger(
        "flex items-center gap-2 transition-opacity duration-500",
        isExecutionLoadingBoolean ? "opacity-0" : "opacity-100"
      )}>
        {children}
      </span>
    </button>
  );
};
