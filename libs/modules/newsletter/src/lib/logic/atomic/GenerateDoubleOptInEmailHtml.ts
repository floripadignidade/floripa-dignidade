/**
 * @section Newsletter Logic - Email Template Generation
 * @description Generador de contenido HTML para el proceso de Double Opt-In.
 *
 * Protocolo OEDP-V14.0 - Verbatim Module Syntax.
 * @author Dirección de Ingeniería - Floripa Dignidade
 */

/** 🛡️ SANEAMIENTO Zenith: Importación de ADN como tipo puro */
import type { INewsletterI18n } from '../../i18n/NewsletterI18n.schema';

/**
 * Genera el cuerpo del correo de confirmación.
 */
export const GenerateDoubleOptInEmailHtml = (
  dictionary: INewsletterI18n,
  securityToken: string,
  correlationIdentifier: string,
): string => {
  return `
    <div style="font-family: sans-serif; padding: 40px; color: #003366; max-width: 600px; margin: auto; border: 1px solid #eee;">
      <h2 style="color: #F5A623;">Floripa Dignidade</h2>
      <p style="font-size: 16px;">${dictionary.email.greetingLiteral}</p>
      <p>${dictionary.email.instructionLiteral}</p>
      <div style="background: #F1F5F9; padding: 20px; font-size: 32px; font-weight: 900; text-align: center; letter-spacing: 5px; border-radius: 12px; margin: 30px 0;">
        ${securityToken}
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin-top: 40px;" />
      <p style="font-size: 10px; color: #94A3B8; text-align: center;">
        ${dictionary.email.trackingFooterLiteral} ${correlationIdentifier}
      </p>
    </div>
  `;
};
