/**
 * @section Storage Logic - Standard Binary Buffer Transformer (Atom)
 * @description Átomo de lógica pura encargado de homogeneizar fuentes heterogéneas
 * de datos binarios (Blob, ArrayBuffer, Uint8Array) en una vista estandarizada Uint8Array,
 * requerida para el despacho hacia el almacenamiento en la nube (S3 / Supabase Storage).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Confiabilidad y Portabilidad).
 * SANEADO: Purga definitiva de metáforas informales ("Sovereign"), erradicación de TypeError
 * mediante ValidationException tipada y blindaje isomórfico sin dependencias de Node.js Buffer.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/* 1. Infraestructura Core: Excepciones Estandarizadas ISO */
import { ValidationException } from '@floripa-dignidade/exceptions';

/**
 * @name THeterogeneousBinarySourceData
 * @description Tipo de unión que define las fuentes binarias reconocidas por el motor.
 */
export type THeterogeneousBinarySourceData = Blob | Uint8Array | ArrayBuffer;

/**
 * Transforma una referencia binaria heterogénea en un búfer de datos crudos estandarizado.
 * Implementa una función pura e isomórfica compatible con Vercel Edge Runtime y navegadores.
 *
 * @param heterogeneousBinarySourceData - Rastro binario capturado por los sensores de hardware.
 * @returns {Promise<Uint8Array>} Promesa que resuelve en la vista binaria Uint8Array pura.
 * @throws {ValidationException} Si el dato suministrado no corresponde a un formato binario reconocido.
 */
export const TransformToStandardBinaryBuffer = async (
  heterogeneousBinarySourceData: THeterogeneousBinarySourceData,
): Promise<Uint8Array> => {
  // --- CASO A: Entorno de Interfaz Web API (Blob / File) ---
  const isBlobInstanceBoolean = heterogeneousBinarySourceData instanceof Blob;

  if (isBlobInstanceBoolean) {
    const rawArrayBufferSnapshot = await heterogeneousBinarySourceData.arrayBuffer();
    return new Uint8Array(rawArrayBufferSnapshot);
  }

  // --- CASO B: Estructura de Memoria Pura (ArrayBuffer) ---
  const isArrayBufferInstanceBoolean = heterogeneousBinarySourceData instanceof ArrayBuffer;

  if (isArrayBufferInstanceBoolean) {
    return new Uint8Array(heterogeneousBinarySourceData);
  }

  // --- CASO C: Vista de Búfer Pre-Estandarizada (Uint8Array) ---
  const isUint8ArrayInstanceBoolean = heterogeneousBinarySourceData instanceof Uint8Array;

  if (isUint8ArrayInstanceBoolean) {
    return heterogeneousBinarySourceData;
  }

  // --- SALVAGUARDA DE INTEGRIDAD ESTRUCTURAL ---
  const identifiedTypeNameLiteral = Object.prototype.toString.call(heterogeneousBinarySourceData);

  throw new ValidationException('FORMATO_DE_FUENTE_BINARIA_INCOMPATIBLE', {
    identifiedTypeNameLiteral,
    resolutionHintLiteral:
      'La fuente suministrada debe ser una instancia válida de Blob, ArrayBuffer o Uint8Array.',
  });
};

/**
 * @name TransformToSovereignBinary
 * @description Alias institucional de compatibilidad histórica para transiciones en el monorepo.
 * @deprecated Utilizar canónicamente 'TransformToStandardBinaryBuffer' bajo el estándar OEDP-V18.1.
 */
export const TransformToSovereignBinary = TransformToStandardBinaryBuffer;
