/**
 * @section Contingency Logic - In-Memory Fallback Dictionaries (Atom)
 * @description Proveedor de respaldos lingüísticos inmutables validados contra
 * `ErrorPageI18nSchema` para garantizar que la página de contingencia nunca colapse
 * por ausencia parcial de diccionarios compilados en runtime (ADR 0030).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010 (Disponibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { DEFAULT_LOCALE_IDENTIFIER } from '@floripa-dignidade/contracts';

import { ErrorPageI18nSchema, type IErrorPageI18n } from '../i18n/schemas/ErrorPage.i18n.schema';

const DEFAULT_LANGUAGE_CODE_LITERAL = DEFAULT_LOCALE_IDENTIFIER.split('-')[0] ?? 'pt';

const PORTUGUESE_ERROR_FALLBACK: IErrorPageI18n = ErrorPageI18nSchema.parse({
  hero: {
    badgeLabelLiteral: 'Contingência Operacional',
    headlineLiteral: 'Não foi possível concluir esta operação agora',
    defaultDescriptionLiteral:
      'Ocorreu uma instabilidade temporária ao processar sua solicitação. Nossa equipe técnica já recebeu o registro automático do incidente.',
    guidanceHintLiteral:
      'Você pode retornar à página inicial e tentar novamente em alguns instantes. Caso o problema persista, informe o código de rastreamento abaixo.',
  },
  errors: {
    CONFIRMATION_FAULT:
      'Ocorreu uma falha interna ao validar ou ativar sua confirmação de inscrição. Nenhuma informação pessoal foi perdida; você pode solicitar um novo link ou tentar novamente.',
    GATEWAY_FAULT:
      'Um dos nossos serviços de comunicação apresentou instabilidade momentânea ao responder à sua solicitação.',
    UNKNOWN_FAULT: 'Detectamos uma interrupção inesperada ao processar sua solicitação nesta rota.',
  },
  actions: {
    primaryActionLabelLiteral: 'Voltar para o Início',
    secondaryActionLabelLiteral: 'Acessar Observatório',
  },
  diagnostics: {
    errorCodeLabelLiteral: 'Código do incidente',
    traceReferenceLabelLiteral: 'Código de rastreamento',
  },
  metadata: {
    pageTitleLiteral: 'Ocorrência Temporária',
    pageDescriptionLiteral:
      'Página de contingência operacional e recuperação segura do portal Floripa Dignidade.',
  },
});

const SPANISH_ERROR_FALLBACK: IErrorPageI18n = ErrorPageI18nSchema.parse({
  hero: {
    badgeLabelLiteral: 'Contingencia Operativa',
    headlineLiteral: 'No pudimos completar esta operación ahora',
    defaultDescriptionLiteral:
      'Ocurrió una inestabilidad temporal al procesar tu solicitud. Nuestro equipo técnico ya recibió el registro automático del incidente.',
    guidanceHintLiteral:
      'Puedes volver a la página de inicio e intentarlo nuevamente en unos instantes. Si el inconveniente persiste, comparte el código de seguimiento mostrado abajo.',
  },
  errors: {
    CONFIRMATION_FAULT:
      'Ocurrió un fallo interno al validar o activar la confirmación de tu suscripción. No se perdió información; puedes solicitar un nuevo enlace o intentarlo nuevamente.',
    GATEWAY_FAULT:
      'Uno de nuestros servicios de comunicación presentó una interrupción momentánea al responder tu solicitud.',
    UNKNOWN_FAULT: 'Detectamos una interrupción inesperada al procesar tu solicitud en esta ruta.',
  },
  actions: {
    primaryActionLabelLiteral: 'Volver al Inicio',
    secondaryActionLabelLiteral: 'Ir al Observatorio',
  },
  diagnostics: {
    errorCodeLabelLiteral: 'Código de incidente',
    traceReferenceLabelLiteral: 'Código de seguimiento',
  },
  metadata: {
    pageTitleLiteral: 'Incidencia Temporal',
    pageDescriptionLiteral:
      'Página de contingencia operativa y recuperación segura del portal Floripa Dignidade.',
  },
});

const ENGLISH_ERROR_FALLBACK: IErrorPageI18n = ErrorPageI18nSchema.parse({
  hero: {
    badgeLabelLiteral: 'Operational Contingency',
    headlineLiteral: 'We could not complete this operation right now',
    defaultDescriptionLiteral:
      'A temporary instability occurred while processing your request. Our engineering team has already received an automatic incident report.',
    guidanceHintLiteral:
      'You may return to the home page and try again in a few moments. If the issue persists, please share the tracking reference below.',
  },
  errors: {
    CONFIRMATION_FAULT:
      'An internal error occurred while validating or activating your subscription confirmation. No personal data was lost; you may request a new link or try again.',
    GATEWAY_FAULT:
      'One of our communication gateways experienced a brief interruption while handling your request.',
    UNKNOWN_FAULT:
      'An unexpected interruption occurred while processing your request on this route.',
  },
  actions: {
    primaryActionLabelLiteral: 'Back to Home',
    secondaryActionLabelLiteral: 'Open Observatory',
  },
  diagnostics: {
    errorCodeLabelLiteral: 'Incident code',
    traceReferenceLabelLiteral: 'Tracking reference',
  },
  metadata: {
    pageTitleLiteral: 'Temporary Interruption',
    pageDescriptionLiteral:
      'Operational contingency and safe recovery page for the Floripa Dignidade portal.',
  },
});

const ERROR_FALLBACKS_BY_LANGUAGE: Readonly<Record<string, IErrorPageI18n>> = Object.freeze({
  pt: PORTUGUESE_ERROR_FALLBACK,
  es: SPANISH_ERROR_FALLBACK,
  en: ENGLISH_ERROR_FALLBACK,
});

/**
 * Resuelve el respaldo lingüístico inmutable en memoria para la página de error.
 *
 * @param requestedLocaleLiteral - Código BCP 47 solicitado en la ruta.
 * @returns {IErrorPageI18n} Diccionario validado por `ErrorPageI18nSchema`.
 */
export const ResolveErrorPageInMemoryFallback = (
  requestedLocaleLiteral: string,
): IErrorPageI18n => {
  const baseLanguageCodeLiteral =
    requestedLocaleLiteral.split('-')[0]?.toLowerCase() ?? DEFAULT_LANGUAGE_CODE_LITERAL;

  return (
    ERROR_FALLBACKS_BY_LANGUAGE[baseLanguageCodeLiteral] ??
    ERROR_FALLBACKS_BY_LANGUAGE[DEFAULT_LANGUAGE_CODE_LITERAL] ??
    PORTUGUESE_ERROR_FALLBACK
  );
};
