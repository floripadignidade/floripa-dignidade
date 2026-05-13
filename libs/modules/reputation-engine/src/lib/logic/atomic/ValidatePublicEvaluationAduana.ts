/**
 * @section Reputation Logic - Public Evaluation Aduana (Atom)
 * @description Átomo encargado exclusivamente de la validación estructural del
 * pulso de evaluación ciudadana. Actúa como el primer sensor de integridad en la
 * frontera del búnker, asegurando que el ADN de entrada cumpla con el estándar ISO.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & High Performance SRE.
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { EmitTelemetrySignal } from '@floripa-dignidade/telemetry';
import { ValidationException } from '@floripa-dignidade/exceptions';
import { PublicEvaluationPulseSchema } from '../../schemas/PublicEvaluationPulse.schema';
import type { IPublicEvaluationPulse } from '../../schemas/PublicEvaluationPulse.schema';

/** Identificador técnico del aparato para el Neural Sentinel. */
const ATOM_IDENTIFIER = 'PUBLIC_EVALUATION_ADUANA_ATOM';

/**
 * Valida la integridad estructural de un pulso de evaluación.
 * Realiza una auditoría forense del payload y emite señales de advertencia si detecta ADN corrupto.
 *
 * @param unvalidatedPayloadSnapshot - Datos crudos capturados por los sensores de la interfaz.
 * @param correlationIdentifier - Identificador único de trazabilidad forense.
 * @returns {IPublicEvaluationPulse} Pulso purificado y tipado nominalmente.
 * @throws {ValidationException} Si el contrato de ADN estructural es violado.
 */
export const ValidatePublicEvaluationAduana = (
  unvalidatedPayloadSnapshot: unknown,
  correlationIdentifier: string
): IPublicEvaluationPulse => {
  const aduanaValidationResult = PublicEvaluationPulseSchema.safeParse(unvalidatedPayloadSnapshot);

  if (!aduanaValidationResult.success) {
    const structuralIssuesCollection = aduanaValidationResult.error.flatten();

    void EmitTelemetrySignal({
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: ATOM_IDENTIFIER,
      operationCodeLiteral: 'EVALUATION_DNA_CORRUPTION',
      correlationIdentifier,
      messageContentLiteral: 'REPUTATION.LOGS.INVALID_PULSE_STRUCTURE',
      contextMetadataSnapshot: {
        issuesCollection: structuralIssuesCollection,
        payloadSnapshot: unvalidatedPayloadSnapshot,
      },
    });

    throw new ValidationException('ADN_DE_EVALUACION_CORRUPTO', {
      structuralIssuesCollection,
    });
  }

  return aduanaValidationResult.data;
};
