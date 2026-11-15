/**
 * @file apps/content-manager-system/src/infrastructure/auth/ResolveCmsSessionSnapshot.ts
 * @section CMS Authentication - Server-Side Cookie Session Resolver
 * @description Verifica criptográficamente en el servidor la cookie `HttpOnly` (`payload-token`)
 * mediante `payload.auth({ headers, canSetHeaders: false })`, evalúa el rango institucional RBAC
 * contra `IDENTITY_ACCESS_ROLES_COLLECTION`, detecta el estado de bootstrap inicial (`totalDocs === 0`)
 * y emite telemetría SRE sin exponer PII bajo cumplimiento LGPD.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0031).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010, ISO/IEC 27001 y LGPD.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { headers as getIncomingRequestHeaders } from 'next/headers';
import { getPayload, type Payload } from 'payload';

import { IdentityAccessRoleSchema, type TIdentityAccessRole } from '@floripa-dignidade/contracts';
import { MapHttpErrorToException } from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
  ReportForensicException,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import payloadConfigurationReference from '../../payload.config';
import {
  CMS_AUTHORIZED_OPERATOR_ROLES_COLLECTION,
  CmsSessionSnapshotSchema,
  type ICmsSessionSnapshot,
} from './schemas/CmsSessionSnapshot.schema';

const SESSION_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'CMS_SERVER_SESSION_RESOLVER',
);

const SESSION_TRACE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'RESOLVE_CMS_HTTPONLY_SESSION',
);

const SESSION_VERIFIED_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'CMS_SESSION_VERIFICATION_COMPLETED',
);

const SESSION_FAILURE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'CMS_SESSION_RESOLUTION_FAULT',
);

const extractSafeStringProperty = (rawRecord: Record<string, unknown>, keyLiteral: string) => {
  const candidateValue = rawRecord[keyLiteral];
  return typeof candidateValue === 'string' && candidateValue.trim().length > 0
    ? candidateValue.trim()
    : null;
};

const evaluateAuthenticatedUserSession = (
  authenticatedUserRecord: Record<string, unknown>,
  correlationIdentifier: CorrelationIdentifier,
  verifiedAtTimestampISO: string,
): ICmsSessionSnapshot => {
  const rawRoleCandidate = authenticatedUserRecord['assignedAuthorityRoleLiteral'];
  const roleValidationResult = IdentityAccessRoleSchema.safeParse(rawRoleCandidate);
  const assignedAuthorityRoleLiteral: TIdentityAccessRole | null = roleValidationResult.success
    ? roleValidationResult.data
    : null;

  const isAuthorizedForAdminBoolean =
    assignedAuthorityRoleLiteral !== null &&
    CMS_AUTHORIZED_OPERATOR_ROLES_COLLECTION.includes(assignedAuthorityRoleLiteral);

  const rawIdentifierCandidate = authenticatedUserRecord['id'];
  const userIdentifierLiteral =
    rawIdentifierCandidate !== undefined && rawIdentifierCandidate !== null
      ? String(rawIdentifierCandidate)
      : 'UNKNOWN_USER';

  return CmsSessionSnapshotSchema.parse({
    sessionStatusLiteral: isAuthorizedForAdminBoolean
      ? 'AUTHENTICATED_OPERATOR'
      : 'INSUFFICIENT_AUTHORITY',
    isAuthenticatedBoolean: true,
    isAuthorizedForAdminBoolean,
    userIdentifierLiteral,
    assignedAuthorityRoleLiteral,
    operatorDisplayNameLiteral: extractSafeStringProperty(
      authenticatedUserRecord,
      'fullLegalNameLiteral',
    ),
    correlationIdentifier,
    verifiedAtTimestampISO,
  });
};

const evaluateUnauthenticatedVisitorState = async (
  payloadInstance: Payload,
  correlationIdentifier: CorrelationIdentifier,
  verifiedAtTimestampISO: string,
): Promise<ICmsSessionSnapshot> => {
  const { totalDocs } = await payloadInstance.count({
    collection: 'citizen-users',
    overrideAccess: true,
  });

  const isBootstrapRequiredBoolean = totalDocs === 0;

  return CmsSessionSnapshotSchema.parse({
    sessionStatusLiteral: isBootstrapRequiredBoolean
      ? 'BOOTSTRAP_REQUIRED'
      : 'UNAUTHENTICATED_VISITOR',
    isAuthenticatedBoolean: false,
    isAuthorizedForAdminBoolean: false,
    userIdentifierLiteral: null,
    assignedAuthorityRoleLiteral: null,
    operatorDisplayNameLiteral: null,
    correlationIdentifier,
    verifiedAtTimestampISO,
  });
};

const buildFailClosedSessionSnapshot = (
  correlationIdentifier: CorrelationIdentifier,
): ICmsSessionSnapshot =>
  CmsSessionSnapshotSchema.parse({
    sessionStatusLiteral: 'UNAUTHENTICATED_VISITOR',
    isAuthenticatedBoolean: false,
    isAuthorizedForAdminBoolean: false,
    userIdentifierLiteral: null,
    assignedAuthorityRoleLiteral: null,
    operatorDisplayNameLiteral: null,
    correlationIdentifier,
    verifiedAtTimestampISO: new Date().toISOString(),
  });

/**
 * Resuelve en el servidor el estado de autenticación por cookie `HttpOnly` para el CMS.
 * Ante cualquier fallo de base de datos o token inválido aplica política Fail-Closed.
 *
 * @returns {Promise<ICmsSessionSnapshot>} Snapshot certificado e inmutable de la sesión activa.
 */
export const ResolveCmsSessionSnapshot = async (): Promise<ICmsSessionSnapshot> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    SESSION_MODULE_IDENTIFIER,
    SESSION_TRACE_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<ICmsSessionSnapshot> => {
      try {
        const [requestHeadersSnapshot, payloadInstance] = await Promise.all([
          getIncomingRequestHeaders(),
          getPayload({ config: payloadConfigurationReference }),
        ]);

        const authResultSnapshot = await payloadInstance.auth({
          headers: requestHeadersSnapshot,
          canSetHeaders: false,
        });

        const verifiedAtTimestampISO = new Date().toISOString();
        const sessionSnapshot = authResultSnapshot.user
          ? evaluateAuthenticatedUserSession(
              authResultSnapshot.user as unknown as Record<string, unknown>,
              correlationIdentifier,
              verifiedAtTimestampISO,
            )
          : await evaluateUnauthenticatedVisitorState(
              payloadInstance,
              correlationIdentifier,
              verifiedAtTimestampISO,
            );

        void EmitTelemetrySignal({
          occurrenceTimestampISO: verifiedAtTimestampISO,
          severityLevelLiteral:
            sessionSnapshot.sessionStatusLiteral === 'INSUFFICIENT_AUTHORITY' ? 'WARNING' : 'INFO',
          moduleIdentifierLiteral: SESSION_MODULE_IDENTIFIER,
          operationCodeLiteral: SESSION_VERIFIED_OPERATION_CODE,
          correlationIdentifier,
          messageContentLiteral: `Verificación de sesión CMS resuelta: [${sessionSnapshot.sessionStatusLiteral}].`,
          semanticIntentTag: 'CMS_COOKIE_SESSION_AUDIT',
          contextMetadataSnapshot: Object.freeze({
            sessionStatusLiteral: sessionSnapshot.sessionStatusLiteral,
            isAuthenticatedBoolean: sessionSnapshot.isAuthenticatedBoolean,
            isAuthorizedForAdminBoolean: sessionSnapshot.isAuthorizedForAdminBoolean,
            ...(sessionSnapshot.userIdentifierLiteral !== null && {
              userIdentifierLiteral: sessionSnapshot.userIdentifierLiteral,
            }),
            ...(sessionSnapshot.assignedAuthorityRoleLiteral !== null && {
              assignedAuthorityRoleLiteral: sessionSnapshot.assignedAuthorityRoleLiteral,
            }),
          }),
        });

        return Object.freeze(sessionSnapshot);
      } catch (caughtExecutionError: unknown) {
        const errorDescriptionLiteral =
          caughtExecutionError instanceof Error
            ? caughtExecutionError.message
            : String(caughtExecutionError);

        const normalizedException = MapHttpErrorToException(500, 'CMS_SESSION_RESOLUTION_FAILED', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
        });

        ReportForensicException(normalizedException, correlationIdentifier);

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: SESSION_MODULE_IDENTIFIER,
          operationCodeLiteral: SESSION_FAILURE_OPERATION_CODE,
          correlationIdentifier,
          messageContentLiteral:
            'Fallo al verificar la cookie de sesión en el CMS; aplicando bloqueo Fail-Closed.',
          semanticIntentTag: 'CMS_SESSION_VERIFICATION_FAULT',
          contextMetadataSnapshot: Object.freeze({
            operationalErrorCodeLiteral: normalizedException.operationalErrorCodeLiteral,
          }),
        });

        return buildFailClosedSessionSnapshot(correlationIdentifier);
      }
    },
  );
};
