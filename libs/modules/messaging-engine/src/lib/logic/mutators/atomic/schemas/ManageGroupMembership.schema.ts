/**
 * @section Messaging Contracts - Group Membership Mutation Schema (Atom)
 * @description Contrato Zod inmutable para la validación perimetral de los parámetros
 * requeridos al ejecutar una transición de estado de membresía en un Círculo de Comunicación.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Seguridad y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import {
  MembershipStatusSchema,
  type TMembershipStatus,
} from '../../../../schemas/CommunicationGroupMembership.schema';

/**
 * @name ManageGroupMembershipParametersSchema
 * @description Aduana Zod inmutable para validar los parámetros de transición de membresía.
 */
export const ManageGroupMembershipParametersSchema = z
  .object({
    /** Identificador UUID v4 único del Círculo de Comunicación (Action Hub). */
    groupIdentifierLiteral: z
      .string()
      .trim()
      .uuid({ message: 'EL_IDENTIFICADOR_DE_GRUPO_DEBE_SER_UUID_VALIDO' })
      .describe('Identificador único del grupo de comunicación objetivo.'),

    /** Identificador UUID v4 único del ciudadano sujeto a la transición de membresía. */
    citizenIdentifierLiteral: z
      .string()
      .trim()
      .uuid({ message: 'EL_IDENTIFICADOR_DE_CIUDADANO_DEBE_SER_UUID_VALIDO' })
      .describe('Identificador único del ciudadano bajo mutación de membresía.'),

    /** Estado ontológico de la membresía conforme a la máquina de estados institucional. */
    targetStatusLiteral: MembershipStatusSchema.describe(
      'Nuevo estatus ontológico asignado a la membresía.',
    ),
  })
  .readonly()
  .describe('Parámetros validados para la mutación de estado de membresía grupal.');

export type IManageGroupMembershipParameters = z.infer<
  typeof ManageGroupMembershipParametersSchema
>;

export type { TMembershipStatus };
