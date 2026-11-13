/**
 * @section Financial Ingestion - Professional Sentry Sensor
 * @description Átomo encargado de emitir señales de telemetría forense cuando
 * se detecta la ejecución de un profesional vinculado a una categoría de gasto.
 * Permite auditar la asignación de capital humano en la matriz financiera.
 *
 * Protocolo OEDP-V17.0 - SRE Visibility & ISO Technical Naming.
 * SANEADO Zenith: Resolución de TS2503 (Namespace collision) mediante importación
 * de interfaz nombrada 'Row' y sincronización con el Puente Soberano.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * 🛡️ SANEADO Zenith: Transición de importación por defecto a importación nombrada.
 * Erradica el error TS6133 al utilizar la interfaz 'Row' definida en 'src/index.d.ts'.
 */
import type { Row } from 'exceljs';

/* 1. Infraestructura Core (Atmos PascalCase) */
import { EmitTelemetrySignal } from '@floripa-dignidade/telemetry';

/**
 * Reporta el rastro forense de un ejecutor humano identificado en la matriz.
 * Implementa una captura pasiva (Sensor) para el sistema nervioso central.
 *
 * @param currentRowInstance - Fila física que contiene los datos del profesional.
 * @param activeCategorySpecificationLiteral - Categoría presupuestaria de vínculo.
 * @param correlationIdentifier - Identificador único de trazabilidad de la transacción.
 * @returns {void} Emisión fire-and-forget (No bloqueante).
 */
export const ReportProfessionalContext = (
  currentRowInstance: Row,
  activeCategorySpecificationLiteral: string,
  correlationIdentifier: string,
): void => {
  /**
   * @section Captura de Identidad Ejecutora
   * SANEADO: Según el estándar institucional, el nombre reside en la columna 2.
   * El puente garantiza que '.getCell()' y '.text' son propiedades validadas.
   */
  const professionalNameLiteral =
    currentRowInstance.getCell(2).text?.trim() || 'IDENTIDAD_NO_CAPTURADA';

  /**
   * @section Emisión de Señal Telemétrica
   * Utilizamos el nivel DEBUG para auditoría técnica de grano fino.
   * Inyectamos el 'semanticIntentTag' para el triaje del Neural Sentinel.
   */
  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'DEBUG',
    moduleIdentifierLiteral: 'FINANCIAL_WORKBOOK_SENSOR',
    operationCodeLiteral: 'PROFESSIONAL_VINCULATION_DETECTED',
    correlationIdentifier,
    messageContentLiteral: `Vínculo institucional detectado: El profesional [${professionalNameLiteral}] ha sido asociado a la partida [${activeCategorySpecificationLiteral}].`,

    /**
     * @section Metadatos de Auditoría
     * Clasificación ontológica para el cruce de datos con el búnker de identidad.
     */
    semanticIntentTag: 'HUMAN_RESOURCE_ALLOCATION',
    contextMetadataSnapshot: {
      professionalNameLiteral,
      targetCategoryLiteral: activeCategorySpecificationLiteral,
      sourceColumnIndexQuantity: 2,
    },
  });
};
