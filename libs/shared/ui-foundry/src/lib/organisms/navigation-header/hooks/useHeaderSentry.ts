/**
 * @section UI Logic - Header Sentry Hook
 * @description Orquestador sensorial encargado de monitorear el scroll del
 * hardware y gestionar la visibilidad del menú móvil.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE.
 */

import { useState, useEffect, useCallback } from 'react';
import { EmitTelemetrySignal, GenerateCorrelationIdentifier } from '@floripa-dignidade/telemetry';

export const useHeaderSentry = (moduleIdentifier: string) => {
  const [isMobileMenuOpenBoolean, setIsMobileMenuOpenBoolean] = useState(false);
  const [isScrollThresholdExceededBoolean, setIsScrollThresholdExceededBoolean] = useState(false);

  useEffect(() => {
    const correlationIdentifier = GenerateCorrelationIdentifier();

    const handleWindowScrollAction = () => {
      setIsScrollThresholdExceededBoolean(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleWindowScrollAction, { passive: true });

    void EmitTelemetrySignal({
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: moduleIdentifier,
      operationCodeLiteral: 'HEADER_SENSORS_ACTIVE',
      correlationIdentifier,
      messageContentLiteral: 'Sensores de scroll y visibilidad inicializados.',
    });

    return () => window.removeEventListener('scroll', handleWindowScrollAction);
  }, [moduleIdentifier]);

  const toggleMobileMenuAction = useCallback(() => {
    setIsMobileMenuOpenBoolean((previous) => !previous);
  }, []);

  return {
    isMobileMenuOpenBoolean,
    isScrollThresholdExceededBoolean,
    toggleMobileMenuAction
  };
};
