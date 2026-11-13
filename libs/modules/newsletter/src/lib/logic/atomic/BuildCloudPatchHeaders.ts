/**
 * @section Newsletter Logic - Network Security Atom
 * @description Átomo de lógica pura encargado de la construcción de cabeceras
 * de seguridad para transacciones de actualización en la nube.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Pure Logic.
 */

/**
 * @interface ISovereignHeadersResult
 * @description Contrato inmutable para las cabeceras de Supabase PostgREST.
 */
export interface ISovereignHeadersResult {
  readonly 'Content-Type': string;
  readonly apikey: string;
  readonly Authorization: string;
  readonly Prefer: string;
}

/**
 * Genera el objeto de cabeceras inmutable para el despacho físico.
 *
 * @param cloudSecurityKeySecret - Llave maestra validada por la aduana.
 * @returns {ISovereignHeadersResult} Diccionario de cabeceras técnico.
 */
export const BuildCloudPatchHeaders = (
  cloudSecurityKeySecret: string,
): ISovereignHeadersResult => ({
  'Content-Type': 'application/json',
  apikey: cloudSecurityKeySecret,
  Authorization: `Bearer ${cloudSecurityKeySecret}`,
  Prefer: 'return=representation',
});
