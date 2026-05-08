/**
 * @section Infrastructure DNA - Global State Schema (Zenith Evolution)
 * @description Única Fuente de Verdad (SSOT) para el contrato de estado del ecosistema.
 * Define la estructura inmutable de los dominios de UI, Identidad, Presencia,
 * Gobernanza Democrática y Resiliencia SRE.
 *
 * Protocolo OEDP-V17.0 - High Performance, Sovereign Data & ReadOnly Integrity.
 * SANEADO Zenith: Integración de Branded Types e inyección de descriptores para IA.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @section ADN Criptográfico - Sellado de Marca (Branding)
 * @description Evita la contaminación de tipos entre diferentes identidades del Ledger.
 */
const StateCitizenIdentifierSchema = z.string().uuid().brand<'CitizenIdentifier'>();
const StateGroupIdentifierSchema = z.string().uuid().brand<'GroupIdentifier'>();

/**
 * @section ADN de Presencia (Sovereign Enums)
 */
export const AvailabilityStatusEnum = z.enum([
  'ONLINE',
  'AWAY',
  'DO_NOT_DISTURB',
  'OFFLINE'
]).describe('Estados ontológicos de disponibilidad del ciudadano en tiempo real.');

export type TAvailabilityStatus = z.infer<typeof AvailabilityStatusEnum>;

/**
 * @domain 1: UI & NAVEGACIÓN VOLÁTIL
 * @description Estados transitorios que no sobreviven a una recarga de página.
 */
export const UiNavigationStateSchema = z.object({
  isSearchPanelOpenBoolean: z.boolean().default(false),
  isMobileMenuOpenBoolean: z.boolean().default(false),
  /** Identificador técnico del modal activo para triaje visual. */
  activeModalIdentifierLiteral: z.string().nullable().default(null),
}).readonly();

/**
 * @domain 2: PREFERENCIAS SOBERANAS
 */
export const UserPreferenceStateSchema = z.object({
  preferredLinguisticLocaleLiteral: z.enum(['pt-BR', 'es-ES', 'en-US']).default('pt-BR'),
  visualThemeModeLiteral: z.enum(['LIGHT', 'DARK', 'SYSTEM']).default('SYSTEM'),
  hasAcceptedPrivacyPolicyBoolean: z.boolean().default(false),
}).readonly();

/**
 * @domain 3: IDENTIDAD & REPUTACIÓN
 */
export const CredibilityIdentityStateSchema = z.object({
  /** Coeficiente bayesiano de autoridad inyectado por el Impact Engine. */
  actorAuthorityWeightNumeric: z.number().min(0).max(1).default(0.1),
  isVerifiedHumanBoolean: z.boolean().default(false),
  activeCitizenIdentifier: StateCitizenIdentifierSchema.optional(),
}).readonly();

/**
 * @domain 4: PRESENCIA COGNITIVA (Expert Presence)
 */
export const UserPresenceStateSchema = z.object({
  availabilityStatus: AvailabilityStatusEnum.default('OFFLINE'),
  customStatusMessageLiteral: z.string().max(60).default(''),
  /** Token para despacho de notificaciones PWA en hardware físico. */
  activePushTokenSecret: z.string().optional()
    .describe('Token secreto para el túnel de notificaciones Web Push.'),
  lastHeartbeatTimestampISO: z.string().datetime(),
}).readonly();

/**
 * @domain 5: GOBERNANZA & DEMOCRACIA LÍQUIDA
 */
export const DemocraticGovernanceStateSchema = z.object({
  /** ID del ciudadano que posee el poder de voto delegado. */
  activeMandataryIdentifier: StateCitizenIdentifierSchema.nullable().default(null),
  isIdentityBiometricallyVerifiedBoolean: z.boolean().default(false),
  communitySeniorityLevelQuantity: z.number().int().nonnegative().default(0),
  /** Lista de Action Hubs marcados como favoritos. */
  favoriteGroupsCollection: z.array(StateGroupIdentifierSchema).default([]),
}).readonly();

/**
 * @domain 6: CACHÉ DE IMPACTO (Hydration Guard)
 * @description Evita el parpadeo de la UI (CLS) al navegar entre reportes.
 */
export const ImpactCacheStateSchema = z.object({
  /** Mapeo de indicadores vistos recientemente [EntityID]: {Score, Consensus} */
  lastViewedIndicatorsMapping: z.record(z.string(), z.object({
    weightedTrustScoreNumeric: z.number().min(0).max(1),
    communityConsensusIndexNumeric: z.number().min(0).max(1)
  })).default({}),
}).readonly();

/**
 * @domain 7: SRE SYNC SENTRY (Resilience)
 */
export const SyncSentryStateSchema = z.object({
  isNetworkOnlineBoolean: z.boolean().default(true),
  /** Cantidad de pulsos encolados por falta de red. */
  pendingActionsQueueQuantity: z.number().nonnegative().default(0)
    .describe('Volumen de transacciones pendientes de sincronización cloud.'),
  lastSuccessfulSyncTimestampISO: z.string().datetime().optional(),
}).readonly();

/**
 * @domain 8: SESIÓN & RECUPERACIÓN (Forensic Persistence)
 */
export const SessionRecoveryStateSchema = z.object({
  humanRightsReportDraftLiteral: z.string().optional()
    .describe('Borrador de denuncia en curso para evitar pérdida de datos (ADR 0025).'),
  lastInteractionTimestampISO: z.string().datetime().optional(),
}).readonly();

/**
 * @name IGlobalStateADN
 * @description Contrato maestro que ensambla todos los dominios de estado institucional.
 */
export type IGlobalStateADN = {
  readonly ui: z.infer<typeof UiNavigationStateSchema>;
  readonly preferences: z.infer<typeof UserPreferenceStateSchema>;
  readonly identity: z.infer<typeof CredibilityIdentityStateSchema>;
  readonly presence: z.infer<typeof UserPresenceStateSchema>;
  readonly governance: z.infer<typeof DemocraticGovernanceStateSchema>;
  readonly impactCache: z.infer<typeof ImpactCacheStateSchema>;
  readonly sync: z.infer<typeof SyncSentryStateSchema>;
  readonly session: z.infer<typeof SessionRecoveryStateSchema>;
};
