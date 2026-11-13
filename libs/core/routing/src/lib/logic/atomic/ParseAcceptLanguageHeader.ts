/**
 * @section Routing Logic - Accept-Language Header Parser Atom
 * @description Átomo de lógica pura encargado de analizar la cabecera HTTP
 * `Accept-Language` conforme a RFC 9110 (Section 12.5.4), normalizar subetiquetas
 * BCP 47 (idioma, escritura ISO 15924 y región ISO 3166-1 / UN M.49) y ordenar
 * los candidatos de forma determinista por peso de calidad (`q`).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), RFC 9110, ISO/IEC 11179 e ISO/IEC 25010.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * @interface IAcceptLanguageCandidate
 * @description Representación inmutable de un idioma candidato extraído de la cabecera HTTP.
 */
export interface IAcceptLanguageCandidate {
  readonly normalizedLocaleTagLiteral: string;
  readonly qualityWeightNumeric: number;
  readonly originalOrderIndexNumeric: number;
}

const DEFAULT_QUALITY_WEIGHT_NUMERIC = 1.0;

/**
 * Normaliza un código BCP 47 respetando la capitalización estándar ISO:
 * idioma en minúsculas, script (4 letras) en Title Case y región (2 letras) en mayúsculas.
 *
 * @param rawLocaleTagLiteral - Etiqueta cruda de idioma extraída de la cabecera.
 * @returns {string} Etiqueta normalizada bajo estándar BCP 47.
 */
const normalizeBcp47TagLiteral = (rawLocaleTagLiteral: string): string => {
  const rawSubtagsCollection = rawLocaleTagLiteral
    .trim()
    .replace(/_/g, '-')
    .split('-')
    .filter((subtagLiteral) => subtagLiteral.length > 0);

  return rawSubtagsCollection
    .map((subtagLiteral, subtagIndexNumeric) => {
      if (subtagIndexNumeric === 0) {
        return subtagLiteral.toLowerCase();
      }
      if (subtagLiteral.length === 4 && /^[a-zA-Z]{4}$/.test(subtagLiteral)) {
        return `${subtagLiteral.charAt(0).toUpperCase()}${subtagLiteral.slice(1).toLowerCase()}`;
      }
      if (subtagLiteral.length === 2 && /^[a-zA-Z]{2}$/.test(subtagLiteral)) {
        return subtagLiteral.toUpperCase();
      }
      return subtagLiteral.toLowerCase();
    })
    .join('-');
};

/**
 * Extrae el factor de calidad `q` (rango 0.0 a 1.0) desde los parámetros de una entrada.
 *
 * @param parameterSegmentsCollection - Segmentos posteriores al separador `;`.
 * @returns {number} Peso de preferencia validado.
 */
const extractQualityWeightNumeric = (parameterSegmentsCollection: readonly string[]): number => {
  const qualitySegmentLiteral = parameterSegmentsCollection.find((segmentLiteral) =>
    segmentLiteral.trim().toLowerCase().startsWith('q='),
  );

  if (qualitySegmentLiteral === undefined) {
    return DEFAULT_QUALITY_WEIGHT_NUMERIC;
  }

  const rawWeightLiteral = qualitySegmentLiteral.trim().slice(2);
  const parsedWeightNumeric = Number.parseFloat(rawWeightLiteral);
  const isWeightOutOfRangeBoolean =
    Number.isNaN(parsedWeightNumeric) || parsedWeightNumeric < 0 || parsedWeightNumeric > 1;

  return isWeightOutOfRangeBoolean ? 0 : parsedWeightNumeric;
};

/**
 * Transforma la cabecera `Accept-Language` en una colección ordenada por prioridad.
 *
 * @param acceptLanguageHeaderLiteral - Valor crudo de la cabecera HTTP.
 * @returns {readonly IAcceptLanguageCandidate[]} Candidatos ordenados de mayor a menor prioridad.
 */
export const ParseAcceptLanguageHeader = (
  acceptLanguageHeaderLiteral: string,
): readonly IAcceptLanguageCandidate[] => {
  const rawEntriesCollection = acceptLanguageHeaderLiteral.split(',');
  const parsedCandidatesCollection: IAcceptLanguageCandidate[] = [];

  for (
    let entryIndexNumeric = 0;
    entryIndexNumeric < rawEntriesCollection.length;
    entryIndexNumeric += 1
  ) {
    const rawEntryLiteral = rawEntriesCollection[entryIndexNumeric];
    if (rawEntryLiteral === undefined) {
      continue;
    }

    const [rawLanguageTagLiteral, ...parameterSegmentsCollection] = rawEntryLiteral.split(';');
    if (rawLanguageTagLiteral === undefined) {
      continue;
    }

    const normalizedLocaleTagLiteral = normalizeBcp47TagLiteral(rawLanguageTagLiteral);
    const isWildcardOrEmptyBoolean =
      normalizedLocaleTagLiteral.length === 0 || normalizedLocaleTagLiteral === '*';

    if (isWildcardOrEmptyBoolean) {
      continue;
    }

    const qualityWeightNumeric = extractQualityWeightNumeric(parameterSegmentsCollection);
    if (qualityWeightNumeric <= 0) {
      continue;
    }

    parsedCandidatesCollection.push(
      Object.freeze({
        normalizedLocaleTagLiteral,
        qualityWeightNumeric,
        originalOrderIndexNumeric: entryIndexNumeric,
      }),
    );
  }

  parsedCandidatesCollection.sort((firstCandidateSnapshot, secondCandidateSnapshot) => {
    const weightDifferenceNumeric =
      secondCandidateSnapshot.qualityWeightNumeric - firstCandidateSnapshot.qualityWeightNumeric;

    return weightDifferenceNumeric !== 0
      ? weightDifferenceNumeric
      : firstCandidateSnapshot.originalOrderIndexNumeric -
          secondCandidateSnapshot.originalOrderIndexNumeric;
  });

  return Object.freeze(parsedCandidatesCollection);
};
