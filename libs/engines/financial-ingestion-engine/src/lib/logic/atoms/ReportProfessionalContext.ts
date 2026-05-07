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

/* 1. Infraestructura Core (Atmos PascalCase) */
import { EmitTelemetrySignal } from '@floripa-dignidade/telemetry';

/**
 * Reporta el rastro forense de un ejecutor humano identificado en la matriz.
 *
 * @param currentRowInstance - Fila física que contiene los datos del profesional.
 * @param activeCategorySpecificationLiteral - Categoría presupuestaria de vínculo.
 * @param correlationIdentifier - Identificador único de trazabilidad de la transacción.
 * @returns {void} Emisión fire-and-forget hacia el sistema nervioso central.
 */
export const ReportProfessionalContext = (
  currentRowInstance: ExcelJS.Row,
  activeCategorySpecificationLiteral: string,
  correlationIdentifier: string
): void => {
  /**
   * @section Captura de Identidad Ejecutora
   * Según el estándar de la plantilla (Fila de profesionales), el nombre
   * reside en la columna 2.
   */
  const professionalNameLiteral = currentRowInstance.getCell(2).text?.trim() || 'IDENTIDAD_NO_CAPTURADA';

  /**
   * @section Emisión de Señal Telemétrica
   * Utilizamos el nivel DEBUG para no saturar el Ledger de producción, pero
   * permitiendo la auditoría técnica en tiempo real.
   */
  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'DEBUG',
    moduleIdentifierLiteral: 'FINANCIAL_WORKBOOK_SENSOR',
    operationCodeLiteral: 'PROFESSIONAL_VINCULATION_DETECTED',
    correlationIdentifier,
    messageContentLiteral: `Vínculo institucional detectado: El profesional [${professionalNameLiteral}] ha sido asociado a la partida [${activeCategorySpecificationLiteral}].`,

    /**
     * Inyectamos metadatos estructurados para que la IA pueda cruzar
     * esta información con el búnker de identidad.
     */
    contextMetadataSnapshot: {
      professionalNameLiteral,
      targetCategoryLiteral: activeCategorySpecificationLiteral,
      sourceColumnIndexQuantity: 2
    }
  });
};
