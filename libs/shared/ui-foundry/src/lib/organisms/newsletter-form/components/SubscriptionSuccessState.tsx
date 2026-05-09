'use client';

/**
 * @section UI Atom - Subscription Success State
 * @description Representación visual de conversión exitosa. Informa al ciudadano
 * sobre el siguiente paso del proceso (Double Opt-In) con una interfaz de
 * alta fidelidad y animaciones fluidas.
 *
 * Protocolo OEDP-V17.0 - High Performance UI & Atomic Visual DNA.
 * SANEADO Zenith: Materialización inicial bajo estándares ISO y accesibilidad WAI-ARIA.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';
import { motion } from 'framer-motion';
import { MailCheck } from 'lucide-react';

/**
 * @interface ISubscriptionSuccessStateProperties
 * @description Contrato inmutable para los literales de éxito localizados.
 */
interface ISubscriptionSuccessStateProperties {
  /** Título de impacto (ej: "¡Verifica tu correo!"). */
  readonly headlineLiteral: string;
  /** Instrucción detallada para el ciudadano. */
  readonly descriptionLiteral: string;
}

/**
 * Aparato encargado de mostrar el feedback positivo tras la suscripción.
 * Implementa una secuencia de entrada animada para reducir la carga cognitiva.
 *
 * @param properties - Literales de texto inyectados por el orquestador.
 * @returns {React.ReactElement} Bloque visual de éxito validado.
 */
export const SubscriptionSuccessState: React.FC<ISubscriptionSuccessStateProperties> = ({
  headlineLiteral,
  descriptionLiteral,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center text-center p-8 bg-amber-50/30 rounded-[2rem] border border-amber-100/50"
      role="status"
      aria-live="polite"
    >
      {/* 1. ICONOGRAFÍA DE IDENTIDAD (Conversion Amber) */}
      <div className="w-20 h-20 bg-amber-500 text-white rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-amber-500/20 rotate-3">
        <MailCheck size={40} strokeWidth={2.5} />
      </div>

      {/* 2. MENSAJE DE SOBERANÍA */}
      <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase">
        {headlineLiteral}
      </h3>

      <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-sm">
        {descriptionLiteral}
      </p>

      {/* 3. ELEMENTO DECORATIVO DE PROGRESO */}
      <div className="mt-8 flex gap-2">
        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        <div className="w-2 h-2 rounded-full bg-amber-200" />
        <div className="w-2 h-2 rounded-full bg-amber-100" />
      </div>
    </motion.div>
  );
};
