/**
 * @section Messaging Logic - Primary Database Headers Builder (Atom)
 * @description Átomo de lógica pura encargado exclusivamente de la construcción
 * y sellado inmutable del diccionario de cabeceras de red para la comunicación
 * con el Tier de Datos (Supabase / PostgREST). Centraliza la inyección de credenciales
 * Bearer y políticas de preferencia de respuesta para todos los despachadores del módulo.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Seguridad y Mantenibilidad).
 * SANEADO: Purga definitiva de metáforas informales ("Sovereign"), validación de contrato Zod,
 * inmutabilidad física en runtime mediante Object.freeze y alias retroactivos para cero roturas.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @name ReturnPreferenceLiteralSchema
 * @description Modos de respuesta y serialización admitidos por el protocolo PostgREST.
 */
export const ReturnPreferenceLiteralSchema = z
  .enum(['representation', 'minimal'])
  .default('minimal')
  .describe('Preferencia de retorno de datos tras mutaciones HTTP en PostgREST.');

/** Tipo literal derivado para modos de respuesta de base de datos. */
export type TReturnPreferenceLiteral = z.infer<typeof ReturnPreferenceLiteralSchema>;

/**
 * @name TReturnPreference
 * @description Alias institucional de compatibilidad histórica para transiciones en el monorepo.
 * @deprecated Utilizar canónicamente 'TReturnPreferenceLiteral' bajo el estándar OEDP-V18.1.
 */
export type TReturnPreference = TReturnPreferenceLiteral;

/**
 * @interface IPrimaryDatabaseHeadersResult
 * @description Contrato inmutable que estructura las cabeceras HTTP obligatorias para PostgREST.
 * Sigue la norma ISO 11179 de Objeto + Propiedad + Representación.
 */
export interface IPrimaryDatabaseHeadersResult {
  readonly 'Content-Type': string;
  readonly apikey: string;
  readonly Authorization: string;
  readonly Prefer: string;
}

/**
 * @interface ISovereignHeadersResult
 * @description Alias institucional de compatibilidad histórica para prevenir roturas en el enjambre.
 * @deprecated Utilizar canónicamente 'IPrimaryDatabaseHeadersResult' bajo el estándar OEDP-V18.1.
 */
export type ISovereignHeadersResult = IPrimaryDatabaseHeadersResult;

/**
 * Genera el diccionario inmutable de cabeceras de red para transacciones con el Ledger Cloud.
 * Implementa una función pura y sellada con Object.freeze para máxima seguridad en runtime.
 *
 * @param cloudSecurityKeySecret - Llave de acceso de alta autoridad validada por el entorno.
 * @param responsePreferenceLiteral - Modo de retorno de datos (Default: 'minimal' para ahorro de ancho de banda).
 * @returns {IPrimaryDatabaseHeadersResult} Diccionario sellado e inmutable listo para consumo en fetch.
 */
export const CreatePrimaryDatabaseHeaders = (
  cloudSecurityKeySecret: string,
  responsePreferenceLiteral: TReturnPreferenceLiteral = 'minimal',
): IPrimaryDatabaseHeadersResult => {
  const sanitizedSecurityKeySecret = cloudSecurityKeySecret.trim();

  /**
   * @section Construcción de Identidad de Red y Autorización Bearer
   * Se sella el objeto físicamente para impedir mutaciones en la capa de transporte.
   */
  return Object.freeze({
    'Content-Type': 'application/json',
    apikey: sanitizedSecurityKeySecret,
    Authorization: `Bearer ${sanitizedSecurityKeySecret}`,
    Prefer: `return=${responsePreferenceLiteral}`,
  });
};

/**
 * @name CreateSovereignDatabaseHeaders
 * @description Alias institucional de compatibilidad histórica para despachadores y mutadores.
 * @deprecated Utilizar canónicamente 'CreatePrimaryDatabaseHeaders' bajo el estándar OEDP-V18.1.
 */
export const CreateSovereignDatabaseHeaders = CreatePrimaryDatabaseHeaders;
