/**
 * @section Frontpage Logic - Dictionary Ingestion Atom
 * @description Átomo encargado de la carga asíncrona y validación de contratos
 * lingüísticos para la Frontpage. Consolida la unión de diccionarios del Weaver.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Sovereign Data.
 * @author Raz Podestá - MetaShark Tech
 */

import { ValidateLinguisticContract } from '@floripa-dignidade/routing';
import {
  NewsletterSubscriptionFormI18nSchema
} from '@floripa-dignidade/shared-ui-contracts';
import type {
  INewsletterSubscriptionFormI18n
} from '@floripa-dignidade/shared-ui-contracts';
import { FrontpageI18nSchema } from '../schemas/FrontpageI18n.schema';
import type { IFrontpageI18n } from '../schemas/FrontpageI18n.schema';

/**
 * @interface IFrontpageDictionariesSnapshot
 * @description Contrato de salida con los diccionarios purificados.
 */
export interface IFrontpageDictionariesSnapshot {
  readonly localizedContent: IFrontpageI18n;
  readonly newsletterUi: INewsletterSubscriptionFormI18n;
}

/**
 * Realiza la ingesta y auditoría de los silos lingüísticos de la Frontpage.
 *
 * @param validatedLocaleIdentifier - Idioma validado por la aduana de ruteo.
 * @returns {Promise<IFrontpageDictionariesSnapshot>} Diccionarios listos para renderizado.
 */
export const LoadFrontpageDictionaries = async (
  validatedLocaleIdentifier: string
): Promise<IFrontpageDictionariesSnapshot> => {
  /**
   * 🛡️ LEY ZENITH: Consumimos el diccionario unificado generado por el Weaver.
   * El casting se realiza tras la validación física del contrato Zod.
   */
  const rawUnifiedSnapshot = (await import(
    `../../i18n/dictionaries/${validatedLocaleIdentifier}.json`
  )) as { default: Record<string, unknown> };

  const localizedContent = rawUnifiedSnapshot.default['apps/frontpage'] as IFrontpageI18n;
  const newsletterUi = rawUnifiedSnapshot.default['shared/ui-primitives'] as INewsletterSubscriptionFormI18n;

  // AUDITORÍA DE ADN (Integrity Guard)
  ValidateLinguisticContract(
    'FRONTPAGE_CONTENT',
    FrontpageI18nSchema,
    localizedContent,
    validatedLocaleIdentifier
  );

  ValidateLinguisticContract(
    'NEWSLETTER_UI',
    NewsletterSubscriptionFormI18nSchema,
    newsletterUi,
    validatedLocaleIdentifier
  );

  return { localizedContent, newsletterUi };
};
