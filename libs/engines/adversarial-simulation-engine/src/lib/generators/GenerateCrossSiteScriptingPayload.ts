/**
 * @section Adversarial Generators - Cross-Site Scripting (XSS)
 * @description Átomo encargado de ensamblar vectores XSS. Orientado a probar
 * la resiliencia del Lexical Editor (CMS) y el renderizado SSR de Next.js 16.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Next-Gen Exploitation.
 * @author Raz Podestá - MetaShark Tech
 */

import type { IAdversarialPayload } from './schemas/AdversarialPayload.schema';

/**
 * Genera vectores de ataque diseñados para inyectar scripts maliciosos.
 * Evalúa las aduanas de sanitización visual y dominios de hidratación React.
 *
 * @returns {IAdversarialPayload[]} Colección de armas XSS estructuradas.
 */
export const GenerateCrossSiteScriptingPayload = (): IAdversarialPayload[] => {
  return [
    {
      payloadIdentifier: crypto.randomUUID(),
      maliciousPayloadContentSnapshot: "<script>alert('SovereignBypass')</script>",
      attackTechniqueDescriptionLiteral:
        'Inyección de script directa. Debería ser atrapada por Zod o escapada por React.',
      intrinsicThreatSeverityLevel: 'HIGH_RISK',
    },
    {
      payloadIdentifier: crypto.randomUUID(),
      maliciousPayloadContentSnapshot: "<img src='x' onerror='alert(\"XSS\")'>",
      attackTechniqueDescriptionLiteral:
        'Evasión de limpieza de etiquetas script mediante atributos de eventos (Event Handlers).',
      intrinsicThreatSeverityLevel: 'HIGH_RISK',
    },
    {
      payloadIdentifier: crypto.randomUUID(),
      maliciousPayloadContentSnapshot: 'javascript:eval(\'alert("XSS")\')',
      attackTechniqueDescriptionLiteral:
        'Abuso de protocolo URI. Altamente efectivo si Zod.string().url() no filtra el protocolo javascript:.',
      intrinsicThreatSeverityLevel: 'CRITICAL_COLLAPSE',
    },
    {
      /**
       * @section Vector de Evasión Hexadecimal
       * Evalúa si las aduanas purifican entradas codificadas antes del guardado.
       */
      payloadIdentifier: crypto.randomUUID(),
      maliciousPayloadContentSnapshot: "%3Cscript%3Ealert('XSS')%3C%2Fscript%3E",
      attackTechniqueDescriptionLiteral:
        'Evasión de filtros básicos WAF mediante URL Encoding (Hexadecimal).',
      intrinsicThreatSeverityLevel: 'MODERATE_FLAW',
    },
  ];
};
