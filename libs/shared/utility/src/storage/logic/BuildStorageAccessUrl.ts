/**
 * @section Storage Logic - Storage Access URL Builder
 * @description Átomo de lógica pura encargado de la construcción de localizadores
 * de recursos (URL) para activos públicos alojados en la nube. Proporciona la
 * interfaz técnica para recuperar evidencias y activos institucionales.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & ISO Technical Naming.
 * 🛡️ LEY SRE: Este aparato garantiza la integridad del enlace físico mediante
 * el saneamiento de prefijos, evitando colisiones de ruteo por dobles barras.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * Genera la URL absoluta de acceso público para un objeto en el Tier de Datos.
 * Implementa el protocolo estándar de Supabase Storage v1.
 *
 * @param cloudStorageBaseUrlLiteral - URL física del búnker de datos (ej: https://xyz.supabase.co).
 * @param storageBucketNameLiteral - Nombre del contêiner de archivos (ej: "media-vault").
 * @param internalStoragePathLiteral - Ruta jerárquica del archivo generada por el orquestador.
 * @returns {string} Localizador uniforme de recursos (URL) validado.
 */
export const BuildStorageAccessUrl = (
  cloudStorageBaseUrlLiteral: string,
  storageBucketNameLiteral: string,
  internalStoragePathLiteral: string
): string => {

  /**
   * @section Saneamiento de Frontera (Clean URL)
   * Eliminamos cualquier barra final en la URL base para evitar el error de
   * concatenación redundante (//).
   */
  const sanitizedBaseUrlLiteral = cloudStorageBaseUrlLiteral.endsWith('/')
    ? cloudStorageBaseUrlLiteral.slice(0, -1)
    : cloudStorageBaseUrlLiteral;

  /**
   * @section Ensamblaje de Identidad de Red
   * Estructura oficial: {BaseUrl}/storage/v1/object/public/{Bucket}/{Path}
   */
  const protocolPathLiteral = 'storage/v1/object/public';

  const finalAccessUrlCollection: string[] = [
    sanitizedBaseUrlLiteral,
    protocolPathLiteral,
    storageBucketNameLiteral,
    internalStoragePathLiteral
  ];

  return finalAccessUrlCollection.join('/');
};
