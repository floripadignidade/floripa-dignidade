/**
 * @section UI Atom - Unauthorized Access Shield Indicator
 * @description Emblema iconográfico accesible para respuestas de restricción perimetral
 * de acceso (HTTP 403) alineado con la paleta institucional ADR 0029.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & WCAG 2.2 AAA).
 * Normas: ISO/IEC 11179 e ISO/IEC 25010.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';
import { Lock } from 'lucide-react';

/**
 * Renderiza el emblema visual de acceso restringido oculto para lectores de pantalla.
 *
 * @returns {React.ReactElement} Emblema vectorial decorativo.
 */
export const UnauthorizedShieldIndicator: React.FC = () => (
  <div
    className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-navy-50 text-navy-900 border border-navy-100 mb-10 shadow-inner"
    aria-hidden="true"
  >
    <Lock size={44} />
  </div>
);
