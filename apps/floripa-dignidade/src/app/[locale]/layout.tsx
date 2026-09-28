/**
 * @section Localized Application Layout
 * @description Carcasa estructural para rutas localizadas.
 * @author Raz Podestá - MetaShark Tech
 */

import React from 'react';
import { notFound } from 'next/navigation';

/* 1. Infraestructura Core y Ruteo */
import {
  SupportedLocaleSchema,
  ValidateLinguisticContract,
} from '@floripa-dignidade/routing';

/* 2. Planos y Contratos (Redirección vía Grafo) */
import { MainNavigationHeaderI18nSchema } from '@floripa-dignidade/shared-ui-contracts';
import type { IMainNavigationHeaderI18n } from '@floripa-dignidade/shared-ui-contracts';

/* 3. Fundición Visual */
import { GlobalMainNavigationHeader } from '@floripa-dignidade/shared-ui-foundry';

interface ILocalizedLayoutProperties {
  readonly children: React.ReactNode;
  readonly params: Promise<{ readonly locale: string }>;
}

export default async function LocalizedLayout(
  propertiesSnapshot: ILocalizedLayoutProperties
): Promise<React.ReactElement> {

  const { children, params } = propertiesSnapshot;
  const { locale: rawLocaleIdentifierLiteral } = await params;

  // Validación Zod de frontera
  const localeValidation = SupportedLocaleSchema.safeParse(rawLocaleIdentifierLiteral);
  if (!localeValidation.success) notFound();

  const validatedLocale = localeValidation.data;

  try {
    const rawData = await import(`../i18n/dictionaries/${validatedLocale}.json`);
    const headerDictionary = rawData.default['shared/composite-ui'];

    // 🛡️ SANEADO Zenith: Inyección nominal para evitar TS2345
    ValidateLinguisticContract(
      'GLOBAL_HEADER_APPARATUS',
      MainNavigationHeaderI18nSchema,
      headerDictionary,
      validatedLocale as string
    );

    return (
      <>
        <GlobalMainNavigationHeader
          translationDictionary={headerDictionary as IMainNavigationHeaderI18n}
        />
        <main className="flex-grow pt-20">{children}</main>
      </>
    );
  } catch (_error) {
    notFound();
  }
}
