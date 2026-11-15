/**
 * @section Security Contingency Logic - Deferred Security Alert Dispatcher (Atom)
 * @description Átomo encargado de registrar inmediatamente la alerta forense ante
 * exposiciones de la ruta `/unauthorized` (`MapHttpErrorToException(403)` +
 * `ReportForensicException` + `EmitTelemetrySignal`), dejando etiquetado el punto de
 * extensión hacia los sistemas pendientes de fase posterior (`@floripa-dignidade/messaging-engine`
 * -> `DispatchSystemNotification` tras migración `02_ecosystem_operational_ledgers.sql`,
 * y flujo OIDC `gov.br` Login Único).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179, ISO/IEC 25010, ISO/IEC 27001 y LGPD (Lei 13.709/2018).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { TSupportedLocale } from '@floripa-dignidade/contracts';
import { MapHttpErrorToException } from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  EmitTelemetrySignal,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
  ReportForensicException,
} from '@floripa-dignidade/telemetry';

const SECURITY_ALERT_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'UNAUTHORIZED_ACCESS_SECURITY_ALERT_DISPATCHER',
);

const SECURITY_ALERT_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'UNAUTHORIZED_ACCESS_SECURITY_ALERT',
);

/**
 * @interface IDispatchUnauthorizedSecurityAlertParameters
 * @description Contexto anonimizado e inmutable para emitir la alerta de seguridad RBAC.
 */
export interface IDispatchUnauthorizedSecurityAlertParameters {
  readonly localeCodeLiteral: TSupportedLocale;
  readonly correlationIdentifier: CorrelationIdentifier;
  readonly originTraceIdentifier: string | null;
  readonly originRouteLiteral: string | null;
}

/**
 * Emite la alerta forense inmediata y deja marcada la integración diferida con
 * el sistema de notificaciones de gobernanza y la verificación `gov.br`.
 *
 * @future_integration
 * Fase 3 + Fase 5: Invocar `DispatchSystemNotification` hacia `PLATFORM_GLOBAL_MANAGER`
 * una vez aprovisionada `system_notifications_ledger` y activa la sesión OIDC `gov.br`.
 *
 * @param parametersSnapshot - Idioma, correlación distribuida y metadatos opacos de origen.
 */
export const DispatchUnauthorizedAccessSecurityAlert = (
  parametersSnapshot: IDispatchUnauthorizedSecurityAlertParameters,
): void => {
  const { localeCodeLiteral, correlationIdentifier, originTraceIdentifier, originRouteLiteral } =
    parametersSnapshot;

  const securityException = MapHttpErrorToException(403, 'RBAC_UNAUTHORIZED_PAGE_ACCESSED', {
    localeCodeLiteral,
    ...(originRouteLiteral !== null && { originRouteLiteral }),
    ...(originTraceIdentifier !== null && { originTraceIdentifier }),
    isNotificationPipelinePendingBoolean: true,
    correlationIdentifier,
  });

  ReportForensicException(securityException, correlationIdentifier);

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'WARNING',
    moduleIdentifierLiteral: SECURITY_ALERT_MODULE_IDENTIFIER,
    operationCodeLiteral: SECURITY_ALERT_OPERATION_CODE,
    correlationIdentifier,
    messageContentLiteral: `Alerta RBAC registrada en [${localeCodeLiteral}]; despacho a panel de gobernanza y flujo gov.br diferido a Fase 3/5.`,
    semanticIntentTag: 'SECURITY_RBAC_ALERT_PENDING_DISPATCH',
    contextMetadataSnapshot: Object.freeze({
      localeCodeLiteral,
      httpStatusCodeNumeric: 403,
      isNotificationPipelinePendingBoolean: true,
      futureTargetSystemsCollection: Object.freeze([
        'MESSAGING_ENGINE_SYSTEM_NOTIFICATION',
        'GOV_BR_OIDC_IDENTITY_UPGRADE',
      ]),
      ...(originRouteLiteral !== null && { originRouteLiteral }),
      ...(originTraceIdentifier !== null && { originTraceIdentifier }),
    }),
  });
};
