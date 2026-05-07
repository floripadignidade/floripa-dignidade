/**
 * @section Telemetry Logic - Cloud Log Transport Driver
 * @description Átomo encarregado exclusivamente da comunicação I/O de rede.
 * Executa o despacho físico das sinais em lote (Batch) para o Data Lake
 * institucional utilizando o protocolo PostgREST sobre Fetch nativo com
 * suporte a persistência de encerramento (keepalive).
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Cloud Sovereign.
 * SANEADO Zenith: Injeção de 'keepalive' para suporte ao Beacon Pattern e ISO Naming.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */
import type { ITelemetrySignal } from '../../schemas/TelemetrySignal.schema';
/**
 * Executa a transmissão física de uma coleção de sinais para a persistência cloud.
 * Implementa suporte a 'keepalive' para garantir que as petições não sejam
 * canceladas durante o fechamento do navegador (Last Breath).
 *
 * @param telemetrySignalsCollection - Lote de sinais validadas para persistência.
 * @param cloudProviderEndpointUniformResourceLocator - URL física do gateway de dados.
 * @param cloudProviderAccessSecurityKeySecret - Chave de autorização Service Role.
 * @returns {Promise<void>}
 */
export declare const TransmitTelemetrySignalsToCloud: (telemetrySignalsCollection: ITelemetrySignal[], cloudProviderEndpointUniformResourceLocator: string, cloudProviderAccessSecurityKeySecret: string) => Promise<void>;
//# sourceMappingURL=TransmitTelemetrySignalsToCloud.d.ts.map