/**
 * @section Meta Webhook Security - Signature Header Parser (Atom)
 * @description Átomo isomórfico de lógica pura encargado de validar el formato
 * estricto de la cabecera `X-Hub-Signature-256` (`sha256=<64 hex>`) conforme a
 * la especificación oficial de Meta y decodificar los 32 bytes del digest SHA-256
 * sin dependencias de Node.js (`Buffer`).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Isomorphic).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

const SHA256_DIGEST_BYTE_LENGTH_QUANTITY = 32;
const META_SHA256_SIGNATURE_REGEX = /^sha256=([a-fA-F0-9]{64})$/;

/**
 * @interface IParsedMetaSignatureHeader
 * @description Resultado inmutable del parseo sintáctico y decodificación hexadecimal de la firma.
 */
export interface IParsedMetaSignatureHeader {
  readonly isHeaderFormatValidBoolean: boolean;
  readonly digestBytes: Uint8Array | null;
  readonly algorithmLiteral: 'SHA-256';
}

/**
 * Valida y decodifica la cabecera `X-Hub-Signature-256` en un `Uint8Array` de 32 bytes.
 *
 * @param signatureHeaderLiteral - Valor crudo de la cabecera recibida de Meta.
 * @returns {IParsedMetaSignatureHeader} Estructura sellada con el estado de validez y digest binario.
 */
export const ParseMetaSignatureHeader = (
  signatureHeaderLiteral: string,
): IParsedMetaSignatureHeader => {
  const regexMatchResult = META_SHA256_SIGNATURE_REGEX.exec(signatureHeaderLiteral.trim());

  if (!regexMatchResult) {
    return Object.freeze({
      isHeaderFormatValidBoolean: false,
      digestBytes: null,
      algorithmLiteral: 'SHA-256',
    });
  }

  const hexadecimalDigestLiteral = regexMatchResult[1] ?? '';
  const digestBytes = new Uint8Array(SHA256_DIGEST_BYTE_LENGTH_QUANTITY);

  for (
    let byteIndexNumeric = 0;
    byteIndexNumeric < SHA256_DIGEST_BYTE_LENGTH_QUANTITY;
    byteIndexNumeric += 1
  ) {
    const hexPairLiteral = hexadecimalDigestLiteral.slice(
      byteIndexNumeric * 2,
      byteIndexNumeric * 2 + 2,
    );
    digestBytes[byteIndexNumeric] = Number.parseInt(hexPairLiteral, 16);
  }

  return Object.freeze({
    isHeaderFormatValidBoolean: true,
    digestBytes,
    algorithmLiteral: 'SHA-256',
  });
};
