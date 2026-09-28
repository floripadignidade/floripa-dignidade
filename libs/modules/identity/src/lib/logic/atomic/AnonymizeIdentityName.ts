/**
 * @section User Management & Identity - Identity Logic Atoms
 * @description Átomo de lógica pura encargado de la transformación de identidades civiles
 * en firmas públicas opacas. Implementa el protocolo de privacidad institucional (Nombre + Inicial),
 * garantizando el cumplimiento de la LGPD y los estándares ISO de transparencia de datos.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Calidad: ISO/IEC 25010 (Modularidad, Privacidad y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime
} from '@floripa-dignidade/telemetry';

import { ValidationException } from '@floripa-dignidade/exceptions';

/* 1. ADN ESTRUCTURAL (Consumo desde SSOT Contracts) */
import { AnonymizeIdentityNameSchema } from '@floripa-dignidade/contracts';
import type { IAnonymizeIdentityNameParameters } from '@floripa-dignidade/contracts';

/** Identificador técnico del aparato para el Health Monitor (IA). */
const ATOM_IDENTIFIER = 'IDENTITY_NAME_ANONYMIZER_ATOM';

/**
 * Procesa un nombre legal completo y lo transforma en una firma pública anonimizada.
 * Ejemplo de transformación: "ANA LUIZA SILVEIRA" -> "ANA S."
 *
 * @param parametersSnapshot - Snapshot de datos validados por el contrato de identidad.
 * @returns {Promise<string>} Firma anonimizada purificada y lista para visualización.
 *
 * @prompt_ia: "Verifica que el algoritmo de división por espacios (split) maneje
 * correctamente múltiples espacios en blanco o caracteres especiales no latinos
 * mediante el uso de regex estandarizado."
 */
export const AnonymizeIdentityName = async (
  parametersSnapshot: IAnonymizeIdentityNameParameters
): Promise<string> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    ATOM_IDENTIFIER,
    'EXECUTE_IDENTITY_NAME_ANONYMIZATION_TRANSACTION',
    correlationIdentifier,
    async () => {

      // 1. INTEGRITY GUARD (Validación contra el Contrato Global)
      const aduanaValidationResult = AnonymizeIdentityNameSchema.safeParse(parametersSnapshot);

      if (!aduanaValidationResult.success) {
        throw new ValidationException('IDENTITY_ANONYMIZATION_CONTRACT_VIOLATION', {
          validationIssuesCollection: aduanaValidationResult.error.flatten(),
          correlationIdentifier
        });
      }

      const { fullLegalNameLiteral, anonymousPlaceholderLiteral } = aduanaValidationResult.data;

      // 2. ALGORITMO DE PRIVACIDAD (ISO Standard Normalization)
      /**
       * Normalizamos a mayúsculas y eliminamos espacios redundantes
       * para asegurar un rastro físico consistente en la UI.
       */
      const sanitizedNameLiteral = fullLegalNameLiteral.toUpperCase().trim();
      const nameSegmentsCollection = sanitizedNameLiteral.split(/\s+/);

      // 3. TRIÁJE DE SEGURIDAD (Empty/Invalid Record Handling)
      if (nameSegmentsCollection.length === 0 || sanitizedNameLiteral === '') {
        return anonymousPlaceholderLiteral;
      }

      const firstNameLiteral = nameSegmentsCollection[0] ?? '';
      let finalAnonymizedResultLiteral = firstNameLiteral;

      // 4. EXTRACCIÓN DE FIRMA (Protocol: First Name + Last Initial)
      if (nameSegmentsCollection.length > 1) {
        const lastSegmentIndexNumeric = nameSegmentsCollection.length - 1;
        const lastNamePartLiteral = nameSegmentsCollection[lastSegmentIndexNumeric] ?? '';
        const lastNameInitialLiteral = lastNamePartLiteral.charAt(0);

        finalAnonymizedResultLiteral = `${firstNameLiteral} ${lastNameInitialLiteral}.`;
      }

      // 5. REPORTE DE SALUD OPERACIONAL (SRE Visibility)
      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: 'INFO',
        moduleIdentifierLiteral: ATOM_IDENTIFIER,
        operationCodeLiteral: 'IDENTITY_NAME_SUCCESSFULLY_ANONYMIZED',
        correlationIdentifier,
        messageContentLiteral: 'Protocolo de privacidad de identidad ejecutado con éxito.',
        semanticIntentTag: 'PII_PROTECTION_ENFORCEMENT',
        contextMetadataSnapshot: {
          resultSnapshotLiteral: finalAnonymizedResultLiteral,
          originalNameLengthQuantity: fullLegalNameLiteral.length,
          segmentsCountQuantity: nameSegmentsCollection.length
        }
      });

      return finalAnonymizedResultLiteral;
    }
  );
};
