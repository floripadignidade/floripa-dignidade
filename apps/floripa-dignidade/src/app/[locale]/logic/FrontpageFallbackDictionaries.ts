/**
 * @section Frontpage Logic - Institutional In-Memory Fallback Dictionaries (Atom)
 * @description Proveedor de respaldos lingüísticos inmutables validados contra
 * `FrontpageI18nSchema` y `NewsletterSubscriptionFormI18nSchema` para garantizar
 * disponibilidad continua (cero 404 ni pantalla en blanco) ante ausencia parcial de
 * diccionarios compilados en runtime (ADR 0030).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010 (Disponibilidad y Resiliencia).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { DEFAULT_LOCALE_IDENTIFIER } from '@floripa-dignidade/contracts';
import {
  type INewsletterSubscriptionFormI18n,
  NewsletterSubscriptionFormI18nSchema,
} from '@floripa-dignidade/shared-ui-contracts';

import { FrontpageI18nSchema, type IFrontpageI18n } from '../schemas/FrontpageI18n.schema';

export interface IInMemoryFrontpageBundle {
  readonly localizedContent: IFrontpageI18n;
  readonly newsletterUi: INewsletterSubscriptionFormI18n;
}

const DEFAULT_LANGUAGE_CODE_LITERAL = DEFAULT_LOCALE_IDENTIFIER.split('-')[0] ?? 'pt';

const PORTUGUESE_BUNDLE: IInMemoryFrontpageBundle = Object.freeze({
  localizedContent: FrontpageI18nSchema.parse({
    hero: {
      badgeLabelLiteral: 'Observatório Cívico • Florianópolis',
      headlineMainLiteral: 'Tecnologia a serviço da',
      headlineAccentLiteral: 'dignidade humana',
      descriptionLiteral:
        'Monitoramento independente de gastos públicos, proteção territorial e canais seguros de denúncia em Florianópolis.',
      primaryActionLabelLiteral: 'Apoiar Causa',
      secondaryActionLabelLiteral: 'Ver Transparência',
    },
    features: [
      {
        identifier: 'TRANSPARENCY',
        titleLiteral: 'Transparência Radical',
        descriptionLiteral:
          'Auditoria cidadã de contratos públicos e prestação de contas em tempo real.',
      },
      {
        identifier: 'ALERTS',
        titleLiteral: 'Alertas Territoriais',
        descriptionLiteral:
          'Monitoramento comunitário por distritos com proteção de identidade sob a LGPD.',
      },
      {
        identifier: 'ACTION',
        titleLiteral: 'Resposta Solidária',
        descriptionLiteral:
          'Articulação direta entre voluntários, rede jurídica e assistência social.',
      },
    ],
    newsletter: {
      sectionHeadlineLiteral: 'Receba alertas de transparência',
      sectionDescriptionLiteral:
        'Participe da rede cidadã e acompanhe relatórios auditados diretamente no seu e-mail.',
    },
  }),
  newsletterUi: NewsletterSubscriptionFormI18nSchema.parse({
    labels: {
      inputPlaceholderLiteral: 'Seu melhor e-mail',
      submitButtonLiteral: 'Participar',
      submittingStatusLiteral: 'Enviando...',
      consentCheckboxLiteral: 'Concordo com o tratamento seguro dos meus dados conforme a LGPD.',
    },
    messages: {
      successHeadlineLiteral: 'Verifique seu e-mail!',
      successDescriptionLiteral:
        'Enviamos um link de confirmação para ativar sua participação na rede.',
      errorGenericLiteral: 'Não foi possível concluir sua inscrição agora. Tente novamente.',
    },
    validation: {
      emailRequiredLiteral: 'Informe um endereço de e-mail.',
      emailInvalidLiteral: 'Digite um endereço de e-mail válido.',
      consentRequiredLiteral: 'O consentimento de privacidade é obrigatório.',
    },
  }),
});

const SPANISH_BUNDLE: IInMemoryFrontpageBundle = Object.freeze({
  localizedContent: FrontpageI18nSchema.parse({
    hero: {
      badgeLabelLiteral: 'Observatorio Cívico • Florianópolis',
      headlineMainLiteral: 'Tecnología al servicio de la',
      headlineAccentLiteral: 'dignidad humana',
      descriptionLiteral:
        'Monitoreo independiente del gasto público, protección territorial y canales seguros de denuncia en Florianópolis.',
      primaryActionLabelLiteral: 'Apoyar Causa',
      secondaryActionLabelLiteral: 'Ver Transparencia',
    },
    features: [
      {
        identifier: 'TRANSPARENCY',
        titleLiteral: 'Transparencia Radical',
        descriptionLiteral:
          'Auditoría ciudadana de contratos públicos y rendición de cuentas en tiempo real.',
      },
      {
        identifier: 'ALERTS',
        titleLiteral: 'Alertas Territoriales',
        descriptionLiteral:
          'Monitoreo comunitario por distritos con protección de identidad bajo la LGPD.',
      },
      {
        identifier: 'ACTION',
        titleLiteral: 'Respuesta Solidaria',
        descriptionLiteral:
          'Articulación directa entre voluntariado, defensa jurídica y asistencia social.',
      },
    ],
    newsletter: {
      sectionHeadlineLiteral: 'Recibe alertas de transparencia',
      sectionDescriptionLiteral:
        'Únete a la red ciudadana y recibe reportes auditados directamente en tu correo.',
    },
  }),
  newsletterUi: NewsletterSubscriptionFormI18nSchema.parse({
    labels: {
      inputPlaceholderLiteral: 'Tu correo electrónico',
      submitButtonLiteral: 'Suscribirme',
      submittingStatusLiteral: 'Enviando...',
      consentCheckboxLiteral: 'Acepto el tratamiento seguro de mis datos conforme a la LGPD.',
    },
    messages: {
      successHeadlineLiteral: '¡Revisa tu correo!',
      successDescriptionLiteral:
        'Enviamos un enlace de confirmación para activar tu participación en la red.',
      errorGenericLiteral: 'No pudimos completar tu suscripción ahora. Intenta nuevamente.',
    },
    validation: {
      emailRequiredLiteral: 'Ingresa una dirección de correo electrónico.',
      emailInvalidLiteral: 'Ingresa un correo electrónico válido.',
      consentRequiredLiteral: 'El consentimiento de privacidad es obligatorio.',
    },
  }),
});

const ENGLISH_BUNDLE: IInMemoryFrontpageBundle = Object.freeze({
  localizedContent: FrontpageI18nSchema.parse({
    hero: {
      badgeLabelLiteral: 'Civic Observatory • Florianópolis',
      headlineMainLiteral: 'Technology serving',
      headlineAccentLiteral: 'human dignity',
      descriptionLiteral:
        'Independent monitoring of public spending, territorial protection, and safe citizen reporting channels in Florianópolis.',
      primaryActionLabelLiteral: 'Support Cause',
      secondaryActionLabelLiteral: 'View Transparency',
    },
    features: [
      {
        identifier: 'TRANSPARENCY',
        titleLiteral: 'Radical Transparency',
        descriptionLiteral:
          'Civic auditing of public contracts and real-time fiscal accountability.',
      },
      {
        identifier: 'ALERTS',
        titleLiteral: 'Territorial Alerts',
        descriptionLiteral:
          'District-level community monitoring with strict LGPD identity protection.',
      },
      {
        identifier: 'ACTION',
        titleLiteral: 'Solidarity Response',
        descriptionLiteral:
          'Direct coordination across volunteers, legal defense, and social support.',
      },
    ],
    newsletter: {
      sectionHeadlineLiteral: 'Receive transparency alerts',
      sectionDescriptionLiteral:
        'Join the civic network and receive audited impact reports straight to your inbox.',
    },
  }),
  newsletterUi: NewsletterSubscriptionFormI18nSchema.parse({
    labels: {
      inputPlaceholderLiteral: 'Your email address',
      submitButtonLiteral: 'Subscribe',
      submittingStatusLiteral: 'Submitting...',
      consentCheckboxLiteral: 'I agree to secure data processing under LGPD privacy standards.',
    },
    messages: {
      successHeadlineLiteral: 'Check your inbox!',
      successDescriptionLiteral:
        'We sent a confirmation link to activate your participation in the network.',
      errorGenericLiteral: 'Unable to complete your subscription right now. Please try again.',
    },
    validation: {
      emailRequiredLiteral: 'Please provide an email address.',
      emailInvalidLiteral: 'Please enter a valid email address.',
      consentRequiredLiteral: 'Privacy consent is mandatory.',
    },
  }),
});

const FALLBACK_BUNDLES_BY_LANGUAGE: Readonly<Record<string, IInMemoryFrontpageBundle>> =
  Object.freeze({
    pt: PORTUGUESE_BUNDLE,
    es: SPANISH_BUNDLE,
    en: ENGLISH_BUNDLE,
  });

/**
 * Resuelve el respaldo lingüístico inmutable en memoria para un código BCP 47 dado.
 *
 * @param requestedLocaleLiteral - Código BCP 47 solicitado.
 * @returns {IInMemoryFrontpageBundle} Diccionarios validados de Frontpage y formulario Newsletter.
 */
export const ResolveFrontpageInMemoryFallback = (
  requestedLocaleLiteral: string,
): IInMemoryFrontpageBundle => {
  const baseLanguageCodeLiteral =
    requestedLocaleLiteral.split('-')[0]?.toLowerCase() ?? DEFAULT_LANGUAGE_CODE_LITERAL;

  return (
    FALLBACK_BUNDLES_BY_LANGUAGE[baseLanguageCodeLiteral] ??
    FALLBACK_BUNDLES_BY_LANGUAGE[DEFAULT_LANGUAGE_CODE_LITERAL] ??
    PORTUGUESE_BUNDLE
  );
};
