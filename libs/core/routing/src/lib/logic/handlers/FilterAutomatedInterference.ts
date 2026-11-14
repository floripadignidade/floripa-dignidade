/**
 * @section Routing Sensors - Automated Traffic Perimeter Guard
 * @description Sensor perimetral de Edge Middleware encargado de interceptar y bloquear
 * agentes automatizados de navegador que comprometan la integridad de encuestas,
 * métricas o formularios ciudadanos, emitiendo trazabilidad forense SRE conforme a
 * `TelemetrySignalSchema`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Seguridad y Rendimiento).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { NextResponse } from 'next/server';

import {
  CorrelationIdentifierSchema,
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
} from '@floripa-dignidade/telemetry';

import { DetectAutomatedUserAgent } from '../atomic/DetectAutomatedUserAgent';
import type { IMiddlewareHandler } from './MiddlewareHandler.schema';

const PERIMETER_GUARD_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'ROUTING_AUTOMATED_TRAFFIC_GUARD',
);

const AUTOMATED_BLOCK_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'AUTOMATED_INTERFERENCE_BLOCKED',
);

/**
 * Inspecciona la solicitud entrante mediante `DetectAutomatedUserAgent` y detiene
 * el flujo con HTTP 403 cuando detecta automatización no autorizada.
 *
 * @param incomingRequestSnapshot - Solicitud HTTP capturada en la frontera de red.
 * @param routingContextSnapshot - Contexto de enrutamiento inicializado para la transacción.
 * @returns {Promise<NextResponse | undefined>} Respuesta 403 si es bloqueada o `undefined` para continuar.
 */
export const FilterAutomatedInterference: IMiddlewareHandler = async (
  incomingRequestSnapshot,
  routingContextSnapshot,
) => {
  const rawUserAgentLiteral =
    incomingRequestSnapshot.headers.get('user-agent') ??
    routingContextSnapshot.clientMetadata.userAgentLiteral;

  const detectionResultSnapshot = DetectAutomatedUserAgent({
    userAgentLiteral: rawUserAgentLiteral,
  });

  if (!detectionResultSnapshot.isAutomationDetectedBoolean) {
    return;
  }

  const correlationValidationResult = CorrelationIdentifierSchema.safeParse(
    routingContextSnapshot.correlationIdentifier,
  );
  const correlationIdentifier = correlationValidationResult.success
    ? correlationValidationResult.data
    : GenerateCorrelationIdentifier();

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'CRITICAL',
    moduleIdentifierLiteral: PERIMETER_GUARD_MODULE_IDENTIFIER,
    operationCodeLiteral: AUTOMATED_BLOCK_OPERATION_CODE,
    correlationIdentifier,
    messageContentLiteral: 'Interferencia automatizada bloqueada en la frontera perimetral de red.',
    semanticIntentTag: 'SECURITY_AUTOMATED_TRAFFIC_BLOCKED',
    contextMetadataSnapshot: Object.freeze({
      matchedSignatureLiteral: detectionResultSnapshot.matchedSignatureLiteral,
      userAgentLiteral: detectionResultSnapshot.sanitizedUserAgentLiteral,
      requestPathnameLiteral: incomingRequestSnapshot.nextUrl.pathname,
      httpStatusCodeNumeric: 403,
    }),
  });

  return new NextResponse('AUTOMATED_ACCESS_DENIED', {
    status: 403,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Floripa-Correlation-ID': correlationIdentifier,
      'X-Floripa-Block-Reason': 'AUTOMATED_INTERFERENCE_DETECTED',
    },
  });
};
