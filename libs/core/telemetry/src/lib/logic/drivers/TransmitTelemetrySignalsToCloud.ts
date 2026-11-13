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
export const TransmitTelemetrySignalsToCloud = async (
  telemetrySignalsCollection: ITelemetrySignal[],
  cloudProviderEndpointUniformResourceLocator: string,
  cloudProviderAccessSecurityKeySecret: string,
): Promise<void> => {
  // 1. FILTRO DE ATOMICIDADE: Se não há dados, não há transação.
  if (telemetrySignalsCollection.length === 0) {
    return;
  }

  try {
    /**
     * @section Despacho Físico (Stateless Fetch)
     * Utilizamos o protocolo padrão de Supabase/PostgREST.
     */
    await fetch(`${cloudProviderEndpointUniformResourceLocator}/rest/v1/system_telemetry_logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: cloudProviderAccessSecurityKeySecret,
        Authorization: `Bearer ${cloudProviderAccessSecurityKeySecret}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(telemetrySignalsCollection),
      /**
       * 🛡️ SANEADO Zenith: Persistência de Encerramento.
       * O flag 'keepalive' permite que a petição continue mesmo que a página
       * seja descarregada, substituindo a necessidade de 'navigator.sendBeacon'
       * para payloads JSON complexos.
       */
      keepalive: true,
      /**
       * 🛡️ SANEADO Zenith: Timeout Soberano.
       * Limitamos a espera para evitar processos zumbis no Edge Runtime.
       */
      signal: AbortSignal.timeout(8000),
    });
  } catch (_caughtNetworkError: unknown) {
    /**
     * @section Resiliência de Fluxo
     * O rastro de telemetria é secundário. Se houver falha de rede (Offline),
     * os sinais permanecerão no LocalStorage para a próxima tentativa.
     */
  }
};
