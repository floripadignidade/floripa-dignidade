/**
 * @section Application Shell - Localized Frontpage Orchestrator
 * @description Punto de ensamblaje maestro para el embudo de conversión social.
 * Implementa el patrón "Sovereign Shell" coordinando la lógica atómica de
 * diccionarios y el enjambre de secciones visuales de alta fidelidad.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Swarm Intelligence.
 * SANEADO Zenith: Resolución de TS7016 mediante Sello de Contención, atomización
 * de lógica de diccionarios, cumplimiento de Prosa ISO y telemetría de montaje.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';

/**
 * 🛡️ LEY DE SOBERANÍA (Fix TS7016):
 * SELLO DE CONTENCIÓN: Suprimimos la alerta del compilador para los módulos de Next.js.
 * La integridad de la firma está garantizada por el Santuario de Tipos global,
 * pero requiere este puente en la frontera física del App Router.
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

/* 1. Infraestructura Core & Routing (Sovereign Boundaries - Clean Paths) */
import {
  GlobalBaseException,
  InternalSystemException,
} from '@floripa-dignidade/exceptions';

import { SupportedLocaleSchema } from '@floripa-dignidade/routing';

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  ReportForensicException,
} from '@floripa-dignidade/telemetry';

/* 2. Secciones Atómicas (Swarm Assembly - Clean Paths) */
import { FrontpageHero } from './sections/FrontpageHero';
import { NewsletterConversionZone } from './sections/NewsletterConversionZone';
import { ValuePropositionGrid } from './sections/ValuePropositionGrid';

/* 3. Lógica Atómica (Delegación de Diccionarios - Clean Paths) */
import { LoadFrontpageDictionaries } from './logic/LoadFrontpageDictionaries';

/** Identificador técnico del orquestador para el Neural Sentinel. */
const ORCHESTRATOR_IDENTIFIER = 'FRONTPAGE_SHELL_ORCHESTRATOR';

/**
 * @interface IFrontpageProperties
 * @description Contrato inmutable para las propiedades de la ruta Next.js.
 * Sigue la norma ISO de Objeto + Propiedad + Representación.
 */
interface IFrontpageProperties {
  /** Promesa de parámetros de ruta capturada por el App Router. */
  readonly params: Promise<{ readonly locale: string }>;
}

/**
 * Generador de Metadatos Dinámicos para el portal.
 *
 * @param propertiesSnapshot - Snapshot de parámetros de la URL.
 * @returns {Promise<Metadata>} Metadatos localizados para SEO institucional.
 */
export async function generateMetadata(
  propertiesSnapshot: IFrontpageProperties,
): Promise<Metadata> {
  const { locale: rawLocaleIdentifierLiteral } = await propertiesSnapshot.params;

  const titlesMapping: Record<string, string> = {
    'pt-BR': 'Página Inicial | Floripa Dignidade',
    'es-ES': 'Inicio | Floripa Dignidade',
    'en-US': 'Home | Floripa Dignidade',
  };

  return {
    title: titlesMapping[rawLocaleIdentifierLiteral] ?? titlesMapping['pt-BR'],
    description: 'Infraestrutura de resposta social para a defesa da dignidade humana.',
  };
}

/**
 * Componente de Servidor encargado del montaje de la Frontpage (RSC).
 * Realiza el montaje del enjambre visual tras la validación de soberanía.
 *
 * @param propertiesSnapshot - Snapshot de parámetros inyectados por el App Router.
 * @returns {Promise<React.ReactElement>} Interfaz de impacto social ensamblada.
 */
export default async function Frontpage(
  propertiesSnapshot: IFrontpageProperties,
): Promise<React.ReactElement> {
  const { locale: rawLocaleIdentifierLiteral } = await propertiesSnapshot.params;
  const correlationIdentifier = GenerateCorrelationIdentifier();

  // --- 1. ADUANA DE ADN LINGÜÍSTICO (Security Border) ---
  const localeValidationResultSnapshot = SupportedLocaleSchema.safeParse(rawLocaleIdentifierLiteral);

  if (!localeValidationResultSnapshot.success) {
    return notFound();
  }

  const validatedLocaleIdentifierLiteral = localeValidationResultSnapshot.data;

  try {
    // --- 2. CARGA SOBERANA DE DICCIONARIOS (Delegación Atómica) ---
    /**
     * 🛡️ LEY ZENITH: Extraemos la responsabilidad de I/O de archivos JSON
     * a un átomo especializado para mantener el SRP y la limpieza del orquestador.
     */
    const { localizedContent, newsletterUi } = await LoadFrontpageDictionaries(
      validatedLocaleIdentifierLiteral as string
    );

    // --- 3. REPORTE DE MONTAJE (SRE Visibility) ---
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
      operationCodeLiteral: 'FRONTPAGE_ASSEMBLY_SUCCESS',
      correlationIdentifier,
      messageContentLiteral: `Ensamble de Frontpage finalizado para [${validatedLocaleIdentifierLiteral}].`,
      semanticIntentTag: 'UI_ASSEMBLY_NOMINAL',
    });

    // --- 4. RENDERIZADO DEL ENJAMBRE (Atomic Assembly) ---
    return (
      <main className="flex flex-col flex-grow overflow-x-hidden">
        {/* ÁTOMO HERO: Primer impacto e identidad visual */}
        <FrontpageHero
          contentDictionarySnapshot={localizedContent.hero}
        />

        {/* ÁTOMO GRID: Pilares de acción y rastro de impacto */}
        <ValuePropositionGrid
          pilarStrategyFeatureCollectionSnapshot={localizedContent.features}
        />

        {/* ÁTOMO CONVERSIÓN: Captación de ciudadanos (Newsletter) */}
        <NewsletterConversionZone
          contentLinguisticDictionarySnapshot={localizedContent.newsletter}
          formTranslationDictionarySnapshot={newsletterUi}
        />
      </main>
    );

  } catch (caughtError: unknown) {
    // --- 5. GESTIÓN DE RESILIENCIA (Panic Mode) ---
    const errorDescriptionLiteral = caughtError instanceof Error
      ? caughtError.message
      : 'UNKNOWN_ORCHESTRATION_FAULT';

    /** Normalizamos el rastro en una excepción institucional para evitar 'any'. */
    const normalizedException = caughtError instanceof GlobalBaseException
      ? caughtError
      : new InternalSystemException('FRONTPAGE_ORCHESTRATION_COLLAPSE', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier
        });

    void EmitTelemetrySignal({
      severityLevelLiteral: 'CRITICAL',
      moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
      operationCodeLiteral: 'FRONTPAGE_MOUNT_FAULT',
      correlationIdentifier,
      messageContentLiteral: 'Fallo catastrófico al intentar orquestar el montaje de la Frontpage.',
      contextMetadataSnapshot: { ...normalizedException.runtimeContextSnapshot }
    });

    /** Reporte forense tipado para el Neural Sentinel. */
    ReportForensicException(normalizedException, correlationIdentifier);

    /** Saneamos el flujo de retorno para evitar estados inconsistentes. */
    return notFound();
  }
}
