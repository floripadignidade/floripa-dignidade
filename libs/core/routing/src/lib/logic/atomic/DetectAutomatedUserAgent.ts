/**
 * @section Routing Logic - Automated User-Agent Detector (Atom)
 * @description Átomo de lógica pura encargado de validar y analizar la cabecera
 * User-Agent en busca de firmas de frameworks de automatización de navegadores,
 * preservando el acceso de rastreadores SEO y previsualizadores sociales legítimos.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Rendimiento y Seguridad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * Longitud máxima de cabecera User-Agent conservada en metadatos telemétricos
 * para prevenir saturación de almacenamiento ante cabeceras artificialmente extensas.
 */
const MAXIMUM_USER_AGENT_LOG_LENGTH_QUANTITY = 256;

/**
 * Catálogo inmutable de firmas de herramientas de automatización en minúsculas.
 * Excluye intencionalmente bots de indexación SEO y previsualización social.
 */
const AUTOMATED_AGENT_SIGNATURES_COLLECTION: readonly string[] = Object.freeze([
  'headlesschrome',
  'puppeteer',
  'selenium',
  'playwright',
  'cypress',
  'phantomjs',
  'webdriver',
]);

/**
 * @name DetectAutomatedUserAgentInputSchema
 * @description Contrato Zod inmutable para normalizar el literal de entrada del agente cliente.
 */
export const DetectAutomatedUserAgentInputSchema = z
  .object({
    userAgentLiteral: z.string().optional().default(''),
  })
  .readonly();

export type IDetectAutomatedUserAgentInput = z.input<typeof DetectAutomatedUserAgentInputSchema>;

/**
 * @interface IAutomatedAgentDetectionResult
 * @description Veredicto inmutable emitido por el detector de automatización perimetral.
 */
export interface IAutomatedAgentDetectionResult {
  readonly isAutomationDetectedBoolean: boolean;
  readonly matchedSignatureLiteral: string | null;
  readonly sanitizedUserAgentLiteral: string;
}

/**
 * Evalúa de forma determinista y sin distinción de mayúsculas si una cadena
 * User-Agent corresponde a un agente automatizado de navegador.
 *
 * @param inputSnapshot - Snapshot con el valor crudo de la cabecera `user-agent`.
 * @returns {IAutomatedAgentDetectionResult} Resultado sellado con firma coincidente y literal saneado.
 */
export const DetectAutomatedUserAgent = (
  inputSnapshot: IDetectAutomatedUserAgentInput,
): IAutomatedAgentDetectionResult => {
  const { userAgentLiteral } = DetectAutomatedUserAgentInputSchema.parse(inputSnapshot);
  const trimmedUserAgentLiteral = userAgentLiteral.trim();
  const sanitizedUserAgentLiteral =
    trimmedUserAgentLiteral.slice(0, MAXIMUM_USER_AGENT_LOG_LENGTH_QUANTITY) || 'NONE';

  if (trimmedUserAgentLiteral.length === 0) {
    return Object.freeze({
      isAutomationDetectedBoolean: false,
      matchedSignatureLiteral: null,
      sanitizedUserAgentLiteral,
    });
  }

  const normalizedUserAgentLowerLiteral = trimmedUserAgentLiteral.toLowerCase();
  const matchedSignatureLiteral =
    AUTOMATED_AGENT_SIGNATURES_COLLECTION.find((signatureLiteral) =>
      normalizedUserAgentLowerLiteral.includes(signatureLiteral),
    ) ?? null;

  const isAutomationDetectedBoolean = matchedSignatureLiteral !== null;

  return Object.freeze({
    isAutomationDetectedBoolean,
    matchedSignatureLiteral,
    sanitizedUserAgentLiteral,
  });
};
