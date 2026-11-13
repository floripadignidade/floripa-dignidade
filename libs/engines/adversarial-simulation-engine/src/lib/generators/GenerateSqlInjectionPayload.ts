/**
 * @section Adversarial Generators - SQL Injection (SQLi)
 * @description Átomo de lógica pura que genera vectores de inyección SQL
 * orientados a romper consultas mal parametrizadas o puentes PostgREST (Supabase).
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Security Fuzzing.
 * Vision: Zero-Trust Database Input.
 *
 * @author Raz Podestá - MetaShark Tech
 */

import type { IAdversarialPayload } from './schemas/AdversarialPayload.schema';

/**
 * Genera una colección determinista de vectores de ataque SQLi.
 *
 * @returns {IAdversarialPayload[]} Colección de armas de inyección estructuradas.
 */
export const GenerateSqlInjectionPayload = (): IAdversarialPayload[] => {
  return [
    {
      payloadIdentifier: crypto.randomUUID(),
      maliciousPayloadContentSnapshot: "' OR 1=1 --",
      attackTechniqueDescriptionLiteral:
        'Tautología clásica para bypass de autenticación o extracción masiva de filas.',
      intrinsicThreatSeverityLevel: 'CRITICAL_COLLAPSE',
    },
    {
      payloadIdentifier: crypto.randomUUID(),
      maliciousPayloadContentSnapshot: "admin' /*",
      attackTechniqueDescriptionLiteral:
        'Evasión de filtros mediante comentarios en línea (Inline Comments).',
      intrinsicThreatSeverityLevel: 'HIGH_RISK',
    },
    {
      payloadIdentifier: crypto.randomUUID(),
      maliciousPayloadContentSnapshot: "'; EXEC pg_sleep(5); --",
      attackTechniqueDescriptionLiteral:
        'Inyección basada en tiempo (Blind SQLi). Si el sistema demora 5s, es vulnerable.',
      intrinsicThreatSeverityLevel: 'CRITICAL_COLLAPSE',
    },
    {
      /**
       * @section Vector Específico Supabase (PostgREST JSONB)
       * Apunta a vulnerabilidades en el manejo de operadores JSON de Postgres.
       */
      payloadIdentifier: crypto.randomUUID(),
      maliciousPayloadContentSnapshot: '{"role": "admin", "id": "1"}',
      attackTechniqueDescriptionLiteral:
        'Intento de envenenamiento de JSONB (Parameter Pollution) en endpoints REST.',
      intrinsicThreatSeverityLevel: 'HIGH_RISK',
    },
  ];
};
