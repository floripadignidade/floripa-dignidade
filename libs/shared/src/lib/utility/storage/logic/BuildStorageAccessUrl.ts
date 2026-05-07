/**
 * @section Storage Logic - Access URL Builder
 * @description Átomo de lógica pura que construye la URL de acceso público.
 */

export const BuildStorageAccessUrl = (
  storageUrl: string,
  bucketName: string,
  storagePath: string
): string => {
  return `${storageUrl}/storage/v1/object/public/${bucketName}/${storagePath}`;
};
