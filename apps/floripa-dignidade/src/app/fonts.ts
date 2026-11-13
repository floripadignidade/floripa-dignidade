/**
 * @section Portal Infrastructure - Typography Foundation Atom
 * @description Centraliza la configuración de fuentes institucionales del portal ciudadano
 * (`Inter` para lectura/UI y `Lexend` para titulares y métricas) conforme al Manifiesto
 * de Branding e Identidad Visual (ADR 0029), previniendo FOUT mediante `display: 'swap'`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 y ADR 0029.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { Inter, Lexend } from 'next/font/google';

/**
 * @interface IInstitutionalFont
 * @description Contrato inmutable para exponer variables y clases CSS de tipografías Next.js.
 */
export interface IInstitutionalFont {
  readonly className: string;
  readonly variable: string;
  readonly style: {
    readonly fontFamily: string;
    readonly fontWeight?: number;
    readonly fontStyle?: string;
  };
}

/**
 * @name institutionalSansFontInstance
 * @description Fuente principal (`--font-inter`) para cuerpo editorial, formularios y tablas.
 */
export const institutionalSansFontInstance: IInstitutionalFont = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

/**
 * @name institutionalDisplayFontInstance
 * @description Fuente de impacto (`--font-lexend`) para titulares H1-H3 e indicadores cívicos.
 */
export const institutionalDisplayFontInstance: IInstitutionalFont = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
  display: 'swap',
});
