/**
 * @section Utility Apparatus: GlobalStyleClassMerger
 * @description Orquestador de fusión de clases CSS para el motor Tailwind.
 * Resuelve conflictos de especificidad de forma funcional.
 *
 * Protocolo OEDP-V17.0 - Verbatim Module Syntax.
 * SANEADO Zenith: Aislamiento de entropía de tipos (Fix TS7016) derivado
 * de la asimetría de exportaciones ESM en PNPM.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';

/**
 * 🛡️ LEY DE CONTENCIÓN (SRE):
 * Suprimimos la alerta TS7016. La asimetría entre 'bundle-mjs.mjs' y 'types.d.ts'
 * ciega al compilador bajo PNPM estricto. Al forzar la salida de nuestra
 * función a ': string', la hemorragia de tipos queda 100% encapsulada aquí.
 */

import { twMerge } from 'tailwind-merge';

/**
 * Fusiona múltiples entradas de clases CSS resolviendo colisiones de Tailwind.
 * Implementa captura variádica de argumentos para máxima flexibilidad en la UI.
 *
 * @param styleClassInputs - Colección de clases condicionales (booleanos, strings, arrays).
 * @returns {string} Cadena de clases CSS procesada, purificada y sin conflictos.
 */
export const GlobalStyleClassMerger = (...styleClassInputs: ClassValue[]): string => {
  const composedClassesLiteral = clsx(styleClassInputs);
  return twMerge(composedClassesLiteral);
};
