/**
 * @section Telemetry Logic - Cloud Synchronization Atom
 * @description Átomo encargado de la coordinación física entre el buffer volátil,
 * la persistencia local y el despacho hacia el Data Lake. Implementa el patrón
 * 'Lock & Release' para prevenir colisiones de red.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & SOLID SRP.
 * @author Raz Podestá - MetaShark Tech
 */

import { DetermineDevelopmentEnvironment } from '../../atomic/DetermineDevelopmentEnvironment';
import { ExtractTelemetryInfrastructureConfiguration } from '../ExtractTelemetryInfrastructureConfiguration';
import { FlushTelemetryBufferSignals } from '../FlushTelemetryBufferSignals';
import { TransmitTelemetrySignalsToCloud } from '../TransmitTelemetrySignalsToCloud';
import { ClearSovereignTelemetryVaultAction } from '../ClearSovereignTelemetryVaultAction';
import type { ITelemetrySignal } from '../../../schemas/TelemetrySignal.schema';

/** Semáforo de Sincronización (Locking) local al proceso. */
let isSynchronizationActiveBoolean = false;

/**
 * Orquesta la sincronización física con la nube soberana.
 *
 * @returns {Promise<void>}
 */
export const SynchronizeTelemetryBufferAction = async (): Promise<void> => {
  if (isSynchronizationActiveBoolean) {
    return;
  }

  const telemetrySignalsCollection = FlushTelemetryBufferSignals();
  if (telemetrySignalsCollection.length === 0) {
    return;
  }

  isSynchronizationActiveBoolean = true;

  try {
    const isDevelopmentActiveBoolean = DetermineDevelopmentEnvironment();

    // CASO A: Trazabilidad Forense Local (Modo Espejo)
    if (isDevelopmentActiveBoolean) {
      telemetrySignalsCollection.forEach((signalSnapshot: ITelemetrySignal) => {
        console.warn(
          `[TELEMETRY_FORENSIC]: ${signalSnapshot.operationCodeLiteral}`,
          signalSnapshot,
        );
      });
      return;
    }

    // CASO B: Persistencia en el Ledger Cloud (Supabase)
    const { cloudStorageUniformResourceLocatorLiteral, cloudStorageAccessSecurityKeySecret } =
      ExtractTelemetryInfrastructureConfiguration();

    if (cloudStorageUniformResourceLocatorLiteral && cloudStorageAccessSecurityKeySecret) {
      await TransmitTelemetrySignalsToCloud(
        telemetrySignalsCollection,
        cloudStorageUniformResourceLocatorLiteral,
        cloudStorageAccessSecurityKeySecret,
      );

      /** 🛡️ SANEADO Zenith: Solo limpiamos el disco local tras el éxito del transporte. */
      ClearSovereignTelemetryVaultAction();
    }
  } finally {
    isSynchronizationActiveBoolean = false;
  }
};
