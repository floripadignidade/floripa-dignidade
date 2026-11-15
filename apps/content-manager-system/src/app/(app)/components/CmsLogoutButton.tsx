'use client';

/**
 * @file apps/content-manager-system/src/app/(app)/components/CmsLogoutButton.tsx
 * @section CMS UI Component - HttpOnly Cookie Logout Button (Atom)
 * @description Botón accesible encargado de invocar el cierre de sesión en el servidor
 * (`POST /api/citizen-users/logout` con cookies incluidas), invalidando la cookie `HttpOnly`
 * `payload-token`, refrescando el estado del servidor y emitiendo telemetría SRE sin PII.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0031).
 * Normas: ISO/IEC 11179, ISO/IEC 25010 y W3C WCAG 2.2 AAA.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useState } from 'react';

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
} from '@floripa-dignidade/telemetry';

const LOGOUT_MODULE_IDENTIFIER: ModuleIdentifier =
  ModuleIdentifierSchema.parse('CMS_LOGOUT_BUTTON_ATOM');

const LOGOUT_SUCCESS_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'CMS_SESSION_LOGOUT_COMPLETED',
);

const LOGOUT_FAILURE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'CMS_SESSION_LOGOUT_FAILED',
);

interface ICmsLogoutButtonProperties {
  readonly labelLiteral: string;
  readonly submittingLabelLiteral: string;
}

/**
 * Ejecuta el cierre de sesión seguro contra la API de Payload y fuerza revalidación de servidor.
 *
 * @param propertiesSnapshot - Literales localizados del botón y estado de envío.
 * @returns {React.ReactElement} Botón táctil accesible (mínimo 44x44px).
 */
export const CmsLogoutButton: React.FC<ICmsLogoutButtonProperties> = ({
  labelLiteral,
  submittingLabelLiteral,
}) => {
  const routerInstance = useRouter();
  const [isSubmittingBoolean, setIsSubmittingBoolean] = useState(false);

  const handleLogoutAction = useCallback(async (): Promise<void> => {
    if (isSubmittingBoolean) {
      return;
    }

    setIsSubmittingBoolean(true);
    const correlationIdentifier = GenerateCorrelationIdentifier();

    try {
      const logoutResponse = await fetch('/api/citizen-users/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!logoutResponse.ok) {
        throw new Error(`HTTP_${logoutResponse.status}`);
      }

      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: 'INFO',
        moduleIdentifierLiteral: LOGOUT_MODULE_IDENTIFIER,
        operationCodeLiteral: LOGOUT_SUCCESS_OPERATION_CODE,
        correlationIdentifier,
        messageContentLiteral: 'Sesión administrativa cerrada e invalidación de cookie completada.',
        semanticIntentTag: 'CMS_SESSION_LOGOUT',
      });

      routerInstance.refresh();
    } catch (caughtError: unknown) {
      const errorDescriptionLiteral =
        caughtError instanceof Error ? caughtError.message : String(caughtError);

      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: 'WARNING',
        moduleIdentifierLiteral: LOGOUT_MODULE_IDENTIFIER,
        operationCodeLiteral: LOGOUT_FAILURE_OPERATION_CODE,
        correlationIdentifier,
        messageContentLiteral: `Error al cerrar sesión en el CMS: ${errorDescriptionLiteral}`,
        semanticIntentTag: 'CMS_LOGOUT_FAULT',
      });
    } finally {
      setIsSubmittingBoolean(false);
    }
  }, [isSubmittingBoolean, routerInstance]);

  return (
    <button
      type="button"
      onClick={() => void handleLogoutAction()}
      disabled={isSubmittingBoolean}
      aria-busy={isSubmittingBoolean}
      className="cms-btn-secondary"
    >
      <LogOut size={18} aria-hidden="true" />
      <span>{isSubmittingBoolean ? submittingLabelLiteral : labelLiteral}</span>
    </button>
  );
};
