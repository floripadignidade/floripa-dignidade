/**
 * @section Application Shell - Root Sovereign Layout Orchestrator
 * @description Carcasa estructural primaria para el portal ciudadano Floripa Dignidade.
 * Orquesta la inyección de fuentes, estilos globales, resolución de diccionarios
 * unificados del Weaver y el montaje de la barra de navegación institucional.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Accesibilidad y Eficiencia).
 * SANEADO Turbopack: Corrección de ruta relativa de diccionarios ('./i18n/dictionaries/').
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';
import { notFound } from 'next/navigation';

/* 1. Infraestructura de Estilos Globales */
import './global.css';

/* 2. Ruteo y Validación de Frontera */
import { SupportedLocaleSchema, ValidateLinguisticContract } from '@floripa-dignidade/routing';

/* 3. Contratos de Interfaz */
import { MainNavigationHeaderI18nSchema } from '@floripa-dignidade/shared-ui-contracts';
import type { IMainNavigationHeaderI18n } from '@floripa-dignidade/shared-ui-contracts';

/* 4. Fundición Visual */
import { GlobalMainNavigationHeader } from '@floripa-dignidade/shared-ui-foundry';

/**
 * @interface IRootLayoutProperties
 * @description Contrato inmutable para las propiedades del layout raíz de Next.js.
 */
interface IRootLayoutProperties {
  readonly children: React.ReactNode;
  readonly params: Promise<{ readonly locale?: string }>;
}

/**
 * Orquestador de diseño raíz del portal ciudadano.
 */
export default async function RootLayout(
  propertiesSnapshot: IRootLayoutProperties,
): Promise<React.ReactElement> {
  const { children, params } = propertiesSnapshot;
  const { locale: rawLocaleIdentifierLiteral = 'pt-BR' } = (await params) ?? {};

  // 1. ADUANA DE FRONTERA LINGÜÍSTICA
  const localeValidation = SupportedLocaleSchema.safeParse(rawLocaleIdentifierLiteral);
  if (!localeValidation.success) notFound();

  const validatedLocale = localeValidation.data;

  try {
    /**
     * 2. RESOLUCIÓN DETERMINISTA DE DICCIONARIOS WEAVER
     * SANEADO: Ruta local exacta al subdirectorio 'i18n/dictionaries/' dentro de 'src/app/'.
     */
    const rawData = await import(`./i18n/dictionaries/${validatedLocale}.json`);
    const headerDictionary = rawData.default['shared/composite-ui'];

    ValidateLinguisticContract(
      'GLOBAL_HEADER_APPARATUS',
      MainNavigationHeaderI18nSchema,
      headerDictionary,
      validatedLocale as string,
    );

    return (
      <html lang={validatedLocale} suppressHydrationWarning>
        <body className="antialiased min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
          <GlobalMainNavigationHeader
            translationDictionary={headerDictionary as IMainNavigationHeaderI18n}
          />
          <main className="flex-grow pt-20">{children}</main>
        </body>
      </html>
    );
  } catch (_caughtError: unknown) {
    notFound();
  }
}
