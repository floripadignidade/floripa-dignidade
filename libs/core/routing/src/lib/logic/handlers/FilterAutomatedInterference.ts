/**
 * @section Routing Sensors - Anti-Bot Interference Filter
 * @description Sensor de frontera que protege la integridad de las estadísticas
 * y encuestas bloqueando agentes automatizados (Bots).
 *
 * Protocolo OEDP-V16.0 - SRE Resilience & Identity Protection.
 */

import { NextResponse } from 'next/server';
import { EmitTelemetrySignal } from '@floripa-dignidade/telemetry';
import type { IMiddlewareHandler } from './MiddlewareHandler.schema';

/**
 * Analiza la firma del cliente para detectar interferencias no humanas.
 */
export const FilterAutomatedInterference: IMiddlewareHandler = async (
  incomingRequest,
  routingContext,
) => {
  const userAgentLiteral = incomingRequest.headers.get('user-agent') ?? 'NONE';

  /**
   * @section Metodología de Detección (Fase 1)
   * Bloqueo por firmas de librerías de automatización comunes.
   */
  const automatedAgentSignaturesCollection = [
    'HeadlessChrome',
    'Puppeteer',
    'Selenium',
    'Playwright',
    'Cypress',
  ];

  const isAutomationDetectedBoolean = automatedAgentSignaturesCollection.some((signature) =>
    userAgentLiteral.includes(signature),
  );

  if (isAutomationDetectedBoolean) {
    EmitTelemetrySignal({
      severityLevel: 'CRITICAL',
      moduleIdentifier: 'ROUTING_ANTIBOT_SENSOR',
      operationCode: 'AUTOMATED_INTERFERENCE_BLOCKED',
      correlationIdentifier: routingContext.correlationIdentifier,
      message: 'Intento de manipulación automatizada bloqueado en frontera.',
      contextMetadata: { userAgentLiteral },
    });

    /**
     * Cortocircuito: Retornamos una respuesta de bloqueo (403).
     */
    return new NextResponse('AUTOMATED_ACCESS_DENIED', { status: 403 });
  }

  return; // Permite el paso al siguiente sensor.
};
