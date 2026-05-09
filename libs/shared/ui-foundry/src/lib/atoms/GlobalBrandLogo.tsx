'use client';

/**
 * @section Component: GlobalBrandLogo
 * @description Representación técnica de la identidad visual institucional.
 * Implementa optimización de LCP mediante carga prioritaria, validación de ADN
 * vía Zod y rastro telemétrico de interacciones de navegación.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Branding Authority.
 * SANEADO Zenith: Resolución de fronteras Shared-Utility, inyección de Aduana Zod
 * y cumplimiento de visibilidad ambiental para Next.js 16 (Fix TS7016).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { z } from 'zod';

/* 1. Infraestructura Core y Utilidades (Sovereign Boundaries) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier
} from '@floripa-dignidade/telemetry';

import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';

/**
 * @section Aduana de ADN (Prop Validation)
 * Define el contrato de integridad inmutable para la identidad visual.
 */
export const GlobalBrandLogoPropertiesSchema = z.object({
  imageWidthPixelQuantity: z.number().default(180),
  imageHeightPixelQuantity: z.number().default(60),
  isNavigationLinkEnabledBoolean: z.boolean().default(true),
  visualVariantLiteral: z.enum(['STANDARD', 'MONOCHROME_WHITE']).default('STANDARD'),
  labels: z.object({
    logoAlternativeTextLiteral: z.string().min(1),
    navigationAriaLabelLiteral: z.string().min(1),
  }).readonly(),
  externalClassName: z.string().optional(),
}).readonly();

export type IGlobalBrandLogoProperties = z.infer<typeof GlobalBrandLogoPropertiesSchema>;

/**
 * @name VARIANT_ASSETS_MAPPING
 * @description Mapa de activos físicos inyectados en la infraestructura.
 */
const VARIANT_ASSETS_MAPPING: Record<string, string> = {
  STANDARD: '/brand/floripa-dignidade-logo-color.png',
  MONOCHROME_WHITE: '/brand/floripa-dignidade-logo-white.png',
};

export const GlobalBrandLogo: React.FC<IGlobalBrandLogoProperties> = (rawProperties) => {

  // 1. ADUANA DE ADN: Purificación de entrada
  const {
    imageWidthPixelQuantity,
    imageHeightPixelQuantity,
    isNavigationLinkEnabledBoolean,
    labels,
    visualVariantLiteral,
    externalClassName,
  } = GlobalBrandLogoPropertiesSchema.parse(rawProperties);

  /**
   * @section Gestión de Interacción Telemétrica
   * 🛡️ SANEADO Zenith: El retorno a home es un evento de trazabilidad crítica.
   */
  const handleLogoInteractionAction = useCallback(() => {
    const correlationIdentifier = GenerateCorrelationIdentifier();

    void EmitTelemetrySignal({
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: 'GLOBAL_BRAND_LOGO_ATOM',
      operationCodeLiteral: 'BRAND_HOME_NAVIGATION_TRIGGERED',
      correlationIdentifier,
      messageContentLiteral: 'Navegación institucional hacia raíz detectada desde el logotipo.',
      contextMetadataSnapshot: {
        variantLiteral: visualVariantLiteral,
        timestampISO: new Date().toISOString()
      }
    });
  }, [visualVariantLiteral]);

  // 2. CONSTRUCCIÓN DEL ELEMENTO VISUAL (Atomic Composition)
  const brandLogoVisualElement = (
    <div className={GlobalStyleClassMerger(
      "flex items-center justify-center transition-all duration-500",
      "hover:opacity-85 active:scale-[0.97]",
      externalClassName
    )}>
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
      aria-label={labels.navigationAriaLabelLiteral}
      className={GlobalStyleClassMerger(
        "outline-none rounded-xl transition-all duration-300",
        "focus-visible:ring-4 focus-visible:ring-amber-500/30 focus-visible:ring-offset-2"
      )}
    >
      {brandLogoVisualElement}
    </Link>
  );
};
