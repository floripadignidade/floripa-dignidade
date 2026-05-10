'use client';

/**
 * @section UI Orchestrator - Newsletter Subscription Form
 * @description Punto de ensamblaje soberano para la captación de ciudadanos.
 * Orquesta la interacción entre el hook de lógica y el enjambre de átomos visuales.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Swarm Intelligence.
 * SANEADO Zenith: Integración de 'ui-contracts', cumplimiento de Prosa ISO
 * y erradicación de rutas relativas de ADN.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

/* 1. Infraestructura Core y Utilidades (Sovereign Swarm) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
} from '@floripa-dignidade/telemetry';

import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';

/* 2. Planos y Contratos (Blueprints Layer) */
import {
  NewsletterSubscriptionFormPropertiesSchema,
  type INewsletterSubscriptionFormI18n
} from '@floripa-dignidade/shared-ui-contracts';

/* 3. Enjambre de Átomos y Hooks Locales (Internal Relative Paths) */
import { useNewsletterSubscription } from './newsletter-form/hooks/useNewsletterSubscription';
import { SubscriptionSuccessState } from './newsletter-form/components/SubscriptionSuccessState';
import { SubscriptionInputGroup } from './newsletter-form/components/SubscriptionInputGroup';
import { SubscriptionConsentBlock } from './newsletter-form/components/SubscriptionConsentBlock';

/**
 * @interface INewsletterSubscriptionFormProperties
 * @description Contrato inmutable para la parametrización del formulario.
 */
interface IGlobalNewsletterSubscriptionFormProperties {
  /** Diccionario de traducciones validado por la aduana Zod. */
  readonly dictionary: INewsletterSubscriptionFormI18n;
  /** Ruta física de la API para el despacho de datos cloud. */
  readonly targetApiEndpointPathLiteral?: string;
  /** Variante visual para adaptación en diferentes secciones del portal. */
  readonly visualVariantLiteral?: 'STANDARD' | 'MINIMAL';
  /** Clases CSS externas para ajustes de posicionamiento. */
  readonly externalClassName?: string;
}

/** Identificador técnico del aparato para el Neural Sentinel. */
const FORM_MODULE_IDENTIFIER = 'NEWSLETTER_SUBSCRIPTION_ORCHESTRATOR';

export const NewsletterSubscriptionForm: React.FC<IGlobalNewsletterSubscriptionFormProperties> = (
  rawProperties
) => {
  // 1. ADUANA DE ADN: Purificación técnica mediante el esquema de contratos
  const config = NewsletterSubscriptionFormPropertiesSchema.parse(rawProperties);

  // --- 2. TELEMETRÍA DE MONTAJE (SRE Visibility) ---
  useEffect(() => {
    const correlationIdentifier = GenerateCorrelationIdentifier();

    void EmitTelemetrySignal({
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: FORM_MODULE_IDENTIFIER,
      operationCodeLiteral: 'FORM_ORCHESTRATOR_MOUNTED',
      correlationIdentifier,
      messageContentLiteral: `Formulario de suscripción activo en variante [${config.visualVariantLiteral}].`,
    });
  }, [config.visualVariantLiteral]);

  // --- 3. LÓGICA DE ESTADO (Hook Swarm) ---
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
    errorGenericLiteral: config.dictionary.messages.errorGenericLiteral,
    targetApiEndpointPathLiteral: config.targetApiEndpointPathLiteral,
  });

  // --- 4. GESTIÓN DE ESTADO DE ÉXITO (Conversion Consolidation) ---
  if (isSuccessfullySubmittedBoolean) {
    return (
      <SubscriptionSuccessState
        headlineLiteral={config.dictionary.messages.successHeadlineLiteral}
        descriptionLiteral={config.dictionary.messages.successDescriptionLiteral}
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onFormSubmitAction)}
      className={GlobalStyleClassMerger('flex flex-col w-full gap-5', config.externalClassName)}
      noValidate
      data-testid={config.forensicTestIdentifier}
    >
      {/* ÁTOMO A: Captura de Identificador de Comunicación */}
      <SubscriptionInputGroup
        register={register('electronicMailAddressLiteral')}
        isExecutingBoolean={isSubmittingBoolean}
        hasErrorBoolean={!!errors.electronicMailAddressLiteral}
        placeholderLiteral={config.dictionary.labels.inputPlaceholderLiteral}
        buttonLabelLiteral={config.dictionary.labels.submitButtonLiteral}
        isMinimalVariantBoolean={config.visualVariantLiteral === 'MINIMAL'}
      />

      {/* ÁTOMO B: Validación Legal y Consentimiento (LGPD Compliance) */}
      <SubscriptionConsentBlock
        register={register('hasGivenPrivacyConsentBoolean')}
        labelLiteral={config.dictionary.labels.consentCheckboxLiteral}
        validationErrorLiteral={errors.hasGivenPrivacyConsentBoolean?.message ?? ''}
        hasEmailErrorBoolean={!!errors.electronicMailAddressLiteral}
        emailInvalidLiteral={config.dictionary.validation.emailInvalidLiteral}
      />

      {/* ALERTA DE FALLO DE INFRAESTRUCTURA (SRE Visibility) */}
      {executionErrorLiteral && (
        <div
          className="flex items-center gap-3 p-4 text-sm text-red-700 bg-red-50 rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-1"
          role="alert"
        >
          <AlertCircle size={16} className="flex-shrink-0" />
          <span className="font-medium">{executionErrorLiteral}</span>
        </div>
      )}
    </form>
  );
};
