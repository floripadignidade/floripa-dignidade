/**
 * @section PMF Engine Logic - Provider Identity Mapper
 * @description Átomo de lógica pura encargado de transformar los datos crudos
 * del beneficiario en una estructura de identidad fiscal purificada y tipada.
 * Garantiza la integridad de la razón social y la normalización del documento legal.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & ISO Technical Naming.
 * SANEADO Zenith: Resolución de TS2305 mediante sincronización de Branded Types.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/* 1. ADN Estructural y Tipos Nominales (Clean Paths) */
/**
 * 🛡️ SANEADO Zenith (Fix TS2305):
 * Sincronización con el esquema soberano. Se sustituye 'TProviderCnpj'
 * por el tipo nominal brindado 'TProviderTaxIdentifier'.
 */
import type { TProviderTaxIdentifier } from '../../../schemas/sovereign/PublicExpenditure.schema';
import { SanitizeProviderTaxIdentifier } from './SanitizeProviderTaxIdentifier';

/**
 * @interface IProviderMetadata
 * @description Contrato inmutable para la identidad legal del proveedor gubernamental.
 */
export interface IProviderMetadata {
  /** Razón social o nombre civil normalizado en mayúsculas. */
  readonly legalNameLiteral: string;

  /** Identificador fiscal (CNPJ/CPF) purificado y sellado nominalmente. */
  readonly taxIdentificationNumber: TProviderTaxIdentifier;
}

/**
 * Mapea y purifica la identidad del proveedor de servicios o bienes.
 * ⚡ PERFORMANCE: Operación sincrónica pura de alta velocidad para mapeo de lotes.
 *
 * @param rawNameLiteral - Nombre crudo extraído de la API de E-Pública.
 * @param rawTaxIdentifierLiteral - Documento fiscal con posibles ruidos de formato.
 * @returns {IProviderMetadata} Snapshot de identidad purificado y validado.
 */
export const MapProviderIdentity = (
  rawNameLiteral: string,
  rawTaxIdentifierLiteral: string,
): IProviderMetadata => {
  return {
    /**
     * @section Saneamiento de Identidad
     * Aplicamos normalización tipográfica ISO: mayúsculas y eliminación de
     * espacios en los extremos para evitar duplicidad semántica.
     */
    legalNameLiteral: rawNameLiteral.toUpperCase().trim(),

    /**
     * 🛡️ DELEGACIÓN ATÓMICA:
     * El saneamiento del rastro numérico se delega al átomo de especialidad fiscal.
     */
    taxIdentificationNumber: SanitizeProviderTaxIdentifier(rawTaxIdentifierLiteral),
  };
};
