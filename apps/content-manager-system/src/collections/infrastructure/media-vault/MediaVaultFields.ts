/**
 * @section CMS Infrastructure - Media Vault Fields Schema (Atom)
 * @description Define la estructura de metadatos editoriales, accesibilidad WCAG 2.2
 * y vinculación multi-tenant para los activos multimedia registrados en el CMS.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 40500 (WCAG).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { CollectionConfig } from 'payload';

/** Longitud mínima exigida para descripciones accesibles de lectores de pantalla. */
const MINIMUM_ALTERNATIVE_TEXT_LENGTH_QUANTITY = 5;

/**
 * Valida que el texto alternativo posea contenido descriptivo útil para tecnologías asistivas.
 *
 * @param candidateValue - Valor ingresado por el operador editorial en el campo de texto.
 * @returns {string | true} Verdadero si cumple el estándar o mensaje localizado de corrección.
 */
const validateAlternativeTextAccessibility = (candidateValue: unknown): string | true => {
  const isValidAlternativeTextBoolean =
    typeof candidateValue === 'string' &&
    candidateValue.trim().length >= MINIMUM_ALTERNATIVE_TEXT_LENGTH_QUANTITY;

  return (
    isValidAlternativeTextBoolean ||
    'O texto alternativo deve conter pelo menos 5 caracteres para conformidade WCAG.'
  );
};

/**
 * @name MEDIA_VAULT_FIELDS_COLLECTION
 * @description Colección inmutable de campos de metadatos asociados a cada archivo almacenado.
 */
export const MEDIA_VAULT_FIELDS_COLLECTION: CollectionConfig['fields'] = [
  {
    name: 'alternativeTextLiteral',
    type: 'text',
    required: true,
    label: 'Texto Alternativo (Acessibilidade ISO)',
    validate: validateAlternativeTextAccessibility,
    admin: {
      description: 'Descrição textual para tecnologias assistivas (SEO/WCAG).',
      placeholder: 'Ex: Evidência de violação de direitos humanos no bairro Tapera',
    },
  },
  {
    name: 'captionLiteral',
    type: 'textarea',
    label: 'Legenda Técnica / Contextual',
    admin: {
      description: 'Informação adicional sobre a origem ou contexto da mídia.',
    },
  },
  {
    name: 'organizationOwnerIdentifier',
    type: 'relationship',
    relationTo: 'organizations',
    label: 'Organização Proprietária',
    required: false,
    admin: {
      position: 'sidebar',
      description: 'Vínculo institucional para governança multi-tenancy.',
    },
  },
];
