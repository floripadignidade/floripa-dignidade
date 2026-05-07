/**
 * @section Environment Logic - Hardware Metadata Sensor
 * @description Átomo de lógica pura encargado de la extracción física de variables
 * de entorno desde el contexto global de ejecución. Actúa como el sensor primario
 * de hardware, aislando el acceso a 'process.env' para garantizar la
 * interoperabilidad entre Node.js, Docker y Edge Runtimes.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Hardware Isolation.
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */
/**
 * @name IEnvironmentMetadataSnapshot
 * @description Representación física de la colección de metadatos capturados.
 */
export type IEnvironmentMetadataSnapshot = Record<string, string | undefined>;
/**
 * Recolecta las variables de entorno inyectadas en el pod de ejecución.
 * Implementa una estrategia de captura pasiva sin mutaciones.
 *
 * @returns {IEnvironmentMetadataSnapshot} Colección inmutable de metadatos crudos.
 */
export declare const GatherEnvironmentMetadata: () => IEnvironmentMetadataSnapshot;
//# sourceMappingURL=GatherEnvironmentMetadata.d.ts.map