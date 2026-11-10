// apps/content-manager-system/src/collections/identity/CitizenUsers.collection.ts

/**
 * @section CMS Architecture - Identity & Civil Governance Axis
 * @description Define la colección de Ciudadanos, Gestores e Interventores institucionales
 * en el panel administrativo de Payload CMS. Implementa el control de acceso basado en roles (RBAC)
 * consumiendo el contrato global de autoridad institucional.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Seguridad y Mantenibilidad).
 * SANEADO Zenith: Erradicación del rol metafórico INFRASTRUCTURE_SOVEREIGN_AUDITOR
 * y alineación canónica con INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR (Fix TS2353).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { CollectionConfig } from 'payload';

/* 1. Infraestructura Core de Telemetría */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

/* 2. Contratos Centralizados de Dominio (Single Source of Truth) */
import {
  IDENTITY_ACCESS_ROLES_COLLECTION,
  type UserAccessRole,
} from '@floripa-dignidade/contracts';

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const COLLECTION_MODULE_IDENTIFIER = 'CITIZEN_USERS_COLLECTION' as ModuleIdentifier;

/**
 * @name INSTITUTIONAL_ROLE_LABELS_MAPPING
 * @description Diccionario estricto que mapea cada rol técnico con su etiqueta legible en la interfaz administrativa.
 * TypeScript forzará un error en tiempo de compilación si el contrato central de roles es alterado sin reflejarse aquí.
 */
const INSTITUTIONAL_ROLE_LABELS_MAPPING: Record<UserAccessRole, string> = {
  INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR: 'Auditor de Infraestrutura (SRE)',
  PLATFORM_GLOBAL_MANAGER: 'Gestor Global da Plataforma',
  ORGANIZATION_ADMINISTRATOR: 'Administrador de Organização',
  ORGANIZATION_OPERATOR: 'Operador de Impacto Social',
  IDENTITY_REGISTERED: 'Cidadão Verificado',
  IDENTITY_ANONYMOUS: 'Cidadão Anônimo (Sistema/Temporário)',
};

/**
 * @section Reglas Atómicas de Acceso
 * Encapsulan la lógica de seguridad administrativa para proteger el principio de privilegio mínimo.
 */
const hasAdministrativeOrManagerAuthorityBoolean = (userRole?: string): boolean => {
  return (
    userRole === IDENTITY_ACCESS_ROLES_COLLECTION.INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR ||
    userRole === IDENTITY_ACCESS_ROLES_COLLECTION.PLATFORM_GLOBAL_MANAGER
  );
};

/**
 * @name CitizenUsersCollection
 * @description Bóveda de identidades ciudadanas y operadores con autoridad sobre el ecosistema.
 */
export const CitizenUsersCollection: CollectionConfig = {
  slug: 'citizen-users',

  labels: {
    singular: 'Cidadão',
    plural: 'Rede de Cidadania',
  },

  admin: {
    useAsTitle: 'fullLegalNameLiteral',
    group: 'Identidade & Acesso',
    defaultColumns: ['fullLegalNameLiteral', 'email', 'assignedAuthorityRoleLiteral'],
    listSearchableFields: ['fullLegalNameLiteral', 'email'],
  },

  /**
   * @section Gobernanza de Acceso (RBAC Institucional)
   */
  access: {
    read: ({ req: { user } }) => {
      const activeUserRoleLiteral = user?.['assignedAuthorityRoleLiteral'] as string | undefined;

      if (
        activeUserRoleLiteral ===
        IDENTITY_ACCESS_ROLES_COLLECTION.INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR
      ) {
        return true;
      }

      // Un ciudadano estándar solo puede visualizar su propio registro de identidad
      return { id: { equals: user?.id } };
    },

    delete: ({ req: { user } }) => {
      const activeUserRoleLiteral = user?.['assignedAuthorityRoleLiteral'] as string | undefined;
      return (
        activeUserRoleLiteral ===
        IDENTITY_ACCESS_ROLES_COLLECTION.INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR
      );
    },

    create: () => true, // El registro inicial ciudadano es público a través del portal
  },

  auth: {
    tokenExpiration: 7200,
    verify: false,
    maxLoginAttempts: 5,
    lockTime: 600000,
  },

  fields: [
    {
      name: 'fullLegalNameLiteral',
      type: 'text',
      required: true,
      label: 'Nome Completo (Registro Civil)',
      admin: { placeholder: 'Ex: João da Silva Sauro' },
    },
    {
      name: 'assignedAuthorityRoleLiteral',
      type: 'select',
      required: true,
      defaultValue: 'IDENTITY_REGISTERED',
      label: 'Nível de Autoridade Institucional',
      options: Object.entries(INSTITUTIONAL_ROLE_LABELS_MAPPING).map(
        ([roleValueLiteral, roleLabelLiteral]) => ({
          label: roleLabelLiteral,
          value: roleValueLiteral,
        }),
      ),
      access: {
        // Bloqueo de escalada de privilegios: Solo roles administrativos pueden alterar rangos
        update: ({ req: { user } }) => {
          const activeUserRoleLiteral = user?.['assignedAuthorityRoleLiteral'] as
            | string
            | undefined;
          return hasAdministrativeOrManagerAuthorityBoolean(activeUserRoleLiteral);
        },
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
        condition: (data) => data['assignedAuthorityRoleLiteral'] !== 'IDENTITY_REGISTERED',
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
  ],

  /**
   * @section Trazabilidad Forense (Integrity Hooks)
   */
  hooks: {
    afterChange: [
      ({ doc, operation, req }) => {
        if (operation === 'create' || operation === 'update') {
          void EmitTelemetrySignal({
            occurrenceTimestampISO: new Date().toISOString(),
            severityLevelLiteral: 'INFO',
            moduleIdentifierLiteral: COLLECTION_MODULE_IDENTIFIER,
            operationCodeLiteral: `IDENTITY_${operation.toUpperCase()}` as OperationCode,
            correlationIdentifier: GenerateCorrelationIdentifier(),
            messageContentLiteral: `Evento de identidade processado no CMS: ${doc['email']}`,
            semanticIntentTag: 'CMS_IDENTITY_MUTATION',
            contextMetadataSnapshot: {
              assignedRoleLiteral: doc['assignedAuthorityRoleLiteral'],
              perpetratorIdentityLiteral: req.user?.email ?? 'SYSTEM_BOOTSTRAP',
            },
          });
        }
      },
    ],
  },
};