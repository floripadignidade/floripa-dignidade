'use client';

/**
 * @section Shared UI Foundry - Newsletter Subscription Form (Orchestrator)
 * @description Punto de ensamblaje soberano para la captación de ciudadanos en la
 * red de transparencia. Orquesta la interacción entre el hook de lógica y el
 * enjambre de átomos visuales (Input, Consentimiento, Alertas).
 * Implementa validación proactiva LGPD y rastro telemétrico forense.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Erradicación de extensiones (.js), atomización de alertas,
 * optimización de renderizado (useMemo) y cumplimiento estricto de Prosa ISO.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useEffect, useMemo } from 'react';

/* 1. Infraestructura Core y Utilidades (Sovereign Swarm) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
} from '@floripa-dignidade/telemetry';

import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';

/* 2. Planos y Contratos (Blueprints Layer - Clean Paths) */
import {
  NewsletterSubscriptionFormPropertiesSchema,
} from '@floripa-dignidade/shared-ui-contracts';

import type { INewsletterSubscriptionFormI18n } from '@floripa-dignidade/shared-ui-contracts';

/* 3. Enjambre Atómico Local (Internal Swarm - Clean Imports) */
import { useNewsletterSubscription } from './newsletter-form/hooks/useNewsletterSubscription';
import { SubscriptionSuccessState } from './newsletter-form/components/SubscriptionSuccessState';
import { SubscriptionInputGroup } from './newsletter-form/components/SubscriptionInputGroup';
import { SubscriptionConsentBlock } from './newsletter-form/components/SubscriptionConsentBlock';

/**
 * 🛡️ LEY DE ATOMIZACIÓN: La alerta de infraestructura ha sido elevada a Átomo.
 * Se entrega como búnker independiente en el siguiente ciclo.
 */
import { NewsletterInfrastructureAlert } from './newsletter-form/components/NewsletterInfrastructureAlert';

/** Identificador técnico del aparato para el Neural Sentinel. */
const FORM_ORCHESTRATOR_IDENTIFIER = 'NEWSLETTER_FORM_ORCHESTRATOR';

/**
 * @interface IGlobalNewsletterSubscriptionFormProperties
 * @description Contrato inmutable para la parametrización del formulario de captación.
 * Sigue la norma ISO 11179 de Objeto + Propiedad + Representación.
 */
interface IGlobalNewsletterSubscriptionFormProperties {
  /** Diccionario de traducciones íntegro validado por la aduana Zod. */
  readonly translationDictionary: INewsletterSubscriptionFormI18n;
  /** Ruta física de la API para el despacho de datos cloud (Default: /api/newsletter/subscribe). */
  readonly targetApiEndpointPathLiteral?: string;
  /** Variante visual para adaptación en diferentes secciones (ej: Footer vs Hero). */
  readonly visualVariantLiteral?: 'STANDARD' | 'MINIMAL';
  /** Clases CSS externas para ajustes de posicionamiento perimetral. */
  readonly externalClassName?: string;
  /** Identificador único para pruebas de auditoría y automatización E2E. */
  readonly forensicTestIdentifier?: string;
}

/**
 * Orquestador encargado de la captación y validación de ciudadanos.
 * Implementa una arquitectura desacoplada donde la lógica reside en Hooks y el estilo en Átomos.
 *
 * @param propertiesSnapshot - Snapshot de configuración y lenguaje.
 * @returns {React.ReactElement} Interfaz de conversión social de alta fidelidad.
 */
export const NewsletterSubscriptionForm: React.FC<IGlobalNewsletterSubscriptionFormProperties> = (
  propertiesSnapshot
) => {
  /**
   * @section Triaje de Propiedades (Aduana Zenith)
   * 🛡️ LEY SRE: Validamos los parámetros técnicos mediante el esquema de contratos
   * inyectando el rastro de clases externas.
   */
  const formConfigurationSnapshot = NewsletterSubscriptionFormPropertiesSchema.parse({
    targetApiEndpointPathLiteral: propertiesSnapshot.targetApiEndpointPathLiteral,
    visualVariantLiteral: propertiesSnapshot.visualVariantLiteral,
    externalClassName: propertiesSnapshot.externalClassName,
    forensicTestIdentifier: propertiesSnapshot.forensicTestIdentifier
  });

  // --- 2. TELEMETRÍA DE MONTAJE (SRE Visibility) ---
  useEffect(() => {
    const correlationIdentifier = GenerateCorrelationIdentifier();

    void EmitTelemetrySignal({
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: FORM_ORCHESTRATOR_IDENTIFIER,
      operationCodeLiteral: 'FORM_ORCHESTRATOR_MOUNTED',
      correlationIdentifier,
      messageContentLiteral: `Formulario de captación activo. Variante:[${formConfigurationSnapshot.visualVariantLiteral}]`,
      semanticIntentTag: 'UI_CONVERSION_MOUNT',
      contextMetadataSnapshot: {
        visualVariantLiteral: formConfigurationSnapshot.visualVariantLiteral,
        forensicId: formConfigurationSnapshot.forensicTestIdentifier,
        timestampISO: new Date().toISOString()
      }
    });
  }, [formConfigurationSnapshot.visualVariantLiteral, formConfigurationSnapshot.forensicTestIdentifier]);

  // --- 3. LÓGICA DE ESTADO (Hook Swarm Delegation) ---
  const {
    formInstance: {
      register,
      handleSubmit,
      formState: { errors, isSubmitting: isSubmittingBoolean },
    },
    isSuccessfullySubmittedBoolean,
    executionErrorLiteral,
    onFormSubmitAction,
  } = useNewsletterSubscription({
    errorGenericLiteral: propertiesSnapshot.translationDictionary.messages.errorGenericLiteral,
    targetApiEndpointPathLiteral: formConfigurationSnapshot.targetApiEndpointPathLiteral,
  });

  /**
   * @section Gestión de Estilos Dinámicos
   * Memoizamos la fusión de clases para proteger el rendimiento del Main Thread.
   */
  const containerStylesLiteral = useMemo(() =>
    GlobalStyleClassMerger(
      'flex flex-col w-full gap-6 transition-opacity duration-500',
      propertiesSnapshot.externalClassName,
      isSubmittingBoolean ? 'opacity-70' : 'opacity-100'
    ),
    [propertiesSnapshot.externalClassName, isSubmittingBoolean]
  );

  // --- 4. ESTADO DE ÉXITO (Conversion Confirmation) ---
  if (isSuccessfullySubmittedBoolean) {
    return (
      <SubscriptionSuccessState
        headlineLiteral={propertiesSnapshot.translationDictionary.messages.successHeadlineLiteral}
        descriptionLiteral={propertiesSnapshot.translationDictionary.messages.successDescriptionLiteral}
      />
    );
  }

  // --- 5. RENDERIZADO DEL ENJAMBRE (Atomic Assembly) ---
  return (
    <form
      onSubmit={handleSubmit(onFormSubmitAction)}
      className={containerStylesLiteral}
      noValidate
      data-testid={formConfigurationSnapshot.forensicTestIdentifier}
    >
      {/* ÁTOMO A: Captura de Identidad de Comunicación */}
      <SubscriptionInputGroup
        register={register('electronicMailAddressLiteral')}
        isExecutingBoolean={isSubmittingBoolean}
        hasErrorBoolean={!!errors.electronicMailAddressLiteral}
        placeholderLiteral={propertiesSnapshot.translationDictionary.labels.inputPlaceholderLiteral}
        buttonLabelLiteral={propertiesSnapshot.translationDictionary.labels.submitButtonLiteral}
        isMinimalVariantBoolean={formConfigurationSnapshot.visualVariantLiteral === 'MINIMAL'}
      />

      {/* ÁTOMO B: Cumplimiento Legal (Consentimiento LGPD) */}
      <SubscriptionConsentBlock
        register={register('hasGivenPrivacyConsentBoolean')}
        labelLiteral={propertiesSnapshot.translationDictionary.labels.consentCheckboxLiteral}
        validationErrorLiteral={errors.hasGivenPrivacyConsentBoolean?.message ?? ''}
        hasEmailErrorBoolean={!!errors.electronicMailAddressLiteral}
        emailInvalidLiteral={propertiesSnapshot.translationDictionary.validation.emailInvalidLiteral}
      />

      {/* ÁTOMO C: Alerta de Fallo de Infraestructura (Delegación Atómica) */}
      <NewsletterInfrastructureAlert
        errorLiteral={executionErrorLiteral}
      />
    </form>
  );
};
