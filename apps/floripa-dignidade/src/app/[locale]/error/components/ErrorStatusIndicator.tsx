/**
 * @section UI Atom - Operational Contingency Indicator
 * @description Indicador iconográfico accesible de interrupción operativa controlada
 * alineado con la paleta de alerta ciudadana de ADR 0029.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & WCAG 2.2 AAA).
 * Normas: ISO/IEC 11179 e ISO/IEC 25010.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Renderiza el emblema visual de incidencia operativa oculto para lectores de pantalla.
 *
 * @returns {React.ReactElement} Emblema vectorial decorativo.
 */
export const ErrorStatusIndicator: React.FC = () => (
  <div
    className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-50 text-red-600 border border-red-100 mb-10 shadow-inner"
    aria-hidden="true"
  >
    <AlertTriangle size={48} />
  </div>
);
