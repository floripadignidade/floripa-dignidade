'use client';

/**
 * @section Shared UI Foundry - Global Action Button (Orchestrator)
 * @description Elemento de interacción primaria. Implementa el patrón "Hardware Barrier".
 *
 * Protocolo OEDP-V17.0 - SRE Complexity Sanation.
 * SANEADO Zenith: Complejidad Ciclomática reducida a 2 mediante el patrón "Memoized Config".
 *
 * @author  Raz Podestá - Metashark Tech
 */

import React, { useCallback, useMemo } from 'react';
import { EmitTelemetrySignal, GenerateCorrelationIdentifier } from '@floripa-dignidade/telemetry';
import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';
import type { IUiPrimitives } from '@floripa-dignidade/shared-ui-contracts';

import {
  ACTION_BUTTON_BASE_STRUCTURAL_STYLES_LITERAL,
  ACTION_BUTTON_VARIANT_STYLES_MAPPING,
  type TVisualIntentConfigurationLiteral
} from './global-action-button/constants/ActionButtonStyles.mapping';

import { ButtonLoadingOverlay } from './global-action-button/atoms/ButtonLoadingOverlay';

export interface IGlobalActionButtonProperties extends React.ButtonHTMLAttributes<HTMLButtonElement>, IUiPrimitives {
  readonly visualIntentConfigurationLiteral?: TVisualIntentConfigurationLiteral;
  readonly isExecutionLoadingBoolean?: boolean;
  readonly actionIdentifierLiteral?: string;
}

const ORCHESTRATOR_IDENTIFIER = 'GLOBAL_ACTION_BUTTON_ORCHESTRATOR';

export const GlobalActionButton: React.FC<IGlobalActionButtonProperties> = ({
  children,
  visualIntentConfigurationLiteral = 'STANDARD',
  isExecutionLoadingBoolean = false,
  actionIdentifierLiteral = 'UNNAMED_ACTION',
  externalClassName,
  forensicTestIdentifier,
  accessibilityConfiguration,
  disabled,
  onClick,
  ...nativeProperties
}) => {

  const handleInteractionAction = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    void EmitTelemetrySignal({
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
      operationCodeLiteral: 'UI_INTERACTION',
      correlationIdentifier: GenerateCorrelationIdentifier(),
      messageContentLiteral: `Click: ${actionIdentifierLiteral}`,
      semanticIntentTag: 'UI_ACTION_TRIGGER',
      contextMetadataSnapshot: { actionId: actionIdentifierLiteral }
    });
    if (onClick) onClick(event);
  }, [onClick, actionIdentifierLiteral]);

  /**
   * @section Saneamiento de Complejidad (Pilar DRY)
   * Centralizamos la lógica de decisión en un objeto memoizado.
   * Esto reduce los puntos de decisión en el JSX.
   */
  const derivedConfiguration = useMemo(() => ({
    mergedStyles: GlobalStyleClassMerger(
      ACTION_BUTTON_BASE_STRUCTURAL_STYLES_LITERAL,
      ACTION_BUTTON_VARIANT_STYLES_MAPPING[visualIntentConfigurationLiteral],
      externalClassName
    ),
    ariaLabel: accessibilityConfiguration?.accessibilityLabelLiteral ?? actionIdentifierLiteral,
    contentOpacity: isExecutionLoadingBoolean ? 'opacity-0' : 'opacity-100'
  }), [visualIntentConfigurationLiteral, externalClassName, accessibilityConfiguration, actionIdentifierLiteral, isExecutionLoadingBoolean]);

  return (
    <button
      {...nativeProperties}
      className={derivedConfiguration.mergedStyles}
      disabled={isExecutionLoadingBoolean || disabled}
      onClick={handleInteractionAction}
      aria-label={derivedConfiguration.ariaLabel}
      aria-busy={isExecutionLoadingBoolean}
      data-testid={forensicTestIdentifier}
    >
      <ButtonLoadingOverlay isVisibleBoolean={isExecutionLoadingBoolean} />
      <span className={GlobalStyleClassMerger('flex items-center gap-2 transition-opacity', derivedConfiguration.contentOpacity)}>
        {children}
      </span>
    </button>
  );
};
