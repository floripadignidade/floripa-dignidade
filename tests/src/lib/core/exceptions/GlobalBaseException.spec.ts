/**
 * @section Quality Assurance - GlobalBaseException Unit Specification
 * @description Valida la integridad estructural, la captura de metadatos inmutables,
 * el sellado de memoria y el cumplimiento del contrato Zod de `GlobalBaseException`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Mirror Testing & ISO/IEC 25010).
 * Normas: ISO/IEC 11179 (Nomenclatura Técnica) e ISO/IEC 25010 (Confiabilidad y Seguridad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  type ErrorCode,
  ErrorCodeSchema,
  ExceptionContractSchema,
  GlobalBaseException,
} from '@floripa-dignidade/exceptions';

/**
 * Implementación concreta auxiliar para verificar el comportamiento de la clase
 * abstracta `GlobalBaseException` bajo condiciones controladas de prueba.
 */
class TestableException extends GlobalBaseException {
  /**
   * Inicializa una excepción de prueba con código nominal validado por contrato Zod.
   *
   * @param messageLiteral - Descripción técnica del fallo simulado.
   * @param operationalErrorCodeLiteral - Código nominal validado mediante `ErrorCodeSchema`.
   * @param httpStatusCodeNumeric - Código de estado HTTP RFC 9110 asociado.
   * @param runtimeContextSnapshotSource - Metadatos contextuales adicionales para el snapshot.
   */
  public constructor(
    messageLiteral: string,
    operationalErrorCodeLiteral: ErrorCode = ErrorCodeSchema.parse('INTERNAL_SYSTEM_FAILURE'),
    httpStatusCodeNumeric = 500,
    runtimeContextSnapshotSource: Record<string, unknown> = {},
  ) {
    super(
      messageLiteral,
      operationalErrorCodeLiteral,
      httpStatusCodeNumeric,
      runtimeContextSnapshotSource,
    );
  }
}

describe('GlobalBaseException', () => {
  it('debe inicializar identidad, mensaje, marca temporal ISO 8601 y traza de pila', () => {
    const errorMessageLiteral = 'ERROR_DE_PRUEBA_TECNICA';
    const exceptionInstance = new TestableException(errorMessageLiteral);

    expect(exceptionInstance).toBeInstanceOf(Error);
    expect(exceptionInstance).toBeInstanceOf(GlobalBaseException);
    expect(exceptionInstance.name).toBe('TestableException');
    expect(exceptionInstance.message).toBe(errorMessageLiteral);
    expect(exceptionInstance.httpStatusCodeNumeric).toBe(500);
    expect(exceptionInstance.operationalErrorCodeLiteral).toBe('INTERNAL_SYSTEM_FAILURE');
    expect(Number.isNaN(Date.parse(exceptionInstance.occurrenceTimestampISO))).toBe(false);
    expect(typeof exceptionInstance.stack).toBe('string');
  });

  it('debe cumplir íntegramente con el contrato ExceptionContractSchema', () => {
    const validationCodeLiteral = ErrorCodeSchema.parse('VALIDATION_FAILED');
    const exceptionInstance = new TestableException(
      'FALLO_DE_CONTRATO_ESPERADO',
      validationCodeLiteral,
      400,
    );

    const contractValidationResult = ExceptionContractSchema.safeParse({
      operationalErrorCodeLiteral: exceptionInstance.operationalErrorCodeLiteral,
      httpStatusCodeNumeric: exceptionInstance.httpStatusCodeNumeric,
      occurrenceTimestampISO: exceptionInstance.occurrenceTimestampISO,
      runtimeContextSnapshot: exceptionInstance.runtimeContextSnapshot,
    });

    expect(contractValidationResult.success).toBe(true);
  });

  it('debe sellar físicamente el snapshot de ejecución para impedir mutaciones en runtime', () => {
    const exceptionInstance = new TestableException('ERROR_DE_INMUTABILIDAD');
    const { runtimeContextSnapshot } = exceptionInstance;

    expect(Object.isFrozen(runtimeContextSnapshot)).toBe(true);
    expect(runtimeContextSnapshot['exceptionIdentifierLiteral']).toBe('TestableException');
    expect(runtimeContextSnapshot['httpStatusCodeNumeric']).toBe(500);
    expect(runtimeContextSnapshot['operationalErrorCodeLiteral']).toBe('INTERNAL_SYSTEM_FAILURE');

    expect(() => {
      Object.defineProperty(runtimeContextSnapshot, 'injectedPropertyLiteral', {
        value: 'MUTATED_VALUE',
      });
    }).toThrow(TypeError);
  });

  it('debe preservar metadatos adicionales y proteger las claves reservadas del núcleo', () => {
    const correlationIdentifierLiteral = '00000000-0000-4000-8000-000000000001';
    const exceptionInstance = new TestableException(
      'ERROR_CON_CONTEXTO_ENRIQUECIDO',
      ErrorCodeSchema.parse('EXTERNAL_SERVICE_TIMEOUT'),
      504,
      {
        correlationIdentifier: correlationIdentifierLiteral,
        httpStatusCodeNumeric: 200,
        operationalErrorCodeLiteral: 'OVERRIDE_ATTEMPT',
      },
    );

    expect(exceptionInstance.runtimeContextSnapshot['correlationIdentifier']).toBe(
      correlationIdentifierLiteral,
    );
    expect(exceptionInstance.runtimeContextSnapshot['httpStatusCodeNumeric']).toBe(504);
    expect(exceptionInstance.runtimeContextSnapshot['operationalErrorCodeLiteral']).toBe(
      'EXTERNAL_SERVICE_TIMEOUT',
    );
  });
});
