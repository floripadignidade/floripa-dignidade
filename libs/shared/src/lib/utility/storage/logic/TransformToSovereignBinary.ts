/**
 * @section Storage Logic - Binary Transformer Atom
 * @description Átomo encargado de homogenizar diferentes fuentes de datos binarios
 * (Blob de navegador o Buffer de Node.js) en un formato compatible con la
 * API Fetch nativa (Uint8Array).
 *
 * Protocolo OEDP-V17.0 - Isomorphic Integrity.
 */

/**
 * Transforma una referencia binaria en un búfer de datos crudos compatible con I/O.
 *
 * @param fileReference - El archivo en formato Blob o Buffer.
 * @returns {Promise<Uint8Array>} Rastro binario homogenizado.
 */
export const TransformToSovereignBinary = async (
  fileReference: Blob | Buffer
): Promise<Uint8Array> => {
  /**
   * CASO A: Entorno Navegador / Edge (Blob)
   */
  if (fileReference instanceof Blob) {
    const arrayBuffer = await fileReference.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }

  /**
   * CASO B: Entorno Servidor (Buffer de Node.js)
   * Sincronizado con 'verbatimModuleSyntax'.
   */
  return new Uint8Array(fileReference);
};
