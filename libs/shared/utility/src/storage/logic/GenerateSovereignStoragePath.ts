/**
 * @section Storage Logic - Enterprise Storage Path Generator (Atom)
 * @description Átomo de lógica pura encargado de la construcción de rutas físicas
 * jerárquicas y deterministas para el almacenamiento de objetos en la nube (S3 / Supabase Storage).
 * Proyecta la estructura organizativa por entidad, categoría y componentes temporales ISO 8601,
 * garantizando la inmutabilidad de la clave de almacenamiento y la mitigación de colisiones.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Seguridad y Mantenibilidad).
 * SANEADO: Purga definitiva de metáforas informales ("Sovereign"), neutralización de ataques
 * de salto de directorio (Path Traversal) y tipado nominal sellado con Zod.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/* 1. Contratos de ADN Estructural (Importación Canónica Relativa) */
import type { IMultimediaEvidencePayload } from '../schemas/MultimediaEvidence.schema.js';

/**
 * @name EnterpriseStoragePathLiteralSchema
 * @description Contrato Zod con sellado de marca nominal para claves jerárquicas de almacenamiento.
 */
export const EnterpriseStoragePathLiteralSchema = z
  .string()
  .min(1, { message: 'LA_RUTA_DE_ALMACENAMIENTO_NO_PUEDE_ESTAR_VACIA' })
  .brand<'EnterpriseStoragePathLiteral'>();

/** Tipo nominal inmutable para la ruta de almacenamiento relativa dentro del bucket. */
export type TEnterpriseStoragePathLiteral = z.infer<
  typeof EnterpriseStoragePathLiteralSchema
>;

/**
 * Genera una ruta de almacenamiento física determinista, semántica y sanitizada contra Path Traversal.
 * Estructura de Clave S3: {organizacion}/{categoria}/{año}/{mes}/{uuid}-{nombre-saneado}
 *
 * @param evidencePayloadSnapshot - Snapshot inmutable con los metadatos institucionales y el archivo.
 * @param uniqueIdentifierLiteral - Identificador único universal (UUID v4) para erradicar colisiones.
 * @returns {TEnterpriseStoragePathLiteral} Clave de almacenamiento jerárquica con tipado nominal sellado.
 */
export const GenerateEnterpriseStoragePath = (
  evidencePayloadSnapshot: IMultimediaEvidencePayload,
  uniqueIdentifierLiteral: string,
): TEnterpriseStoragePathLiteral => {
  const currentExecutionDateTime = new Date();

  // 1. EXTRACCIÓN DE COMPONENTES TEMPORALES (ISO 8601)
  const currentYearLiteral = currentExecutionDateTime.getFullYear().toString();
  const currentMonthLiteral = (currentExecutionDateTime.getMonth() + 1)
    .toString()
    .padStart(2, '0');

  // 2. SANITIZACIÓN ROBUSTA DE SEGURIDAD (Path Traversal Defense)
  /**
   * Proceso de purificación:
   * A. Forzado a minúsculas y eliminación de espacios en los extremos.
   * B. Sustitución de cualquier carácter no alfanumérico (excepto puntos) por guiones.
   * C. Neutralización de puntos consecutivos (..) para impedir ataques de salto de directorio.
   * D. Colapso de guiones repetidos (--) generados por caracteres especiales contiguos.
   * E. Eliminación de guiones o puntos en los bordes del nombre de archivo.
   */
  const rawFileNameLiteral =
    evidencePayloadSnapshot.institutionalContextMetadata.originalFileNameLiteral;

  const sanitizedFileNameLiteral = rawFileNameLiteral
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9.]/g, '-')
    .replace(/\.{2,}/g, '.')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '');

  // 3. EXTRACCIÓN DE METADATOS INSTITUCIONALES (Jurisdicción Multi-tenant)
  const { ownerOrganizationIdentifier, evidenceCategoryLiteral } =
    evidencePayloadSnapshot.institutionalContextMetadata;

  /**
   * @section Construcción Isomórfica de Clave S3
   * Se utiliza estrictamente el delimitador universal '/' independientemente del sistema operativo
   * anfitrión (Windows/Linux), satisfaciendo la especificación de claves de objetos de Amazon S3.
   */
  const fileKeySegmentLiteral = `${uniqueIdentifierLiteral}-${sanitizedFileNameLiteral}`;

  const pathSegmentsCollection: readonly string[] = [
    ownerOrganizationIdentifier,
    evidenceCategoryLiteral,
    currentYearLiteral,
    currentMonthLiteral,
    fileKeySegmentLiteral,
  ];

  const enterpriseStoragePathLiteral = pathSegmentsCollection.join('/');

  return enterpriseStoragePathLiteral as TEnterpriseStoragePathLiteral;
};

/**
 * @name GenerateSovereignStoragePath
 * @description Alias institucional de compatibilidad histórica para transiciones en el monorepo.
 * @deprecated Utilizar canónicamente 'GenerateEnterpriseStoragePath' bajo el estándar OEDP-V18.1.
 */
export const GenerateSovereignStoragePath = GenerateEnterpriseStoragePath;