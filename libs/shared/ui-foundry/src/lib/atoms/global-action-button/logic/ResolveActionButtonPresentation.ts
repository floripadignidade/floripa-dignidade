/**
 * @file libs/shared/ui-foundry/src/lib/atoms/global-action-button/logic/ResolveActionButtonPresentation.ts
 * @section Shared UI Foundry - Action Button Presentation Resolver (Atom)
 * @description Átomo de lógica pura encargado de normalizar propiedades, resolver variantes
 * cromáticas, fusionar clases CSS (`externalClassName` y `className`), mapear atributos
 * WAI-ARIA (`IAriaAttributes`) y determinar atributos seguros para modo nativo o polimórfico.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 y W3C WCAG 2.2 AAA.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type React from 'react';

import type { IAriaAttributes } from '@floripa-dignidade/shared-ui-contracts';
import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';

import {
  ACTION_BUTTON_BASE_STRUCTURAL_STYLES_LITERAL,
  ACTION_BUTTON_VARIANT_STYLES_MAPPING,
  type TVisualIntentConfigurationLiteral,
} from '../constants/ActionButtonStyles.mapping';

const CONTENT_WRAPPER_BASE_STYLES_LITERAL =
  'flex items-center justify-center gap-2 transition-opacity duration-300 w-full';

type TAriaBindingsSnapshot = React.AriaAttributes & { readonly role?: string | undefined };

/**
 * @interface IActionButtonPresentationInput
 * @description Contrato inmutable de entrada con las propiedades crudas de `GlobalActionButton`.
 */
export interface IActionButtonPresentationInput {
  readonly visualIntentConfigurationLiteral: TVisualIntentConfigurationLiteral | undefined;
  readonly isExecutionLoadingBoolean: boolean | undefined;
  readonly isNativeDisabledBoolean: boolean | undefined;
  readonly isPolymorphicBoolean: boolean | undefined;
  readonly actionIdentifierLiteral: string | undefined;
  readonly technicalIdentifier: string | undefined;
  readonly nativeElementIdentifier: string | undefined;
  readonly externalClassName: string | undefined;
  readonly nativeClassName: string | undefined;
  readonly nativeButtonType: 'button' | 'submit' | 'reset' | undefined;
  readonly nativeRoleLiteral: string | undefined;
  readonly nativeAriaLabelLiteral: string | undefined;
  readonly accessibilityConfiguration: IAriaAttributes | undefined;
}

/**
 * @interface IActionButtonPresentationSnapshot
 * @description Contrato inmutable con los valores derivados listos para renderizado a 120 FPS.
 */
export interface IActionButtonPresentationSnapshot {
  readonly visualIntentConfigurationLiteral: TVisualIntentConfigurationLiteral;
  readonly actionIdentifierLiteral: string;
  readonly isLoadingBoolean: boolean;
  readonly isInteractionDisabledBoolean: boolean;
  readonly isPolymorphicBoolean: boolean;
  readonly mergedStylesLiteral: string;
  readonly contentWrapperStylesLiteral: string;
  readonly resolvedElementIdentifier: string | undefined;
  readonly resolvedRoleLiteral: string | undefined;
  readonly buttonType: 'button' | 'submit' | 'reset' | undefined;
  readonly buttonDisabledBoolean: boolean | undefined;
  readonly ariaDisabledBoolean: boolean | undefined;
  readonly ariaBindingsSnapshot: TAriaBindingsSnapshot;
}

const resolveVariantStylesLiteral = (
  visualIntentCandidate: TVisualIntentConfigurationLiteral,
): string => {
  const isKnownVariantBoolean = Object.prototype.hasOwnProperty.call(
    ACTION_BUTTON_VARIANT_STYLES_MAPPING,
    visualIntentCandidate,
  );

  return isKnownVariantBoolean
    ? ACTION_BUTTON_VARIANT_STYLES_MAPPING[visualIntentCandidate]
    : ACTION_BUTTON_VARIANT_STYLES_MAPPING.STANDARD;
};

const resolveAriaBindingsSnapshot = (
  accessibilityConfiguration: IAriaAttributes | undefined,
  nativeAriaLabelLiteral: string | undefined,
  actionIdentifierLiteral: string,
): TAriaBindingsSnapshot => ({
  'aria-label':
    accessibilityConfiguration?.accessibilityLabelLiteral ??
    nativeAriaLabelLiteral ??
    actionIdentifierLiteral,
  'aria-describedby': accessibilityConfiguration?.accessibilityDescribedByReference,
  'aria-hidden': accessibilityConfiguration?.isAccessibilityHiddenBoolean,
  'aria-controls': accessibilityConfiguration?.ariaControlsReference,
  'aria-expanded': accessibilityConfiguration?.isAriaExpandedBoolean,
  role: accessibilityConfiguration?.semanticRoleLiteral,
});

const resolveActionButtonIdentity = (inputSnapshot: IActionButtonPresentationInput) => {
  const isLoadingBoolean = Boolean(inputSnapshot.isExecutionLoadingBoolean);

  return {
    visualIntentConfigurationLiteral: inputSnapshot.visualIntentConfigurationLiteral ?? 'STANDARD',
    actionIdentifierLiteral: inputSnapshot.actionIdentifierLiteral ?? 'UNNAMED_ACTION',
    isLoadingBoolean,
    isInteractionDisabledBoolean:
      isLoadingBoolean || Boolean(inputSnapshot.isNativeDisabledBoolean),
    isPolymorphicBoolean: Boolean(inputSnapshot.isPolymorphicBoolean),
    resolvedElementIdentifier:
      inputSnapshot.nativeElementIdentifier ?? inputSnapshot.technicalIdentifier,
  };
};

const resolveInteractiveAttributes = (
  isPolymorphicBoolean: boolean,
  isInteractionDisabledBoolean: boolean,
  nativeButtonType: 'button' | 'submit' | 'reset' | undefined,
) => {
  if (isPolymorphicBoolean) {
    return {
      buttonType: undefined,
      buttonDisabledBoolean: undefined,
      ariaDisabledBoolean: isInteractionDisabledBoolean || undefined,
    };
  }

  return {
    buttonType: nativeButtonType ?? 'button',
    buttonDisabledBoolean: isInteractionDisabledBoolean,
    ariaDisabledBoolean: isInteractionDisabledBoolean || undefined,
  };
};

/**
 * Calcula y sella inmutablemente los estilos, atributos ARIA y estado interactivo del botón.
 *
 * @param inputSnapshot - Propiedades crudas recibidas por el componente `GlobalActionButton`.
 * @returns {IActionButtonPresentationSnapshot} Snapshot inmutable listo para el renderizado React.
 */
export const ResolveActionButtonPresentation = (
  inputSnapshot: IActionButtonPresentationInput,
): IActionButtonPresentationSnapshot => {
  const identitySnapshot = resolveActionButtonIdentity(inputSnapshot);
  const variantStylesLiteral = resolveVariantStylesLiteral(
    identitySnapshot.visualIntentConfigurationLiteral,
  );
  const ariaBindingsSnapshot = resolveAriaBindingsSnapshot(
    inputSnapshot.accessibilityConfiguration,
    inputSnapshot.nativeAriaLabelLiteral,
    identitySnapshot.actionIdentifierLiteral,
  );
  const interactiveAttributesSnapshot = resolveInteractiveAttributes(
    identitySnapshot.isPolymorphicBoolean,
    identitySnapshot.isInteractionDisabledBoolean,
    inputSnapshot.nativeButtonType,
  );

  const contentOpacityStylesLiteral = identitySnapshot.isLoadingBoolean
    ? 'opacity-0'
    : 'opacity-100';

  return Object.freeze({
    ...identitySnapshot,
    ...interactiveAttributesSnapshot,
    mergedStylesLiteral: GlobalStyleClassMerger(
      ACTION_BUTTON_BASE_STRUCTURAL_STYLES_LITERAL,
      variantStylesLiteral,
      inputSnapshot.externalClassName,
      inputSnapshot.nativeClassName,
    ),
    contentWrapperStylesLiteral: GlobalStyleClassMerger(
      CONTENT_WRAPPER_BASE_STYLES_LITERAL,
      contentOpacityStylesLiteral,
    ),
    resolvedRoleLiteral: ariaBindingsSnapshot.role ?? inputSnapshot.nativeRoleLiteral,
    ariaBindingsSnapshot,
  });
};
