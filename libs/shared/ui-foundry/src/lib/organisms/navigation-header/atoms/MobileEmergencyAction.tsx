'use client';

/**
 * @section Shared UI Foundry - Mobile Emergency Action (Atom)
 * @description Átomo de alta jerarquía visual diseñado para el acceso inmediato
 * al canal de denuncias ciudadanas. Implementa rastro telemétrico de conversión
 * de impacto y accesibilidad reforzada para situaciones de crisis.
 *
 * Protocolo OEDP-V17.0 - High Performance UI & SRE Resilience.
 * SANEADO Zenith: Aislamiento funcional, validación de ADN mediante Zod,
 * cumplimiento de Prosa ISO y telemetría de Derechos Humanos.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useCallback } from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { z } from 'zod';

/* 1. Infraestructura Core (Atmos PascalCase - Clean Paths) */
import { EmitTelemetrySignal, GenerateCorrelationIdentifier } from '@floripa-dignidade/telemetry';

/**
 * @section Aduana de ADN (Prop Validation)
 */
const MobileEmergencyActionPropertiesSchema = z
  .object({
    /** Etiqueta localizada para la acción (ej: "DENÚNCIA URGENTE"). */
    labelLiteral: z.string().min(1),
    /** Identificador forense para el rastro telemétrico. */
    actionIdentifierLiteral: z.string().default('MOBILE_EMERGENCY_TRIGGER'),
  })
  .readonly();

export type IMobileEmergencyActionProperties = z.infer<
  typeof MobileEmergencyActionPropertiesSchema
>;

/** Identificador técnico del aparato para el Neural Sentinel. */
const ATOM_IDENTIFIER = 'MOBILE_EMERGENCY_ACTION_ATOM';

/**
 * Aparato encargado de la señalética de auxilio y conversión en el entorno móvil.
 *
 * @param propertiesSnapshot - Snapshot de configuración inyectado por el orquestador.
 * @returns {React.ReactElement} Botón de emergencia táctil y auditado.
 */
export const MobileEmergencyAction: React.FC<IMobileEmergencyActionProperties> = (
  propertiesSnapshot,
) => {
  // 1. ADUANA DE ADN: Purificación de entrada
  const { labelLiteral, actionIdentifierLiteral } =
    MobileEmergencyActionPropertiesSchema.parse(propertiesSnapshot);

  /**
   * @section Gestión de Telemetría de Conversión
   * 🛡️ LEY ZENITH: La activación de este canal es un evento de alta saliencia.
   * Se utiliza el tag 'HUMAN_RIGHTS_CONVERSION' para el triaje de la IA.
   */
  const handleEmergencyTriggerAction = useCallback((): void => {
    const correlationIdentifier = GenerateCorrelationIdentifier();

    void EmitTelemetrySignal({
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: ATOM_IDENTIFIER,
      operationCodeLiteral: 'EMERGENCY_CHANNEL_ACTIVATED',
      correlationIdentifier,
      messageContentLiteral: `Ciudadano activó el búnker de denuncias desde el menú móvil: [${labelLiteral}].`,
      semanticIntentTag: 'HUMAN_RIGHTS_CONVERSION',
      contextMetadataSnapshot: {
        actionId: actionIdentifierLiteral,
        timestampISO: new Date().toISOString(),
      },
    });
  }, [labelLiteral, actionIdentifierLiteral]);

  return (
    <Link
      href="/denuncia"
      onClick={handleEmergencyTriggerAction}
      className="mt-4 flex items-center justify-between p-5 rounded-2xl bg-red-50 text-red-700 border border-red-100 active:scale-95 transition-all group touch-target-min"
      aria-label={labelLiteral}
      role="button"
    >
      <div className="flex items-center gap-4">
        <ShieldCheck
          size={24}
          className="group-hover:animate-pulse transition-transform group-hover:scale-110"
          aria-hidden="true"
        />
        <span className="font-black text-sm uppercase tracking-wider">{labelLiteral}</span>
      </div>
    </Link>
  );
};
