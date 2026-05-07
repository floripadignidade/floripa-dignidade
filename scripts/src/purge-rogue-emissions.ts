/**
 * @section Scripts - Rogue Emissions Purge Trigger
 * @description Punto de entrada CLI para la limpieza de artefactos de compilacion
 * huerfanos. Delega la logica en el bunker de herramientas para cumplir con
 * los Module Boundaries (ADR 0003).
 *
 * Protocolo OEDP-V17.0 - Trigger Pattern & High Performance SRE.
 * SANEADO Zenith: Erradicacion de logica sincrona y cumplimiento de Prosa ISO.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ExecutePurgeOrchestrator } from '@floripa-dignidade/tools';

/**
 * Inicia la secuencia de limpieza institucional.
 * Implementa captura de colapsos para asegurar un rastro forense en el proceso.
 */
const executeTriggerAction = async (): Promise<void> => {
  try {
    await ExecutePurgeOrchestrator();
    process.exit(0);
  } catch (caughtError: unknown) {
    const errorDescriptionLiteral = caughtError instanceof Error
      ? caughtError.message
      : String(caughtError);

    console.error(`[FATAL_CLI_ERROR]: Purga de emisiones interrumpida. Rastro: ${errorDescriptionLiteral}`);
    process.exit(1);
  }
};

/** 🛡️ SANEADO: Cumplimiento de no-floating-promises */
void executeTriggerAction();
