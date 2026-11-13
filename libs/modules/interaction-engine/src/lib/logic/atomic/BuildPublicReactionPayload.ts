// libs/modules/interaction-engine/src/lib/logic/atomic/BuildPublicReactionPayload.ts

/**
 * @section Interaction Logic - Public Reaction Payload Builder (Atom)
 * @description Átomo de lógica pura encargado de ensamblar el payload de datos crudos
 * para una reacción cívica o pulso de apoyo popular antes de su validación por la
 * aduana Zod (PublicReactionSchema). Aísla la construcción de datos de los ciclos
 * de vida del framework visual y normaliza los identificadores ciudadanos.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Modularidad y Confiabilidad).
 *
 * SANEADO Zenith:
 * 1. Resolución de fronteras modulares con @floripa-dignidade/contracts.
 * 2. Inmutabilidad forzada en runtime mediante Object.freeze.
 * 3. Cumplimiento de 'exactOptionalPropertyTypes' en la interfaz de salida.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/* 1. Contratos Centralizados de Dominio (Single Source of Truth) */
import type { IUserIdentity } from '@floripa-dignidade/contracts';

/**
 * @interface IRawPublicReactionPayload
 * @description Contrato inmutable que estructura la carga útil antes de pasar por la aduana Zod.
 * Sigue la norma ISO 11179 de Objeto + Propiedad + Representación.
 */
export interface IRawPublicReactionPayload {
  readonly interactionIdentifier: string;
  readonly targetEntityIdentifier: string;
  readonly evaluatorIdentityIdentifier: string | null;
  readonly interactionPolarityNumeric: number;
  readonly semanticEmoticonIntention: string | undefined;
  readonly evaluatorPublicAliasLiteral: string;
  readonly evaluatorAvatarSourceUrl: string | null;
  readonly territorialContextLiteral: string;
  readonly occurrenceTimestampISO: string;
}

/**
 * Ensambla el diccionario de datos inmutable para una interacción social de termómetro popular.
 * Implementa una función pura determinista libre de efectos secundarios.
 *
 * @param targetEntityIdentifier - Identificador único universal (UUID) de la entidad auditada que recibe la reacción.
 * @param polarityNumeric - Valor numérico de polaridad: 1 (Apoyo/Like), -1 (Rechazo/Unlike), 0 (Neutral).
 * @param activeCitizenIdentitySnapshot - Contexto de identidad ciudadana activa obtenido de la sesión o token (Opcional).
 * @param emoticonIntentionLiteral - Intención semántica visual de la reacción (ej: "SOLIDARITY", "RESPECT") (Opcional).
 * @returns {IRawPublicReactionPayload} Payload estructurado e inmutable listo para safeParse en la aduana de interacción.
 */
export const BuildPublicReactionPayload = (
  targetEntityIdentifier: string,
  polarityNumeric: number,
  activeCitizenIdentitySnapshot?: IUserIdentity,
  emoticonIntentionLiteral?: string,
): IRawPublicReactionPayload => {
  return Object.freeze({
    interactionIdentifier: crypto.randomUUID(),
    targetEntityIdentifier,
    evaluatorIdentityIdentifier: activeCitizenIdentitySnapshot?.identityIdentifier ?? null,
    interactionPolarityNumeric: polarityNumeric,
    semanticEmoticonIntention: emoticonIntentionLiteral,
    evaluatorPublicAliasLiteral:
      activeCitizenIdentitySnapshot?.anonymizedPublicNameLiteral ?? 'Cidadão Anônimo',
    evaluatorAvatarSourceUrl: null,
    territorialContextLiteral: 'FLORIANÓPOLIS_GLOBAL',
    occurrenceTimestampISO: new Date().toISOString(),
  });
};
