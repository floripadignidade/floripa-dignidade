/**
 * @section CMS Governance - Organizations Fields Schema (Atom)
 * @description Define la estructura de pestañas, campos de identidad legal,
 * parámetros de branding multi-tenant conforme a ADR 0029 y configuración operativa
 * de red para cada organización registrada en el CMS, incluyendo validadores puros.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad y Seguridad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { CollectionConfig } from 'payload';

const SLUG_FORMAT_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEXADECIMAL_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

/**
 * Valida que el slug institucional sea seguro para enrutamiento URL Multi-tenant.
 *
 * @param candidateValue - Valor ingresado en el campo de slug.
 * @returns {string | true} Verdadero si cumple el estándar o mensaje de validación.
 */
const validateSlugFormat = (candidateValue: unknown): string | true => {
  const isValidSlugBoolean =
    typeof candidateValue === 'string' && SLUG_FORMAT_REGEX.test(candidateValue.trim());
  return isValidSlugBoolean || 'O slug deve conter apenas letras minúsculas, números e hífens.';
};

/**
 * Valida que el color de marca respete la notación hexadecimal estándar (ADR 0029).
 *
 * @param candidateValue - Valor hexadecimal ingresado en el campo visual.
 * @returns {string | true} Verdadero si es válido/vacío o mensaje de error.
 */
const validateHexadecimalColorFormat = (candidateValue: unknown): string | true => {
  if (candidateValue === undefined || candidateValue === null || candidateValue === '') {
    return true;
  }
  const isValidHexBoolean =
    typeof candidateValue === 'string' && HEXADECIMAL_COLOR_REGEX.test(candidateValue.trim());
  return isValidHexBoolean || 'A cor deve seguir o formato hexadecimal válido (ex: #003366).';
};

/**
 * @name ORGANIZATIONS_FIELDS_COLLECTION
 * @description Definición de pestañas y campos estructurales para organizaciones en Payload CMS.
 */
export const ORGANIZATIONS_FIELDS_COLLECTION: CollectionConfig['fields'] = [
  {
    type: 'tabs',
    tabs: [
      {
        label: 'Dados Institucionais',
        fields: [
          {
            type: 'row',
            fields: [
              {
                name: 'institutionalNameLiteral',
                type: 'text',
                required: true,
                label: 'Nome Institucional',
                admin: { width: '50%' },
              },
              {
                name: 'legalIdentificationLiteral',
                type: 'text',
                required: true,
                unique: true,
                label: 'Identificação Legal (CNPJ/Tax ID)',
                admin: { width: '50%' },
              },
            ],
          },
          {
            name: 'institutionalSlugLiteral',
            type: 'text',
            required: true,
            unique: true,
            label: 'Slug de Rede (URL)',
            validate: validateSlugFormat,
            admin: {
              description: 'Identificador único para subdomínios ou rotas dinâmicas do portal.',
            },
          },
        ],
      },
      {
        label: 'Identidade Visual (Branding)',
        fields: [
          {
            type: 'row',
            fields: [
              {
                name: 'primaryBrandColorHex',
                type: 'text',
                label: 'Cor Primária (Hex)',
                defaultValue: '#003366',
                validate: validateHexadecimalColorFormat,
                admin: {
                  width: '50%',
                  description: 'Cor Azul Hércules de Autoridade (CSS Variable Override).',
                },
              },
              {
                name: 'secondaryBrandColorHex',
                type: 'text',
                label: 'Cor Secundária (Hex)',
                defaultValue: '#F5A623',
                validate: validateHexadecimalColorFormat,
                admin: {
                  width: '50%',
                  description: 'Cor Âmbar de Conversão e Impacto Social.',
                },
              },
            ],
          },
          {
            name: 'institutionalLogoIdentifier',
            type: 'upload',
            relationTo: 'media-vault',
            label: 'Logotipo Oficial',
            required: false,
          },
        ],
      },
      {
        label: 'Configuração de Rede',
        fields: [
          {
            name: 'isRootOrganizationBoolean',
            type: 'checkbox',
            defaultValue: false,
            label: 'Organização Master (Raiz)',
            admin: {
              description:
                'Define se esta entidade possui autoridade sobre as demais na rede institucional.',
            },
          },
          {
            name: 'operationalStatusLiteral',
            type: 'select',
            required: true,
            defaultValue: 'ACTIVE',
            label: 'Status de Operação',
            options: [
              { label: 'Ativa e Verificada', value: 'ACTIVE' },
              { label: 'Suspensa por Auditoria', value: 'SUSPENDED' },
              { label: 'Arquivada/Inativa', value: 'ARCHIVED' },
            ],
          },
        ],
      },
    ],
  },
];
