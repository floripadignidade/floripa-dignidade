/**
 * @section Newsletter Welcome Logic - In-Memory Fallback Dictionaries (Atom)
 * @description Proveedor de respaldos lingüísticos inmutables validados contra
 * `NewsletterWelcomeI18nSchema` para asegurar inmunidad frente a 404 ante ausencia
 * parcial de claves (como `supportSection`) en compilación o runtime (ADR 0030).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010 (Disponibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { DEFAULT_LOCALE_IDENTIFIER } from '@floripa-dignidade/contracts';

import {
  type INewsletterWelcomeI18n,
  NewsletterWelcomeI18nSchema,
} from '../schemas/NewsletterWelcomeI18n.schema';

const DEFAULT_LANGUAGE_CODE_LITERAL = DEFAULT_LOCALE_IDENTIFIER.split('-')[0] ?? 'pt';

const PORTUGUESE_WELCOME_FALLBACK: INewsletterWelcomeI18n = NewsletterWelcomeI18nSchema.parse({
  hero: {
    headlineLiteral: 'Bem-vindo à nossa rede de transparência!',
    descriptionLiteral:
      'Sua participação foi confirmada. Agora você faz parte da rede que monitora e protege Florianópolis com informações críticas diretamente no seu e-mail.',
  },
  actions: {
    primaryActionLabelLiteral: 'Ver Relatórios de Transparência',
    secondaryActionLabelLiteral: 'Voltar para o Início',
  },
  supportSection: {
    newsHeadlineLiteral: 'Voz Dignidade & Imprensa',
    newsDescriptionLiteral:
      'Acompanhe apurações independentes sobre direitos humanos e políticas públicas em Florianópolis.',
    dataHeadlineLiteral: 'Observatório de Gastos',
    dataDescriptionLiteral:
      'Consulte contratos municipais auditados e indicadores de impacto social por território.',
  },
  metadata: {
    pageTitleLiteral: 'Inscrição Confirmada',
  },
});

const SPANISH_WELCOME_FALLBACK: INewsletterWelcomeI18n = NewsletterWelcomeI18nSchema.parse({
  hero: {
    headlineLiteral: '¡Bienvenido a nuestra red de transparencia!',
    descriptionLiteral:
      'Tu confirmación se completó con éxito. Ahora formas parte de la red que monitorea y protege Florianópolis con alertas de impacto directamente en tu correo.',
  },
  actions: {
    primaryActionLabelLiteral: 'Ver Reportes de Transparencia',
    secondaryActionLabelLiteral: 'Volver al Inicio',
  },
  supportSection: {
    newsHeadlineLiteral: 'Voz Dignidad y Prensa',
    newsDescriptionLiteral:
      'Sigue investigaciones independientes sobre derechos humanos y políticas públicas en Florianópolis.',
    dataHeadlineLiteral: 'Observatorio de Gastos',
    dataDescriptionLiteral:
      'Consulta contratos municipales auditados e indicadores de impacto social por territorio.',
  },
  metadata: {
    pageTitleLiteral: 'Suscripción Confirmada',
  },
});

const ENGLISH_WELCOME_FALLBACK: INewsletterWelcomeI18n = NewsletterWelcomeI18nSchema.parse({
  hero: {
    headlineLiteral: 'Welcome to our transparency network!',
    descriptionLiteral:
      'Your confirmation is complete. You are now part of the network monitoring and protecting Florianópolis with critical impact alerts directly in your inbox.',
  },
  actions: {
    primaryActionLabelLiteral: 'View Transparency Reports',
    secondaryActionLabelLiteral: 'Back to Home',
  },
  supportSection: {
    newsHeadlineLiteral: 'Dignity Voice & Press',
    newsDescriptionLiteral:
      'Follow independent reporting on human rights and public policies in Florianópolis.',
    dataHeadlineLiteral: 'Public Expenditure Observatory',
    dataDescriptionLiteral:
      'Explore audited municipal contracts and territorial social impact indicators.',
  },
  metadata: {
    pageTitleLiteral: 'Subscription Confirmed',
  },
});

const WELCOME_FALLBACKS_BY_LANGUAGE: Readonly<Record<string, INewsletterWelcomeI18n>> =
  Object.freeze({
    pt: PORTUGUESE_WELCOME_FALLBACK,
    es: SPANISH_WELCOME_FALLBACK,
    en: ENGLISH_WELCOME_FALLBACK,
  });

/**
 * Resuelve el respaldo inmutable en memoria para la página de bienvenida de newsletter.
 *
 * @param requestedLocaleLiteral - Código BCP 47 solicitado.
 * @returns {INewsletterWelcomeI18n} Diccionario validado por `NewsletterWelcomeI18nSchema`.
 */
export const ResolveNewsletterWelcomeInMemoryFallback = (
  requestedLocaleLiteral: string,
): INewsletterWelcomeI18n => {
  const baseLanguageCodeLiteral =
    requestedLocaleLiteral.split('-')[0]?.toLowerCase() ?? DEFAULT_LANGUAGE_CODE_LITERAL;

  return (
    WELCOME_FALLBACKS_BY_LANGUAGE[baseLanguageCodeLiteral] ??
    WELCOME_FALLBACKS_BY_LANGUAGE[DEFAULT_LANGUAGE_CODE_LITERAL] ??
    PORTUGUESE_WELCOME_FALLBACK
  );
};
