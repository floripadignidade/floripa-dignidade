/**
 * @section Storage Logic - Sovereign Storage Path Generator
 * @description Átomo de lógica pura encargado de la construcción de rutas físicas
 * jerárquicas para el almacenamiento en la nube. Garantiza que el Data Lake esté
 * organizado por organización, categoría y tiempo, facilitando la auditoría y
 * las políticas de retención.
 *
 * Protocolo OEDP-V17.0 - Isomorphic Integrity & Prosa Code.
 * 🛡️ LEY SRE: Este aparato utiliza manipulación de cadenas pura en lugar de 'node:path'
 * para garantizar la compatibilidad universal entre Browser, Edge y Node.js.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { IMultimediaEvidencePayload } from '../schemas/MultimediaEvidence.schema';

/**
 * Genera una ruta de almacenamiento determinista y semántica.
 * Estructura: {organizacion}/{categoria}/{año}/{mes}/{uuid}-{nombre-saneado}
 *
 * @param evidencePayloadSnapshot - ADN de la evidencia validado por la aduana.
 * @param uniqueIdentifierLiteral - ID único (UUID) para evitar colisiones de archivos.
 * @returns {string} Ruta relativa normalizada para el bucket S3/Supabase.
 */
export const GenerateSovereignStoragePath = (
  evidencePayloadSnapshot: IMultimediaEvidencePayload,
  uniqueIdentifierLiteral: string
): string => {
  const currentMoment = new Date();

  // 1. EXTRACCIÓN DE COMPONENTES TEMPORALES (ISO 8601)
  const currentYearLiteral = currentMoment.getFullYear().toString();
  const currentMonthLiteral = (currentMoment.getMonth() + 1).toString().padStart(2, '0');

  // 2. SANEAMIENTO DE NOMBRE DE ARCHIVO
  /**
   * Convertimos a minúsculas y sustituimos cualquier rastro no alfanumérico
   * (excepto puntos) por guiones para asegurar la compatibilidad con URLs.
   */
  const sanitizedFileNameLiteral = evidencePayloadSnapshot.institutionalContextMetadata.originalFileNameLiteral
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '-');

  // 3. EXTRACCIÓN DE METADATOS INSTITUCIONALES
  const {
    ownerOrganizationIdentifier,
    evidenceCategoryLiteral
  } = evidencePayloadSnapshot.institutionalContextMetadata;

  /**
   * @section Construcción de Ruta Isomórfica
   * Utilizamos el separador universal '/' independientemente del Sistema Operativo,
   * ya que esta ruta es para consumo de APIs de Almacenamiento Cloud.
   */
  const pathSegmentsCollection: string[] = [
    ownerOrganizationIdentifier,
    evidenceCategoryLiteral,
    currentYearLiteral,
    currentMonthLiteral,
    `${uniqueIdentifierLiteral}-${sanitizedFileNameLiteral}`
  ];

  return pathSegmentsCollection.join('/');
};
