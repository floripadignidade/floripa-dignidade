/**
 * @section CMS Infrastructure - Typography Foundation (Atom)
 * @description Centraliza la configuración de fuentes institucionales para el CMS.
 * Implementa optimización de carga vía 'display: swap' y variables CSS nativas,
 * previniendo el parpadeo de texto (FOUT) y mejorando el LCP (Core Web Vitals).
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Asset Management.
 * SANEADO Zenith: Resolución de Asfixia de Identidad (TS7016) mediante el
 * patrón "Aduana de Salida" y aislamiento de advertencias del linter.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * @interface IInstitutionalFont
 * @description Contrato inmutable que sella la identidad de la fuente.
 * Protege al ecosistema de la propagación del tipo 'any' generado por el
 * fallo de resolución profunda de Next.js.
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
 * 🛡️ LEY DE SOBERANÍA FÍSICA:
 * Silenciamos la advertencia del compilador porque la librería existe físicamente
 * en el 'node_modules', pero su declaración profunda (.d.ts) es invisible para PNPM.
 */
 - TS7016: Falla de resolución profunda de Next.js en entornos Nx/PNPM estricto.
import { Inter, Lexend } from 'next/font/google';

/**
 * @name institutionalSansFontInstance
 * @description Fuente principal para lectura, cuerpos de texto y matrices de datos.
 * Configurada exclusivamente con el subconjunto latino para reducir el peso del payload.
 *
 * 🛡️ CASTING SOBERANO: Forzamos el cumplimiento de la interfaz IInstitutionalFont.
 */
export const institutionalSansFontInstance: IInstitutionalFont = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

/**
 * @name institutionalDisplayFontInstance
 * @description Fuente secundaria de alta jerarquía visual, reservada para titulares,
 * métricas críticas (SRE Dashboards) e identidad de marca.
 */
export const institutionalDisplayFontInstance: IInstitutionalFont = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
  display: 'swap',
});
