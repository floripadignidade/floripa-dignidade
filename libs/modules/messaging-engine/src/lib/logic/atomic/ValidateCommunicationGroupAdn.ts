/**
 * @section Messaging Logic - Communication Group DNA Validator
 * @description Átomo encargado de verificar la integridad estructural del grupo.
 * Implementa el patrón Safe Parsing para asegurar el cumplimiento del contrato.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & High Performance.
 */

import { ValidationException } from '@floripa-dignidade/exceptions';
import { CommunicationGroupSchema } from '../../schemas/CommunicationGroup.schema';
import type { ICommunicationGroup } from '../../schemas/CommunicationGroup.schema';

/**
 * Valida los datos propuestos para un grupo contra su esquema de ADN.
 *
 * @param unvalidatedPayload - Datos crudos a validar.
 * @returns {ICommunicationGroup} Datos validados y tipados.
 * @throws {ValidationException} Si el payload viola el contrato estructural.
 */
export const ValidateCommunicationGroupAdn = (unvalidatedPayload: unknown): ICommunicationGroup => {
  const validationResult = CommunicationGroupSchema.safeParse(unvalidatedPayload);

  if (!validationResult.success) {
    /**
     * Transformamos los errores de Zod en una ValidationException con
     * contexto forense para el Neural Sentinel.
     */
    throw new ValidationException('COMMUNICATION_GROUP_DNA_VIOLATION', {
      intent: 'VALIDATE_GROUP_INTEGRITY',
      validationDetails: validationResult.error.format(),
      message: 'Los datos proporcionados no cumplen con el estándar del Action Hub.',
    });
  }

  return validationResult.data;
};
