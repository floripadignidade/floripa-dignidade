/**
 * @section Localized Application Layout
 * @description Carcasa estructural para rutas localizadas.
 * Protocolo OEDP-V17.0 - Zenith Architecture Standard.
 */

import React from 'react';
import { notFound } from 'next/navigation';

/* 1. Infraestructura Core y Ruteo (Referenciados por el Grafo del base.json) */
import {
  SupportedLocaleSchema,
  ValidateLinguisticContract,
} from '@floripa-dignidade/routing';

/* 2. Planos y Contratos (Referenciados por el Grafo del base.json) */
import { MainNavigationHeaderI18nSchema } from '@floripa-dignidade/shared-ui-contracts';
import type { IMainNavigationHeaderI18n } from '@floripa-dignidade/shared-ui-contracts';

/* 3. Fundición Visual (Referenciados por el Grafo del base.json) */
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
    /**
     * SANEADO: Usamos una ruta absoluta relativa a la raíz para evitar fallos de resolución
     * entre capas (Next.js App y libs).
     */
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
