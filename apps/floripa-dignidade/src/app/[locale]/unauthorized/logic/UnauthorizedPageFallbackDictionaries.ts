/**
 * @section Security Contingency Logic - In-Memory Fallback Dictionaries (Atom)
 * @description Proveedor de respaldos lingüísticos inmutables validados contra
 * `UnauthorizedPageI18nSchema` para asegurar disponibilidad continua ante ausencia
 * parcial de diccionarios compilados en tiempo de ejecución (ADR 0030).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010 (Disponibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { DEFAULT_LOCALE_IDENTIFIER } from '@floripa-dignidade/contracts';

import {
  type IUnauthorizedPageI18n,
  UnauthorizedPageI18nSchema,
} from '../i18n/schemas/UnauthorizedPage.i18n.schema';

const DEFAULT_LANGUAGE_CODE_LITERAL = DEFAULT_LOCALE_IDENTIFIER.split('-')[0] ?? 'pt';

const PORTUGUESE_UNAUTHORIZED_FALLBACK: IUnauthorizedPageI18n = UnauthorizedPageI18nSchema.parse({
  hero: {
    badgeLabelLiteral: 'Controle de Acesso Institucional',
    headlineLiteral: 'Acesso restrito a perfis autorizados',
    descriptionLiteral:
      'Esta área contém dados fiscais ou operacionais que exigem credenciais institucionais verificadas para proteção da integridade cívica.',
    guidanceHintLiteral:
      'Você pode retornar à página inicial ou inscrever-se nos boletins para receber relatórios públicos auditados por e-mail.',
  },
  systemAlert: {
    titleLiteral: 'Alerta de Segurança Registrado',
    descriptionLiteral:
      'Este bloqueio gerou um registro anônimo de auditoria (em conformidade com a LGPD) e foi enfileirado para futura notificação ao painel de governança.',
    roadmapNoteLiteral:
      'Em breve: verificação de identidade cívica via gov.br (níveis Prata e Ouro) e solicitação direta de habilitação institucional.',
  },
  actions: {
    primaryActionLabelLiteral: 'Voltar para o Início',
    secondaryActionLabelLiteral: 'Receber Alertas Públicos',
  },
  diagnostics: {
    originRouteLabelLiteral: 'Rota protegida',
    traceReferenceLabelLiteral: 'Código de rastreamento',
  },
  metadata: {
    pageTitleLiteral: 'Acesso Restrito',
    pageDescriptionLiteral:
      'Aviso de controle de acesso institucional e proteção de dados do portal Floripa Dignidade.',
  },
});

const SPANISH_UNAUTHORIZED_FALLBACK: IUnauthorizedPageI18n = UnauthorizedPageI18nSchema.parse({
  hero: {
    badgeLabelLiteral: 'Control de Acceso Institucional',
    headlineLiteral: 'Acceso restringido a perfiles autorizados',
    descriptionLiteral:
      'Esta sección contiene datos fiscales u operativos que requieren credenciales institucionales verificadas para proteger la integridad cívica.',
    guidanceHintLiteral:
      'Puedes volver a la página de inicio o suscribirte al boletín para recibir reportes públicos auditados directamente en tu correo.',
  },
  systemAlert: {
    titleLiteral: 'Alerta de Seguridad Registrada',
    descriptionLiteral:
      'Este bloqueo generó un registro anónimo de auditoría (conforme a la LGPD) y quedó preparado para notificación futura hacia el panel de gobernanza.',
    roadmapNoteLiteral:
      'Próximamente: verificación de identidad cívica vía gov.br (niveles Plata y Oro) y solicitud directa de habilitación institucional.',
  },
  actions: {
    primaryActionLabelLiteral: 'Volver al Inicio',
    secondaryActionLabelLiteral: 'Recibir Alertas Públicas',
  },
  diagnostics: {
    originRouteLabelLiteral: 'Ruta protegida',
    traceReferenceLabelLiteral: 'Código de seguimiento',
  },
  metadata: {
    pageTitleLiteral: 'Acceso Restringido',
    pageDescriptionLiteral:
      'Aviso de control de acceso institucional y protección de datos del portal Floripa Dignidade.',
  },
});

const ENGLISH_UNAUTHORIZED_FALLBACK: IUnauthorizedPageI18n = UnauthorizedPageI18nSchema.parse({
  hero: {
    badgeLabelLiteral: 'Institutional Access Control',
    headlineLiteral: 'Access restricted to authorized profiles',
    descriptionLiteral:
      'This section holds fiscal or operational records that require verified institutional credentials to protect civic integrity.',
    guidanceHintLiteral:
      'You can return to the home page or subscribe to our newsletter to receive audited public reports by email.',
  },
  systemAlert: {
    titleLiteral: 'Security Alert Recorded',
    descriptionLiteral:
      'This access block generated an anonymous audit record (LGPD compliant) and is flagged for future notification dispatch to the governance panel.',
    roadmapNoteLiteral:
      'Coming next: civic identity verification via gov.br (Silver and Gold tiers) and direct institutional access request workflow.',
  },
  actions: {
    primaryActionLabelLiteral: 'Back to Home',
    secondaryActionLabelLiteral: 'Receive Public Alerts',
  },
  diagnostics: {
    originRouteLabelLiteral: 'Protected route',
    traceReferenceLabelLiteral: 'Tracking reference',
  },
  metadata: {
    pageTitleLiteral: 'Restricted Access',
    pageDescriptionLiteral:
      'Institutional access control and data protection notice for the Floripa Dignidade portal.',
  },
});

const UNAUTHORIZED_FALLBACKS_BY_LANGUAGE: Readonly<Record<string, IUnauthorizedPageI18n>> =
  Object.freeze({
    pt: PORTUGUESE_UNAUTHORIZED_FALLBACK,
    es: SPANISH_UNAUTHORIZED_FALLBACK,
    en: ENGLISH_UNAUTHORIZED_FALLBACK,
  });

/**
 * Resuelve el respaldo lingüístico inmutable en memoria para `/unauthorized`.
 *
 * @param requestedLocaleLiteral - Código BCP 47 solicitado en la ruta.
 * @returns {IUnauthorizedPageI18n} Diccionario validado por `UnauthorizedPageI18nSchema`.
 */
export const ResolveUnauthorizedPageInMemoryFallback = (
  requestedLocaleLiteral: string,
): IUnauthorizedPageI18n => {
  const baseLanguageCodeLiteral =
    requestedLocaleLiteral.split('-')[0]?.toLowerCase() ?? DEFAULT_LANGUAGE_CODE_LITERAL;

  return (
    UNAUTHORIZED_FALLBACKS_BY_LANGUAGE[baseLanguageCodeLiteral] ??
    UNAUTHORIZED_FALLBACKS_BY_LANGUAGE[DEFAULT_LANGUAGE_CODE_LITERAL] ??
    PORTUGUESE_UNAUTHORIZED_FALLBACK
  );
};
