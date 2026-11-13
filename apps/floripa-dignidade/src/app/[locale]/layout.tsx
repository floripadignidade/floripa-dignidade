/**
 * @section Localized Application Layout - Multi-Locale Shell Orchestrator
 * @description Carcasa estructural para todas las rutas localizadas bajo `/[locale]`.
 * Valida la legitimidad BCP 47 del segmento dinámico contra el catálogo SSOT
 * (`@floripa-dignidade/contracts`), genera parámetros estáticos dinámicos para N idiomas,
 * resuelve de forma resiliente el diccionario del encabezado sin provocar 404 por
 * claves secundarias (ADR 0030) y evita landmarks `<main>` anidados.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179, ISO/IEC 25010 y W3C WCAG 2.2.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';
import { notFound } from 'next/navigation';

import {
  SUPPORTED_LOCALE_CODES_COLLECTION,
  SupportedLocaleSchema,
} from '@floripa-dignidade/contracts';
import { GlobalMainNavigationHeader } from '@floripa-dignidade/shared-ui-foundry';

import { LoadNavigationHeaderDictionary } from './logic/LoadNavigationHeaderDictionary';

interface ILocalizedLayoutProperties {
  readonly children: React.ReactNode;
  readonly params: Promise<{ readonly locale: string }>;
}

/**
 * Genera dinámicamente los segmentos estáticos `[locale]` para todos los idiomas
 * habilitados en `SUPPORTED_LOCALES_REGISTRY` (escalabilidad O(1) a N idiomas).
 *
 * @returns {readonly { readonly locale: string }[]} Lista de parámetros BCP 47 activos.
 */
export function generateStaticParams(): Array<{ readonly locale: string }> {
  return SUPPORTED_LOCALE_CODES_COLLECTION.map((localeCodeLiteral) => ({
    locale: localeCodeLiteral,
  }));
}

/**
 * Envuelve las rutas localizadas inyectando el encabezado institucional en el idioma activo.
 *
 * @param propertiesSnapshot - Contenido hijo y promesa de parámetros `[locale]` de Next.js 16.
 * @returns {Promise<React.ReactElement>} Estructura localizada resiliente libre de 404 por i18n.
 */
export default async function LocalizedLayout(
  propertiesSnapshot: ILocalizedLayoutProperties,
): Promise<React.ReactElement> {
  const { children, params } = propertiesSnapshot;
  const { locale: rawLocaleIdentifierLiteral } = await params;

  const localeValidationResult = SupportedLocaleSchema.safeParse(rawLocaleIdentifierLiteral);
  if (!localeValidationResult.success) {
    notFound();
  }

  const validatedLocaleLiteral = localeValidationResult.data;
  const headerTranslationDictionary = await LoadNavigationHeaderDictionary(validatedLocaleLiteral);

  return (
    <>
      <GlobalMainNavigationHeader translationDictionary={headerTranslationDictionary} />
      <div className="flex-grow flex flex-col pt-20">{children}</div>
    </>
  );
}
