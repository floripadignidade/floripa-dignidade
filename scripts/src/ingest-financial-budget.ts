/**
 * @section Scripts - Financial Budget Ingestion Trigger
 * @description Punto de entrada CLI para la ingesta de presupuestos institucionales.
 * Delega la orquestación a la librería de herramientas para cumplir con Module Boundaries.
 *
 * Protocolo OEDP-V17.0 - Trigger Pattern & High Performance SRE.
 * SANEADO Zenith: Erradicación de lógica de negocio en scripts y cumplimiento de promesas.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ExecuteFinancialIngestionOrchestrator } from '@floripa-dignidade/tools';

/**
 * Inicia el proceso de ingesta delegando en el búnker de herramientas.
 * Implementa captura de colapsos para asegurar un código de salida (exit code) correcto.
 */
const executeTriggerAction = async (): Promise<void> => {
  try {
    await ExecuteFinancialIngestionOrchestrator();
    process.exit(0);
  } catch (caughtError: unknown) {
    /**
     * El error ya ha sido reportado por telemetría dentro del orquestador.
     * Aquí solo aseguramos el cierre del proceso con señal de fallo.
     */
    const errorDescriptionLiteral = caughtError instanceof Error
      ? caughtError.message
      : String(caughtError);

    console.error(`[FATAL_CLI_ERROR]: Ingesta interrumpida. Rastro: ${errorDescriptionLiteral}`);
    process.exit(1);
  }
};

/** 🛡️ SANEADO: Cumplimiento de no-floating-promises */
void executeTriggerAction();
