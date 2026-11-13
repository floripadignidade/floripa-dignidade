'use client';

/**
 * @section Shared UI Foundry - Newsletter Subscription Form (Orchestrator)
 * @description Organismo cliente para la captación ciudadana en la red de transparencia.
 * Coordina el hook `useNewsletterSubscription` con los componentes atómicos de entrada,
 * consentimiento LGPD, estado de éxito y alertas de infraestructura, mapeando los códigos
 * de error Zod a mensajes localizados y emitiendo telemetría conforme a `TelemetrySignalSchema`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 y LGPD (Lei 13.709/2018).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useEffect, useMemo, useRef } from 'react';

import type { TSupportedLocale } from '@floripa-dignidade/contracts';
import {
  type INewsletterSubscriptionFormI18n,
  NewsletterSubscriptionFormPropertiesSchema,
} from '@floripa-dignidade/shared-ui-contracts';
import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

import { NewsletterInfrastructureAlert } from './newsletter-form/components/NewsletterInfrastructureAlert';
import { SubscriptionConsentBlock } from './newsletter-form/components/SubscriptionConsentBlock';
import { SubscriptionInputGroup } from './newsletter-form/components/SubscriptionInputGroup';
import { SubscriptionSuccessState } from './newsletter-form/components/SubscriptionSuccessState';
import { useNewsletterSubscription } from './newsletter-form/hooks/useNewsletterSubscription';

const FORM_ORCHESTRATOR_IDENTIFIER = 'NEWSLETTER_FORM_ORCHESTRATOR' as ModuleIdentifier;

/**
 * @interface IGlobalNewsletterSubscriptionFormProperties
 * @description Contrato inmutable de propiedades para el formulario de suscripción.
 */
export interface IGlobalNewsletterSubscriptionFormProperties {
  readonly translationDictionary: INewsletterSubscriptionFormI18n;
  readonly targetApiEndpointPathLiteral?: string;
  readonly visualVariantLiteral?: 'STANDARD' | 'MINIMAL';
  readonly preferredLinguisticLocaleIdentifier?: TSupportedLocale;
  readonly externalClassName?: string;
  readonly forensicTestIdentifier?: string;
}

const resolveEmailValidationMessageLiteral = (
  errorCodeLiteral: string | undefined,
  validationDictionary: INewsletterSubscriptionFormI18n['validation'],
): string =>
  errorCodeLiteral === 'ERROR_EMAIL_REQUIRED'
    ? validationDictionary.emailRequiredLiteral
    : validationDictionary.emailInvalidLiteral;

/**
 * Orquestador visual del formulario de captación ciudadana con validación LGPD.
 *
 * @param propertiesSnapshot - Diccionario localizado y configuración opcional del formulario.
 * @returns {React.ReactElement} Interfaz de suscripción validada y accesible.
 */
export const NewsletterSubscriptionForm: React.FC<IGlobalNewsletterSubscriptionFormProperties> = (
  propertiesSnapshot,
) => {
  const { translationDictionary, preferredLinguisticLocaleIdentifier } = propertiesSnapshot;

  const serializedPropertiesKeyLiteral = JSON.stringify({
    targetApiEndpointPathLiteral: propertiesSnapshot.targetApiEndpointPathLiteral,
    visualVariantLiteral: propertiesSnapshot.visualVariantLiteral,
    externalClassName: propertiesSnapshot.externalClassName,
    forensicTestIdentifier: propertiesSnapshot.forensicTestIdentifier,
  });

  const formConfigurationSnapshot = useMemo(
    () =>
      NewsletterSubscriptionFormPropertiesSchema.parse(
        JSON.parse(serializedPropertiesKeyLiteral) as unknown,
      ),
    [serializedPropertiesKeyLiteral],
  );

  const hasEmittedMountSignalBooleanReference = useRef(false);
  const { visualVariantLiteral, forensicTestIdentifier } = formConfigurationSnapshot;

  useEffect(() => {
    if (hasEmittedMountSignalBooleanReference.current) return;
    hasEmittedMountSignalBooleanReference.current = true;

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: FORM_ORCHESTRATOR_IDENTIFIER,
      operationCodeLiteral: 'FORM_ORCHESTRATOR_MOUNTED' as OperationCode,
      correlationIdentifier: GenerateCorrelationIdentifier(),
      messageContentLiteral: `Formulario de captación activo. Variante:[${visualVariantLiteral}]`,
      semanticIntentTag: 'UI_CONVERSION_MOUNT',
      contextMetadataSnapshot: {
        visualVariantLiteral,
        ...(forensicTestIdentifier !== undefined && { forensicTestIdentifier }),
      },
    });
  }, [visualVariantLiteral, forensicTestIdentifier]);

  const {
    formInstance,
    isSuccessfullySubmittedBoolean,
    executionErrorLiteral,
    onFormSubmitAction,
  } = useNewsletterSubscription({
    errorGenericLiteral: translationDictionary.messages.errorGenericLiteral,
    targetApiEndpointPathLiteral: formConfigurationSnapshot.targetApiEndpointPathLiteral,
    ...(preferredLinguisticLocaleIdentifier !== undefined && {
      preferredLinguisticLocaleIdentifier,
    }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: isSubmittingBoolean },
  } = formInstance;

  const containerStylesLiteral = useMemo(
    () =>
      GlobalStyleClassMerger(
        'flex flex-col w-full gap-6 transition-opacity duration-500',
        formConfigurationSnapshot.externalClassName,
        isSubmittingBoolean ? 'opacity-70' : 'opacity-100',
      ),
    [formConfigurationSnapshot.externalClassName, isSubmittingBoolean],
  );

  if (isSuccessfullySubmittedBoolean) {
    return (
      <SubscriptionSuccessState
        headlineLiteral={translationDictionary.messages.successHeadlineLiteral}
        descriptionLiteral={translationDictionary.messages.successDescriptionLiteral}
      />
    );
  }

  const hasEmailErrorBoolean = Boolean(errors.electronicMailAddressLiteral);
  const hasConsentErrorBoolean = Boolean(errors.hasGivenPrivacyConsentBoolean);
  const resolvedEmailErrorMessageLiteral = resolveEmailValidationMessageLiteral(
    errors.electronicMailAddressLiteral?.message,
    translationDictionary.validation,
  );
  const resolvedConsentErrorMessageLiteral = hasConsentErrorBoolean
    ? translationDictionary.validation.consentRequiredLiteral
    : '';

  return (
    <form
      onSubmit={(submitEvent) => void handleSubmit(onFormSubmitAction)(submitEvent)}
      className={containerStylesLiteral}
      noValidate
      data-testid={forensicTestIdentifier}
    >
      <SubscriptionInputGroup
        register={register('electronicMailAddressLiteral')}
        isExecutingBoolean={isSubmittingBoolean}
        hasErrorBoolean={hasEmailErrorBoolean}
        placeholderLiteral={translationDictionary.labels.inputPlaceholderLiteral}
        buttonLabelLiteral={
          isSubmittingBoolean
            ? translationDictionary.labels.submittingStatusLiteral
            : translationDictionary.labels.submitButtonLiteral
        }
        isMinimalVariantBoolean={visualVariantLiteral === 'MINIMAL'}
      />
      <SubscriptionConsentBlock
        register={register('hasGivenPrivacyConsentBoolean')}
        labelLiteral={translationDictionary.labels.consentCheckboxLiteral}
        validationErrorLiteral={resolvedConsentErrorMessageLiteral}
        hasEmailErrorBoolean={hasEmailErrorBoolean}
        emailInvalidLiteral={resolvedEmailErrorMessageLiteral}
      />
      <NewsletterInfrastructureAlert errorLiteral={executionErrorLiteral} />
    </form>
  );
};
