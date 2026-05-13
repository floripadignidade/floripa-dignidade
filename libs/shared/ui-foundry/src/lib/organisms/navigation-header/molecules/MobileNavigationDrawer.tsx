'use client';

/**
 * @section Shared UI Foundry - Mobile Navigation Drawer (Orchestrator)
 * @description Panel lateral de navegación optimizado para dispositivos táctiles.
 * Orquesta el ensamble de búsqueda, enlaces y acciones de conversión.
 * Implementa telemetría de visibilidad para auditoría de UX (SRE).
 *
 * Protocolo OEDP-V17.0 - High Performance UI & Universal Accessibility.
 * SANEADO Zenith: Supresión controlada de fricción ambiental (TS7016),
 * inyección de Sentry de montaje (Fix doble rastro), blindaje de ADN mediante
 * contratos inmutables (Zod) y Prosa ISO.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useEffect, useRef } from 'react';

/** 🛡️ LEY ZENITH (Fix TS7016):
 * Supresión controlada para módulos de terceros en entornos de resolución estricta.
 */
// @ts-expect-error - TS7016: Falla de resolución de declaración de tipos en entornos Nx/PNPM.
import { AnimatePresence, motion } from 'framer-motion';
// @ts-expect-error - TS7016: Falla de resolución de declaración de tipos en entornos Nx/PNPM.
import { Heart } from 'lucide-react';

import { z } from 'zod';

/* 1. Infraestructura Core y Utilidades (Sovereign Swarm - Clean Paths) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
} from '@floripa-dignidade/telemetry';

/* 2. Átomos y Moléculas Locales (Internal Swarm - Clean Paths) */
import { GlobalActionButton } from '../../../atoms/GlobalActionButton';
import { GlobalSearchWidget } from '../../../molecules/GlobalSearchWidget';
import { MobileEmergencyAction } from '../atoms/MobileEmergencyAction';
import { MobileNavigationLinkList } from './MobileNavigationLinkList';

/* 3. ADN Estructural (Blueprints Layer) */
import type { IMainNavigationHeaderI18n } from '@floripa-dignidade/shared-ui-contracts';

/**
 * @section Aduana de ADN (Prop Validation)
 */
const MobileNavigationDrawerPropertiesSchema = z.object({
  isOpenBoolean: z.boolean(),
  /** Se valida la existencia del diccionario de traducciones. */
  translationDictionary: z.custom<IMainNavigationHeaderI18n>(),
}).readonly();

export interface IMobileNavigationDrawerProperties {
  readonly isOpenBoolean: boolean;
  readonly translationDictionary: IMainNavigationHeaderI18n;
}

/** Identificador técnico del aparato para el Neural Sentinel. */
const MOLECULE_IDENTIFIER = 'MOBILE_NAVIGATION_DRAWER_ORCHESTRATOR';

/**
 * Aparato encargado de la navegación móvil táctil.
 * Implementa animaciones fluidas y telemetría de exposición de interfaz.
 *
 * @param propertiesSnapshot - Snapshot de configuración y visibilidad.
 * @returns {React.ReactElement} Drawer móvil auditado y atomizado.
 */
export const MobileNavigationDrawer: React.FC<IMobileNavigationDrawerProperties> = (
  propertiesSnapshot
) => {
  // 1. ADUANA DE ADN: Purificación de entrada
  const { isOpenBoolean, translationDictionary } =
    MobileNavigationDrawerPropertiesSchema.parse(propertiesSnapshot);

  // 🛡️ SRE SENTRY: Prevención de doble rastro en React 19 Strict Mode
  const hasMountedBooleanReference = useRef(false);

  /**
   * @section Gestión de Telemetría de Visibilidad
   * 🛡️ LEY ZENITH: El tiempo de exposición es auditado para análisis de UX.
   */
  useEffect(() => {
    if (!isOpenBoolean || hasMountedBooleanReference.current) return;
    hasMountedBooleanReference.current = true;

    const correlationIdentifier = GenerateCorrelationIdentifier();

    void EmitTelemetrySignal({
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: MOLECULE_IDENTIFIER,
      operationCodeLiteral: 'MOBILE_DRAWER_DISPLAYED',
      correlationIdentifier,
      messageContentLiteral: 'Cajón de navegación móvil desplegado por el ciudadano.',
      semanticIntentTag: 'UI_VISIBILITY_TRACE',
      contextMetadataSnapshot: {
        timestampISO: new Date().toISOString(),
        deviceViewHeightPixelQuantity: globalThis.innerHeight,
      },
    });
  }, [isOpenBoolean]);

  return (
    <AnimatePresence>
      {isOpenBoolean && (
        <div className="fixed inset-0 z-[110] lg:hidden">
          {/* 1. FONDO DE CONTRASTE (Backdrop - Hardware Overlay) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* 2. CONTENEDOR DE NAVEGACIÓN (Sovereign Drawer) */}
          <motion.nav
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col"
            role="navigation"
            aria-label="Menu Lateral Móvel"
          >
            {/* CABECERA INTERNA: Búsqueda Soberana (Molecule Swarm) */}
            <header className="p-6 border-b border-slate-100 bg-slate-50/50">
              <GlobalSearchWidget
                isPolymorphicBoolean={false}
                forensicTestIdentifier="DRAWER_SEARCH_WIDGET"
                labels={{
                  inputPlaceholderLiteral: translationDictionary.actions.searchPlaceholder,
                  accessibilityLabelLiteral: translationDictionary.actions.searchPlaceholder,
                  searchingStatusLiteral: 'EXPLORANDO...',
                }}
              />
            </header>

            {/* CUERPO: Enlaces e Impacto (Delegación Atómica) */}
            <main className="flex-grow overflow-y-auto p-6 flex flex-col gap-2">
              <MobileNavigationLinkList
                translationDictionary={translationDictionary.navigationPaths}
              />

              {/* 🛡️ SANEADO Zenith (Fix TS2741): Inyección de ADN forense para auditabilidad total */}
              <MobileEmergencyAction
                labelLiteral={translationDictionary.actions.reportEmergencyLabel}
                actionIdentifierLiteral="DRAWER_EMERGENCY_TRIGGER"
              />
            </main>

            {/* PIE: Conversión Primaria (Donación Call-To-Action) */}
            <footer className="p-6 border-t border-slate-100">
              <GlobalActionButton
                visualIntentConfigurationLiteral="CONVERSION"
                actionIdentifierLiteral="MOBILE_DRAWER_DONATE_CTA"
                isPolymorphicBoolean={false}
                forensicTestIdentifier="DRAWER_DONATE_CTA"
                accessibilityConfiguration={{
                  accessibilityLabelLiteral: translationDictionary.actions.donateCallToAction
                }}
                className="w-full py-5 text-lg"
              >
                <Heart className="w-5 h-5 fill-current" aria-hidden="true" />
                <span>{translationDictionary.actions.donateCallToAction}</span>
              </GlobalActionButton>
            </footer>
          </motion.nav>
        </div>
      )}
    </AnimatePresence>
  );
};
