'use client';

/**
 * @section UI Atom - Subscription Input Group
 * @description Aparato encargado de la captura física del identificador de
 * comunicación (Email). Fusiona el campo de texto y el botón de acción
 * en una unidad atómica con soporte para variantes visuales.
 *
 * Protocolo OEDP-V17.0 - High Performance UI & Form Integrity.
 * SANEADO Zenith: Materialización inicial con soporte para React Hook Form y variantes.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';
import { Mail } from 'lucide-react';
import type { UseFormRegisterReturn } from 'react-hook-form';

/* 1. Infraestructura de Utilidades y Primitivos */
import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';
import { GlobalActionButton } from '../../../atoms/GlobalActionButton';

/**
 * @interface ISubscriptionInputGroupProperties
 * @description Contrato inmutable para la configuración de la entrada de datos.
 */
interface ISubscriptionInputGroupProperties {
  /** Referencia de registro de react-hook-form. */
  readonly register: UseFormRegisterReturn;
  /** Estado de ejecución asíncrona en curso. */
  readonly isExecutingBoolean: boolean;
  /** Indica si la aduana de ADN detectó errores en el campo. */
  readonly hasErrorBoolean: boolean;
  /** Texto de sugerencia para el campo de entrada. */
  readonly placeholderLiteral: string;
  /** Etiqueta visual para el botón de despacho. */
  readonly buttonLabelLiteral: string;
  /** Define si el componente se renderiza en formato compacto. */
  readonly isMinimalVariantBoolean: boolean;
}

/**
 * Aparato encargado de la interacción primaria de captura de identidad.
 *
 * @param properties - Configuración de control y diseño.
 * @returns {React.ReactElement} Grupo de entrada de alta fidelidad.
 */
export const SubscriptionInputGroup: React.FC<ISubscriptionInputGroupProperties> = ({
  register,
  isExecutingBoolean,
  hasErrorBoolean,
  placeholderLiteral,
  buttonLabelLiteral,
  isMinimalVariantBoolean,
}) => {
  return (
    <div
      className={GlobalStyleClassMerger(
        'relative flex flex-col sm:flex-row gap-3 w-full transition-all duration-500',
        isMinimalVariantBoolean ? 'max-w-md' : 'max-w-2xl',
      )}
    >
      {/* 1. CAMPO DE ENTRADA (Hardware Sensor) */}
      <div className="relative flex-grow group">
        <div
          className={GlobalStyleClassMerger(
            'absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300',
            hasErrorBoolean ? 'text-red-400' : 'text-slate-400 group-focus-within:text-amber-500',
          )}
        >
          <Mail size={isMinimalVariantBoolean ? 18 : 22} />
        </div>

        <input
          {...register}
          type="email"
          autoComplete="email"
          disabled={isExecutingBoolean}
          placeholder={placeholderLiteral}
          aria-invalid={hasErrorBoolean}
          className={GlobalStyleClassMerger(
            'w-full bg-slate-50 border-2 rounded-2xl font-medium transition-all duration-300 outline-none',
            isMinimalVariantBoolean ? 'py-3 pl-12 pr-4 text-sm' : 'py-4 pl-14 pr-6 text-base',
            hasErrorBoolean
              ? 'border-red-100 bg-red-50/30 text-red-900 placeholder:text-red-300 focus:border-red-300'
              : 'border-slate-100 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:shadow-xl focus:shadow-amber-500/5',
          )}
        />
      </div>

      {/* 2. DISPARADOR DE ACCIÓN (Conversion Trigger) */}
      <GlobalActionButton
        type="submit"
        visualIntentConfigurationLiteral="CONVERSION"
        isExecutionLoadingBoolean={isExecutingBoolean}
        actionIdentifierLiteral="NEWSLETTER_SUBSCRIBE_SUBMIT"
        className={GlobalStyleClassMerger(
          'sm:w-auto font-black uppercase tracking-wider',
          isMinimalVariantBoolean ? 'py-3 px-6 text-xs' : 'py-4 px-10 text-sm',
        )}
      >
        <span>{buttonLabelLiteral}</span>
      </GlobalActionButton>
    </div>
  );
};
