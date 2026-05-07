/**
 * @section Telemetry Logic - Last Breath Sensor Orchestrator
 * @description Registra un disparador que vacía el buffer de telemetría cuando el usuario
 * cierra o minimiza la aplicación, asegurando que la última señal no se pierda.
 *
 * Protocolo OEDP-V17.0 - Hardware Isolation & SRE Resilience.
 * SANEADO Zenith: Erradicación total de 'any' (Fix TS @typescript-eslint/no-explicit-any).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */
/**
 * Vincula la acción de despacho al sensor de visibilidad del sistema operativo.
 *
 * @param onLifecycleTerminationAction - Acción de sincronización (Flush) a ejecutar.
 * @returns {void}
 */
export declare const RegisterSovereignLastBreathSensor: (onLifecycleTerminationAction: () => void) => void;
//# sourceMappingURL=RegisterSovereignLastBreathSensor.d.ts.map