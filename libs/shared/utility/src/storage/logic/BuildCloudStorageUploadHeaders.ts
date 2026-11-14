/**
 * @section Storage Logic - Upload HTTP Headers Builder (Atom)
 * @description Átomo de lógica pura encargado de ensamblar y sellar inmutablemente
 * las cabeceras HTTP de autenticación, tipo de contenido, caché e idempotencia
 * requeridas por el gateway de almacenamiento cloud (Supabase Storage / S3 REST).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Seguridad y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * @interface ICloudStorageUploadHeadersInput
 * @description Contrato inmutable de entrada para construir las cabeceras de transferencia.
 */
export interface ICloudStorageUploadHeadersInput {
  readonly cloudAccessSecurityKeySecret: string;
  readonly contentMimeTypeLiteral: string;
  readonly isUpsertEnabledBoolean: boolean;
  readonly cacheControlSecondsLiteral: string;
}

/**
 * Construye el diccionario inmutable de cabeceras HTTP para carga de objetos en la nube.
 *
 * @param inputSnapshot - Credencial, tipo MIME y directivas de sobrescritura/caché validadas.
 * @returns {Readonly<Record<string, string>>} Mapa de cabeceras congelado en memoria.
 */
export const BuildCloudStorageUploadHeaders = (
  inputSnapshot: ICloudStorageUploadHeadersInput,
): Readonly<Record<string, string>> => {
  const {
    cloudAccessSecurityKeySecret,
    contentMimeTypeLiteral,
    isUpsertEnabledBoolean,
    cacheControlSecondsLiteral,
  } = inputSnapshot;

  return Object.freeze({
    Authorization: `Bearer ${cloudAccessSecurityKeySecret}`,
    apikey: cloudAccessSecurityKeySecret,
    'Content-Type': contentMimeTypeLiteral,
    'x-upsert': isUpsertEnabledBoolean ? 'true' : 'false',
    'cache-control': cacheControlSecondsLiteral,
  });
};
