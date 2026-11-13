'use client';

/**
 * @section Shared UI Foundry - Global Action Button (Orchestrator)
 * @description Elemento de interacción primaria y conversión ciudadana.
 * Implementa el patrón "Hardware Barrier" con telemetría forense integrada
 * y soporte polimórfico (Slot) para delegación semántica.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Polymorphic UI.
 * SANEADO Zenith: Erradicación de directivas de supresión obsoletas (Fix TS2578),
 * cumplimiento de Prosa ISO 11179 y sellado de integridad de tipos.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useCallback, useMemo } from 'react';
import { Slot } from '@radix-ui/react-slot';

/* 1. Infraestructura Core y Utilidades (Sovereign Swarm - Clean Paths) */
import { EmitTelemetrySignal, GenerateCorrelationIdentifier } from '@floripa-dignidade/telemetry';

import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';

/* 2. Planos y Contratos (Blueprints Layer - Redirección de ADN) */
/** 🛡️ SANEADO Zenith: El Santuario de Tipos ya autoriza esta importación nominal. */
import type { IUiPrimitives } from '@floripa-dignidade/shared-ui-contracts';

/* 3. ADN Visual Local (Swiss-Watch Swarm) */
import {
  ACTION_BUTTON_BASE_STRUCTURAL_STYLES_LITERAL,
  ACTION_BUTTON_VARIANT_STYLES_MAPPING,
  type TVisualIntentConfigurationLiteral,
} from './global-action-button/constants/ActionButtonStyles.mapping';

import { ButtonLoadingOverlay } from './global-action-button/atoms/ButtonLoadingOverlay';

/**
 * @interface IGlobalActionButtonProperties
 * @description Contrato inmutable para la parametrización de botones de acción.
 * Fusiona los atributos nativos de HTML con el ADN de primitivos institucionales.
 */
export interface IGlobalActionButtonProperties
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    IUiPrimitives {
  /** Variante cromática que define la intención y jerarquía de la acción. */
  readonly visualIntentConfigurationLiteral?: TVisualIntentConfigurationLiteral;
  /** Indica si la transacción asociada está en progreso (Deshabilita el hardware). */
  readonly isExecutionLoadingBoolean?: boolean;
  /** Identificador técnico de la acción para el rastro telemétrico forense. */
  readonly actionIdentifierLiteral?: string;
}

/** Identificador técnico del aparato para el Neural Sentinel. */
const ORCHESTRATOR_IDENTIFIER = 'GLOBAL_ACTION_BUTTON_ORCHESTRATOR';

/**
 * Aparato encargado de la conversión y confirmación ciudadana.
 * Protege contra ráfagas de clics accidentales y audita cada intención.
 *
 * @param propertiesSnapshot - Snapshot de propiedades y estado de interacción.
 * @returns {React.ReactElement} Nodo interactivo blindado y auditado.
 */
export const GlobalActionButton: React.FC<IGlobalActionButtonProperties> = ({
  children,
  visualIntentConfigurationLiteral = 'STANDARD',
  isExecutionLoadingBoolean = false,
  actionIdentifierLiteral = 'UNNAMED_ACTION',
  isPolymorphicBoolean = false,
  externalClassName,
  forensicTestIdentifier,
  accessibilityConfiguration,
  disabled,
  onClick,
  ...nativeProperties
}) => {
  /**
   * @section Gestión de Telemetría de Interacción (Audit Trail)
   * Registramos la intención física del ciudadano antes de delegar la ejecución.
   */
  const handleInteractionAction = useCallback(
    (mouseEvent: React.MouseEvent<HTMLButtonElement>) => {
      const correlationIdentifier = GenerateCorrelationIdentifier();

      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: 'INFO',
        moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
        operationCodeLiteral: 'UI_INTERACTION_TRIGGERED',
        correlationIdentifier,
        messageContentLiteral: `Interacción física detectada en: [${actionIdentifierLiteral}]`,
        semanticIntentTag: 'UI_ACTION_TRIGGER',
        contextMetadataSnapshot: { actionIdentifier: actionIdentifierLiteral },
      });

      if (onClick) {
        onClick(mouseEvent);
      }
    },
    [onClick, actionIdentifierLiteral],
  );

  /**
   * @section Saneamiento de Complejidad (Pilar DRY & SRE)
   * 🛡️ LEY SRE: Memoizamos la configuración visual para proteger los 120 FPS
   * ante ráfagas de re-renderizado en la interfaz.
   */
  const derivedConfigurationSnapshot = useMemo(() => {
    return {
      mergedStylesLiteral: GlobalStyleClassMerger(
        ACTION_BUTTON_BASE_STRUCTURAL_STYLES_LITERAL,
        ACTION_BUTTON_VARIANT_STYLES_MAPPING[visualIntentConfigurationLiteral],
        externalClassName,
      ),
      computedAriaLabelLiteral:
        accessibilityConfiguration?.accessibilityLabelLiteral ?? actionIdentifierLiteral,
      contentOpacityStylesLiteral: isExecutionLoadingBoolean ? 'opacity-0' : 'opacity-100',
    };
  }, [
    visualIntentConfigurationLiteral,
    externalClassName,
    accessibilityConfiguration,
    actionIdentifierLiteral,
    isExecutionLoadingBoolean,
  ]);

  /**
   * @section Transmutación Semántica (Polymorphism)
   * 🛡️ LEY ZENITH: Si 'isPolymorphicBoolean' es verdadero, el botón cede
   * su elemento contenedor (button) al nodo hijo directo para preservar el SEO.
   */
  const SovereignContainerComponent = isPolymorphicBoolean ? Slot : 'button';

  return (
    <SovereignContainerComponent
      {...nativeProperties}
      className={derivedConfigurationSnapshot.mergedStylesLiteral}
      disabled={isExecutionLoadingBoolean || disabled}
      onClick={handleInteractionAction}
      aria-label={derivedConfigurationSnapshot.computedAriaLabelLiteral}
      aria-busy={isExecutionLoadingBoolean}
      data-testid={forensicTestIdentifier}
    >
      {isPolymorphicBoolean ? (
        children
      ) : (
        <>
          <ButtonLoadingOverlay isVisibleBoolean={isExecutionLoadingBoolean} />
          <span
            className={GlobalStyleClassMerger(
              'flex items-center justify-center gap-2 transition-opacity duration-300 w-full',
              derivedConfigurationSnapshot.contentOpacityStylesLiteral,
            )}
          >
            {children}
          </span>
        </>
      )}
    </SovereignContainerComponent>
  );
};
