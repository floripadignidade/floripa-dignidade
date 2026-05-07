/**
 * @section Storage Logic - Path Generator Atom
 * @description Átomo de lógica pura que construye la ruta física jerárquica.
 * Garantiza que la nube esté organizada y sea auditable.
 *
 * Protocolo OEDP-V17.0 - ISO Standard Naming.
 */

import { join } from 'node:path';
import type { IMultimediaEvidencePayload } from '../schemas/MultimediaEvidence.schema';

/**
 * Genera una ruta absoluta determinista para el storage.
 * Estructura: {org}/{categoria}/{año}/{mes}/{uuid}-{nombre-saneado}
 */
export const GenerateSovereignStoragePath = (
  payload: IMultimediaEvidencePayload,
  uniqueIdentifier: string
): string => {
  const currentMoment = new Date();
  const yearLiteral = currentMoment.getFullYear().toString();
  const monthLiteral = (currentMoment.getMonth() + 1).toString().padStart(2, '0');

  const sanitizedFileName = payload.contextMetadata.originalFileNameLiteral
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '-');

  return join(
    payload.contextMetadata.ownerOrganizationIdentifier,
    payload.contextMetadata.evidenceCategoryLiteral,
    yearLiteral,
    monthLiteral,
    `${uniqueIdentifier}-${sanitizedFileName}`
  );
};
