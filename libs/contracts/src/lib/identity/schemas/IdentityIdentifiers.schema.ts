/**
 * @section User Management & Identity - Identity Nominal Types
 * @description Única Fuente de Verdad (SSOT) para los identificadores técnicos del sistema.
 * Implementa Branded Types (Tipado Nominal) para garantizar la integridad del Grafo de Tipos
 * y evitar la polución de datos entre diferentes dominios de identidad.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Calidad: ISO/IEC 25010 (Seguridad y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @name IdentityIdentifierSchema
 * @description Identificador único inalterable de una identidad (Persona Física o Jurídica).
 * Representación: UUID v4 con sello de marca nominal.
 */
export const IdentityIdentifierSchema = z.string()
  .uuid({ message: 'IDENTITY_IDENTIFIER_MUST_BE_UUID_V4' })
  .brand<'IdentityIdentifier'>();

/** 🛡️ ADN Tipado: Identidad Primaria */
export type TIdentityIdentifier = z.infer<typeof IdentityIdentifierSchema>;

/**
 * @name OrganizationIdentifierSchema
 * @description Identificador de la jurisdicción institucional (Tenant/Prefeitura).
 * Es el eje central del blindaje Multi-tenant del ecosistema.
 */
export const OrganizationIdentifierSchema = z.string()
  .uuid({ message: 'ORGANIZATION_IDENTIFIER_MUST_BE_UUID_V4' })
  .brand<'OrganizationIdentifier'>();

/** 🛡️ ADN Tipado: Jurisdicción Institucional */
export type TOrganizationIdentifier = z.infer<typeof OrganizationIdentifierSchema>;

/**
 * @name TerritorialTechnicalIdentifierSchema
 * @description Identificador técnico de una unidad geográfica (Estado, Municipio, Barrio).
 * Basado estrictamente en el estándar de códigos abiertos del IBGE.
 */
export const TerritorialTechnicalIdentifierSchema = z.string()
  .min(3, { message: 'TERRITORIAL_IDENTIFIER_INSUFFICIENT_LENGTH' })
  .brand<'TerritorialTechnicalIdentifier'>();

/** 🛡️ ADN Tipado: Identidad Geográfica (IBGE Sync) */
export type TTerritorialTechnicalIdentifier = z.infer<typeof TerritorialTechnicalIdentifierSchema>;

/**
 * @name DeviceFingerprintIdentifierSchema
 * @description Huella digital de hardware utilizada para el rastro de sesiones anónimas.
 * Permite la persistencia de resiliencia sin necesidad de una identidad civil verificada.
 */
export const DeviceFingerprintIdentifierSchema = z.string()
  .min(32, { message: 'DEVICE_FINGERPRINT_INSUFFICIENT_ENTROPY' })
  .brand<'DeviceFingerprintIdentifier'>();

/** 🛡️ ADN Tipado: Identidad de Hardware (Anonymous Trace) */
export type TDeviceFingerprintIdentifier = z.infer<typeof DeviceFingerprintIdentifierSchema>;

/**
 * @prompt_ia: "Asegura que el Health Monitor valide la presencia de estos Branded Types
 * en cualquier orquestador de lógica que realice operaciones de escritura (Create/Update),
 * impidiendo el paso de cadenas de texto planas para proteger la integridad del Ledger físico."
 */
