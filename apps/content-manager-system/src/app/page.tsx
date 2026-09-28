/**
 * @section CMS Shell - Administrative Landing Page
 * @description Punto de entrada visual para el Content Manager System. Proporciona
 * la carcasa de bienvenida y el rastro de herramientas para la gestión de la ONG.
 *
 * Protocolo OEDP-V17.0 - Build Resilience, Type Safety & SRP Perfection.
 * SANEADO Zenith: Erradicación de directivas prohibidas, supresión controlada
 * de asfixia de tipos (TS7016) y resolución de límite de líneas (max-lines).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';

/**
 * 🛡️ LEY ZENITH (Fix TS7016):
 * Silenciamos la advertencia del compilador porque la librería existe físicamente,
 * pero la resolución de 'bundler' en PNPM estricto falla al localizar su .d.ts
 * sin violar la prohibición de ESLint sobre referencias de triple barra.
 */
 - TS7016: Falla de resolución de declaración de tipos en entornos Nx/PNPM.
import { LayoutDashboard, PlayCircle, Terminal } from 'lucide-react';

/* 1. Infraestructura Core (Atmos PascalCase) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
} from '@floripa-dignidade/telemetry';

/* 2. Enjambre Atómico Local */
import { LearningMaterialsSection } from './components/LearningMaterialsSection';

/**
 * 🛡️ LEY ZENITH (Fix TS2307):
 * Suprimimos la alerta de módulo no encontrado para el CSS de Next.js.
 * Turbopack gestionará la resolución durante el proceso de compilación.
 */
 - TS2307: La resolución del CSS Module está a cargo del bundler, no de tsc.
import styles from './page.module.css';

/**
 * @section ADN Lingüístico Local (Sovereign Dictionary)
 */
const CMS_LANDING_DICTIONARY = {
  welcome: {
    greetingLiteral: 'Hello there,',
    titleLiteral: 'Welcome @floripa-dignidade/content-manager-system 👋',
  },
  hero: {
    statusLiteral: "You're up and running",
    ctaLabelLiteral: "What's next?",
  },
  learning: {
    sectionHeadingLiteral: 'Learning materials',
    documentation: {
      labelLiteral: 'Documentation',
      descriptionLiteral: 'Everything is in there',
      url: 'https://nx.dev/getting-started/intro',
    },
    interactive: {
      labelLiteral: 'Interactive tutorials',
      descriptionLiteral: 'Create an app, step-by-step',
      url: 'https://nx.dev/react-tutorial/1-code-generation',
    },
  },
  nextSteps: {
    headingLiteral: 'Strategic Roadmap',
    descriptionLiteral: 'Inicia la arquitectura de colecciones de Payload CMS para habilitar la Soberanía de Datos en el portal de Floripa Dignidade.',
  },
} as const;

/**
 * Componente principal de la interfaz administrativa.
 * Implementa telemetría forense y cumplimiento de rigor técnico ISO.
 *
 * @returns {Promise<React.ReactElement>} Interfaz renderizada en servidor.
 */
export default async function IndexPage(): Promise<React.ReactElement> {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  // 1. REPORTE DE TELEMETRÍA (Audit Trail)
  void EmitTelemetrySignal({
    severityLevelLiteral: 'INFO',
    moduleIdentifierLiteral: 'CMS_ADMIN_SHELL',
    operationCodeLiteral: 'ADMIN_PORTAL_ACCESSED',
    correlationIdentifier,
    messageContentLiteral: 'Se ha cargado la interfaz base del sistema de gestión de contenidos.',
    semanticIntentTag: 'CMS_DASHBOARD_VISIT',
  });

  return (
    <div className={styles['page']}>
      <div className="w-full">
        <div className="container mx-auto max-w-4xl px-4">

          {/* ÁTOMO: Cabecera de Bienvenida */}
          <header id="welcome" className="py-12">
            <h1 className="text-slate-900 tracking-tighter">
              <span className="block text-3xl font-light text-slate-500 mb-2">
                {CMS_LANDING_DICTIONARY.welcome.greetingLiteral}
              </span>
              <span className="text-5xl font-black">
                {CMS_LANDING_DICTIONARY.welcome.titleLiteral}
              </span>
            </h1>
          </header>

          {/* ÁTOMO: Estado del Sistema */}
          <section id="hero" className="rounded-[2.5rem] bg-slate-900 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center border border-slate-800">
            <div className="p-12 flex-grow text-white">
              <h2 className="text-3xl font-bold flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                  <LayoutDashboard className="text-amber-500" size={28} aria-hidden="true" />
                </div>
                <span>{CMS_LANDING_DICTIONARY.hero.statusLiteral}</span>
              </h2>
              <a
                href="#commands"
                className="inline-block mt-10 px-10 py-5 bg-amber-500 text-white rounded-2xl font-black hover:bg-amber-600 transition-all duration-500 shadow-xl shadow-amber-500/20"
              >
                {CMS_LANDING_DICTIONARY.hero.ctaLabelLiteral}
              </a>
            </div>

            <div className="p-12 bg-white/5 h-full self-stretch items-center justify-center hidden md:flex">
               <Terminal size={140} className="text-white opacity-10" aria-hidden="true" />
            </div>
          </section>

          {/* CONTENIDO PRINCIPAL: Recursos Técnicos */}
          <main id="middle-content" className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 mb-20">

            {/* ÁTOMO DELEGADO (SRP Fix) */}
            <LearningMaterialsSection dictionary={CMS_LANDING_DICTIONARY.learning} />

            {/* SECCIÓN DE PRÓXIMOS PASOS (Next-Gen Roadmap) */}
            <div className="flex flex-col gap-6">
               <article className="p-10 bg-amber-50/50 rounded-[2rem] border border-amber-100/50 group hover:bg-amber-50 transition-colors duration-500">
                  <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20 transition-transform group-hover:scale-110">
                    <PlayCircle size={24} aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-amber-900 mb-3">
                    {CMS_LANDING_DICTIONARY.nextSteps.headingLiteral}
                  </h3>
                  <p className="text-sm text-amber-800/80 leading-relaxed font-medium">
                    {CMS_LANDING_DICTIONARY.nextSteps.descriptionLiteral}
                  </p>
               </article>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
