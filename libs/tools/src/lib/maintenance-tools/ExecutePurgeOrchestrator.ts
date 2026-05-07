/**
 * @section Tools Logic - Purge Interaction Orchestrator
 * @description Orquestador encargado de la comunicación con el operador humano
 * y el disparo del motor de limpieza recursiva.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & ISO Technical Naming.
 */

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import * as readlinePromises from 'node:readline/promises';
import { stdin as standardInputReference, stdout as standardOutputReference } from 'node:process';

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { ExecuteRecursiveEmissionsPurge } from './ExecuteRecursiveEmissionsPurge';

/** Identificador técnico del aparato para el Neural Sentinel. */
const ORCHESTRATOR_IDENTIFIER = 'MAINTENANCE_PURGE_ORCHESTRATOR';

/**
 * Ejecuta el flujo interactivo de purga de artefactos.
 */
export const ExecutePurgeOrchestrator = async (): Promise<void> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();
  const cliInterface = readlinePromises.createInterface({
    input: standardInputReference,
    output: standardOutputReference
  });

  return await TraceExecutionTime(
    ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_INTERACTIVE_PURGE_SESSION',
    correlationIdentifier,
    async () => {
      try {
        console.warn('\n--- [ZENITH SENTRY]: LIMPIADOR DE EMISIONES SOBERANO ---');

        const rawDirectoryPathInputLiteral = await cliInterface.question(
          '\n📂 Ingrese la ruta absoluta o relativa a purificar: '
        );

        const targetAbsolutePathLiteral = resolve(process.cwd(), rawDirectoryPathInputLiteral.trim());

        if (!existsSync(targetAbsolutePathLiteral)) {
          console.error(`\n❌ ERROR_I/O: La jurisdicción física no existe: [${targetAbsolutePathLiteral}]`);
          return;
        }

        console.warn(`\n⚠️ Se procederá a la purga de rastro técnico en: ${targetAbsolutePathLiteral}`);
        const confirmationLiteral = await cliInterface.question('¿Confirmar acción de borrado inalterable? (s/n): ');

        if (confirmationLiteral.toLowerCase() !== 's') {
          console.warn('\n🚫 Operación abortada por el auditor humano.\n');
          return;
        }

        // DISPARO DEL ÁTOMO DE LIMPIEZA
        await ExecuteRecursiveEmissionsPurge(targetAbsolutePathLiteral, correlationIdentifier);

        console.warn('\n✅ LIMPIEZA COMPLETADA: El código fuente está ahora puro.\n');

        void EmitTelemetrySignal({
          severityLevel: 'INFO',
          moduleIdentifier: ORCHESTRATOR_IDENTIFIER,
          operationCode: 'PURGE_SESSION_FINISHED',
          correlationIdentifier,
          message: 'Sesión de limpieza de rastro técnico finalizada con éxito.'
        });

      } finally {
        cliInterface.close();
      }
    }
  );
};
