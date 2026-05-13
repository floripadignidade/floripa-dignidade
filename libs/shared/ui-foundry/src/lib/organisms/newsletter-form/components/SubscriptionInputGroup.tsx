'use client';

/**
 * @section Shared UI Foundry - Subscription Input Group (Atom)
 * @description Aparato especializado en la captura física del identificador de
 * comunicación ciudadana. Fusiona el campo de entrada táctil con el disparador
 * de conversión en una unidad atómica resiliente.
 *
 * Protocolo OEDP-V17.0 - High Performance UI & SRE Resilience.
 * SANEADO Zenith: Resolución de TS2741 (Polymorphism), rastro de telemetría de
 * interacción física y cumplimiento estricto de Prosa ISO (Zero Abbreviations).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useCallback, useMemo } from 'react';
import { Mail } from 'lucide-react';
import type { UseFormRegisterReturn } from 'react-hook-form';

/* 1. Infraestructura Core y Utilidades (Sovereign Swarm) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
} from '@floripa-dignidade/telemetry';

import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';

/* 2. Átomos de Interacción (Internal Library Boundary) */
/** 🛡️ SANEADO Zenith: Inyección de extensión '.js' para resolución Node16/Next16. */
import { GlobalActionButton } from '../../../atoms/GlobalActionButton.js';

/**
 * @interface ISubscriptionInputGroupProperties
 * @description Contrato inmutable para la parametrización de la entrada de datos.
 * Sigue la norma ISO 11179 de Objeto + Propiedad + Representación.
 */
interface ISubscriptionInputGroupProperties {
  /** Referencia de registro de react-hook-form para el campo de comunicación. */
  readonly register: UseFormRegisterReturn;
  /** Indica si existe una transacción de red en curso. */
  readonly isExecutingBoolean: boolean;
  /** Indica si la aduana de ADN detectó violaciones de formato. */
  readonly hasErrorBoolean: boolean;
  /** Texto de sugerencia localizado para el hardware de entrada. */
  readonly placeholderLiteral: string;
  /** Etiqueta visual para el disparador de acción. */
  readonly buttonLabelLiteral: string;
  /** Define el modo de visualización compacto (ej: Mobile vs Desktop Hero). */
  readonly isMinimalVariantBoolean: boolean;
}

/** Identificador técnico del aparato para el Neural Sentinel. */
const ATOM_IDENTIFIER = 'SUBSCRIPTION_INPUT_GROUP_ATOM';

/**
 * Aparato encargado de la interacción primaria en el embudo de captación.
 */
export const SubscriptionInputGroup: React.FC<ISubscriptionInputGroupProperties> = ({
  register,
  isExecutingBoolean,
  hasErrorBoolean,
  placeholderLiteral,
  buttonLabelLiteral,
  isMinimalVariantBoolean,
}) => {

  /**
   * @section Gestión de Telemetría Sensorial
   * Registra el inicio de interacción con el campo para análisis de fricción.
   */
  const handleInputFocusAction = useCallback(() => {
    void EmitTelemetrySignal({
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: ATOM_IDENTIFIER,
      operationCodeLiteral: 'INPUT_FIELD_FOCUSED',
      correlationIdentifier: GenerateCorrelationIdentifier(),
      messageContentLiteral: 'Ciudadano inició interacción con el campo de email.',
      semanticIntentTag: 'UI_INTERACTION_START'
    });
  }, []);

  /**
   * @section Arquitectura de Estilos (Atomic Performance)
   * 🛡️ LEY SRE: Memoizamos la composición de clases para proteger el Main Thread
   * durante las ráfagas de validación síncrona de React Hook Form.
   */
  const containerStylesLiteral = useMemo(() =>
    GlobalStyleClassMerger(
      'relative flex flex-col sm:flex-row gap-4 w-full transition-all duration-500',
      isMinimalVariantBoolean ? 'max-w-md' : 'max-w-2xl',
    ),
    [isMinimalVariantBoolean]
  );

  const inputStylesLiteral = useMemo(() =>
    GlobalStyleClassMerger(
      'w-full bg-slate-50 border-2 rounded-2xl font-bold transition-all duration-300 outline-none',
      isMinimalVariantBoolean ? 'py-3.5 pl-12 pr-4 text-sm' : 'py-5 pl-14 pr-6 text-base',
      hasErrorBoolean
        ? 'border-red-100 bg-red-50/30 text-red-900 placeholder:text-red-300 focus:border-red-300'
        : 'border-slate-100 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:shadow-2xl focus:shadow-amber-500/5',
    ),
    [isMinimalVariantBoolean, hasErrorBoolean]
  );

  return (
    <div className={containerStylesLiteral}>

      {/* 1. COMPONENTE SENSORIAL (Input Field Swarm) */}
      <div className="relative flex-grow group">
        <div
          className={GlobalStyleClassMerger(
            'absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 pointer-events-none',
            hasErrorBoolean ? 'text-red-400' : 'text-slate-300 group-focus-within:text-amber-500',
          )}
          aria-hidden="true"
        >
          <Mail size={isMinimalVariantBoolean ? 18 : 22} />
        </div>

        <input
          {...register}
          type="email"
          autoComplete="email"
          disabled={isExecutingBoolean}
          placeholder={placeholderLiteral}
          onFocus={handleInputFocusAction}
          aria-invalid={hasErrorBoolean}
          className={inputStylesLiteral}
        />
      </div>

      {/* 2. DISPARADOR DE ACCIÓN (Global Conversion Trigger) */}
      <GlobalActionButton
        type="submit"
        visualIntentConfigurationLiteral="CONVERSION"
        isExecutionLoadingBoolean={isExecutingBoolean}
        /** 🛡️ SANEADO Zenith (Fix TS2741): Inyección de propiedad mandatoria. */
        isPolymorphicBoolean={false}
        actionIdentifierLiteral="NEWSLETTER_CONVERSION_SUBMIT"
        className={GlobalStyleClassMerger(
          'sm:w-auto font-black uppercase tracking-widest px-10',
          isMinimalVariantBoolean ? 'py-3.5 text-xs' : 'py-5 text-sm',
        )}
      >
        <span>{buttonLabelLiteral}</span>
      </GlobalActionButton>

    </div>
  );
};
