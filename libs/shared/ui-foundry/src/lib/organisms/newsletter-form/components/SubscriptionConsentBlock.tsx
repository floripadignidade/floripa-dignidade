'use client';

/**
 * @section UI Atom - Subscription Consent Block
 * @description Aparato de cumplimiento legal encargado de capturar el consentimiento
 * de privacidad (LGPD) y mostrar rastro de errores de validación. Implementa
 * animaciones de alta fidelidad para la gestión de feedback visual.
 *
 * Protocolo OEDP-V17.0 - High Performance UI & Legal Compliance.
 * SANEADO Zenith: Materialización inicial con soporte para Prosa ISO y Motion Design.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ShieldCheck } from 'lucide-react';
import type { UseFormRegisterReturn } from 'react-hook-form';

/* 1. Infraestructura de Utilidades */
import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';

/**
 * @interface ISubscriptionConsentBlockProperties
 * @description Contrato inmutable para la gestión de legalidad y errores.
 */
interface ISubscriptionConsentBlockProperties {
  /** Referencia de registro de react-hook-form para el campo boolean. */
  readonly register: UseFormRegisterReturn;
  /** Etiqueta descriptiva de la política de privacidad. */
  readonly labelLiteral: string;
  /** Mensaje de error específico del campo de consentimiento. */
  readonly validationErrorLiteral: string;
  /** Indica si el campo de email (hermano) posee errores. */
  readonly hasEmailErrorBoolean: boolean;
  /** Literal localizado para el error de formato de correo. */
  readonly emailInvalidLiteral: string;
}

/**
 * Aparato encargado de la validación de cumplimiento y reporte de fallos.
 *
 * @param properties - Configuración de control y lenguaje.
 * @returns {React.ReactElement} Bloque de consentimiento auditado.
 */
export const SubscriptionConsentBlock: React.FC<ISubscriptionConsentBlockProperties> = ({
  register,
  labelLiteral,
  validationErrorLiteral,
  hasEmailErrorBoolean,
  emailInvalidLiteral,
}) => {
  // Determinamos si existe alguna violación de contrato activa en el formulario.
  const isAnyErrorVisibleBoolean = hasEmailErrorBoolean || !!validationErrorLiteral;

  return (
    <div className="flex flex-col gap-3 transition-all duration-300">
      {/* 1. FILA DE CONSENTIMIENTO (Checkbox Custom) */}
      <label className="flex items-start gap-3 cursor-pointer group select-none">
        <div className="relative flex items-center mt-1">
          <input
            {...register}
            type="checkbox"
            className="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-md bg-white checked:bg-amber-500 checked:border-amber-500 transition-all duration-300 outline-none focus-visible:ring-4 focus-visible:ring-amber-500/20"
          />
          <ShieldCheck
            size={14}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-300 pointer-events-none"
          />
        </div>

        <span
          className={GlobalStyleClassMerger(
            'text-sm font-medium transition-colors duration-300',
            validationErrorLiteral ? 'text-red-600' : 'text-slate-500 group-hover:text-slate-700',
          )}
        >
          {labelLiteral}
        </span>
      </label>

      {/* 2. ÁREA DE MENSAJES DE ERROR (Motion Sentry) */}
      <div className="min-h-[20px]">
        <AnimatePresence mode="wait">
          {isAnyErrorVisibleBoolean && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-tight"
            >
              <AlertCircle size={14} />
              <span>{hasEmailErrorBoolean ? emailInvalidLiteral : validationErrorLiteral}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
