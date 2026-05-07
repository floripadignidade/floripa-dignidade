/**
 * @section Telemetry Logic - LocalStorage Purge Atom
 * @description Átomo encargado de la eliminación física del rastro local tras el éxito cloud.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE.
 */
/**
 * Borra físicamente la bóveda de telemetría del hardware local.
 * Se invoca tras la confirmación de recepción (HTTP 201) del Data Lake.
 *
 * @returns {void}
 */
export declare const ClearSovereignTelemetryVaultAction: () => void;
//# sourceMappingURL=ClearSovereignTelemetryVaultAction.d.ts.map