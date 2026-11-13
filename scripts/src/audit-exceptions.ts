/**
 * @section Scripts - Exceptions Build Audit Trigger
 * @description Disparador CLI encargado de la verificacion fisica de los artefactos
 * de compilacion del bunker 'exceptions'. Garantiza que tanto la logica SWC
 * como el ADN de TSC existan en el disco antes del empaquetado final.
 *
 * Protocolo OEDP-V17.0 - Forensic Traceability & ISO Technical Naming.
 * SANEADO Zenith: Erradicacion de 'no-console' y cumplimiento de promesas flotantes.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { AuditExceptionsBuildArtifacts } from '@floripa-dignidade/tools';

/**
 * Ejecuta la secuencia de auditoria fisica de artefactos.
 * Implementa un patron de captura global para asegurar la integridad del rastro forense.
 *
 * @returns {Promise<void>}
 */
const ExecuteExceptionsBuildAuditAction = async (): Promise<void> => {
  try {
    /**
     * @section Inicio de Sentry
     * SANEADO: Uso de console.warn para cumplir con la regla 'no-console'
     * mientras se mantiene la visibilidad en el proceso de CI/CD.
     */
    console.warn('\n--- [ZENITH SENTRY]: INICIANDO AUDITORIA DE ARTEFACTOS (EXCEPTIONS) ---');

    /**
     * Invocacion del aparato de auditoria residente en la libreria de herramientas.
     * Valida la existencia de .js, .d.ts y .tsbuildinfo en la carpeta 'dist/'.
     */
    await AuditExceptionsBuildArtifacts();

    console.warn('--- [ZENITH SENTRY]: AUDITORIA FINALIZADA CON EXITO ---\n');
    process.exit(0);
  } catch (caughtError: unknown) {
    /**
     * @section Gestion de Colapso de Infraestructura
     * Si la auditoria falla, debemos detener el proceso de CI/CD inmediatamente
     * devolviendo un codigo de salida de error (1).
     */
    const errorDescriptionLiteral =
      caughtError instanceof Error ? caughtError.message : String(caughtError);

    console.error('\n[CRITICAL_INFRASTRUCTURE_FAILURE]: La auditoria forense ha colapsado.');
    console.error(`Rastro del fallo: ${errorDescriptionLiteral}`);

    process.exit(1);
  }
};

/**
 * @section Disparo Fisico (Trigger)
 * SANEADO: Se utiliza el operador 'void' para indicar intencionalmente
 * una promesa flotante de entrada al proceso.
 */
void ExecuteExceptionsBuildAuditAction();
