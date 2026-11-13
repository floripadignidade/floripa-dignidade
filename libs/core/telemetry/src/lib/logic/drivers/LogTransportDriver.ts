/**
 * @section Telemetry Drivers - Sovereign Transport Orchestrator
 * @description Orquestador superior encargado de coordinar el flujo sanguíneo digital.
 * Implementa una arquitectura de enjambre delegando responsabilidades a átomos
 * de criptografía, persistencia local y sensores de hardware.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Atomic Swarm.
 * SANEADO Zenith: Implementación de Semáforo Merkle y reporte de fallo de cadena.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { ContentFingerprint, ITelemetrySignal } from '../../schemas/TelemetrySignal.schema';
import { DetermineServerRuntime } from '../atomic/DetermineServerRuntime';

/* 1. Enjambre Atómico de Gestión de Datos (Swarm) */
import { AddTelemetrySignalToBuffer } from './AddTelemetrySignalToBuffer';
import { GetTelemetryBufferSizeQuantity } from './GetTelemetryBufferSizeQuantity';
import { PersistTelemetrySignalsToLocalStorage } from './PersistTelemetrySignalsToLocalStorage';
import { SynchronizeTelemetryBufferAction } from './internal/SynchronizeTelemetryBufferAction';

/* 2. Átomos de Especialidad Criptográfica y Sensorial */
import { ExecuteMerkleChainCalculation } from './internal/ExecuteMerkleChainCalculation';
import { RegisterSovereignLastBreathSensor } from './internal/RegisterSovereignLastBreathSensor';

/** @section Configuración Técnica de Resiliencia (SRE) */
const MAXIMUM_BUFFER_CAPACITY_QUANTITY = 20;
const FLUSH_DELAY_MILLISECONDS_QUANTITY = 5000;

/**
 * Única fuente de verdad para el último eslabón de la cadena Merkle.
 * Se mantiene en el ámbito del módulo para persistencia entre llamadas.
 */
let lastEventHashFingerprintValue: ContentFingerprint | undefined = undefined;

/** Referencia de temporizador para el vaciado diferido (Debounce Pattern). */
let flushTimeoutReference: ReturnType<typeof setTimeout> | null = null;

/** 🛡️ Semáforo de Integridad: Previene colisiones en el cálculo de hashes secuenciales. */
let isCriptographicCalculationActiveBoolean = false;

/**
 * Punto de entrada universal para el transporte de telemetría.
 * Orquesta la transición entre hilos, la integridad Merkle y la persistencia.
 *
 * @param validatedTelemetrySignalSnapshot - Señal purificada por la aduana Zod.
 * @returns {Promise<void>}
 */
export const QueueTelemetrySignalForTransportAction = async (
  validatedTelemetrySignalSnapshot: ITelemetrySignal,
): Promise<void> => {
  const isServerRuntimeBoolean = DetermineServerRuntime();

  /**
   * @section FASE 1: INTEGRIDAD CRIPTOGRÁFICA (Merkle Chain)
   * Solo se ejecuta en el cliente para asegurar la cadena de custodia
   * antes del despacho a la nube.
   */
  let forensicTelemetrySignalSnapshot = { ...validatedTelemetrySignalSnapshot };

  if (!isServerRuntimeBoolean) {
    try {
      /**
       * @guard Semáforo de Secuencia
       * Si el cálculo está ocupado, esperamos brevemente para no romper la cadena.
       */
      while (isCriptographicCalculationActiveBoolean) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      isCriptographicCalculationActiveBoolean = true;

      const { currentHash } = await ExecuteMerkleChainCalculation(
        validatedTelemetrySignalSnapshot,
        lastEventHashFingerprintValue,
      );

      forensicTelemetrySignalSnapshot = {
        ...forensicTelemetrySignalSnapshot,
        contentHashFingerprint: currentHash,
        previousEventHashFingerprint: lastEventHashFingerprintValue,
      };

      lastEventHashFingerprintValue = currentHash;
      isCriptographicCalculationActiveBoolean = false;
    } catch (caughtMerkleError: unknown) {
      isCriptographicCalculationActiveBoolean = false;

      /**
       * REPORTE DE ANOMALÍA: Notificamos el fallo de integridad Merkle
       * sin detener el transporte (Prioridad: Disponibilidad).
       */
      console.error('[SRE_WARNING]: Fallo en la generación de cadena Merkle.', caughtMerkleError);
    }
  }

  /**
   * @section FASE 2: SALVAGUARDA FÍSICA (Local Shield)
   * Registramos la señal en el buffer de memoria y en el almacenamiento local.
   */
  AddTelemetrySignalToBuffer(forensicTelemetrySignalSnapshot);

  if (!isServerRuntimeBoolean) {
    PersistTelemetrySignalsToLocalStorage([forensicTelemetrySignalSnapshot]);
  }

  /**
   * @section FASE 3: ESTRATEGIA DE DESPACHO ASIMÉTRICO
   * Servidor: Despacho inmediato (Stateless execution).
   * Cliente: Despacho por lote (Batch) o por tiempo (Debounce).
   */
  if (isServerRuntimeBoolean) {
    void SynchronizeTelemetryBufferAction();
    return;
  }

  const currentBufferSizeQuantity = GetTelemetryBufferSizeQuantity();

  if (currentBufferSizeQuantity >= MAXIMUM_BUFFER_CAPACITY_QUANTITY) {
    /** Límite de capacidad alcanzado: Forzamos el vaciado. */
    if (flushTimeoutReference) {
      clearTimeout(flushTimeoutReference);
      flushTimeoutReference = null;
    }
    void SynchronizeTelemetryBufferAction();
  } else if (!flushTimeoutReference) {
    /** Programamos el vaciado diferido para optimizar tráfico. */
    flushTimeoutReference = setTimeout(() => {
      flushTimeoutReference = null;
      void SynchronizeTelemetryBufferAction();
    }, FLUSH_DELAY_MILLISECONDS_QUANTITY);
  }
};

/**
 * @section FASE 4: ACTIVACIÓN DE SENSORES DE HARDWARE (Lifecycle Sentry)
 * Registramos el "Último Suspiro" del cliente: si el ciudadano cierra la pestaña,
 * forzamos la sincronización de cualquier rastro pendiente.
 */
RegisterSovereignLastBreathSensor(() => {
  void SynchronizeTelemetryBufferAction();
});
