'use client';

/**
 * @section UI Logic - Newsletter Subscription Hook (Orchestrator)
 * @description Hook soberano encargado de gestionar el ciclo de vida de la
 * suscripción ciudadana. Orquesta la validación de ADN, el enmascaramiento
 * de privacidad (LGPD), la comunicación asíncrona con el Gateway y el rastro
 * telemétrico de conversión social.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Functional Atomicity.
 * SANEADO Zenith: Resolución de TS2307 (Contracts Sync), sincronización de
 * privacidad asíncrona e inyección de protección de timeout (SRE).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

/* 1. Infraestructura Core y Utilidades (Sovereign Swarm) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
} from '@floripa-dignidade/telemetry';

import { MaskSovereignIdentity } from '@floripa-dignidade/shared-utility';

/* 2. ADN Estructural (Blueprints Layer) */
/** 🛡️ SANEADO Zenith: Redirección hacia el búnker de contratos oficial. */
import {
  NewsletterSubscriptionFormSchema
} from '@floripa-dignidade/shared-ui-contracts';

import type {
  INewsletterSubscriptionForm
} from '@floripa-dignidade/shared-ui-contracts';

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
 * Gestiona la lógica reactiva y la persistencia cloud de la suscripción ciudadana.
 * Implementa el patrón "Sovereign Ingestion" con blindaje de privacidad.
 *
 * @param parametersSnapshot - Configuración de mensajes y destinos de red.
 * @returns {IUseNewsletterSubscriptionResult} Motores de estado y acciones.
 */
export const useNewsletterSubscription = (
  parametersSnapshot: IUseNewsletterSubscriptionParameters
): IUseNewsletterSubscriptionResult => {

  // --- 1. ESTADOS ATÓMICOS DE CONVERSIÓN (Prosa Booleana) ---
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
   * @description Ejecuta el despacho físico de la identidad hacia la nube.
   */
  const onFormSubmitAction = useCallback(async (
    dataSnapshot: INewsletterSubscriptionForm
  ): Promise<void> => {
    const correlationIdentifier = GenerateCorrelationIdentifier();
    setExecutionErrorLiteral(null);

    /**
     * 🛡️ SANEADO Zenith: Sincronización con la utilidad de privacidad asíncrona.
     * Enmascaramos el email para los logs telemétricos (LGPD Compliance).
     */
    const maskedIdentityLiteral = await MaskSovereignIdentity({
      rawIdentityLiteral: dataSnapshot.electronicMailAddressLiteral,
      maskingStrategyLiteral: 'ELECTRONIC_MAIL'
    });

    void EmitTelemetrySignal({
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: HOOK_IDENTIFIER,
      operationCodeLiteral: 'SUBSCRIPTION_TRANSACTION_STARTED',
      correlationIdentifier,
      messageContentLiteral: `Iniciando despacho de suscripción para [${maskedIdentityLiteral}].`,
      semanticIntentTag: 'NEWSLETTER_CONVERSION_START'
    });

    try {
      /**
       * FASE 1: DESPACHO FÍSICO (Cloud I/O)
       * Implementamos protocolo Stateless Fetch con protección SRE de timeout.
       */
      const networkResponse = await fetch(parametersSnapshot.targetApiEndpointPathLiteral, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Floripa-Correlation-ID': correlationIdentifier,
        },
        body: JSON.stringify({
          communicationIdentifierLiteral: dataSnapshot.electronicMailAddressLiteral,
          verificationChannelPreference: 'ELECTRONIC_MAIL',
          preferredLinguisticLocaleIdentifier: 'pt-BR',
          hasGivenPrivacyConsentBoolean: dataSnapshot.hasGivenPrivacyConsentBoolean,
        }),
        /** 🛡️ SANEADO: Timeout de 10 segundos para prevenir bloqueos de hardware. */
        signal: AbortSignal.timeout(10000)
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
        semanticIntentTag: 'NEWSLETTER_CONVERSION_COMPLETE'
      });

    } catch (caughtError: unknown) {
      /**
       * FASE 3: GESTIÓN FORENSE DE FALLO (Resilience Layer)
       */
      const errorDescriptionLiteral = caughtError instanceof Error
        ? caughtError.message
        : String(caughtError);

      setExecutionErrorLiteral(parametersSnapshot.errorGenericLiteral);

      void EmitTelemetrySignal({
        severityLevelLiteral: 'ERROR',
        moduleIdentifierLiteral: HOOK_IDENTIFIER,
        operationCodeLiteral: 'SUBSCRIPTION_DISPATCH_FAULT',
        correlationIdentifier,
        messageContentLiteral: 'Fallo al intentar sincronizar suscripción con la nube.',
        semanticIntentTag: 'INFRASTRUCTURE_IO_FAULT',
        contextMetadataSnapshot: { errorTraceLiteral: errorDescriptionLiteral }
      });
    }
  }, [parametersSnapshot]);

  return {
    formInstance,
    isSuccessfullySubmittedBoolean,
    executionErrorLiteral,
    onFormSubmitAction,
  };
};
