/**
 * @section Telemetry Logic - Forensic Identity Generator
 * @description Átomo de lógica pura encargado de la creación de identificadores
 * únicos universales (UUID v4). Actúa como la semilla de la "Traza de Sangre
 * Digital", permitiendo correlacionar eventos a través de búnkeres distribuidos.
 *
 * Protocolo OEDP-V17.0 - ISO Technical Naming & Branded Type Integrity.
 * Vision: Deterministic Traceability across the Cloud-Sovereign Swarm.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { CorrelationIdentifier } from '../../schemas/TelemetrySignal.schema';

/**
 * Genera un identificador de correlación determinista y criptográficamente
 * seguro utilizando el hardware disponible en el runtime (Web Crypto API).
 *
 * Implementa el estándar RFC 4122 para garantizar la unicidad de la traza
 * en arquitecturas de microservicios y Edge Computing.
 *
 * @returns {CorrelationIdentifier} Identificador UUID v4 sellado nominalmente.
 */
export const GenerateCorrelationIdentifier = (): CorrelationIdentifier => {
  /**
   * @section Generación de Identidad Técnica
   * SANEADO Zenith: Acceso directo a 'globalThis.crypto' para asegurar la
   * resolución isomórfica en entornos donde el objeto global 'crypto'
   * pueda estar sombreado o requiera referencia explícita.
   */
  const cryptoProviderReference = globalThis.crypto;

  const newCorrelationIdentifierLiteral = cryptoProviderReference.randomUUID();

  /**
   * 🛡️ SANEADO Zenith: Sellado de Marca (Branded Casting).
   * Elevamos el primitivo 'string' al tipo soberano 'CorrelationIdentifier'.
   * Este sello impide la polución de tipos en el sistema nervioso central.
   */
  return newCorrelationIdentifierLiteral as CorrelationIdentifier;
};
