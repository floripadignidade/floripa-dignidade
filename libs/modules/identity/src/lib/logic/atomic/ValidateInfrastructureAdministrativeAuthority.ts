/**
 * @section User Management & Identity - Identity Logic Atoms
 * @description Aparato de seguridad encargado de validar la activación de privilegios
 * de auditoría total basados en secretos de infraestructura. Implementa comparación
 * de tiempo constante (Constant-time) para erradicar ataques de temporización.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Calidad: ISO/IEC 25010 (Seguridad y Resiliencia).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

/* 1. INFRAESTRUCTURA CORE Y GUARDIANES */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime
} from '@floripa-dignidade/telemetry';

import { ValidateEnvironmentAduana } from '@floripa-dignidade/environment-validator';
import { ValidationException } from '@floripa-dignidade/exceptions';

/* 2. ADN ESTRUCTURAL (Consumo desde SSOT Contracts) */
import {
  ValidateAdministrativeAuthoritySchema
} from '@floripa-dignidade/contracts';

import type {
  IValidateAdministrativeAuthorityParameters
} from '@floripa-dignidade/contracts';

/** Identificador técnico del aparato para el Health Monitor (IA). */
const SECURITY_GUARD_IDENTIFIER = 'INFRASTRUCTURE_ADMIN_GATEKEEPER';

/**
 * Evalúa si el desafío de autoridad administrativa es legítimo mediante simetría criptográfica.
 * Realiza una comparación blindada contra el secreto institucional de infraestructura.
 *
 * @param parametersSnapshot - Snapshot conteniendo el token de seguridad suministrado.
 * @returns {Promise<boolean>} Verdadero si la firma coincide exactamente con el secreto.
 *
 * @prompt_ia: "Verifica que el uso de 'timingSafeEqual' se realice sobre búferes de
 * longitud idéntica (normalizados vía HMAC) para evitar fugas de información."
 */
export const ValidateInfrastructureAdministrativeAuthority = async (
  parametersSnapshot: IValidateAdministrativeAuthorityParameters
): Promise<boolean> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    SECURITY_GUARD_IDENTIFIER,
    'EXECUTE_ADMIN_CHALLENGE_VALIDATION',
    correlationIdentifier,
    async () => {

      // 1. INTEGRITY GUARD (Validación del ADN de entrada)
      const validationResult = ValidateAdministrativeAuthoritySchema.safeParse(parametersSnapshot);

      if (!validationResult.success) {
        throw new ValidationException('ADMIN_SECURITY_TOKEN_MALFORMED', {
          validationIssuesCollection: validationResult.error.flatten(),
          correlationIdentifier
        });
      }

      // 2. CAPTURA DE INFRAESTRUCTURA (Hardware Secrets)
      /** 🛡️ LEY ZENITH: Resolución asíncrona de secretos validados por la aduana de entorno. */
      const infrastructureSecretsSnapshot = await ValidateEnvironmentAduana();

      const {
        PAYLOAD_SECRET: cryptographicSaltSecret,
        SOVEREIGN_EMERGENCY_TOKEN: administrativeMasterTokenSecret
      } = infrastructureSecretsSnapshot;

      try {
        /**
         * 3. NORMALIZACIÓN CRIPTOGRÁFICA (HMAC SHA-256)
         * Generamos firmas digitales para asegurar que ambos operandos de la comparación
         * posean la misma longitud física antes de entrar al comparador de tiempo constante.
         */
        const challengeHashBuffer = createHmac('sha256', cryptographicSaltSecret)
          .update(validationResult.data.administrativeSecurityTokenLiteral)
          .digest();

        const expectedHashBuffer = createHmac('sha256', cryptographicSaltSecret)
          .update(administrativeMasterTokenSecret)
          .digest();

        // 4. COMPARACIÓN SEGURA (Constant-time Hardware Comparison)
        const isIdentityLegitimateBoolean = timingSafeEqual(challengeHashBuffer, expectedHashBuffer);

        // 5. REPORTE SRE DE ALTA PRIORIDAD (Visibility)
        if (!isIdentityLegitimateBoolean) {
          void EmitTelemetrySignal({
            severityLevelLiteral: 'CRITICAL',
            moduleIdentifierLiteral: SECURITY_GUARD_IDENTIFIER,
            operationCodeLiteral: 'ADMIN_BYPASS_ATTEMPT_REJECTED',
            correlationIdentifier,
            messageContentLiteral: 'ALERTA: Intento fallido de activación de autoridad administrativa.',
            semanticIntentTag: 'SECURITY_THREAT_DETECTION',
            contextMetadataSnapshot: { threatLevelLiteral: 'HIGH_ALERT' }
          });
        } else {
          void EmitTelemetrySignal({
            severityLevelLiteral: 'WARNING',
            moduleIdentifierLiteral: SECURITY_GUARD_IDENTIFIER,
            operationCodeLiteral: 'ADMIN_AUTHORITY_ACTIVATED',
            correlationIdentifier,
            messageContentLiteral: 'Autoridad administrativa de infraestructura activada exitosamente.',
            semanticIntentTag: 'PRIVILEGE_ESCALATION_EVENT'
          });
        }

        return isIdentityLegitimateBoolean;

      } catch (caughtError: unknown) {
        const errorDescriptionLiteral = caughtError instanceof Error
          ? caughtError.message
          : String(caughtError);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'ERROR',
          moduleIdentifierLiteral: SECURITY_GUARD_IDENTIFIER,
          operationCodeLiteral: 'CRYPTOGRAPHIC_PROCESS_FAULT',
          correlationIdentifier,
          messageContentLiteral: 'Fallo técnico durante el proceso de verificación criptográfica.',
          contextMetadataSnapshot: { errorTraceLiteral: errorDescriptionLiteral }
        });

        return false;
      }
    }
  );
};
