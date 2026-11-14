/**
 * @section Health Monitor Contracts - Infrastructure Service Probe Schema (Atom)
 * @description Contrato Zod inmutable para validar el identificador del servicio destino
 * y las opciones configurables de timeout, umbral de latencia degradada, correlación y
 * localización BCP 47 en `MonitorInfrastructureService`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import { DEFAULT_LOCALE_IDENTIFIER, SupportedLocaleSchema } from '@floripa-dignidade/contracts';
import { CorrelationIdentifierSchema } from '@floripa-dignidade/telemetry';

export const DEFAULT_PROBE_TIMEOUT_IN_MILLISECONDS_QUANTITY = 10_000;
export const DEFAULT_DEGRADED_LATENCY_THRESHOLD_IN_MILLISECONDS_QUANTITY = 500;

/**
 * @name ServiceNameIdentifierSchema
 * @description Validador para el identificador técnico normalizado del servicio auditado.
 */
export const ServiceNameIdentifierSchema = z
  .string()
  .trim()
  .min(2, { message: 'TARGET_SERVICE_NAME_TOO_SHORT' })
  .max(100, { message: 'TARGET_SERVICE_NAME_TOO_LONG' })
  .describe('Identificador técnico del servicio externo o interno bajo auditoría.');

/**
 * @name MonitorInfrastructureServiceOptionsSchema
 * @description Opciones extensibles para parametrización de sondas de salud SRE.
 */
export const MonitorInfrastructureServiceOptionsSchema = z
  .object({
    timeoutInMillisecondsQuantity: z
      .number()
      .int()
      .min(500)
      .max(60_000)
      .default(DEFAULT_PROBE_TIMEOUT_IN_MILLISECONDS_QUANTITY)
      .describe('Tiempo límite en milisegundos antes de abortar la sonda como DOWN (HTTP 504).'),
    degradedLatencyThresholdInMillisecondsQuantity: z
      .number()
      .int()
      .min(50)
      .max(30_000)
      .default(DEFAULT_DEGRADED_LATENCY_THRESHOLD_IN_MILLISECONDS_QUANTITY)
      .describe('Umbral en milisegundos a partir del cual una sonda operativa es DEGRADED.'),
    localeIdentifier: SupportedLocaleSchema.default(DEFAULT_LOCALE_IDENTIFIER).describe(
      'Código BCP 47 para mensajes localizados en telemetría.',
    ),
    correlationIdentifier: CorrelationIdentifierSchema.optional().describe(
      'Identificador UUID v4 propagado desde un flujo distribuido superior.',
    ),
  })
  .readonly();

export type IMonitorInfrastructureServiceOptionsInput = z.input<
  typeof MonitorInfrastructureServiceOptionsSchema
>;

export type IMonitorInfrastructureServiceOptions = z.output<
  typeof MonitorInfrastructureServiceOptionsSchema
>;
