'use client';

/**
 * @section Shared UI Foundry - Newsletter Infrastructure Alert (Atom)
 * @description Átomo encargado exclusivamente de reportar visualmente fallos en el
 * Tier de Datos o errores de red durante el embudo de captación. Implementa
 * accesibilidad WAI-ARIA (role="alert") y rastro telemétrico de exposición de error.
 *
 * Protocolo OEDP-V17.0 - High Performance UI & SRE Resilience.
 * SANEADO Zenith: Corrección de orden alfabético en importaciones (sort-imports),
 * inyección de Motion Design, telemetría forense y cumplimiento de Rutas Limpias.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
/** 🛡️ SANEADO Zenith: Ordenamiento alfabético estricto (A < m) para sanar el Linter. */
import { AnimatePresence, motion } from 'framer-motion';

/* 1. Infraestructura Core (Atmos PascalCase - Clean Paths) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
} from '@floripa-dignidade/telemetry';

/** Identificador técnico del aparato para el Neural Sentinel. */
const ATOM_IDENTIFIER = 'NEWSLETTER_INFRASTRUCTURE_ALERT_ATOM';

/**
 * @interface INewsletterInfrastructureAlertProperties
 * @description Contrato inmutable para la visualización de fallos técnicos.
 * Sigue la norma ISO 11179 de Objeto + Propiedad + Representación.
 */
interface INewsletterInfrastructureAlertProperties {
  /** Literal descriptivo del error capturado por el orquestador o gateway. */
  readonly errorLiteral: string | null;
}

/**
 * Aparato encargado de la señalética visual de resiliencia.
 * Implementa una secuencia de entrada suave para mitigar la carga cognitiva del fallo.
 *
 * @param propertiesSnapshot - Snapshot conteniendo el rastro del error.
 * @returns {React.ReactElement} Bloque de alerta animado y auditado.
 */
export const NewsletterInfrastructureAlert: React.FC<INewsletterInfrastructureAlertProperties> = ({
  errorLiteral,
}) => {
  /**
   * @section Gestión de Telemetría de Exposición
   * 🛡️ LEY ZENITH: Si un error es mostrado físicamente al usuario, el sistema debe
   * auditar la frustración del ciudadano vinculada a la latencia o el colapso.
   */
  useEffect(() => {
    if (!errorLiteral) return;

    const correlationIdentifier = GenerateCorrelationIdentifier();

    void EmitTelemetrySignal({
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: ATOM_IDENTIFIER,
      operationCodeLiteral: 'INFRASTRUCTURE_ERROR_DISPLAYED',
      correlationIdentifier,
      messageContentLiteral: `Feedback de error presentado al ciudadano: [${errorLiteral}]`,
      semanticIntentTag: 'UI_ERROR_VISIBILITY',
      contextMetadataSnapshot: {
        errorDescriptionLiteral: errorLiteral,
        timestampISO: new Date().toISOString()
      }
    });
  }, [errorLiteral]);

  return (
    <AnimatePresence mode="wait">
      {errorLiteral && (
        <motion.div
          key="infrastructure-alert"
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex items-center gap-4 p-5 text-sm text-red-700 bg-red-50 rounded-2xl border border-red-100 shadow-sm"
          role="alert"
          aria-live="assertive"
        >
          {/* ICONOGRAFÍA DE ALERTA (SRE Logic) */}
          <div className="flex-shrink-0 text-red-500">
            <AlertCircle size={20} strokeWidth={2.5} aria-hidden="true" />
          </div>

          {/* CUERPO DEL MENSAJE (ISO Prosa) */}
          <span className="font-bold uppercase tracking-tight leading-tight">
            {errorLiteral}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
