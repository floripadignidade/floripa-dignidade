/**
 * @section Environment Logic - Hardware Metadata Sensor (Atom)
 * @description Átomo de lógica pura encargado de la extracción física y segura de las
 * variables de entorno del proceso de ejecución. Actúa como el sensor primario de hardware,
 * aislando el acceso a 'process.env' para garantizar la interoperabilidad isomórfica
 * entre Node.js, Vercel Serverless, contenedores Docker y Edge Runtimes.
 * Emite telemetría estandarizada conforme a ISO/IEC 11179 y sella inmutablemente el snapshot de salida.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Confiabilidad) e ISO/IEC 27001 (Seguridad).
 * SANEADO Zenith: Erradicación de propiedades de telemetría obsoletas, inyección obligatoria
 * de occurrenceTimestampISO y sellado inmutable del diccionario capturado con Object.freeze.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const SENSOR_MODULE_IDENTIFIER = 'ENVIRONMENT_HARDWARE_SENSOR' as ModuleIdentifier;

/**
 * @interface IGlobalExecutionContext
 * @description Puente de tipos institucional para el acceso seguro al objeto de proceso
 * del sistema operativo o entorno de ejecución en la nube.
 */
interface IGlobalExecutionContext {
  readonly process?: {
    readonly env: Record<string, string | undefined>;
  };
}

/**
 * @name IEnvironmentMetadataSnapshot
 * @description Representación física inmutable de la colección de metadatos capturados.
 */
export type IEnvironmentMetadataSnapshot = Readonly<Record<string, string | undefined>>;

/**
 * Recolecta las variables de entorno inyectadas en el pod o contenedor de ejecución.
 * Implementa una estrategia de captura pasiva y sella inmutablemente el resultado.
 *
 * @returns {IEnvironmentMetadataSnapshot} Colección inmutable y sellada de metadatos de entorno.
 */
export const GatherEnvironmentMetadata = (): IEnvironmentMetadataSnapshot => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  /**
   * @section Captura Isomórfica Blindada
   * Se consulta 'process.env' si existe en el entorno global o se recurre a 'globalThis'
   * para garantizar que el sensor no colapse en contextos donde 'process' sea virtual.
   */
  const globalExecutionContextReference = globalThis as unknown as IGlobalExecutionContext;

  const rawEnvironmentVariablesRecord =
    typeof process !== 'undefined' && process.env
      ? process.env
      : (globalExecutionContextReference.process?.env ?? {});

  const environmentVariablesCountQuantity = Object.keys(rawEnvironmentVariablesRecord).length;

  // REPORTE DE ACTIVACIÓN DE SENSOR (Alineación con TelemetrySignalSchema)
  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'DEBUG',
    moduleIdentifierLiteral: SENSOR_MODULE_IDENTIFIER,
    operationCodeLiteral: 'HARDWARE_METADATA_EXTRACTED' as OperationCode,
    correlationIdentifier,
    messageContentLiteral:
      'Sensor de hardware activado: Captura de variables de entorno finalizada.',
    semanticIntentTag: 'HARDWARE_ENVIRONMENT_ACQUISITION',
    contextMetadataSnapshot: {
      variablesCountQuantity: environmentVariablesCountQuantity,
    },
  });

  /**
   * Sello inmutable físico del diccionario para evitar mutaciones de memoria
   * en los consumidores subsiguientes del monorepo.
   */
  return Object.freeze({ ...rawEnvironmentVariablesRecord });
};
