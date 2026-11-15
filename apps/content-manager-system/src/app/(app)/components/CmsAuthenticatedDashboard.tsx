/**
 * @file apps/content-manager-system/src/app/(app)/components/CmsAuthenticatedDashboard.tsx
 * @section CMS UI Organism - Authenticated Operator Welcome Dashboard
 * @description Página de bienvenida institucional mostrada exclusivamente a operadores
 * y auditores con cookie `HttpOnly` verificada en el servidor y rol autorizado.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0029 / ADR 0031).
 * Normas: ISO/IEC 11179, ISO/IEC 25010, ISO/IEC 27001 y W3C WCAG 2.2 AAA.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { CheckCircle2, ExternalLink, ShieldCheck } from 'lucide-react';
import React from 'react';

import type { ICmsSessionSnapshot } from '../../../infrastructure/auth/schemas/CmsSessionSnapshot.schema';
import { LearningMaterialsSection } from '../../components/LearningMaterialsSection';
import { CmsLogoutButton } from './CmsLogoutButton';

interface ICmsAuthenticatedDashboardProperties {
  readonly sessionSnapshot: ICmsSessionSnapshot;
}

const AUTHENTICATED_DASHBOARD_DICTIONARY = {
  badgeLiteral: 'Sessão Autenticada via Cookie HttpOnly',
  greetingPrefixLiteral: 'Bem-vindo ao Núcleo Editorial,',
  defaultOperatorTitleLiteral: 'Operador Institucional',
  descriptionLiteral:
    'Sua credencial de acesso foi verificada no servidor. Você possui permissão ativa para gerenciar organizações, acervo multimídia e identidades autorizadas.',
  adminCtaLabelLiteral: 'Abrir Painel Administrativo (/admin)',
  roadmapHeadingLiteral: 'Diretrizes de Operação Segura',
  roadmapDescriptionLiteral:
    'Toda mutação editorial e carregamento de mídia na bóveda S3 é auditada com identificador de correlação distribuída e conformidade LGPD.',
  learning: {
    sectionHeadingLiteral: 'Documentação Operacional',
    documentation: {
      labelLiteral: 'Documentação Payload CMS',
      descriptionLiteral: 'Guias oficiais de coleções e editor lexical',
      url: 'https://payloadcms.com/docs',
    },
    interactive: {
      labelLiteral: 'Portal Cidadão Floripa Dignidade',
      descriptionLiteral: 'Visualizar ambiente público de transparência',
      url: 'https://floripa-dignidade-portal.vercel.app',
    },
  },
} as const;

/**
 * Renderiza el tablero de bienvenida para operadores autenticados del CMS.
 *
 * @param propertiesSnapshot - Snapshot inmutable de sesión verificada por `ResolveCmsSessionSnapshot`.
 * @returns {React.ReactElement} Vista autenticada accesible y alineada a ADR 0029.
 */
export const CmsAuthenticatedDashboard: React.FC<ICmsAuthenticatedDashboardProperties> = ({
  sessionSnapshot,
}) => {
  const operatorNameLiteral =
    sessionSnapshot.operatorDisplayNameLiteral ??
    AUTHENTICATED_DASHBOARD_DICTIONARY.defaultOperatorTitleLiteral;

  return (
    <div className="cms-dashboard-container">
      <header className="cms-dashboard-header">
        <div className="cms-status-pill">
          <CheckCircle2 size={16} aria-hidden="true" />
          <span>{AUTHENTICATED_DASHBOARD_DICTIONARY.badgeLiteral}</span>
        </div>

        <h1 className="cms-dashboard-title">
          <span className="cms-dashboard-subtitle">
            {AUTHENTICATED_DASHBOARD_DICTIONARY.greetingPrefixLiteral}
          </span>
          <span>{operatorNameLiteral}</span>
        </h1>
      </header>

      <section className="cms-hero-panel" aria-labelledby="cms-session-status-heading">
        <div className="cms-hero-content">
          <h2 id="cms-session-status-heading" className="cms-hero-heading">
            <ShieldCheck size={28} aria-hidden="true" />
            <span>Nível: {sessionSnapshot.assignedAuthorityRoleLiteral}</span>
          </h2>
          <p className="cms-hero-description">
            {AUTHENTICATED_DASHBOARD_DICTIONARY.descriptionLiteral}
          </p>

          <div className="cms-actions-row">
            <a href="/admin" className="cms-btn-accent">
              <span>{AUTHENTICATED_DASHBOARD_DICTIONARY.adminCtaLabelLiteral}</span>
              <ExternalLink size={18} aria-hidden="true" />
            </a>

            <CmsLogoutButton
              labelLiteral="Encerrar Sessão"
              submittingLabelLiteral="Encerrando..."
            />
          </div>
        </div>
      </section>

      <main className="cms-middle-grid">
        <LearningMaterialsSection dictionary={AUTHENTICATED_DASHBOARD_DICTIONARY.learning} />

        <article className="cms-info-card">
          <h2 className="cms-info-card-heading">
            {AUTHENTICATED_DASHBOARD_DICTIONARY.roadmapHeadingLiteral}
          </h2>
          <p className="cms-info-card-body">
            {AUTHENTICATED_DASHBOARD_DICTIONARY.roadmapDescriptionLiteral}
          </p>
          <p className="cms-trace-footer">
            Correlação da Sessão: <span>{sessionSnapshot.correlationIdentifier}</span>
          </p>
        </article>
      </main>
    </div>
  );
};
