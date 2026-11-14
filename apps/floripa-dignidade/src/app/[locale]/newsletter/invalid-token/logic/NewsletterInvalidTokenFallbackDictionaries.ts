/**
 * @section Newsletter Invalid Token Logic - In-Memory Fallback Dictionaries (Atom)
 * @description Proveedor de respaldos lingüísticos inmutables validados contra
 * `NewsletterInvalidTokenI18nSchema` para asegurar disponibilidad continua (cero 404
 * ni pantalla en blanco) ante ausencia parcial de diccionarios compilados en runtime.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010 (Disponibilidad y Resiliencia).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { DEFAULT_LOCALE_IDENTIFIER } from '@floripa-dignidade/contracts';

import {
  type INewsletterInvalidTokenI18n,
  NewsletterInvalidTokenI18nSchema,
} from '../i18n/schemas/InvalidToken.i18n.schema';

const DEFAULT_LANGUAGE_CODE_LITERAL = DEFAULT_LOCALE_IDENTIFIER.split('-')[0] ?? 'pt';

const PORTUGUESE_INVALID_TOKEN_FALLBACK: INewsletterInvalidTokenI18n =
  NewsletterInvalidTokenI18nSchema.parse({
    hero: {
      badgeLabelLiteral: 'Verificação de Segurança',
      headlineLiteral: 'Link de confirmação inválido ou expirado',
      descriptionLiteral:
        'Não foi possível validar o seu código de confirmação. Isso acontece quando o link já foi utilizado anteriormente, expirou ou foi copiado de forma incompleta.',
      guidanceHintLiteral:
        'Você pode solicitar um novo link de confirmação preenchendo novamente seu e-mail na página inicial.',
    },
    actions: {
      primaryActionLabelLiteral: 'Solicitar Novo Link',
      secondaryActionLabelLiteral: 'Voltar para o Início',
    },
    diagnostics: {
      traceReferenceLabelLiteral: 'Código de rastreamento',
    },
    metadata: {
      pageTitleLiteral: 'Link de Confirmação Inválido',
      pageDescriptionLiteral:
        'O token de verificação da sua inscrição na rede Floripa Dignidade é inválido ou expirou.',
    },
  });

const SPANISH_INVALID_TOKEN_FALLBACK: INewsletterInvalidTokenI18n =
  NewsletterInvalidTokenI18nSchema.parse({
    hero: {
      badgeLabelLiteral: 'Verificación de Seguridad',
      headlineLiteral: 'Enlace de confirmación inválido o expirado',
      descriptionLiteral:
        'No pudimos validar tu código de confirmación. Esto ocurre cuando el enlace ya fue utilizado anteriormente, caducó o se copió de forma incompleta.',
      guidanceHintLiteral:
        'Puedes solicitar un nuevo enlace de confirmación ingresando nuevamente tu correo electrónico en la página de inicio.',
    },
    actions: {
      primaryActionLabelLiteral: 'Solicitar Nuevo Enlace',
      secondaryActionLabelLiteral: 'Volver al Inicio',
    },
    diagnostics: {
      traceReferenceLabelLiteral: 'Código de seguimiento',
    },
    metadata: {
      pageTitleLiteral: 'Enlace de Confirmación Inválido',
      pageDescriptionLiteral:
        'El token de verificación de tu suscripción en la red Floripa Dignidade es inválido o ha expirado.',
    },
  });

const ENGLISH_INVALID_TOKEN_FALLBACK: INewsletterInvalidTokenI18n =
  NewsletterInvalidTokenI18nSchema.parse({
    hero: {
      badgeLabelLiteral: 'Security Verification',
      headlineLiteral: 'Invalid or expired confirmation link',
      descriptionLiteral:
        'We could not validate your confirmation code. This happens when the link has already been used, expired, or was copied incompletely.',
      guidanceHintLiteral:
        'You can request a fresh confirmation link by submitting your email address again on the home page.',
    },
    actions: {
      primaryActionLabelLiteral: 'Request New Link',
      secondaryActionLabelLiteral: 'Back to Home',
    },
    diagnostics: {
      traceReferenceLabelLiteral: 'Tracking reference',
    },
    metadata: {
      pageTitleLiteral: 'Invalid Confirmation Link',
      pageDescriptionLiteral:
        'Your Floripa Dignidade network verification token is invalid or has expired.',
    },
  });

const INVALID_TOKEN_FALLBACKS_BY_LANGUAGE: Readonly<Record<string, INewsletterInvalidTokenI18n>> =
  Object.freeze({
    pt: PORTUGUESE_INVALID_TOKEN_FALLBACK,
    es: SPANISH_INVALID_TOKEN_FALLBACK,
    en: ENGLISH_INVALID_TOKEN_FALLBACK,
  });

/**
 * Resuelve el respaldo lingüístico inmutable en memoria para la vista de token inválido.
 *
 * @param requestedLocaleLiteral - Código BCP 47 solicitado en la ruta.
 * @returns {INewsletterInvalidTokenI18n} Diccionario validado por `NewsletterInvalidTokenI18nSchema`.
 */
export const ResolveNewsletterInvalidTokenInMemoryFallback = (
  requestedLocaleLiteral: string,
): INewsletterInvalidTokenI18n => {
  const baseLanguageCodeLiteral =
    requestedLocaleLiteral.split('-')[0]?.toLowerCase() ?? DEFAULT_LANGUAGE_CODE_LITERAL;

  return (
    INVALID_TOKEN_FALLBACKS_BY_LANGUAGE[baseLanguageCodeLiteral] ??
    INVALID_TOKEN_FALLBACKS_BY_LANGUAGE[DEFAULT_LANGUAGE_CODE_LITERAL] ??
    PORTUGUESE_INVALID_TOKEN_FALLBACK
  );
};
