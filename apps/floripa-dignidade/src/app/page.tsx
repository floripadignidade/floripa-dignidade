/**
 * @section Application Infrastructure - Root Entry Orchestrator
 * @description Punto de entrada absoluto del portal. Detecta la soberanía
 * lingüística del hardware del ciudadano mediante el análisis de cabeceras,
 * emite el rastro de vida inicial y ejecuta la redirección hacia el búnker
 * localizado correspondiente.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & ISO Technical Naming.
 * SANEADO Zenith: Resolución de TS7016 mediante Sello de Contención, inyección
 * de telemetría de ruteo inicial y cumplimiento de Prosa ISO 11179.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * 🛡️ LEY DE SOBERANÍA (Fix TS7016):
 * SELLO DE CONTENCIÓN: Suprimimos la alerta del compilador para los módulos de Next.js.
 * La integridad de la firma está garantizada por el Santuario de Tipos global.
 */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

/* 1. Infraestructura Core & Routing (Sovereign Swarm - Clean Paths) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
} from '@floripa-dignidade/telemetry';

import { DetermineDeviceLocale } from '@floripa-dignidade/routing';

/** Identificador técnico del aparato para el Neural Sentinel. */
const ORCHESTRATOR_IDENTIFIER = 'ROOT_ENTRY_REDIRECTION_ORCHESTRATOR';

/**
 * Orquestador encargado de la distribución inicial de ciudadanos.
 * Implementa el patrón "Locale Sentry": garantiza que nadie acceda a la raíz sin idioma.
 *
 * @returns {Promise<void>} Ejecuta una redirección 307 (Temporal) hacia el locale detectado.
 */
export default async function RootPage(): Promise<void> {
  /**
   * Generamos la "Traza de Sangre Digital" inicial. Este identificador vinculará
   * la redirección con la primera carga de la Frontpage localizada.
   */
  const correlationIdentifier = GenerateCorrelationIdentifier();

  // 1. CAPTURA DE METADATOS DE HARDWARE (Headers Ingestion)
  const requestHeadersSnapshot = await headers();
  const acceptLanguageHeaderLiteral = requestHeadersSnapshot.get('accept-language');

  // 2. INFERENCIA DE SOBERANÍA LINGÜÍSTICA (Routing Engine)
  const detectedLocaleIdentifier = DetermineDeviceLocale(acceptLanguageHeaderLiteral);

  // 3. REPORTE DE PRIMER IMPACTO (SRE Visibility)
  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'INFO',
    moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
    operationCodeLiteral: 'INITIAL_LOCALE_REDIRECTION_TRIGGERED',
    correlationIdentifier,
    messageContentLiteral: `Tráfico inicial capturado. Redirigiendo ciudadano al búnker: [/${detectedLocaleIdentifier}]`,
    semanticIntentTag: 'LOCALE_REDIRECTION_START',
    contextMetadataSnapshot: {
      detectedLocaleLiteral: detectedLocaleIdentifier,
      hasAcceptLanguageHeaderBoolean: !!acceptLanguageHeaderLiteral,
    },
  });

  /**
   * 4. REDIRECCIÓN SOBERANA
   * Se utiliza una redirección temporal para permitir que el motor de búsqueda
   * y el ciudadano puedan cambiar de preferencia lingüística en el futuro.
   */
  redirect(`/${detectedLocaleIdentifier}`);
}
