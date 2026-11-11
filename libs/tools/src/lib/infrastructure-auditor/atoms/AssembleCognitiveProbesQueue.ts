/**
 * @section Infrastructure Auditor - Cognitive Probes Queue Assembler Atom
 * @description Átomo encargado de evaluar las credenciales de inteligencia artificial
 * configuradas (Google Gemini y Hugging Face Router) y ensamblar la cola elástica de sondas.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { IIndividualProviderAuditSnapshot } from '../schemas/CloudInfrastructureAuditReport.schema';
import { AuditGoogleGeminiCognitiveProbe } from '../probes/AuditGoogleGeminiCognitiveProbe';
import { AuditHuggingFaceCognitiveProbe } from '../probes/AuditHuggingFaceCognitiveProbe';

/**
 * Ensambla dinámicamente las promesas de sondas cognitivas según las credenciales presentes.
 *
 * @param environmentMetadataSnapshot - Metadatos de hardware extraídos de forma segura.
 * @param correlationIdentifier - Identificador de trazabilidad forense.
 * @returns {Array<Promise<IIndividualProviderAuditSnapshot>>} Cola de promesas de sondas de IA.
 */
export const AssembleCognitiveProbesQueue = (
  environmentMetadataSnapshot: Readonly<Record<string, string | undefined>>,
  correlationIdentifier: string,
): Array<Promise<IIndividualProviderAuditSnapshot>> => {
  const isGoogleGeminiConfiguredBoolean =
    !!environmentMetadataSnapshot['GOOGLE_GEMINI_API_KEY'] &&
    environmentMetadataSnapshot['GOOGLE_GEMINI_API_KEY'].trim() !== '';

  const isHuggingFaceConfiguredBoolean =
    !!environmentMetadataSnapshot['HUGGING_FACE_API_TOKEN'] &&
    environmentMetadataSnapshot['HUGGING_FACE_API_TOKEN'].trim() !== '';

  const cognitiveProbesQueueCollection: Array<Promise<IIndividualProviderAuditSnapshot>> = [];

  if (isGoogleGeminiConfiguredBoolean) {
    cognitiveProbesQueueCollection.push(AuditGoogleGeminiCognitiveProbe(correlationIdentifier));
  }

  if (isHuggingFaceConfiguredBoolean) {
    cognitiveProbesQueueCollection.push(AuditHuggingFaceCognitiveProbe(correlationIdentifier));
  }

  if (cognitiveProbesQueueCollection.length === 0) {
    cognitiveProbesQueueCollection.push(AuditGoogleGeminiCognitiveProbe(correlationIdentifier));
  }

  return cognitiveProbesQueueCollection;
};
