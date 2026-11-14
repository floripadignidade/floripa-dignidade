/**
 * @section CMS Identity - Citizen Users Fields Schema (Atom)
 * @description Define la estructura de campos civiles, niveles de autoridad RBAC,
 * vinculación multi-tenant y consentimiento LGPD para la colección de usuarios
 * ciudadanos y operadores institucionales en Payload CMS.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e LGPD (Lei 13.709/2018).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { CollectionConfig } from 'payload';

/* 1. Contratos Centralizados de Dominio (Single Source of Truth) */
import {
  IDENTITY_ACCESS_ROLES_COLLECTION,
  type UserAccessRole,
} from '@floripa-dignidade/contracts';

/* 2. Átomo Local de Autorización */
import { hasIdentityRoleManagementAuthorityBoolean } from './CitizenUsersAccessPolicy';

/** Longitud mínima exigida para nombres legales civiles en el registro institucional. */
const MINIMUM_FULL_LEGAL_NAME_LENGTH_QUANTITY = 3;

/**
 * @name INSTITUTIONAL_ROLE_LABELS_MAPPING
 * @description Mapeo inmutable y tipado de roles técnicos hacia sus etiquetas en el panel administrativo.
 */
const INSTITUTIONAL_ROLE_LABELS_MAPPING: Readonly<Record<UserAccessRole, string>> = Object.freeze({
  INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR: 'Auditor de Infraestrutura (SRE)',
  PLATFORM_GLOBAL_MANAGER: 'Gestor Global da Plataforma',
  ORGANIZATION_ADMINISTRATOR: 'Administrador de Organização',
  ORGANIZATION_OPERATOR: 'Operador de Impacto Social',
  IDENTITY_REGISTERED: 'Cidadão Verificado',
  IDENTITY_ANONYMOUS: 'Cidadão Anônimo (Sistema/Temporário)',
});

/**
 * Valida que el nombre civil proporcionado posea contenido legible suficiente.
 *
 * @param candidateValue - Valor ingresado en el campo de nombre completo.
 * @returns {string | true} Verdadero si es válido o mensaje de validación para el operador.
 */
const validateFullLegalNameLiteral = (candidateValue: unknown): string | true => {
  const isValidFullNameBoolean =
    typeof candidateValue === 'string' &&
    candidateValue.trim().length >= MINIMUM_FULL_LEGAL_NAME_LENGTH_QUANTITY;

  return isValidFullNameBoolean || 'O nome completo deve conter pelo menos 3 caracteres válidos.';
};

/**
 * @name CITIZEN_USERS_FIELDS_COLLECTION
 * @description Colección estructural de campos para identidades ciudadanas y operadores en Payload CMS.
 */
export const CITIZEN_USERS_FIELDS_COLLECTION: CollectionConfig['fields'] = [
  {
    name: 'fullLegalNameLiteral',
    type: 'text',
    required: true,
    label: 'Nome Completo (Registro Civil)',
    validate: validateFullLegalNameLiteral,
    admin: { placeholder: 'Ex: João da Silva Sauro' },
  },
  {
    name: 'assignedAuthorityRoleLiteral',
    type: 'select',
    required: true,
    defaultValue: IDENTITY_ACCESS_ROLES_COLLECTION.IDENTITY_REGISTERED,
    label: 'Nível de Autoridade Institucional',
    options: Object.entries(INSTITUTIONAL_ROLE_LABELS_MAPPING).map(([roleKey, roleLabel]) => ({
      label: roleLabel,
      value: roleKey,
    })),
    access: {
      create: (fieldAccessArgumentsSnapshot) =>
        hasIdentityRoleManagementAuthorityBoolean(
          fieldAccessArgumentsSnapshot.req.user?.['assignedAuthorityRoleLiteral'],
        ),
      update: (fieldAccessArgumentsSnapshot) =>
        hasIdentityRoleManagementAuthorityBoolean(
          fieldAccessArgumentsSnapshot.req.user?.['assignedAuthorityRoleLiteral'],
        ),
    },
  },
  {
    name: 'tenantOrganizationIdentifier',
    type: 'relationship',
    relationTo: 'organizations',
    label: 'Organização de Vínculo',
    hasMany: false,
    admin: {
      description: 'Vínculo institucional para governança multi-tenancy.',
      condition: (data) =>
        Boolean(data) &&
        data['assignedAuthorityRoleLiteral'] !==
          IDENTITY_ACCESS_ROLES_COLLECTION.IDENTITY_REGISTERED &&
        data['assignedAuthorityRoleLiteral'] !==
          IDENTITY_ACCESS_ROLES_COLLECTION.IDENTITY_ANONYMOUS,
    },
  },
  {
    type: 'group',
    name: 'forensicIdentificationGroup',
    label: 'Identificação e Privacidade',
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'isIdentityLegallyVerifiedBoolean',
            type: 'checkbox',
            defaultValue: false,
            label: 'Identidade Validada',
            access: {
              create: (fieldAccessArgumentsSnapshot) =>
                hasIdentityRoleManagementAuthorityBoolean(
                  fieldAccessArgumentsSnapshot.req.user?.['assignedAuthorityRoleLiteral'],
                ),
              update: (fieldAccessArgumentsSnapshot) =>
                hasIdentityRoleManagementAuthorityBoolean(
                  fieldAccessArgumentsSnapshot.req.user?.['assignedAuthorityRoleLiteral'],
                ),
            },
            admin: { width: '50%' },
          },
          {
            name: 'hasAcceptedPrivacyPolicyBoolean',
            type: 'checkbox',
            required: true,
            defaultValue: false,
            label: 'Consentimento LGPD Ativo',
            admin: { width: '50%' },
          },
        ],
      },
    ],
  },
];
