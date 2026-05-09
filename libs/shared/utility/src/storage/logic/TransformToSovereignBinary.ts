/**
 * @section Storage Logic - Isomorphic Binary Transformer Atom
 * @description Átomo de lógica pura encargado de homogeneizar diversas fuentes
 * de datos binarios (Blob, ArrayBuffer, Uint8Array) en el formato universal
 * requerido por la API Fetch nativa (Uint8Array) para su volcado en S3/Cloud.
 *
 * Protocolo OEDP-V17.0 - Isomorphic Integrity & High Performance SRE.
 * 🛡️ LEY SRE: Al evitar la clase 'Buffer' de Node.js, este aparato garantiza
 * compatibilidad total con Vercel Edge Runtime y navegadores móviles modernos.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * Transforma una referencia binaria heterogénea en un búfer de datos
 * crudos estandarizado y listo para I/O de red.
 *
 * @param heterogeneousBinarySource - El rastro binario capturado (Blob, Buffer o ArrayBuffer).
 * @returns {Promise<Uint8Array>} Rastro binario puro sin pérdida de fidelidad técnica.
 * @throws {TypeError} Si la fuente no corresponde a un formato binario reconocido.
 */
export const TransformToSovereignBinary = async (
  heterogeneousBinarySource: Blob | Uint8Array | ArrayBuffer
): Promise<Uint8Array> => {

  /**
   * @section CASO A: Entorno de Interfaz (Browser / PWA)
   * Si recibimos un Blob (común en 'input type=file' o capturas de cámara),
   * extraemos su contenido mediante la Web API asíncrona.
   */
  if (heterogeneousBinarySource instanceof Blob) {
    const rawArrayBufferSnapshot = await heterogeneousBinarySource.arrayBuffer();
    return new Uint8Array(rawArrayBufferSnapshot);
  }

  /**
   * @section CASO B: Estructura de Memoria Genérica
   * Si la fuente es un ArrayBuffer (resultado de lecturas de bajo nivel),
   * lo envolvemos en una vista Uint8Array compatible con el cuerpo de Fetch.
   */
  if (heterogeneousBinarySource instanceof ArrayBuffer) {
    return new Uint8Array(heterogeneousBinarySource);
  }

  /**
   * @section CASO C: Conformidad Absoluta y Eficiencia
   * Si ya es un Uint8Array (que incluye a la clase 'Buffer' en Node.js),
   * lo retornamos directamente, logrando una operación de coste O(1).
   */
  if (heterogeneousBinarySource instanceof Uint8Array) {
    return heterogeneousBinarySource;
  }

  /**
   * @section Salvaguarda de Integridad
   * Si el flujo llega aquí con un tipo inesperado, lanzamos un error
   * descriptivo para el Neural Sentinel.
   */
  throw new TypeError(
    '[STORAGE_TRANSFORMER_ERROR]: La fuente binaria proporcionada no es compatible con el estándar Zenith.'
  );
};
