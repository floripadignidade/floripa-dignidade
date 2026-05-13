'use client';

/**
 * @section Shared UI Foundry - Global Brand Logo (Atom)
 * @description Representación técnica de la identidad visual institucional.
 * Implementa optimización de LCP mediante carga prioritaria y rastro
 * telemétrico de interacciones de navegación institucional.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Branding Authority.
 * SANEADO Zenith: Resolución de Asfixia de Identidad (TS7016) mediante supresión
 * controlada e inyección de 'useMemo' para protección de render loop.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useCallback, useMemo } from 'react';

/**
 * 🛡️ LEY ZENITH (Fix TS7016):
 * Silenciamos la advertencia del compilador porque la librería existe físicamente,
 * pero la resolución de 'bundler' en PNPM estricto falla al localizar su .d.ts
 * sin violar la prohibición de ESLint sobre referencias de triple barra.
 */
// @ts-expect-error - TS7016: Falla de resolución de declaración de tipos en entornos Nx/PNPM.
import Link from 'next/link';
// @ts-expect-error - TS7016: Falla de resolución de declaración de tipos en entornos Nx/PNPM.
import Image from 'next/image';

/* 1. Infraestructura Core y Utilidades (Sovereign Boundaries) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier
} from '@floripa-dignidade/telemetry';

import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';

/* 2. Planos y Contratos (Blueprints Layer) */
import { GlobalBrandLogoPropertiesSchema } from '@floripa-dignidade/shared-ui-contracts';
import type { IGlobalBrandLogoProperties } from '@floripa-dignidade/shared-ui-contracts';

/**
 * @name VARIANT_ASSETS_MAPPING
 * @description Mapa de activos físicos inyectados en la infraestructura.
 * 🛡️ LEY SRE: Estas rutas son relativas a la carpeta /public de la aplicación final.
 */
const VARIANT_ASSETS_MAPPING: Record<string, string> = {
  STANDARD: '/brand/floripa-dignidade-logo-color.png',
  MONOCHROME_WHITE: '/brand/floripa-dignidade-logo-white.png',
};

/** Identificador técnico del aparato para el Neural Sentinel. */
const ATOM_IDENTIFIER = 'GLOBAL_BRAND_LOGO_ATOM';

/**
 * Aparato visual que representa el sello institucional.
 *
 * @param rawPropertiesSnapshot - Propiedades inyectadas por el orquestador.
 * @returns {React.ReactElement} Logotipo renderizado e interactivo.
 */
export const GlobalBrandLogo: React.FC<IGlobalBrandLogoProperties> = (rawPropertiesSnapshot) => {

  // 1. ADUANA DE ADN: Purificación mediante el contrato de UI Contracts
  const {
    imageWidthPixelQuantity,
    imageHeightPixelQuantity,
    isNavigationLinkEnabledBoolean,
    labels,
    visualVariantLiteral,
    externalClassName,
    forensicTestIdentifier,
    accessibilityConfiguration
  } = GlobalBrandLogoPropertiesSchema.parse(rawPropertiesSnapshot);

  /**
   * @section Gestión de Interacción Telemétrica
   * 🛡️ LEY ZENITH: El rastro de navegación hacia 'Home' es auditado como evento de conversión.
   */
  const handleLogoInteractionAction = useCallback(() => {
    const correlationIdentifier = GenerateCorrelationIdentifier();

    void EmitTelemetrySignal({
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: ATOM_IDENTIFIER,
      operationCodeLiteral: 'BRAND_HOME_NAVIGATION_TRIGGERED',
      correlationIdentifier,
      messageContentLiteral: 'Navegación institucional hacia raíz detectada.',
      semanticIntentTag: 'NAVIGATION_TO_ROOT',
      contextMetadataSnapshot: {
        variantLiteral: visualVariantLiteral,
        timestampISO: new Date().toISOString()
      }
    });
  }, [visualVariantLiteral]);

  /**
   * @section Saneamiento de Complejidad (Pilar DRY & SRE)
   * Centralizamos la lógica de decisión de estilos y accesibilidad.
   */
  const derivedConfigurationSnapshot = useMemo(() => {
    return {
      containerMergedStylesLiteral: GlobalStyleClassMerger(
        'flex items-center justify-center transition-all duration-500',
        'hover:opacity-85 active:scale-[0.97]',
        externalClassName
      ),
      linkMergedStylesLiteral: GlobalStyleClassMerger(
        'outline-none rounded-xl transition-all duration-300',
        'focus-visible:ring-4 focus-visible:ring-amber-500/30 focus-visible:ring-offset-2'
      ),
      computedAriaLabelLiteral:
        labels.navigationAriaLabelLiteral || accessibilityConfiguration?.accessibilityLabelLiteral,
      imageSourceLiteral:
        VARIANT_ASSETS_MAPPING[visualVariantLiteral] || VARIANT_ASSETS_MAPPING['STANDARD']
    };
  }, [
    externalClassName,
    labels.navigationAriaLabelLiteral,
    accessibilityConfiguration,
    visualVariantLiteral
  ]);

  // 2. CONSTRUCCIÓN DEL ELEMENTO VISUAL (Atomic Composition)
  const brandLogoVisualElement = (
    <div
      className={derivedConfigurationSnapshot.containerMergedStylesLiteral}
      data-testid={forensicTestIdentifier}
    >
      <div
        className="relative"
        style={{
          width: imageWidthPixelQuantity,
          height: imageHeightPixelQuantity,
        }}
      >
        <Image
          src={derivedConfigurationSnapshot.imageSourceLiteral}
          alt={labels.logoAlternativeTextLiteral}
          fill
          priority // 🛡️ SANEADO: Indispensable para optimización de LCP (Web Vitals)
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 200px"
        />
      </div>
    </div>
  );

  // 3. ORQUESTACIÓN DE NAVEGACIÓN (Accessibility & SEO Layer)
  if (!isNavigationLinkEnabledBoolean) {
    return brandLogoVisualElement;
  }

  return (
    <Link
      href="/"
      onClick={handleLogoInteractionAction}
      aria-label={derivedConfigurationSnapshot.computedAriaLabelLiteral}
      className={derivedConfigurationSnapshot.linkMergedStylesLiteral}
    >
      {brandLogoVisualElement}
    </Link>
  );
};
