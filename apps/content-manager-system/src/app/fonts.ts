/**
 * @section CMS Infrastructure - Typography Foundation Atom
 * @description Centraliza la configuración de fuentes institucionales para el panel administrativo.
 * Implementa optimización de carga mediante 'display: swap' y variables CSS nativas,
 * previniendo el parpadeo de texto (FOUT) y mejorando el LCP (Core Web Vitals).
 *
 * Protocolo OEDP-V18.1 - High Performance SRE & Asset Management.
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Calidad y Eficiencia).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { Inter, Lexend } from 'next/font/google';

/**
 * @interface IInstitutionalFont
 * @description Contrato inmutable que sella la identidad estructural de una fuente web.
 * Protege al ecosistema de la propagación del tipo 'any' y asegura compatibilidad con Next.js 16.
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
 * @description Fuente principal para lectura, cuerpos de texto y matrices de datos administrativos.
 * Configurada exclusivamente con el subconjunto latino para minimizar el tamaño del payload transferido.
 */
export const institutionalSansFontInstance: IInstitutionalFont = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

/**
 * @name institutionalDisplayFontInstance
 * @description Fuente secundaria de alta jerarquía visual, reservada para titulares,
 * métricas críticas (Dashboards SRE) e identidad de marca.
 */
export const institutionalDisplayFontInstance: IInstitutionalFont = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
  display: 'swap',
});
