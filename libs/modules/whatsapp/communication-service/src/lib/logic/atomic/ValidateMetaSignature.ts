/**
 * @section WhatsApp Logic - Meta Cryptographic Validator
 * @description Valida la autenticidad de los paquetes entrantes mediante el
 * algoritmo SHA256 HMAC provisto por Meta. Implementa comparación de tiempo
 * constante (timingSafeEqual) para prevenir ataques de temporización.
 *
 * Protocolo OEDP-V17.0 - Security First & Functional Atomicity.
 * SANEADO Zenith: Resolución de Paradoja Asíncrona (await) e inyección de TraceExecutionTime.
 *
 * @author Raz Podestá - MetaShark Tech
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import { ValidateEnvironmentAduana } from '@floripa-dignidade/environment-validator';
import { ValidationException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 1. ADN Estructural (Internal Contract) */
import { ValidateMetaSignatureSchema } from './schemas/ValidateMetaSignature.schema';
import type { IValidateMetaSignatureParameters } from './schemas/ValidateMetaSignature.schema';

/** Identificador técnico del aparato para el Neural Sentinel. */
const SECURITY_ATOM_IDENTIFIER = 'WHATSAPP_SECURITY_ADUANA';

/**
 * Compara la firma recibida con la firma calculada utilizando el secreto soberano.
 *
 * @param parameters - Objeto conteniendo el cuerpo de la petición y la firma de Meta.
 * @returns {Promise<boolean>} Verdadero si la identidad de Meta es legítima y comprobada.
 * @throws {ValidationException} Si los parámetros de entrada violan el contrato Zod.
 */
export const ValidateMetaSignature = async (
  parameters: IValidateMetaSignatureParameters,
): Promise<boolean> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    SECURITY_ATOM_IDENTIFIER,
    'EXECUTE_META_SIGNATURE_VALIDATION',
    correlationIdentifier,
    async () => {
      /**
       * 1. CAPTURA DE INFRAESTRUCTURA (Sovereign Secret Capture)
       * 🛡️ SANEADO Zenith: El secreto se recupera de manera asíncrona a través de la aduana
       * validada en el arranque, garantizando que el token sea un Branded Type.
       */
      const { WHATSAPP_APP_SECRET } = await ValidateEnvironmentAduana();

      // 2. ADUANA DE ADN (Input Validation)
      const validationResult = ValidateMetaSignatureSchema.safeParse(parameters);

      if (!validationResult.success) {
        throw new ValidationException('CONTRATO_DE_FIRMA_WHATSAPP_VIOLADO', {
          issuesCollection: validationResult.error.flatten(),
        });
      }

      const { rawRequestBodyLiteral, xHubSignatureHeaderLiteral } = validationResult.data;

      try {
        /**
         * 3. NORMALIZACIÓN DE FIRMA (Protocol Cleaning)
         * Meta envía la firma con el prefijo "sha256=".
         */
        const signaturePrefixLiteral = 'sha256=';
        const receivedHashLiteral = xHubSignatureHeaderLiteral.replace(signaturePrefixLiteral, '');

        /**
         * 4. CÁLCULO DE FIRMA LOCAL (HMAC SHA256)
         */
        const calculatedHashLiteral = createHmac('sha256', WHATSAPP_APP_SECRET)
          .update(rawRequestBodyLiteral)
          .digest('hex');

        /**
         * 5. COMPARACIÓN SEGURA (Constant-time Comparison)
         * Protege contra ataques de análisis de tiempo de respuesta (Timing Attacks).
         */
        const isIdentityMatchBoolean = timingSafeEqual(
          Buffer.from(receivedHashLiteral, 'hex'),
          Buffer.from(calculatedHashLiteral, 'hex'),
        );

        // 6. REPORTE DE TELEMETRÍA DE ALTA PRIORIDAD
        if (!isIdentityMatchBoolean) {
          void EmitTelemetrySignal({
            severityLevel: 'CRITICAL',
            moduleIdentifier: SECURITY_ATOM_IDENTIFIER,
            operationCode: 'META_SIGNATURE_MISMATCH_DETECTED',
            correlationIdentifier,
            message: 'ALERTA DE SEGURIDAD: Intento de suplantación de Webhook de Meta.',
            contextMetadata: { threatLevel: 'HIGH' },
          });
        }

        return isIdentityMatchBoolean;
      } catch (caughtError: unknown) {
        const errorDescriptionLiteral =
          caughtError instanceof Error ? caughtError.message : String(caughtError);

        void EmitTelemetrySignal({
          severityLevel: 'ERROR',
          moduleIdentifier: SECURITY_ATOM_IDENTIFIER,
          operationCode: 'SIGNATURE_VERIFICATION_FAULT',
          correlationIdentifier,
          message: 'Fallo técnico al verificar la integridad criptográfica.',
          contextMetadata: { errorTrace: errorDescriptionLiteral },
        });

        return false;
      }
    },
  );
};
