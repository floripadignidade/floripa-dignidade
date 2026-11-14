/**
 * @section Meta Webhook Security - Isomorphic HMAC-SHA256 Verifier (Atom)
 * @description Átomo criptográfico isomórfico basado en la Web Crypto API nativa
 * (`globalThis.crypto.subtle.verify`) para verificar firmas HMAC-SHA256 en tiempo
 * constante tanto en Node.js 20+ como en Vercel Edge Runtime, Workers y Deno.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Isomorphic).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

export type TRawHmacPayloadSource = string | Uint8Array | ArrayBuffer;

const copyUint8ArrayToArrayBuffer = (sourceBytes: Uint8Array): ArrayBuffer => {
  const targetArrayBuffer = new ArrayBuffer(sourceBytes.byteLength);
  new Uint8Array(targetArrayBuffer).set(sourceBytes);
  return targetArrayBuffer;
};

const normalizePayloadToArrayBuffer = (rawPayloadSource: TRawHmacPayloadSource): ArrayBuffer => {
  if (typeof rawPayloadSource === 'string') {
    return copyUint8ArrayToArrayBuffer(new TextEncoder().encode(rawPayloadSource));
  }

  if (rawPayloadSource instanceof ArrayBuffer) {
    return rawPayloadSource;
  }

  return copyUint8ArrayToArrayBuffer(rawPayloadSource);
};

/**
 * Verifica en tiempo constante si `expectedDigestBytes` coincide con el HMAC-SHA256
 * calculado sobre los bytes exactos de `rawPayloadSource` usando `appSecretLiteral`.
 *
 * @param rawPayloadSource - Cuerpo HTTP crudo en texto UTF-8 o bytes exactos.
 * @param appSecretLiteral - Secreto HMAC de la aplicación Meta correspondiente.
 * @param expectedDigestBytes - Digest binario SHA-256 (32 bytes) extraído de la cabecera.
 * @returns {Promise<boolean>} Verdadero si la firma criptográfica es auténtica.
 */
export const VerifyHmacSha256Signature = async (
  rawPayloadSource: TRawHmacPayloadSource,
  appSecretLiteral: string,
  expectedDigestBytes: Uint8Array,
): Promise<boolean> => {
  if (appSecretLiteral.length === 0 || expectedDigestBytes.byteLength !== 32) {
    return false;
  }

  const secretArrayBuffer = copyUint8ArrayToArrayBuffer(new TextEncoder().encode(appSecretLiteral));
  const payloadArrayBuffer = normalizePayloadToArrayBuffer(rawPayloadSource);
  const signatureArrayBuffer = copyUint8ArrayToArrayBuffer(expectedDigestBytes);

  const hmacCryptoKey = await globalThis.crypto.subtle.importKey(
    'raw',
    secretArrayBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );

  return await globalThis.crypto.subtle.verify(
    'HMAC',
    hmacCryptoKey,
    signatureArrayBuffer,
    payloadArrayBuffer,
  );
};
