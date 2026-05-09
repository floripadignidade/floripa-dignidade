'use client';

/**
 * @section UI Orchestrator - Newsletter Subscription Form
 * @description Punto de ensamblaje soberano para la captación de ciudadanos.
 * Orquesta la interacción entre el hook de lógica y el enjambre de átomos visuales.
 * Gestiona el ciclo de vida de la conversión, reportando telemetría proactiva
 * al Neural Sentinel.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Swarm Intelligence.
 * SANEADO Zenith: Corrección de nomenclatura booleana (Fix naming-convention).
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

/* 2. Enjambre de Átomos Locales (Functional Swarm - Sub-pathing) */
import { useNewsletterSubscription } from './newsletter-form/hooks/useNewsletterSubscription';
import { SubscriptionSuccessState } from './newsletter-form/components/SubscriptionSuccessState';
import { SubscriptionInputGroup } from './newsletter-form/components/SubscriptionInputGroup';
import { SubscriptionConsentBlock } from './newsletter-form/components/SubscriptionConsentBlock';

/* 3. ADN Estructural (Silo Lingüístico) */
import type { INewsletterSubscriptionFormI18n } from '../ui-primitives/i18n/NewsletterSubscriptionFormI18n.schema';

/**
 * @interface INewsletterSubscriptionFormProperties
 * @description Contrato inmutable para la parametrización del formulario.
 */
interface INewsletterSubscriptionFormProperties {
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

export const NewsletterSubscriptionForm: React.FC<INewsletterSubscriptionFormProperties> = ({
  dictionary,
  targetApiEndpointPathLiteral = '/api/newsletter/subscribe',
  visualVariantLiteral = 'STANDARD',
  externalClassName,
}) => {
  // --- 1. TELEMETRÍA DE MONTAJE (SRE Visibility) ---
  useEffect(() => {
    const correlationIdentifier = GenerateCorrelationIdentifier();

    void EmitTelemetrySignal({
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: FORM_MODULE_IDENTIFIER,
      operationCodeLiteral: 'FORM_ORCHESTRATOR_MOUNTED',
      correlationIdentifier,
      messageContentLiteral: `Formulario de suscripción activo en variante [${visualVariantLiteral}].`,
    });
  }, [visualVariantLiteral]);

  // --- 2. LOGICA DE ESTADO (Hook Swarm) ---
  const {
    formInstance: {
      register,
      handleSubmit,
      /** 🛡️ SANEADO Zenith: Renombre para cumplimiento de ADR 0002 */
      formState: { errors, isSubmitting: isSubmittingBoolean },
    },
    isSuccessfullySubmittedBoolean,
    executionErrorLiteral,
    onFormSubmitAction,
  } = useNewsletterSubscription({
    errorGenericLiteral: dictionary.messages.errorGenericLiteral,
    targetApiEndpointPathLiteral,
  });

  // --- 3. GESTIÓN DE ESTADO DE ÉXITO (Conversion Consolidation) ---
  if (isSuccessfullySubmittedBoolean) {
    return (
      <SubscriptionSuccessState
        headlineLiteral={dictionary.messages.successHeadlineLiteral}
        descriptionLiteral={dictionary.messages.successDescriptionLiteral}
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onFormSubmitAction)}
      className={GlobalStyleClassMerger('flex flex-col w-full gap-5', externalClassName)}
      noValidate
    >
      {/* ÁTOMO A: Captura de Identificador de Comunicación */}
      <SubscriptionInputGroup
        register={register('electronicMailAddressLiteral')}
        isExecutingBoolean={isSubmittingBoolean}
        hasErrorBoolean={!!errors.electronicMailAddressLiteral}
        placeholderLiteral={dictionary.labels.inputPlaceholderLiteral}
        buttonLabelLiteral={dictionary.labels.submitButtonLiteral}
        isMinimalVariantBoolean={visualVariantLiteral === 'MINIMAL'}
      />

      {/* ÁTOMO B: Validación Legal y Consentimiento (LGPD Compliance) */}
      <SubscriptionConsentBlock
        register={register('hasGivenPrivacyConsentBoolean')}
        labelLiteral={dictionary.labels.consentCheckboxLiteral}
        validationErrorLiteral={errors.hasGivenPrivacyConsentBoolean?.message ?? ''}
        hasEmailErrorBoolean={!!errors.electronicMailAddressLiteral}
        emailInvalidLiteral={dictionary.validation.emailInvalidLiteral}
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
