/**
 * @section UI Atom - Invalid Token Visual Indicator
 * @description Indicador iconográfico accesible de advertencia controlada para
 * tokens de confirmación expirados o inválidos.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & WCAG 2.2).
 * Normas: ISO/IEC 11179 e ISO/IEC 25010.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';
import { ShieldAlert } from 'lucide-react';

/**
 * Renderiza el emblema visual de verificación interrumpida oculto para tecnologías asistivas.
 *
 * @returns {React.ReactElement} Emblema vectorial decorativo.
 */
export const InvalidTokenIndicator: React.FC = () => (
  <div
    className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-amber-50 text-amber-600 border border-amber-100 mb-10 shadow-inner"
    aria-hidden="true"
  >
    <ShieldAlert size={48} />
  </div>
);
