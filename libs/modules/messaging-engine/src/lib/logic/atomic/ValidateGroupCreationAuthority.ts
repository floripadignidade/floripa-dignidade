/**
 * @section Messaging Logic - Authority Validation Atom
 * @description Átomo encargado de verificar la jerarquía de soberanía del actor.
 * Garantiza que solo roles autorizados puedan instanciar nuevos Action Hubs.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Zero-Trust.
 */

import { ValidationException } from '@floripa-dignidade/exceptions';

/**
 * Catálogo de roles con autoridad de creación (Soberanía de Gestión).
 * 🛡️ Refuerzo: Solo niveles estratégicos y de coordinación.
 */
const AUTHORIZED_CREATION_ROLES: ReadonlyArray<string> = [
  'ROOT',
  'ADMINISTRATOR',
  'COORDINATOR',
  'SOCIAL_WORKER_LEAD',
];

/**
 * Valida si el rol proporcionado tiene permisos de creación de grupos.
 * @param assignedRoleLiteral - El rol del actor que solicita la operación.
 * @throws {ValidationException} Si el rol no tiene la autoridad necesaria.
 */
export const ValidateGroupCreationAuthority = (assignedRoleLiteral: string): void => {
  const isAuthorizedBoolean = AUTHORIZED_CREATION_ROLES.includes(assignedRoleLiteral);

  if (!isAuthorizedBoolean) {
    throw new ValidationException('INSUFFICIENT_CREATION_AUTHORITY', {
      intent: 'CREATE_COMMUNICATION_GROUP',
      providedRole: assignedRoleLiteral,
      message: 'La identidad no posee rango suficiente para gestionar Círculos de Comunicación.',
    });
  }
};
