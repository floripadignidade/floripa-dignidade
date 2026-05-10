'use client';

/**
 * @section Component: GlobalBrandLogo
 * @description Representación técnica de la identidad visual institucional.
 * Implementa optimización de LCP mediante carga prioritaria y rastro
 * telemétrico de interacciones de navegación institucional.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Branding Authority.
 * SANEADO Zenith: Erradicación de TS7016 mediante Santuario de Tipos,
 * migración de ADN a 'ui-contracts' e integración de Prosa ISO.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useCallback } from 'react';
import Link from 'next/link';
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

export const GlobalBrandLogo: React.FC<IGlobalBrandLogoProperties> = (rawProperties) => {

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
  } = GlobalBrandLogoPropertiesSchema.parse(rawProperties);

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

  // 2. CONSTRUCCIÓN DEL ELEMENTO VISUAL (Atomic Composition)
  const brandLogoVisualElement = (
    <div
      className={GlobalStyleClassMerger(
        "flex items-center justify-center transition-all duration-500",
        "hover:opacity-85 active:scale-[0.97]",
        externalClassName
      )}
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
          src={VARIANT_ASSETS_MAPPING[visualVariantLiteral] || VARIANT_ASSETS_MAPPING['STANDARD']}
          alt={labels.logoAlternativeTextLiteral}
          fill
          priority // 🛡️ SANEADO: Indispensable para optimización de LCP (Web Vitals)
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 200px"
        />
      </div>
    </div>
  );

  // 3. ORQUESTACIÓN DE NAVEGACIÓN (Accessiblity & SEO Layer)
  if (!isNavigationLinkEnabledBoolean) {
    return brandLogoVisualElement;
  }

  return (
    <Link
      href="/"
      onClick={handleLogoInteractionAction}
      /** SANEADO: Si no hay label específico en el ADN, usamos el del AriaContract */
      aria-label={labels.navigationAriaLabelLiteral || accessibilityConfiguration?.accessibilityLabelLiteral}
      className={GlobalStyleClassMerger(
        "outline-none rounded-xl transition-all duration-300",
        "focus-visible:ring-4 focus-visible:ring-amber-500/30 focus-visible:ring-offset-2"
      )}
    >
      {brandLogoVisualElement}
    </Link>
  );
};
