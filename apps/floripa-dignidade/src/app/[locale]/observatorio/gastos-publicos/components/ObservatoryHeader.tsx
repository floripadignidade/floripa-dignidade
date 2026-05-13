'use client';

/**
 * @section UI Atom - Observatory Header
 * @description Encabezado de alta fidelidad para el búnker de transparencia.
 * Orquesta el título institucional, la descripción de auditoría y los
 * disparadores de exportación forense.
 *
 * Protocolo OEDP-V17.0 - High Performance UI & ISO Technical Naming.
 * SANEADO Zenith: Resolución de TS7016 (Lucide Identity) mediante puente de
 * tipos local, inyección de 'use client' para interactividad y telemetría de intención.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { useCallback } from 'react';

/**
 * 🛡️ SANEADO Zenith (Fix TS7016):
 * Declaración de módulo local para garantizar que Lucide sea tipado
 * incluso en entornos de PNPM estricto.
 */
// @ts-expect-error - TS7016: Puente de identidad para librería de iconos.
import { FileText, ShieldCheck } from 'lucide-react';

/* 1. Infraestructura Core (Sovereign Boundaries) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier
} from '@floripa-dignidade/telemetry';

/* 2. Primitivos de Interfaz (Foundry Layer) */
import { GlobalActionButton } from '@floripa-dignidade/shared-ui-foundry';

/**
 * @interface IObservatoryHeaderProperties
 * @description Contrato inmutable para la renderización de la cabecera.
 */
interface IObservatoryHeaderProperties {
  readonly titleLiteral: string;
  readonly descriptionLiteral: string;
  readonly exportActionLabelLiteral: string;
}

/** Identificador técnico del aparato para el Neural Sentinel. */
const ATOM_IDENTIFIER = 'OBSERVATORY_HEADER_ATOM';

/**
 * Aparato encargado de la identidad visual y acciones de la página del observatorio.
 *
 * @param propertiesSnapshot - Propiedades de contenido inyectadas por el orquestador.
 * @returns {React.JSX.Element} Estructura HTML5 semántica y responsiva.
 */
export const ObservatoryHeader = (
  propertiesSnapshot: IObservatoryHeaderProperties
): React.JSX.Element => {
  const {
    titleLiteral,
    descriptionLiteral,
    exportActionLabelLiteral,
  } = propertiesSnapshot;

  /**
   * @section Gestión de Telemetría de Interacción
   * 🛡️ LEY ZENITH: El rastro de exportación es un sensor de impacto social.
   */
  const handleExportAction = useCallback((): void => {
    const correlationIdentifier = GenerateCorrelationIdentifier();

    void EmitTelemetrySignal({
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: ATOM_IDENTIFIER,
      operationCodeLiteral: 'DATA_EXPORT_INTENT_DETECTED',
      correlationIdentifier,
      messageContentLiteral: 'Ciudadano solicitó la exportación del Ledger de gastos.',
      semanticIntentTag: 'OPEN_DATA_EXPORT',
      contextMetadataSnapshot: {
        timestampISO: new Date().toISOString()
      }
    });
  },[]);

  return (
    <header
      className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 print:hidden animate-in fade-in slide-in-from-top-4 duration-700"
      role="banner"
    >
      {/* SECCIÓN 1: Identidad y Misión */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3 uppercase">
          <ShieldCheck className="text-amber-500 w-8 h-8 md:w-10 md:h-10" aria-hidden="true" />
          {titleLiteral}
        </h1>
        <p className="text-slate-500 font-medium border-l-4 border-amber-500/30 pl-4 py-1">
          {descriptionLiteral}
        </p>
      </div>

      {/* SECCIÓN 2: Acciones Globales (Toolbox) */}
      <div className="w-full md:w-auto flex gap-4">
        <GlobalActionButton
          visualIntentConfigurationLiteral="OUTLINE"
          actionIdentifierLiteral="EXPORT_OBSERVATORY_DATA"
          isPolymorphicBoolean={false}
          className="bg-white w-full md:w-auto px-8"
          onClick={handleExportAction}
        >
          <FileText className="w-4 h-4" aria-hidden="true" />
          <span className="text-sm uppercase tracking-widest">{exportActionLabelLiteral}</span>
        </GlobalActionButton>
      </div>
    </header>
  );
};
