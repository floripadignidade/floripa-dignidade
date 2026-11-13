/**
 * @section Tools & Infrastructure - Linguistic Tree Flattener (Atom)
 * @description Átomo de lógica pura encargado de recorrer recursivamente un árbol de
 * diccionario JSON y extraer de forma determinista y ordenada todas las rutas de claves
 * hoja (notación punto), preservando objetos vacíos como nodos hoja para detección de
 * asimetrías estructurales.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Técnica) e ISO/IEC 25010 (Mantenibilidad y Precisión).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

const isPlainObjectRecordGuard = (
  candidateValue: unknown,
): candidateValue is Readonly<Record<string, unknown>> =>
  typeof candidateValue === 'object' && candidateValue !== null && !Array.isArray(candidateValue);

/**
 * Extrae y ordena alfabéticamente todas las rutas de claves hoja de un objeto de traducción.
 *
 * @param dictionaryNodeSnapshot - Objeto JSON de traducción o sub-sección anidada.
 * @param currentPrefixLiteral - Prefijo acumulado durante el recorrido recursivo.
 * @returns {readonly string[]} Colección inmutable y ordenada de rutas de claves.
 */
export const CollectLinguisticLeafKeyPaths = (
  dictionaryNodeSnapshot: Readonly<Record<string, unknown>>,
  currentPrefixLiteral = '',
): readonly string[] => {
  const collectedKeysCollection: string[] = [];

  for (const [entryKeyLiteral, entryValue] of Object.entries(dictionaryNodeSnapshot)) {
    const composedPathLiteral = currentPrefixLiteral
      ? `${currentPrefixLiteral}.${entryKeyLiteral}`
      : entryKeyLiteral;

    if (isPlainObjectRecordGuard(entryValue) && Object.keys(entryValue).length > 0) {
      collectedKeysCollection.push(
        ...CollectLinguisticLeafKeyPaths(entryValue, composedPathLiteral),
      );
    } else {
      collectedKeysCollection.push(composedPathLiteral);
    }
  }

  return Object.freeze(collectedKeysCollection.sort());
};
