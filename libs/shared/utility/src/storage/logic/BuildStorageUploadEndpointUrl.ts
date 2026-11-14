/**
 * @section Storage Logic - Storage Upload Endpoint Builder (Atom)
 * @description Átomo de lógica pura encargado de construir la URL REST canónica de
 * Supabase Storage (`/storage/v1/object/{bucket}/{path}`) a partir de `SUPABASE_URL`,
 * saneando barras redundantes y codificando el identificador de bucket.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad y Portabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * Ensambla el endpoint HTTPS de carga física para la API REST de Supabase Storage.
 *
 * @param supabaseBaseUrlLiteral - URL raíz del proyecto Supabase (`SUPABASE_URL`).
 * @param storageBucketNameLiteral - Nombre del bucket destino en Supabase Storage.
 * @param internalStoragePathLiteral - Clave jerárquica saneada generada para el objeto.
 * @returns {string} Endpoint absoluto normalizado para petición HTTP POST.
 */
export const BuildStorageUploadEndpointUrl = (
  supabaseBaseUrlLiteral: string,
  storageBucketNameLiteral: string,
  internalStoragePathLiteral: string,
): string => {
  const sanitizedBaseUrlLiteral = supabaseBaseUrlLiteral.trim().replace(/\/+$/, '');
  const encodedBucketSegmentLiteral = encodeURIComponent(storageBucketNameLiteral.trim());
  const sanitizedObjectPathLiteral = internalStoragePathLiteral.trim().replace(/^\/+/, '');

  return `${sanitizedBaseUrlLiteral}/storage/v1/object/${encodedBucketSegmentLiteral}/${sanitizedObjectPathLiteral}`;
};
