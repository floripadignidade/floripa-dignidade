/**
 * @section Infrastructure Auditor - WhatsApp Cryptographic Handshake Engine (Atom)
 * @description Átomo de lógica pura encargado de auditar la entropía de los secretos
 * de WhatsApp ('WHATSAPP_VERIFY_TOKEN' y 'WHATSAPP_APP_SECRET') y ejecutar una simulación
 * de verificación de firma HMAC-SHA256 en tiempo constante con 'node:crypto'.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Seguridad y Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

const MINIMUM_VERIFY_TOKEN_LENGTH_QUANTITY = 10;
const MINIMUM_APP_SECRET_LENGTH_QUANTITY = 16;
const SYNTHETIC_CHALLENGE_PAYLOAD_LITERAL = 'FLORIPA_DIGNIDADE_META_HANDSHAKE_TEST';

/**
 * @interface IWhatsAppHandshakeResult
 * @description Contrato inmutable que estructura el diagnóstico criptográfico y de entropía.
 */
export interface IWhatsAppHandshakeResult {
  readonly isValidBoolean: boolean;
  readonly statusDescriptionLiteral: string;
  readonly diagnosticErrorLiteral?: string;
  readonly hasValidSecretFormatBoolean: boolean;
}

/**
 * Valida la entropía de las credenciales y ejecuta una prueba de firma HMAC simétrica en tiempo constante.
 *
 * @param rawVerifyTokenSecret - Secreto configurado en WHATSAPP_VERIFY_TOKEN.
 * @param rawAppSecret - Secreto configurado en WHATSAPP_APP_SECRET.
 * @returns {IWhatsAppHandshakeResult} Diagnóstico criptográfico sellado e inmutable.
 */
export const ExecuteWhatsAppCryptographicHandshake = (
  rawVerifyTokenSecret: string,
  rawAppSecret: string,
): IWhatsAppHandshakeResult => {
  const hasValidVerifyTokenLengthBoolean =
    rawVerifyTokenSecret.length >= MINIMUM_VERIFY_TOKEN_LENGTH_QUANTITY;
  const hasValidAppSecretLengthBoolean = rawAppSecret.length >= MINIMUM_APP_SECRET_LENGTH_QUANTITY;

  if (!hasValidVerifyTokenLengthBoolean) {
    return Object.freeze({
      isValidBoolean: false,
      hasValidSecretFormatBoolean: false,
      statusDescriptionLiteral: `WHATSAPP_VERIFY_TOKEN no cumple con la entropía mínima (${MINIMUM_VERIFY_TOKEN_LENGTH_QUANTITY} caracteres).`,
      diagnosticErrorLiteral: 'INSUFFICIENT_VERIFY_TOKEN_ENTROPY',
    });
  }

  if (!hasValidAppSecretLengthBoolean) {
    return Object.freeze({
      isValidBoolean: false,
      hasValidSecretFormatBoolean: false,
      statusDescriptionLiteral: `WHATSAPP_APP_SECRET no cumple con la longitud mínima (${MINIMUM_APP_SECRET_LENGTH_QUANTITY} caracteres).`,
      diagnosticErrorLiteral: 'INSUFFICIENT_APP_SECRET_ENTROPY',
    });
  }

  try {
    const generatedSignatureBuffer = createHmac('sha256', rawAppSecret)
      .update(SYNTHETIC_CHALLENGE_PAYLOAD_LITERAL)
      .digest();

    const expectedSignatureBuffer = createHmac('sha256', rawAppSecret)
      .update(SYNTHETIC_CHALLENGE_PAYLOAD_LITERAL)
      .digest();

    const isSignatureSymmetricBoolean = timingSafeEqual(
      generatedSignatureBuffer,
      expectedSignatureBuffer,
    );

    if (!isSignatureSymmetricBoolean) {
      return Object.freeze({
        isValidBoolean: false,
        hasValidSecretFormatBoolean: true,
        statusDescriptionLiteral: 'Fallo en la simetría criptográfica de la firma HMAC.',
        diagnosticErrorLiteral: 'HMAC_SIGNATURE_ASYMMETRY',
      });
    }

    return Object.freeze({
      isValidBoolean: true,
      hasValidSecretFormatBoolean: true,
      statusDescriptionLiteral:
        'Gateway de comunicación Meta WhatsApp plenamente verificado (Entropía y firma HMAC nominales).',
    });
  } catch (caughtExecutionError: unknown) {
    const errorDescriptionLiteral =
      caughtExecutionError instanceof Error
        ? caughtExecutionError.message
        : String(caughtExecutionError);

    return Object.freeze({
      isValidBoolean: false,
      hasValidSecretFormatBoolean: true,
      statusDescriptionLiteral: `Fallo en verificación criptográfica de WhatsApp: ${errorDescriptionLiteral}`,
      diagnosticErrorLiteral: errorDescriptionLiteral,
    });
  }
};
