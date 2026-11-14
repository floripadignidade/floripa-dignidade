/**
 * @section Newsletter Gateway Logic - Correlation Identifier Resolver (Atom)
 * @description Átomo encargado de extraer y validar mediante `CorrelationIdentifierSchema`
 * la cabecera entrante `x-floripa-correlation-id` para preservar trazabilidad distribuida
 * entre el cliente y el Edge Runtime, generando un nuevo identificador UUID v4 si está
 * ausente o malformada.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Edge Compatible).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Observabilidad y Seguridad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  type CorrelationIdentifier,
  CorrelationIdentifierSchema,
  GenerateCorrelationIdentifier,
} from '@floripa-dignidade/telemetry';

const CORRELATION_HEADER_NAME_LITERAL = 'x-floripa-correlation-id';

/**
 * Resuelve un identificador de correlación nominal válido a partir de las cabeceras HTTP.
 *
 * @param incomingHeaders - Cabeceras de la solicitud HTTP recibida en el Edge Gateway.
 * @returns {CorrelationIdentifier} Identificador UUID v4 validado y sellado nominalmente.
 */
export const ResolveSubscribeCorrelationIdentifier = (
  incomingHeaders: Headers,
): CorrelationIdentifier => {
  const rawCorrelationHeaderLiteral = incomingHeaders.get(CORRELATION_HEADER_NAME_LITERAL);

  if (!rawCorrelationHeaderLiteral) {
    return GenerateCorrelationIdentifier();
  }

  const validationResult = CorrelationIdentifierSchema.safeParse(
    rawCorrelationHeaderLiteral.trim(),
  );

  return validationResult.success ? validationResult.data : GenerateCorrelationIdentifier();
};
