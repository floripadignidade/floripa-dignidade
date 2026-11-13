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
 * @interface IGlobalExecutionContext
 * @description Puente de tipos soberano para el acceso seguro al objeto de proceso
 * del sistema operativo sin dependencias directas de Node.js.
 */
interface IGlobalExecutionContext {
  readonly process?: {
    readonly env: Record<string, string | undefined>;
  };
}

/**
 * Extrae los metadatos de infraestructura desde el contexto global de ejecución.
 * Implementa una estrategia de lectura pasiva para no contaminar el entorno.
 *
 * @returns {ITelemetryInfrastructureMetadataSnapshot} Configuración purificada.
 */
export const ExtractTelemetryInfrastructureConfiguration =
  (): ITelemetryInfrastructureMetadataSnapshot => {
    /**
     * @section Acceso Isomórfico
     * SANEADO Zenith: El uso de 'globalThis' garantiza que el driver no colapse
     * en el Edge Runtime de Vercel donde 'process' puede ser volátil.
     */
    const globalExecutionContextReference = globalThis as unknown as IGlobalExecutionContext;

    return {
      nodeExecutionEnvironmentLiteral:
        globalExecutionContextReference.process?.env['NODE_ENV'] ?? 'development',

      cloudStorageUniformResourceLocatorLiteral:
        globalExecutionContextReference.process?.env['SUPABASE_URL'],

      cloudStorageAccessSecurityKeySecret:
        globalExecutionContextReference.process?.env['SUPABASE_SERVICE_ROLE_KEY'],
    };
  };
