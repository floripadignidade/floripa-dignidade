/**
 * @section Enterprise Contracts - Multidimensional Citizen Identity Canonical Bridge
 * @description Única Fuente de Verdad (SSOT) para la exportación simétrica de la
 * identidad ciudadana multidimensional. Actúa como el puente canónico entre la
 * nomenclatura ISO 11179 (UserIdentitySchema) y el alias institucional (IdentityProfileSchema),
 * garantizando cero duplicidad de código y cumplimiento estricto de las reglas de ESLint.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 y LGPD (Lei 13.709/2018).
 * SANEADO Turbopack: Erradicación de extensiones '.js', consolidación DRY y reducción a < 80 líneas.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/* 1. Importación Canónica desde el Contrato de Perfil de Identidad (Clean Paths) */
import {
  ContactPointMetadataSchema,
  type IContactPointMetadata,
  IdentityProfileSchema,
  IdentityTrustLevelEnum,
  type IIdentityProfile,
  type ITerritorialAddressSnapshot,
  TerritorialAddressSnapshotSchema,
  type TIdentityTrustLevel,
} from './schemas/IdentityProfile.schema';

/**
 * @section Exportaciones Estructurales Simétricas
 * Garantiza retrocompatibilidad total con cualquier módulo que consuma la identidad
 * bajo la denominación UserIdentity o IdentityProfile.
 */
export {
  IdentityTrustLevelEnum,
  ContactPointMetadataSchema,
  TerritorialAddressSnapshotSchema,
  IdentityProfileSchema,
  IdentityProfileSchema as UserIdentitySchema,
};

/**
 * @section Representación de Tipos Estáticos (Source-First Typing)
 */
export type {
  TIdentityTrustLevel,
  IContactPointMetadata,
  ITerritorialAddressSnapshot,
  IIdentityProfile,
  IIdentityProfile as IUserIdentity,
};
