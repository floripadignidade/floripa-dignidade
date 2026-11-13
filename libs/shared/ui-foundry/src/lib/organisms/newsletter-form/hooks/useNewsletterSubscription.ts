'use client';

/**
 * @section Shared UI Foundry - Newsletter Subscription Hook (Orchestrator)
 * @description Hook reactivo extensible y multi-aplicación que coordina validación Zod
 * del formulario, detección dinámica de localización BCP 47 (ADR 0030), protección PII
 * (LGPD) mediante `MaskCitizenIdentity`, transporte HTTP resiliente y telemetría SRE.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179, ISO/IEC 25010 y LGPD (Lei 13.709/2018).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { useCallback, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import type { TSupportedLocale } from '@floripa-dignidade/contracts';
import {
  type INewsletterSubscriptionForm,
  NewsletterSubscriptionFormSchema,
} from '@floripa-dignidade/shared-ui-contracts';
import { MaskCitizenIdentity } from '@floripa-dignidade/shared-utility';
import { GenerateCorrelationIdentifier } from '@floripa-dignidade/telemetry';

import { DispatchNewsletterSubscriptionRequest } from '../logic/atoms/DispatchNewsletterSubscriptionRequest';
import { EmitNewsletterSubscriptionTelemetry } from '../logic/atoms/EmitNewsletterSubscriptionTelemetry';
import { ResolveActiveSubscriptionLocale } from '../logic/atoms/ResolveActiveSubscriptionLocale';
import {
  type ISubscriptionGatewayResponse,
  NewsletterSubscriptionHookParametersSchema,
  type TSubscriptionVerificationChannel,
} from '../schemas/UseNewsletterSubscription.schema';

/**
 * @interface IUseNewsletterSubscriptionParameters
 * @description Configuración extensible del hook para distintas aplicaciones consumidoras.
 */
export interface IUseNewsletterSubscriptionParameters {
  readonly errorGenericLiteral: string;
  readonly targetApiEndpointPathLiteral: string;
  readonly preferredLinguisticLocaleIdentifier?: TSupportedLocale;
  readonly verificationChannelPreference?: TSubscriptionVerificationChannel;
  readonly acquisitionSourceIdentifier?: string;
  readonly requestTimeoutInMillisecondsQuantity?: number;
  readonly correlationHeaderNameLiteral?: string;
  readonly customHeadersMapping?: Readonly<Record<string, string>>;
  readonly onSubmissionSuccessCallback?: (
    gatewayPayloadSnapshot: ISubscriptionGatewayResponse | undefined,
  ) => void;
  readonly onSubmissionFailureCallback?: (errorDescriptionLiteral: string) => void;
}

/**
 * @interface IUseNewsletterSubscriptionResult
 * @description Contrato de estado reactivo y acciones expuestas a la interfaz consumidora.
 */
export interface IUseNewsletterSubscriptionResult {
  readonly formInstance: ReturnType<typeof useForm<INewsletterSubscriptionForm>>;
  readonly isSuccessfullySubmittedBoolean: boolean;
  readonly executionErrorLiteral: string | null;
  readonly resolvedLocaleIdentifier: TSupportedLocale;
  readonly onFormSubmitAction: (dataSnapshot: INewsletterSubscriptionForm) => Promise<void>;
  readonly resetSubmissionStateAction: () => void;
}

/**
 * Orquesta el ciclo completo de suscripción ciudadana con soporte multi-app y configuración declarativa.
 *
 * @param parametersSnapshot - Configuración requerida y personalizaciones opcionales por aplicación.
 * @returns {IUseNewsletterSubscriptionResult} Instancia de formulario, estado y disparadores.
 */
export const useNewsletterSubscription = (
  parametersSnapshot: IUseNewsletterSubscriptionParameters,
): IUseNewsletterSubscriptionResult => {
  const { onSubmissionSuccessCallback, onSubmissionFailureCallback } = parametersSnapshot;

  const serializedConfigurationKeyLiteral = JSON.stringify({
    errorGenericLiteral: parametersSnapshot.errorGenericLiteral,
    targetApiEndpointPathLiteral: parametersSnapshot.targetApiEndpointPathLiteral,
    preferredLinguisticLocaleIdentifier: parametersSnapshot.preferredLinguisticLocaleIdentifier,
    verificationChannelPreference: parametersSnapshot.verificationChannelPreference,
    acquisitionSourceIdentifier: parametersSnapshot.acquisitionSourceIdentifier,
    requestTimeoutInMillisecondsQuantity: parametersSnapshot.requestTimeoutInMillisecondsQuantity,
    correlationHeaderNameLiteral: parametersSnapshot.correlationHeaderNameLiteral,
    customHeadersMapping: parametersSnapshot.customHeadersMapping,
  });

  const validatedConfiguration = useMemo(
    () =>
      NewsletterSubscriptionHookParametersSchema.parse(
        JSON.parse(serializedConfigurationKeyLiteral) as unknown,
      ),
    [serializedConfigurationKeyLiteral],
  );

  const [isSuccessfullySubmittedBoolean, setIsSuccessfullySubmittedBoolean] = useState(false);
  const [executionErrorLiteral, setExecutionErrorLiteral] = useState<string | null>(null);

  const resolvedLocaleIdentifier = useMemo(
    () =>
      ResolveActiveSubscriptionLocale(validatedConfiguration.preferredLinguisticLocaleIdentifier),
    [validatedConfiguration.preferredLinguisticLocaleIdentifier],
  );

  const formInstance = useForm<INewsletterSubscriptionForm>({
    resolver: zodResolver(NewsletterSubscriptionFormSchema),
    defaultValues: {
      electronicMailAddressLiteral: '',
      hasGivenPrivacyConsentBoolean: false,
    },
  });

  const resetSubmissionStateAction = useCallback((): void => {
    setIsSuccessfullySubmittedBoolean(false);
    setExecutionErrorLiteral(null);
    formInstance.reset();
  }, [formInstance]);

  const onFormSubmitAction = useCallback(
    async (dataSnapshot: INewsletterSubscriptionForm): Promise<void> => {
      const correlationIdentifier = GenerateCorrelationIdentifier();
      setExecutionErrorLiteral(null);

      const {
        errorGenericLiteral: configuredErrorMessageLiteral,
        ...transportConfigurationSnapshot
      } = validatedConfiguration;

      const maskedIdentityLiteral = await MaskCitizenIdentity({
        rawIdentityLiteral: dataSnapshot.electronicMailAddressLiteral,
        maskingStrategyLiteral: 'ELECTRONIC_MAIL',
      });

      EmitNewsletterSubscriptionTelemetry({
        stageLiteral: 'STARTED',
        correlationIdentifier,
        contextMetadataSnapshot: {
          maskedIdentityLiteral,
          resolvedLocaleIdentifier,
          acquisitionSourceIdentifier: transportConfigurationSnapshot.acquisitionSourceIdentifier,
        },
      });

      try {
        const dispatchResult = await DispatchNewsletterSubscriptionRequest({
          ...transportConfigurationSnapshot,
          electronicMailAddressLiteral: dataSnapshot.electronicMailAddressLiteral,
          hasGivenPrivacyConsentBoolean: dataSnapshot.hasGivenPrivacyConsentBoolean,
          preferredLinguisticLocaleIdentifier: resolvedLocaleIdentifier,
          correlationIdentifier,
          customHeadersMapping: transportConfigurationSnapshot.customHeadersMapping,
        });

        setIsSuccessfullySubmittedBoolean(true);
        EmitNewsletterSubscriptionTelemetry({
          stageLiteral: 'SUCCESS',
          correlationIdentifier,
          executionLatencyInMillisecondsQuantity:
            dispatchResult.executionLatencyInMillisecondsQuantity,
          contextMetadataSnapshot: {
            httpStatusCodeNumeric: dispatchResult.httpStatusCodeNumeric,
            resolvedLocaleIdentifier,
            acquisitionSourceIdentifier: transportConfigurationSnapshot.acquisitionSourceIdentifier,
          },
        });

        onSubmissionSuccessCallback?.(dispatchResult.gatewayPayloadSnapshot);
      } catch (caughtError: unknown) {
        const errorDescriptionLiteral =
          caughtError instanceof Error ? caughtError.message : String(caughtError);

        setExecutionErrorLiteral(configuredErrorMessageLiteral);
        EmitNewsletterSubscriptionTelemetry({
          stageLiteral: 'FAULT',
          correlationIdentifier,
          contextMetadataSnapshot: {
            errorTraceLiteral: errorDescriptionLiteral,
            acquisitionSourceIdentifier: transportConfigurationSnapshot.acquisitionSourceIdentifier,
          },
        });

        onSubmissionFailureCallback?.(errorDescriptionLiteral);
      }
    },
    [
      validatedConfiguration,
      resolvedLocaleIdentifier,
      onSubmissionSuccessCallback,
      onSubmissionFailureCallback,
    ],
  );

  return {
    formInstance,
    isSuccessfullySubmittedBoolean,
    executionErrorLiteral,
    resolvedLocaleIdentifier,
    onFormSubmitAction,
    resetSubmissionStateAction,
  };
};
