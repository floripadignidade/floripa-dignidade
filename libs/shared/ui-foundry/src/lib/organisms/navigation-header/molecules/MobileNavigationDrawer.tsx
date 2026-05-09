'use client';

/**
 * @section UI Molecule - Mobile Navigation Drawer
 * @description Panel lateral de navegación optimizado para dispositivos táctiles.
 * Implementa el patrón 'Overlay' con bloqueo de scroll, búsqueda integrada
 * y rastro telemétrico de visibilidad para auditoría de UX.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Universal Accessibility.
 * SANEADO Zenith: Resolución de Self-import (Nx Boundary), corrección de tipos
 * y ordenamiento alfabético de miembros.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Info, Newspaper, ShieldCheck } from 'lucide-react';

/* 1. Infraestructura Core y Utilidades (Sovereign Swarm) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
} from '@floripa-dignidade/telemetry';

/* 2. Átomos y Primitivos Locales (Relative Paths - Nx Compliance) */
import { GlobalActionButton } from '../../../atoms/GlobalActionButton';
import { GlobalSearchWidget } from '../../../molecules/GlobalSearchWidget';

/* 3. ADN Estructural (Silo Lingüístico) */
import type { IMainNavigationHeaderI18n } from '../../../composite-ui/i18n/MainNavigationHeaderI18n.schema';

/**
 * @interface IMobileNavigationDrawerProperties
 * @description Contrato inmutable para la gestión de visibilidad y contenido del cajón.
 */
export interface IMobileNavigationDrawerProperties {
  /** Estado de visibilidad controlado por el orquestador superior (Header). */
  readonly isOpenBoolean: boolean;
  /** Diccionario de traducciones validado por la aduana Zod. */
  readonly translationDictionary: IMainNavigationHeaderI18n;
}

/** Identificador técnico del aparato para el Neural Sentinel. */
const MOLECULE_IDENTIFIER = 'MOBILE_NAVIGATION_DRAWER_MOLECULE';

export const MobileNavigationDrawer: React.FC<IMobileNavigationDrawerProperties> = ({
  isOpenBoolean,
  translationDictionary,
}) => {
  /**
   * @section Gestión de Telemetría de Visibilidad
   * 🛡️ LEY ZENITH: El tiempo de exposición y la interacción con el Drawer son auditados.
   */
  useEffect(() => {
    if (!isOpenBoolean) return;

    const correlationIdentifier = GenerateCorrelationIdentifier();

    void EmitTelemetrySignal({
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: MOLECULE_IDENTIFIER,
      operationCodeLiteral: 'MOBILE_DRAWER_DISPLAYED',
      correlationIdentifier,
      messageContentLiteral: 'Cajón de navegación móvil desplegado por el ciudadano.',
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
          {/* 1. FONDO DE CONTRASTE (Backdrop) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* 2. CONTENEDOR DE NAVEGACIÓN (Drawer) */}
          <motion.nav
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col"
            role="navigation"
          >
            {/* CABECERA INTERNA: Búsqueda Soberana */}
            <header className="p-6 border-b border-slate-100 bg-slate-50/50">
              <GlobalSearchWidget
                labels={{
                  inputPlaceholderLiteral: translationDictionary.actions.searchPlaceholder,
                  accessibilityLabelLiteral: translationDictionary.actions.searchPlaceholder,
                  searchingStatusLiteral: 'EXPLORANDO...',
                }}
              />
            </header>

            {/* CUERPO: Enlaces de Identidad e Impacto */}
            <main className="flex-grow overflow-y-auto p-6 flex flex-col gap-2">
              <MobileNavLink
                hrefLiteral="/identidad"
                labelLiteral={translationDictionary.navigationPaths.identity}
                iconNode={<Info size={20} />}
              />

              <MobileNavLink
                hrefLiteral="/transparencia"
                labelLiteral={translationDictionary.navigationPaths.transparency}
                iconNode={<ShieldCheck size={20} />}
              />

              <MobileNavLink
                hrefLiteral="/prensa"
                labelLiteral={translationDictionary.navigationPaths.press}
                iconNode={<Newspaper size={20} />}
              />

              {/* ACCIÓN DE EMERGENCIA (Búnker de Denuncias) */}
              <Link
                href="/denuncia"
                className="mt-4 flex items-center justify-between p-5 rounded-2xl bg-red-50 text-red-700 border border-red-100 active:scale-95 transition-all"
              >
                <div className="flex items-center gap-4">
                  <ShieldCheck size={24} />
                  <span className="font-black text-sm uppercase tracking-wider">
                    {translationDictionary.actions.reportEmergencyLabel}
                  </span>
                </div>
              </Link>
            </main>

            {/* PIE: Conversión Primaria (Donación) */}
            <footer className="p-6 border-t border-slate-100">
              <GlobalActionButton
                visualIntentConfigurationLiteral="CONVERSION"
                actionIdentifierLiteral="MOBILE_DRAWER_DONATE_CTA"
                className="w-full py-5 text-lg"
              >
                <Heart className="w-5 h-5 fill-current" />
                <span>{translationDictionary.actions.donateCallToAction}</span>
              </GlobalActionButton>
            </footer>
          </motion.nav>
        </div>
      )}
    </AnimatePresence>
  );
};

/**
 * @private Sub-Aparato: MobileNavLink
 * @description Átomo local para la renderización de filas de navegación móvil.
 */
interface IMobileNavLinkProperties {
  readonly hrefLiteral: string;
  readonly labelLiteral: string;
  readonly iconNode: React.ReactNode;
}

const MobileNavLink: React.FC<IMobileNavLinkProperties> = ({
  hrefLiteral,
  labelLiteral,
  iconNode,
}) => (
  <Link
    href={hrefLiteral}
    className="flex items-center gap-5 p-5 rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-navy-900 transition-all group active:scale-[0.98]"
  >
    <div className="text-slate-400 group-hover:text-amber-500 transition-colors">{iconNode}</div>
    <span className="font-bold text-base">{labelLiteral}</span>
  </Link>
);
