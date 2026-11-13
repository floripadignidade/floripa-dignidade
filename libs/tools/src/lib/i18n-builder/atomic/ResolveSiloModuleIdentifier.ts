/**
 * @section Tools & Infrastructure - Silo Module Identifier Resolver (Atom)
 * @description Átomo de lógica pura encargado de derivar un identificador de dominio
 * semántico, determinista y libre de colisiones a partir de la ruta física de un directorio
 * `i18n/`, eliminando segmentos técnicos (`src`, `lib`, `app`, `[locale]`, `i18n`) sin
 * truncamientos ciegos y protegiendo la frontera física frente a saltos de directorio (`..`).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: ISO/IEC 11179 (Nomenclatura Técnica) e ISO/IEC 25010 (Mantenibilidad y Seguridad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { isAbsolute, normalize, relative } from 'node:path';
import { z } from 'zod';

import { ValidationException } from '@floripa-dignidade/exceptions';

const STRUCTURAL_NOISE_SEGMENTS_SET: ReadonlySet<string> = new Set([
  'src',
  'lib',
  'app',
  '[locale]',
  'i18n',
]);

const ResolveSiloModuleIdentifierParametersSchema = z
  .object({
    scopePrefixLiteral: z.enum(['libs', 'apps']),
    scanRootDirectoryPathLiteral: z.string().trim().min(1),
    siloDirectoryPathLiteral: z.string().trim().min(1),
  })
  .readonly();

/**
 * Calcula el identificador lógico normalizado de un silo lingüístico bajo `libs/` o `apps/`.
 *
 * @param scopePrefixLiteral - Raíz lógica de procedencia (`libs` o `apps`).
 * @param scanRootDirectoryPathLiteral - Ruta absoluta de la raíz escaneada (`libs` o `apps`).
 * @param siloDirectoryPathLiteral - Ruta absoluta del directorio `i18n` descubierto.
 * @returns {string} Identificador normalizado (ej: `core/telemetry`, `modules/whatsapp/communication-service`, `apps/floripa-dignidade/observatorio`).
 * @throws {ValidationException} Si los parámetros son inválidos o el silo escapa de la raíz escaneada.
 */
export const ResolveSiloModuleIdentifier = (
  scopePrefixLiteral: 'libs' | 'apps',
  scanRootDirectoryPathLiteral: string,
  siloDirectoryPathLiteral: string,
): string => {
  const validationResult = ResolveSiloModuleIdentifierParametersSchema.safeParse({
    scopePrefixLiteral,
    scanRootDirectoryPathLiteral,
    siloDirectoryPathLiteral,
  });

  if (!validationResult.success) {
    throw new ValidationException('PARAMETROS_RESOLUCION_MODULO_LINGUISTICO_INVALIDOS', {
      validationIssuesCollection: validationResult.error.flatten(),
    });
  }

  const normalizedRootLiteral = normalize(validationResult.data.scanRootDirectoryPathLiteral);
  const normalizedSiloLiteral = normalize(validationResult.data.siloDirectoryPathLiteral);
  const computedRelativePathLiteral = relative(normalizedRootLiteral, normalizedSiloLiteral);

  const isOutsideScanRootBoolean =
    computedRelativePathLiteral === '' ||
    computedRelativePathLiteral.startsWith('..') ||
    isAbsolute(computedRelativePathLiteral);

  if (isOutsideScanRootBoolean) {
    throw new ValidationException('RUTA_DE_SILO_FUERA_DE_JURISDICCION', {
      scopePrefixLiteral: validationResult.data.scopePrefixLiteral,
      normalizedRootLiteral,
      normalizedSiloLiteral,
    });
  }

  const relativeSegmentsCollection = computedRelativePathLiteral
    .split(/[/\\]+/)
    .filter((segmentLiteral) => segmentLiteral.length > 0 && segmentLiteral !== '.')
    .filter((segmentLiteral) => !STRUCTURAL_NOISE_SEGMENTS_SET.has(segmentLiteral));

  if (relativeSegmentsCollection.length === 0) {
    throw new ValidationException('IDENTIFICADOR_DE_MODULO_LINGUISTICO_VACIO', {
      scopePrefixLiteral: validationResult.data.scopePrefixLiteral,
      normalizedSiloLiteral,
    });
  }

  if (validationResult.data.scopePrefixLiteral === 'apps') {
    return ['apps', ...relativeSegmentsCollection].join('/');
  }

  return relativeSegmentsCollection.join('/');
};
