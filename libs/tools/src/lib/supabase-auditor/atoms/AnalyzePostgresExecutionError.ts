/**
 * @file libs/tools/src/lib/supabase-auditor/atoms/AnalyzePostgresExecutionError.ts
 * @section Supabase Auditor - PostgreSQL Error Classifier (Atom)
 * @description Átomo de lógica pura encargado de inspeccionar fallos de conexión o
 * autenticación de `pg`, clasificar el estado SRE y validar el resultado con Zod.
 *
 * Protocolo OEDP-V18.1 | ISO/IEC 11179, ISO/IEC 25010 e ISO/IEC 27001.
 */

import { z } from 'zod';

const AUTH_FAILURE_POSTGRES_CODES_SET: ReadonlySet<string> = new Set(['28P01', '28000']);
const POOLER_SATURATION_POSTGRES_CODES_SET: ReadonlySet<string> = new Set(['53300', '53400']);

/**
 * @name PostgresErrorAnalysisSchema
 * @description Aduana Zod inmutable para el veredicto de error SQL/TCP de PostgreSQL.
 */
export const PostgresErrorAnalysisSchema = z
  .object({
    statusLiteral: z.enum(['AUTHENTICATION_FAILED', 'UNREACHABLE']),
    httpStatusCodeNumeric: z.number().int().min(400).max(599),
    diagnosticMessageLiteral: z.string().min(1),
    remediationHintLiteral: z.string().min(1),
    errorCodeLiteral: z.string().min(1),
  })
  .readonly();

export type IPostgresErrorAnalysis = z.infer<typeof PostgresErrorAnalysisSchema>;

const extractPostgresErrorCodeLiteral = (caughtExecutionError: unknown): string => {
  if (
    typeof caughtExecutionError === 'object' &&
    caughtExecutionError !== null &&
    'code' in caughtExecutionError
  ) {
    const rawCodeValue = (caughtExecutionError as { readonly code: unknown }).code;
    if (typeof rawCodeValue === 'string' && rawCodeValue.trim().length > 0) {
      return rawCodeValue.trim();
    }
  }

  return 'UNKNOWN_ERROR';
};

/**
 * Clasifica de forma determinista una excepción capturada durante el handshake SQL.
 *
 * @param caughtExecutionError - Error capturado por `pg.Client` en conexión o consulta.
 * @returns {IPostgresErrorAnalysis} Diagnóstico validado contra `PostgresErrorAnalysisSchema`.
 */
export const AnalyzePostgresExecutionError = (
  caughtExecutionError: unknown,
): IPostgresErrorAnalysis => {
  const errorMessageLiteral =
    caughtExecutionError instanceof Error
      ? caughtExecutionError.message
      : String(caughtExecutionError);
  const postgresErrorCodeLiteral = extractPostgresErrorCodeLiteral(caughtExecutionError);

  const isAuthenticationFailureBoolean =
    AUTH_FAILURE_POSTGRES_CODES_SET.has(postgresErrorCodeLiteral) ||
    errorMessageLiteral.includes('password authentication');

  if (isAuthenticationFailureBoolean) {
    return Object.freeze(
      PostgresErrorAnalysisSchema.parse({
        statusLiteral: 'AUTHENTICATION_FAILED',
        httpStatusCodeNumeric: 401,
        diagnosticMessageLiteral: `Autenticación SQL rechazada: ${errorMessageLiteral}`,
        remediationHintLiteral:
          'Verificar contraseña del usuario postgres/pooler en Supabase Settings > Database.',
        errorCodeLiteral: postgresErrorCodeLiteral,
      }),
    );
  }

  const isPoolerSaturatedBoolean =
    POOLER_SATURATION_POSTGRES_CODES_SET.has(postgresErrorCodeLiteral);

  return Object.freeze(
    PostgresErrorAnalysisSchema.parse({
      statusLiteral: 'UNREACHABLE',
      httpStatusCodeNumeric: 503,
      diagnosticMessageLiteral: `Incapaz de alcanzar socket PostgreSQL: ${errorMessageLiteral}`,
      remediationHintLiteral: isPoolerSaturatedBoolean
        ? 'Pooler PostgreSQL saturado; reducir conexiones simultáneas o usar puerto 6543.'
        : 'Verificar conectividad de red, puerto (5432 o 6543 pooler) y estado en Supabase.',
      errorCodeLiteral: postgresErrorCodeLiteral,
    }),
  );
};
