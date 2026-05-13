/**
 * @section Localized Application Layout
 * @description Carcasa estructural para rutas con prefijo de idioma.
 * Ensambla el encabezado de navegación global y gestiona el ADN visual local.
 *
 * Protocolo OEDP-V17.0 - High Performance Architecture & Sovereign Data.
 * SANEADO Zenith: Resolución de Asfixia de Tipos (TS2307), inyección de
 * rutas limpias, erradicación de dependencia física y consumo del
 * diccionario unificado del orquestador Weaver (Fix TS2345).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';
import { notFound } from 'next/navigation';

/* 1. Infraestructura Core y Ruteo (Sovereign Boundaries) */
import {
  SupportedLocaleSchema,
  ValidateLinguisticContract,
} from '@floripa-dignidade/routing';

/* 2. Planos y Contratos (Blueprints Layer - Clean Paths) */
import { MainNavigationHeaderI18nSchema } from '@floripa-dignidade/shared-ui-contracts';

/* 3. Fundición Visual (Foundry Layer) */
import { GlobalMainNavigationHeader } from '@floripa-dignidade/shared-ui-foundry';

/**
 * @interface ILocalizedLayoutProperties
 * @description Contrato inmutable para la carcasa de la aplicación localizada.
 * Sigue la norma ISO de Objeto + Propiedad + Representación.
 */
interface ILocalizedLayoutProperties {
  readonly children: React.ReactNode;
  readonly params: Promise<{
    readonly locale: string;
  }>;
}

/**
 * Componente de servidor encargado del ruteo internacionalizado.
 * Implementa la carga asíncrona del diccionario de navegación institucional.
 *
 * @param propertiesSnapshot - Snapshot inmutable con los parámetros de Next.js.
 * @returns {Promise<React.ReactElement>} Interfaz ensamblada de la aplicación.
 */
export default async function LocalizedLayout(
  propertiesSnapshot: ILocalizedLayoutProperties
): Promise<React.ReactElement> {

  const { children, params } = propertiesSnapshot;
  const { locale: rawLocaleIdentifierLiteral } = await params;

  // --- 1. ADUANA DE ADN LINGÜÍSTICO (Security Border) ---
  const localeValidationResultSnapshot = SupportedLocaleSchema.safeParse(rawLocaleIdentifierLiteral);

  if (!localeValidationResultSnapshot.success) {
    notFound();
  }

  const validatedLocaleIdentifier = localeValidationResultSnapshot.data;

  // --- 2. CARGA SOBERANA DE DICCIONARIO (Weaver Integration) ---
  let headerDictionarySnapshot;

  try {
    /**
     * 🛡️ LEY ZENITH: Consumimos el diccionario unificado generado por el
     * motor 'Weaver' en la raíz de la aplicación, en lugar de acoplarnos
     * a la ruta física original de la librería en 'libs/'.
     */
    const rawUnifiedDictionaryData = await import(
      `../../i18n/dictionaries/${validatedLocaleIdentifier}.json`
    );

    /**
     * Extraemos la sección específica basándonos en la taxonomía del Weaver.
     * (El prefijo 'shared/composite-ui' es el identificador original heredado).
     */
    const rawHeaderDictionarySection = rawUnifiedDictionaryData.default['shared/composite-ui'];

    /**
     * Validación del contrato lingüístico.
     * 🛡️ FIX TS2345: 'validatedLocaleIdentifier' se castiga a string para evitar
     * la fricción de tipos nominales en la función de aserción.
     */
    ValidateLinguisticContract(
      'GLOBAL_HEADER_APPARATUS',
      MainNavigationHeaderI18nSchema,
      rawHeaderDictionarySection,
      validatedLocaleIdentifier as string
    );

    headerDictionarySnapshot = rawHeaderDictionarySection;

  } catch (_caughtError: unknown) {
    /**
     * @section Gestión de Resiliencia
     * Si el ADN lingüístico está ausente o corrupto, abortamos la carga
     * de la vista para no mostrar llaves (keys) crudas al ciudadano.
     */
    notFound();
  }

  // --- 3. ENSAMBLAJE DEL ENJAMBRE (Layout Composition) ---
  return (
    <>
      {/* ORQUESTADOR DE NAVEGACIÓN */}
      <GlobalMainNavigationHeader
        translationDictionary={headerDictionarySnapshot}
      />

      {/* CUERPO DE LA APLICACIÓN */}
      <main className="flex-grow pt-20">
        {children}
      </main>

      {/* TODO: Inyectar GlobalImpactFooter aquí (Fase 6) */}
    </>
  );
}
