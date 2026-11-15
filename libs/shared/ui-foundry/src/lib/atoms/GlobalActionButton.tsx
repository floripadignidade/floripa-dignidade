'use client';

/**
 * @file libs/shared/ui-foundry/src/lib/atoms/GlobalActionButton.tsx
 * @section Shared UI Foundry - Global Action Button (Atom)
 * @description Elemento de interacción primaria y conversión ciudadana accesible (WCAG 2.2 AAA).
 * Implementa soporte polimórfico mediante Radix UI Slot, fusión determinista de clases CSS
 * (`className` nativo y `externalClassName`), mapeo completo del contrato `IUiPrimitives`
 * (`technicalIdentifier` y `IAriaAttributes`), protección de clics durante estados de carga
 * y telemetría SRE delegada en átomos dedicados.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 y W3C WCAG 2.2 AAA.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useCallback, useMemo } from 'react';
import { Slot } from '@radix-ui/react-slot';

/* 1. Contratos de Primitivos de UI */
import type { IUiPrimitives } from '@floripa-dignidade/shared-ui-contracts';

/* 2. Átomos, Constantes y Lógica Local */
import { ButtonLoadingOverlay } from './global-action-button/atoms/ButtonLoadingOverlay';
import type { TVisualIntentConfigurationLiteral } from './global-action-button/constants/ActionButtonStyles.mapping';
import { EmitActionButtonTelemetry } from './global-action-button/logic/EmitActionButtonTelemetry';
import { ResolveActionButtonPresentation } from './global-action-button/logic/ResolveActionButtonPresentation';

export type { TVisualIntentConfigurationLiteral };

/**
 * @interface IGlobalActionButtonProperties
 * @description Contrato inmutable para la parametrización de botones de acción.
 * Fusiona los atributos nativos de `HTMLButtonElement` con el contrato institucional `IUiPrimitives`.
 */
export interface IGlobalActionButtonProperties
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    IUiPrimitives {
  /** Variante cromática que define la intención y jerarquía de la acción. */
  readonly visualIntentConfigurationLiteral?: TVisualIntentConfigurationLiteral;
  /** Indica si la transacción asociada está en progreso (deshabilita la interacción). */
  readonly isExecutionLoadingBoolean?: boolean;
  /** Identificador técnico de la acción para el rastro telemétrico forense. */
  readonly actionIdentifierLiteral?: string;
}

/**
 * Componente atómico de acción interactiva y conversión cívica.
 *
 * @param propertiesSnapshot - Propiedades de estilo, estado de carga, polimorfismo y accesibilidad.
 * @returns {React.ReactElement} Elemento interactivo accesible, estilizado y auditado.
 */
export const GlobalActionButton: React.FC<IGlobalActionButtonProperties> = (propertiesSnapshot) => {
  const {
    children,
    visualIntentConfigurationLiteral,
    isExecutionLoadingBoolean,
    actionIdentifierLiteral,
    isPolymorphicBoolean,
    technicalIdentifier,
    id: nativeElementIdentifier,
    className: nativeClassName,
    externalClassName,
    forensicTestIdentifier,
    accessibilityConfiguration,
    disabled: isNativeDisabledBoolean,
    type: nativeButtonType,
    role: nativeRoleLiteral,
    'aria-label': nativeAriaLabelLiteral,
    onClick,
    ...nativeProperties
  } = propertiesSnapshot;

  const presentationSnapshot = useMemo(
    () =>
      ResolveActionButtonPresentation({
        visualIntentConfigurationLiteral,
        isExecutionLoadingBoolean,
        isNativeDisabledBoolean,
        isPolymorphicBoolean,
        actionIdentifierLiteral,
        technicalIdentifier,
        nativeElementIdentifier,
        externalClassName,
        nativeClassName,
        nativeButtonType,
        nativeRoleLiteral,
        nativeAriaLabelLiteral,
        accessibilityConfiguration,
      }),
    [
      visualIntentConfigurationLiteral,
      isExecutionLoadingBoolean,
      isNativeDisabledBoolean,
      isPolymorphicBoolean,
      actionIdentifierLiteral,
      technicalIdentifier,
      nativeElementIdentifier,
      externalClassName,
      nativeClassName,
      nativeButtonType,
      nativeRoleLiteral,
      nativeAriaLabelLiteral,
      accessibilityConfiguration,
    ],
  );

  const handleInteractionAction = useCallback(
    (mouseEvent: React.MouseEvent<HTMLButtonElement>): void => {
      if (presentationSnapshot.isInteractionDisabledBoolean) {
        mouseEvent.preventDefault();
        return;
      }

      EmitActionButtonTelemetry({
        actionIdentifierLiteral: presentationSnapshot.actionIdentifierLiteral,
        visualIntentConfigurationLiteral: presentationSnapshot.visualIntentConfigurationLiteral,
        isPolymorphicBoolean: presentationSnapshot.isPolymorphicBoolean,
      });

      onClick?.(mouseEvent);
    },
    [
      presentationSnapshot.isInteractionDisabledBoolean,
      presentationSnapshot.actionIdentifierLiteral,
      presentationSnapshot.visualIntentConfigurationLiteral,
      presentationSnapshot.isPolymorphicBoolean,
      onClick,
    ],
  );

  const PolymorphicInteractiveContainer = presentationSnapshot.isPolymorphicBoolean
    ? Slot
    : 'button';

  return (
    <PolymorphicInteractiveContainer
      {...nativeProperties}
      id={presentationSnapshot.resolvedElementIdentifier}
      type={presentationSnapshot.buttonType}
      role={presentationSnapshot.resolvedRoleLiteral}
      className={presentationSnapshot.mergedStylesLiteral}
      disabled={presentationSnapshot.buttonDisabledBoolean}
      onClick={handleInteractionAction}
      aria-label={presentationSnapshot.ariaBindingsSnapshot['aria-label']}
      aria-describedby={presentationSnapshot.ariaBindingsSnapshot['aria-describedby']}
      aria-hidden={presentationSnapshot.ariaBindingsSnapshot['aria-hidden']}
      aria-controls={presentationSnapshot.ariaBindingsSnapshot['aria-controls']}
      aria-expanded={presentationSnapshot.ariaBindingsSnapshot['aria-expanded']}
      aria-disabled={presentationSnapshot.ariaDisabledBoolean}
      aria-busy={presentationSnapshot.isLoadingBoolean}
      data-testid={forensicTestIdentifier}
    >
      {presentationSnapshot.isPolymorphicBoolean ? (
        children
      ) : (
        <>
          <ButtonLoadingOverlay isVisibleBoolean={presentationSnapshot.isLoadingBoolean} />
          <span className={presentationSnapshot.contentWrapperStylesLiteral}>{children}</span>
        </>
      )}
    </PolymorphicInteractiveContainer>
  );
};
