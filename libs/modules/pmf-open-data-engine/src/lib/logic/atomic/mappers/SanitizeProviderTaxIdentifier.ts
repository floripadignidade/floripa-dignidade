/**
 * @section PMF Engine Logic - Provider Tax Identifier Sanitizer
 * @description Átomo de lógica pura encargado de normalizar identificadores
 * fiscales (CNPJ/CPF). Elimina caracteres no numéricos para garantizar
 * la integridad en el cruce de datos y la analítica forense.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & ISO Standards.
 * SANEADO Zenith: Resolución de TS2305 mediante sincronización de Branded Types.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/* 1. ADN Estructural y Tipos Nominales (Clean Paths) */
/**
 * 🛡️ SANEADO Zenith (Fix TS2305):
 * Sincronización con la evolución del esquema soberano. Se transita de
 * 'TProviderCnpj' al tipo nominal profesional 'TProviderTaxIdentifier'.
 */
import type { TProviderTaxIdentifier } from '../../../schemas/sovereign/PublicExpenditure.schema';

/**
 * Purifica un identificador fiscal eliminando ruidos visuales (puntos, guiones, barras).
 * ⚡ PERFORMANCE: Algoritmo de reemplazo por expresión regular de paso único.
 *
 * @param rawTaxIdentifierLiteral - Cadena cruda proveniente del portal gubernamental.
 * @returns {TProviderTaxIdentifier} Identificador purificado y sellado (Branded Type).
 */
export const SanitizeProviderTaxIdentifier = (
  rawTaxIdentifierLiteral: string
): TProviderTaxIdentifier => {
  /**
   * @section Normalización de ADN
   * La expresión regular \D captura cualquier carácter que no sea un dígito,
   * garantizando que solo la esencia numérica del ID fiscal persista.
   */
  const purifiedIdentifierLiteral = rawTaxIdentifierLiteral.replace(/\D/g, '');

  /**
   * 🛡️ SOVEREIGN CASTING:
   * Elevamos el literal purificado al tipo nominal TProviderTaxIdentifier.
   * Este sello impide que el rastro fiscal sea confundido con strings genéricos.
   */
  return purifiedIdentifierLiteral as TProviderTaxIdentifier;
};
