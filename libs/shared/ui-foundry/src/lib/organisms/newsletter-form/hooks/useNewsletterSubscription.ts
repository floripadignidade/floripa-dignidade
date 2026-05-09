'use client';

/**
 * @section UI Logic - Newsletter Subscription Hook
 * @description Hook soberano encargado de gestionar el ciclo de vida de la
 * suscripción ciudadana. Orquesta la validación de ADN, la comunicación
 * con la API y el rastro telemétrico de conversión social.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Functional Atomicity.
 * SANEADO Zenith: Materialización inicial bajo estándares ISO y telemetría forense.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

/* 1. Infraestructura Core y Utilidades (Sovereign Swarm) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
} from '@floripa-dignidade/telemetry';

import { MaskSovereignIdentity } from '@floripa-dignidade/shared-utility';

/* 2. ADN Estructural (Sovereign Schemas) */
import { NewsletterSubscriptionFormSchema } from '../../../ui-primitives/schemas/NewsletterSubscriptionForm.schema';
import type { INewsletterSubscriptionForm } from '../../../ui-primitives/schemas/NewsletterSubscriptionForm.schema';

/**
 * @interface IUseNewsletterSubscriptionParameters
 * @description Contrato inmutable para la parametrización de la lógica de estado.
 */
interface IUseNewsletterSubscriptionParameters {
  /** Literal localizado para el reporte de fallos genéricos. */
  readonly errorGenericLiteral: string;
  /** Ruta física absoluta o relativa del Gateway de suscripción. */
  readonly targetApiEndpointPathLiteral: string;
}

/**
 * @interface IUseNewsletterSubscriptionResult
 * @description Capacidades expuestas para el orquestador visual (Form).
 */
interface IUseNewsletterSubscriptionResult {
  readonly formInstance: ReturnType<typeof useForm<INewsletterSubscriptionForm>>;
  readonly isSuccessfullySubmittedBoolean: boolean;
  readonly executionErrorLiteral: string | null;
  readonly onFormSubmitAction: (dataSnapshot: INewsletterSubscriptionForm) => Promise<void>;
}

/** Identificador técnico del aparato para el Neural Sentinel. */
const HOOK_IDENTIFIER = 'USE_NEWSLETTER_SUBSCRIPTION_HOOK';

/**
 * Gestiona la lógica reactiva y la persistencia cloud de la suscripción.
 *
 * @param parameters - Configuración de mensajes y destinos de red.
 * @returns {IUseNewsletterSubscriptionResult} Motores de estado y acciones.
 */
export const useNewsletterSubscription = (
  parameters: IUseNewsletterSubscriptionParameters
): IUseNewsletterSubscriptionResult => {

  // --- 1. ESTADOS ATÓMICOS DE CONVERSIÓN ---
  const [isSuccessfullySubmittedBoolean, setIsSuccessfullySubmittedBoolean] = useState(false);
  const [executionErrorLiteral, setExecutionErrorLiteral] = useState<string | null>(null);

  // --- 2. INICIALIZACIÓN DE ADUANA (Form Control) ---
  const formInstance = useForm<INewsletterSubscriptionForm>({
    resolver: zodResolver(NewsletterSubscriptionFormSchema),
    defaultValues: {
      electronicMailAddressLiteral: '',
      hasGivenPrivacyConsentBoolean: false,
    },
  });

  /**
   * @section Acción: onFormSubmitAction
   * @description Ejecuta el despacho físico de la identidad ciudadana hacia la nube.
   */
  const onFormSubmitAction = async (
    dataSnapshot: INewsletterSubscriptionForm
  ): Promise<void> => {
    const correlationIdentifier = GenerateCorrelationIdentifier();
    setExecutionErrorLiteral(null);

    // Protegemos la privacidad en el log enmascarando el email (LGPD Compliance)
    const maskedIdentityLiteral = MaskSovereignIdentity({
      rawIdentityLiteral: dataSnapshot.electronicMailAddressLiteral,
      maskingStrategyLiteral: 'ELECTRONIC_MAIL'
    });

    void EmitTelemetrySignal({
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: HOOK_IDENTIFIER,
      operationCodeLiteral: 'SUBSCRIPTION_TRANSACTION_STARTED',
      correlationIdentifier,
      messageContentLiteral: `Iniciando despacho de suscripción para [${maskedIdentityLiteral}].`,
    });

    try {
      /**
       * FASE 1: DESPACHO FÍSICO (Cloud I/O)
       * Implementamos protocolo Stateless Fetch hacia el Gateway de la aplicación.
       */
      const networkResponse = await fetch(parameters.targetApiEndpointPathLiteral, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Floripa-Correlation-ID': correlationIdentifier,
        },
        body: JSON.stringify({
          communicationIdentifierLiteral: dataSnapshot.electronicMailAddressLiteral,
          verificationChannelPreference: 'ELECTRONIC_MAIL',
          preferredLinguisticLocaleIdentifier: 'pt-BR', // TODO: Detectar dinámicamente
          hasGivenPrivacyConsentBoolean: dataSnapshot.hasGivenPrivacyConsentBoolean,
        }),
      });

      if (!networkResponse.ok) {
        throw new Error(`GATEWAY_FAULT_CODE_${networkResponse.status}`);
      }

      // FASE 2: CONSOLIDACIÓN DE ÉXITO
      setIsSuccessfullySubmittedBoolean(true);

      void EmitTelemetrySignal({
        severityLevelLiteral: 'INFO',
        moduleIdentifierLiteral: HOOK_IDENTIFIER,
        operationCodeLiteral: 'SUBSCRIPTION_CONVERSION_SUCCESS',
        correlationIdentifier,
        messageContentLiteral: 'Ciudadano integrado exitosamente en el flujo de verificación.',
      });

    } catch (caughtError: unknown) {
      /**
       * FASE 3: GESTIÓN FORENSE DE FALLO (Resilience)
       */
      const errorDescriptionLiteral = caughtError instanceof Error
        ? caughtError.message
        : String(caughtError);

      setExecutionErrorLiteral(parameters.errorGenericLiteral);

      void EmitTelemetrySignal({
        severityLevelLiteral: 'ERROR',
        moduleIdentifierLiteral: HOOK_IDENTIFIER,
        operationCodeLiteral: 'SUBSCRIPTION_DISPATCH_FAULT',
        correlationIdentifier,
        messageContentLiteral: 'Fallo al intentar sincronizar suscripción con la nube.',
        contextMetadataSnapshot: { errorTraceLiteral: errorDescriptionLiteral }
      });
    }
  };

  return {
    formInstance,
    isSuccessfullySubmittedBoolean,
    executionErrorLiteral,
    onFormSubmitAction,
  };
};
