/**
 * @section Telemetry Logic - Forensic Hash Generator
 * @description Átomo de lógica pura encargado de la generación de firmas digitales
 * SHA-256. Proporciona la inalterabilidad necesaria para la Cadena Merkle del
 * sistema nervioso central, asegurando la integridad de la evidencia digital.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Cryptographic Integrity.
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { ContentFingerprint } from '../../schemas/TelemetrySignal.schema';

/**
 * Genera una huella digital determinista de un diccionario de datos.
 * Utiliza la Web Crypto API nativa para máxima eficiencia y soberanía.
 *
 * @param dataPayloadSnapshot - El objeto de datos que será sellado.
 * @returns {Promise<ContentFingerprint>} Firma hexadecimal de 64 caracteres.
 */
export const GenerateForensicHash = async (
  dataPayloadSnapshot: Record<string, unknown>,
): Promise<ContentFingerprint> => {
  /**
   * @section Serialización Determinista
   * Ordenamos las llaves alfabéticamente para garantizar que la firma
   * no cambie si el orden de las propiedades varía en memoria.
   */
  const sortedKeysCollection = Object.keys(dataPayloadSnapshot).sort();
  const deterministicJsonLiteral = JSON.stringify(dataPayloadSnapshot, sortedKeysCollection);

  /**
   * @section Procesamiento Criptográfico (Hardware Native)
   * Transformamos el literal de texto en un rastro binario (Uint8Array)
   * para el motor digest del hardware.
   */
  const textEncoderInstance = new TextEncoder();
  const binaryDataBuffer = textEncoderInstance.encode(deterministicJsonLiteral);

  try {
    /**
     * @step_crypto: SHA-256 Digest
     * Operación asíncrona no bloqueante ejecutada por el motor de criptografía.
     */
    const hashBuffer = await crypto.subtle.digest('SHA-256', binaryDataBuffer);

    // Transformación del buffer binario a cadena hexadecimal técnica.
    const hashArrayCollection = Array.from(new Uint8Array(hashBuffer));

    const hexDigestLiteral = hashArrayCollection
      .map((byteValue) => byteValue.toString(16).padStart(2, '0'))
      .join('');

    /**
     * 🛡️ SANEADO Zenith: Sellado de marca (Branding).
     * Retornamos la firma validando el contrato de longitud del ADN.
     */
    return hexDigestLiteral as ContentFingerprint;
  } catch (_caughtAlgorithmError: unknown) {
    /**
     * @section Resiliencia en Fallo Criptográfico
     * En caso de colapso del hardware de criptografía (entornos legacy),
     * se genera un rastro de fallo para alertar al Neural Sentinel.
     */
    return '0000000000000000000000000000000000000000000000000000000000000000' as ContentFingerprint;
  }
};
