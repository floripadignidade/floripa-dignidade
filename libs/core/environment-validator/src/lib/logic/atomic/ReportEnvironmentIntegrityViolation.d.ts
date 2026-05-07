/**
 * @section Environment Logic - Integrity Violation Reporter
 * @description Átomo encargado de procesar fallos de esquema en el entorno.
 * Realiza el triaje de variables comprometidas, emite señales forenses
 * y dispara el bloqueo de seguridad del sistema.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Forensic Visibility.
 * SANEADO Zenith: Resolución de error de Lint (consistent-type-imports).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */
import type { ZodError } from 'zod';
/**
 * Procesa un error de validación de entorno y aborta la ejecución.
 *
 * @param zodErrorReference - Instancia del error de esquema capturado.
 * @param correlationIdentifier - ID de trazabilidad del hilo.
 * @throws {InternalSystemException} Bloqueo mandatorio de seguridad.
 */
export declare const ReportEnvironmentIntegrityViolation: (zodErrorReference: ZodError, correlationIdentifier: string) => never;
//# sourceMappingURL=ReportEnvironmentIntegrityViolation.d.ts.map