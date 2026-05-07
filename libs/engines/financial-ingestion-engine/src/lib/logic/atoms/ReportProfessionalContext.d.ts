/**
 * @section Financial Ingestion - Professional Sentry Sensor
 * @description Átomo encargado de emitir señales de telemetría forense cuando
 * se detecta la ejecución de un profesional vinculado a una categoría de gasto
 * administrativo. Proporciona visibilidad sobre la asignación de recursos humanos.
 *
 * Protocolo OEDP-V17.0 - SRE Visibility & ISO Technical Naming.
 * SANEADO Zenith: Erradicación de abreviaturas y estandarización de señales.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */
import type ExcelJS from 'exceljs';
/**
 * Reporta el rastro forense de un ejecutor humano identificado en la matriz.
 *
 * @param currentRowInstance - Fila física que contiene los datos del profesional.
 * @param activeCategorySpecificationLiteral - Categoría presupuestaria de vínculo.
 * @param correlationIdentifier - Identificador único de trazabilidad de la transacción.
 * @returns {void} Emisión fire-and-forget hacia el sistema nervioso central.
 */
export declare const ReportProfessionalContext: (currentRowInstance: ExcelJS.Row, activeCategorySpecificationLiteral: string, correlationIdentifier: string) => void;
//# sourceMappingURL=ReportProfessionalContext.d.ts.map