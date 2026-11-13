/**
 * @section User Management and Identity - Civil Document Validation Contracts
 * @description Esquemas puros de validación estructural y algorítmica para documentos
 * fiscales brasileños (CPF y CNPJ). Implementa la verificación completa de dígitos
 * verificadores mediante el algoritmo de Módulo 11 conforme a la Receita Federal.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Técnica) e ISO/IEC 25010 (Confiabilidad y Seguridad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

const REPEATED_DIGITS_SEQUENCE_REGEX = /^(\d)\1+$/;

const CPF_FIRST_CHECK_DIGIT_WEIGHTS_COLLECTION: readonly number[] = [10, 9, 8, 7, 6, 5, 4, 3, 2];

const CPF_SECOND_CHECK_DIGIT_WEIGHTS_COLLECTION: readonly number[] = [
  11, 10, 9, 8, 7, 6, 5, 4, 3, 2,
];

const CNPJ_FIRST_CHECK_DIGIT_WEIGHTS_COLLECTION: readonly number[] = [
  5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2,
];

const CNPJ_SECOND_CHECK_DIGIT_WEIGHTS_COLLECTION: readonly number[] = [
  6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2,
];

/**
 * Ejecuta el cálculo de dígito verificador por Módulo 11 sobre una cadena numérica.
 * Función pura sin aserciones inseguras ni acceso no verificado por índice.
 *
 * @param documentDigitsLiteral - Cadena numérica purificada del documento fiscal.
 * @param weightsCollection - Matriz inmutable de pesos posicionales para el cálculo.
 * @returns {boolean} Verdadero si el dígito verificador coincide con el estándar fiscal.
 */
const validateModulo11CheckDigitAction = (
  documentDigitsLiteral: string,
  weightsCollection: readonly number[],
): boolean => {
  let accumulatedWeightedSumNumeric = 0;

  for (let indexNumeric = 0; indexNumeric < weightsCollection.length; indexNumeric += 1) {
    const digitCharacterLiteral = documentDigitsLiteral.charAt(indexNumeric);
    const weightFactorNumeric = weightsCollection[indexNumeric];

    if (digitCharacterLiteral === '' || weightFactorNumeric === undefined) {
      return false;
    }

    accumulatedWeightedSumNumeric +=
      Number.parseInt(digitCharacterLiteral, 10) * weightFactorNumeric;
  }

  const moduloRemainderNumeric = accumulatedWeightedSumNumeric % 11;
  const expectedCheckDigitNumeric = moduloRemainderNumeric < 2 ? 0 : 11 - moduloRemainderNumeric;
  const actualCheckDigitCharacterLiteral = documentDigitsLiteral.charAt(weightsCollection.length);

  if (actualCheckDigitCharacterLiteral === '') {
    return false;
  }

  return Number.parseInt(actualCheckDigitCharacterLiteral, 10) === expectedCheckDigitNumeric;
};

/**
 * @name CitizenCpfSchema
 * @description Contrato de validación para Registro de Persona Física (CPF - 11 dígitos).
 */
export const CitizenCpfSchema = z
  .string()
  .trim()
  .length(11, 'CPF_INVALID_LENGTH')
  .regex(/^\d+$/, 'CPF_MUST_BE_NUMERIC')
  .refine(
    (brazilianCpfDocumentLiteral: string): boolean => {
      if (REPEATED_DIGITS_SEQUENCE_REGEX.test(brazilianCpfDocumentLiteral)) {
        return false;
      }

      const hasValidFirstCheckDigitBoolean = validateModulo11CheckDigitAction(
        brazilianCpfDocumentLiteral,
        CPF_FIRST_CHECK_DIGIT_WEIGHTS_COLLECTION,
      );

      const hasValidSecondCheckDigitBoolean = validateModulo11CheckDigitAction(
        brazilianCpfDocumentLiteral,
        CPF_SECOND_CHECK_DIGIT_WEIGHTS_COLLECTION,
      );

      return hasValidFirstCheckDigitBoolean && hasValidSecondCheckDigitBoolean;
    },
    { message: 'CPF_INVALID_DIGITS' },
  )
  .describe('Número de inscripción CPF validado con dígitos verificadores Módulo 11.');

export type TCitizenCpf = z.infer<typeof CitizenCpfSchema>;

/**
 * @name EnterpriseCnpjSchema
 * @description Contrato de validación para Registro Nacional de Persona Jurídica (CNPJ - 14 dígitos).
 */
export const EnterpriseCnpjSchema = z
  .string()
  .trim()
  .length(14, 'CNPJ_INVALID_LENGTH')
  .regex(/^\d+$/, 'CNPJ_MUST_BE_NUMERIC')
  .refine(
    (brazilianCnpjDocumentLiteral: string): boolean => {
      if (REPEATED_DIGITS_SEQUENCE_REGEX.test(brazilianCnpjDocumentLiteral)) {
        return false;
      }

      const hasValidFirstCheckDigitBoolean = validateModulo11CheckDigitAction(
        brazilianCnpjDocumentLiteral,
        CNPJ_FIRST_CHECK_DIGIT_WEIGHTS_COLLECTION,
      );

      const hasValidSecondCheckDigitBoolean = validateModulo11CheckDigitAction(
        brazilianCnpjDocumentLiteral,
        CNPJ_SECOND_CHECK_DIGIT_WEIGHTS_COLLECTION,
      );

      return hasValidFirstCheckDigitBoolean && hasValidSecondCheckDigitBoolean;
    },
    { message: 'CNPJ_INVALID_DIGITS' },
  )
  .describe('Número de inscripción CNPJ validado con dígitos verificadores Módulo 11.');

export type TEnterpriseCnpj = z.infer<typeof EnterpriseCnpjSchema>;
