/**
 * @file apps/content-manager-system/src/app/(app)/components/CmsRestrictedAccessGate.tsx
 * @section CMS UI Organism - Restricted Access Gate
 * @description Renderiza la puerta de acceso institucional (Fail-Closed) cuando el visitante
 * carece de cookie `HttpOnly` válida, no posee rango administrativo suficiente o requiere
 * completar el bootstrap del primer administrador en el CMS.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0029 / ADR 0031).
 * Normas: ISO/IEC 11179, ISO/IEC 25010, ISO/IEC 27001 y W3C WCAG 2.2 AAA.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ArrowRight, Lock, ShieldAlert, UserPlus } from 'lucide-react';
import React from 'react';

import type { ICmsSessionSnapshot } from '../../../infrastructure/auth/schemas/CmsSessionSnapshot.schema';
import { CmsLogoutButton } from './CmsLogoutButton';

interface ICmsRestrictedAccessGateProperties {
  readonly sessionSnapshot: ICmsSessionSnapshot;
}

const GATE_COPY_CATALOG = {
  BOOTSTRAP_REQUIRED: {
    badgeLiteral: 'Inicialização do Sistema',
    headlineLiteral: 'Criar Primeiro Administrador Institucional',
    descriptionLiteral:
      'Nenhuma conta administrativa foi registrada ainda neste nó. Complete o cadastro inicial para ativar a autenticação por cookie seguro.',
    actionHrefLiteral: '/admin/create-first-user',
    actionLabelLiteral: 'Criar Primeiro Administrador',
  },
  UNAUTHENTICATED_VISITOR: {
    badgeLiteral: 'Acesso Restrito • Autenticação Obrigatória',
    headlineLiteral: 'Painel Institucional Floripa Dignidade',
    descriptionLiteral:
      'Esta área é reservada exclusivamente a operadores e auditores registrados. Faça login para receber sua credencial de sessão segura (HttpOnly).',
    actionHrefLiteral: '/admin/login',
    actionLabelLiteral: 'Entrar com Credencial Institucional',
  },
  INSUFFICIENT_AUTHORITY: {
    badgeLiteral: 'Acesso Negado (403) • Privilégios Insuficientes',
    headlineLiteral: 'Perfil sem Autoridade Operacional no CMS',
    descriptionLiteral:
      'Sua sessão atual está autenticada, mas o nível de acesso atribuído não possui permissão para operar o painel administrativo.',
    actionHrefLiteral: '/admin/login',
    actionLabelLiteral: 'Trocar de Conta',
  },
} as const;

/**
 * Renderiza la interfaz segura para visitantes no autorizados o estado inicial de bootstrap.
 *
 * @param propertiesSnapshot - Snapshot validado de sesión devuelto por `ResolveCmsSessionSnapshot`.
 * @returns {React.ReactElement} Vista accesible de control de acceso perimetral.
 */
export const CmsRestrictedAccessGate: React.FC<ICmsRestrictedAccessGateProperties> = ({
  sessionSnapshot,
}) => {
  const isBootstrapBoolean = sessionSnapshot.sessionStatusLiteral === 'BOOTSTRAP_REQUIRED';
  const isInsufficientRoleBoolean =
    sessionSnapshot.sessionStatusLiteral === 'INSUFFICIENT_AUTHORITY';

  const activeCopySnapshot = isBootstrapBoolean
    ? GATE_COPY_CATALOG.BOOTSTRAP_REQUIRED
    : isInsufficientRoleBoolean
      ? GATE_COPY_CATALOG.INSUFFICIENT_AUTHORITY
      : GATE_COPY_CATALOG.UNAUTHENTICATED_VISITOR;

  return (
    <main className="cms-gate-wrapper">
      <section className="cms-gate-card" aria-labelledby="cms-gate-headline">
        <div
          className={
            isInsufficientRoleBoolean
              ? 'cms-status-emblem cms-status-emblem-alert'
              : 'cms-status-emblem'
          }
          aria-hidden="true"
        >
          {isBootstrapBoolean ? (
            <UserPlus size={36} />
          ) : isInsufficientRoleBoolean ? (
            <ShieldAlert size={36} />
          ) : (
            <Lock size={36} />
          )}
        </div>

        <p className="cms-badge">{activeCopySnapshot.badgeLiteral}</p>

        <h1 id="cms-gate-headline" className="cms-gate-headline">
          {activeCopySnapshot.headlineLiteral}
        </h1>

        <p className="cms-gate-description">{activeCopySnapshot.descriptionLiteral}</p>

        <div className="cms-actions-row">
          <a href={activeCopySnapshot.actionHrefLiteral} className="cms-btn-primary">
            <span>{activeCopySnapshot.actionLabelLiteral}</span>
            <ArrowRight size={18} aria-hidden="true" />
          </a>

          {isInsufficientRoleBoolean && (
            <CmsLogoutButton
              labelLiteral="Encerrar Sessão Atual"
              submittingLabelLiteral="Encerrando..."
            />
          )}
        </div>

        <p className="cms-trace-footer">
          Referência de Auditoria: <span>{sessionSnapshot.correlationIdentifier}</span>
        </p>
      </section>
    </main>
  );
};
