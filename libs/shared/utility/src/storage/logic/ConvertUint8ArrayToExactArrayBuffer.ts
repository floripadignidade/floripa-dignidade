/**
 * @section Storage Logic - Exact ArrayBuffer Converter (Atom)
 * @description Átomo isomórfico encargado de proyectar cualquier `Uint8Array`
 * (incluyendo sub-vistas con `byteOffset` o respaldadas por `ArrayBufferLike`) hacia
 * un `ArrayBuffer` estricto compatible con `BodyInit` de `fetch` en TypeScript 5.9,
 * erradicando conversiones inseguras (`as any`) y supresiones de linter.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Portabilidad y Robustez).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * Copia de forma determinista el rango exacto de bytes de una vista `Uint8Array` en un `ArrayBuffer` nuevo.
 *
 * @param binarySourceView - Vista binaria validada del activo multimedia o documental.
 * @returns {ArrayBuffer} Búfer binario exacto compatible de forma nativa con `fetch` en Node, Edge y Browser.
 */
export const ConvertUint8ArrayToExactArrayBuffer = (binarySourceView: Uint8Array): ArrayBuffer => {
  const exactArrayBuffer = new ArrayBuffer(binarySourceView.byteLength);
  new Uint8Array(exactArrayBuffer).set(binarySourceView);
  return exactArrayBuffer;
};
