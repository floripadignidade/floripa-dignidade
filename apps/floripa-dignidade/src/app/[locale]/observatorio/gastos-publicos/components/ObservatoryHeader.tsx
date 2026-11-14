'use client';

/**
 * @section UI Atom - Observatory Header
 * @description Encabezado institucional del Observatorio de Gastos Públicos.
 * Orquesta el título localizado, la descripción de auditoría y el disparador
 * de exportación, delegando la validación estructural en `ObservatoryHeaderPropertiesSchema`
 * y la observabilidad SRE en `EmitObservatoryExportTelemetry`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 y W3C WCAG 2.2 AAA.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useCallback, useId } from 'react';
import { FileText, ShieldCheck } from 'lucide-react';

/* 1. Primitivos de Interfaz (Foundry Layer) */
import { GlobalActionButton } from '@floripa-dignidade/shared-ui-foundry';

/* 2. Contrato y Átomo de Telemetría Local (Clean Paths) */
import { EmitObservatoryExportTelemetry } from '../logic/EmitObservatoryExportTelemetry';
import {
  type IObservatoryHeaderProperties,
  ObservatoryHeaderPropertiesSchema,
} from '../schemas/ObservatoryHeader.schema';

export { type IObservatoryHeaderProperties, ObservatoryHeaderPropertiesSchema };

/**
 * Renderiza la cabecera semántica del observatorio con accesibilidad WCAG y telemetría SRE.
 *
 * @param propertiesSnapshot - Propiedades de contenido localizadas e inyectadas por el servidor.
 * @returns {React.JSX.Element} Encabezado HTML5 accesible, validado y auditado.
 */
export const ObservatoryHeader = (
  propertiesSnapshot: IObservatoryHeaderProperties,
): React.JSX.Element => {
  const { titleLiteral, descriptionLiteral, exportActionLabelLiteral, onExportAction } =
    ObservatoryHeaderPropertiesSchema.parse(propertiesSnapshot);

  const reactInstanceIdentifier = useId();
  const headingElementIdentifier = `observatory-header-title-${reactInstanceIdentifier}`;

  const handleExportAction = useCallback((): void => {
    EmitObservatoryExportTelemetry(exportActionLabelLiteral);
    onExportAction?.();
  }, [exportActionLabelLiteral, onExportAction]);

  return (
    <header
      className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 print:hidden animate-in fade-in slide-in-from-top-4 duration-700"
      aria-labelledby={headingElementIdentifier}
    >
      <div className="flex flex-col gap-2">
        <h1
          id={headingElementIdentifier}
          className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3 uppercase"
        >
          <ShieldCheck className="text-amber-500 w-8 h-8 md:w-10 md:h-10" aria-hidden="true" />
          <span>{titleLiteral}</span>
        </h1>
        <p className="text-slate-500 font-medium border-l-4 border-amber-500/30 pl-4 py-1">
          {descriptionLiteral}
        </p>
      </div>

      <div className="w-full md:w-auto flex gap-4">
        <GlobalActionButton
          visualIntentConfigurationLiteral="OUTLINE"
          actionIdentifierLiteral="EXPORT_OBSERVATORY_DATA"
          isPolymorphicBoolean={false}
          forensicTestIdentifier="OBSERVATORY_EXPORT_DATA_BUTTON"
          accessibilityConfiguration={{
            accessibilityLabelLiteral: exportActionLabelLiteral,
          }}
          externalClassName="bg-white w-full md:w-auto px-8"
          onClick={handleExportAction}
        >
          <FileText className="w-4 h-4" aria-hidden="true" />
          <span className="text-sm uppercase tracking-widest">{exportActionLabelLiteral}</span>
        </GlobalActionButton>
      </div>
    </header>
  );
};
