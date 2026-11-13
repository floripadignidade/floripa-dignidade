/**
 * @section Application Infrastructure - Root Not Found Orchestrator
 * @description Captura colapsos de ruta (404) fuera de los dominios localizados.
 * Orquesta la inferencia de idioma del dispositivo, emite señales de rastro
 * forense al Neural Sentinel y redirige al ciudadano hacia su zona soberana.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Forensic Visibility.
 * SANEADO Zenith: Erradicación de triple-slash reference (ESLint Fix), resolución
 * de TS2534 (Retorno de flujo) e inyección de telemetría de navegación.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * 🛡️ LEY DE SOBERANÍA (Fix TS7016):
 * Suprimimos la alerta del compilador para los módulos de Next.js mediante el
 * estilo de importación estándar. La integridad está garantizada por el
 * Santuario de Tipos nivelado en el tsconfig.app.json.
 */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

/* 1. Infraestructura Core & Routing (Sovereign Swarm - Clean Paths) */
import { EmitTelemetrySignal, GenerateCorrelationIdentifier } from '@floripa-dignidade/telemetry';

import { DetermineDeviceLocale } from '@floripa-dignidade/routing';

/** Identificador técnico del aparato para el Neural Sentinel. */
const SENTRY_IDENTIFIER = 'ROOT_NOT_FOUND_SENTRY';

/**
 * Componente de servidor encargado de la recuperación de tráfico huérfano.
 * Implementa el patrón "Resilient Redirection": nadie se queda sin contenido.
 *
 * 🛡️ SANEADO Zenith (Fix TS2534): Se transiciona el retorno a 'void' ya que
 * la función redirect() de Next.js interrumpe físicamente la ejecución.
 *
 * @returns {Promise<void>} Ejecuta una redirección absoluta hacia el locale detectado.
 */
export default async function RootNotFound(): Promise<void> {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  // 1. CAPTURA DE METADATOS DE HARDWARE (Headers Ingestion)
  const requestHeaders = await headers();
  const acceptLanguageHeaderLiteral = requestHeaders.get('accept-language');

  // 2. INFERENCIA DE SOBERANÍA LINGÜÍSTICA
  const detectedLocaleIdentifier = DetermineDeviceLocale(acceptLanguageHeaderLiteral);

  // 3. REPORTE DE ANOMALÍA DE NAVEGACIÓN (Audit Trail)
  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'WARNING',
    moduleIdentifierLiteral: SENTRY_IDENTIFIER,
    operationCodeLiteral: 'ORPHAN_ROUTE_INTERCEPTED',
    correlationIdentifier,
    messageContentLiteral: `Ruta inexistente detectada. Redirigiendo ciudadano a: [/${detectedLocaleIdentifier}]`,
    semanticIntentTag: 'UI_NAVIGATION_RECOVERY',
    contextMetadataSnapshot: {
      detectedLocaleLiteral: detectedLocaleIdentifier,
      userAgentLiteral: requestHeaders.get('user-agent') ?? 'UNKNOWN',
    },
  });

  /**
   * 4. REDIRECCIÓN SOBERANA
   * Se utiliza el prefijo detectado para garantizar que el ciudadano reciba
   * la interfaz en su idioma preferido inmediatamente.
   */
  redirect(`/${detectedLocaleIdentifier}`);
}
