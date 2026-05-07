/**
 * @section Telemetry Drivers - Infrastructure Metadata Extractor
 * @description Átomo encargado de la extracción segura y tipada de los secretos
 * de infraestructura necesarios para el transporte de señales. Actúa como el
 * puente entre el hardware (process.env) y la lógica de red del sistema nervioso.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Hardware Isolation.
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */
/**
 * @interface ITelemetryInfrastructureMetadataSnapshot
 * @description Contrato inmutable para la parametrización del transporte cloud.
 */
export interface ITelemetryInfrastructureMetadataSnapshot {
    readonly nodeExecutionEnvironmentLiteral: string;
    readonly cloudStorageUniformResourceLocatorLiteral: string | undefined;
    readonly cloudStorageAccessSecurityKeySecret: string | undefined;
}
/**
 * Extrae los metadatos de infraestructura desde el contexto global de ejecución.
 * Implementa una estrategia de lectura pasiva para no contaminar el entorno.
 *
 * @returns {ITelemetryInfrastructureMetadataSnapshot} Configuración purificada.
 */
export declare const ExtractTelemetryInfrastructureConfiguration: () => ITelemetryInfrastructureMetadataSnapshot;
//# sourceMappingURL=ExtractTelemetryInfrastructureConfiguration.d.ts.map