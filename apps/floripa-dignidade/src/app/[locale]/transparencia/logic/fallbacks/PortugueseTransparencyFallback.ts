/**
 * @file apps/floripa-dignidade/src/app/[locale]/transparencia/logic/fallbacks/PortugueseTransparencyFallback.ts
 * @section Transparency Gazette - Portuguese In-Memory Fallback (Atom)
 * @description Respaldo institucional inmutable en memoria para idioma portugués (pt-BR).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  type ITransparencyPageI18n,
  TransparencyPageI18nSchema,
} from '../../i18n/schemas/TransparencyPage.i18n.schema';
import { FALLBACK_ARTICLE_SPECIFICATIONS } from './FallbackArticleSpecifications';

export const PORTUGUESE_TRANSPARENCY_FALLBACK: ITransparencyPageI18n =
  TransparencyPageI18nSchema.parse({
    hero: {
      editionBadgeLiteral: 'Transparência Ativa • Lei 12.527/2011 • Florianópolis',
      editionLabelLiteral: 'Diário Cívico por Secretarias',
      headlineMainLiteral: 'Jornal da transparência pública:',
      headlineAccentLiteral: 'fatos auditados por secretaria',
      leadDescriptionLiteral:
        'Sínteses jornalísticas, resumos executivos e alertas de fiscalização sobre contratos e serviços municipais em Florianópolis.',
      primaryCtaLabelLiteral: 'Abrir Observatório de Gastos',
      secondaryCtaLabelLiteral: 'Enviar Denúncia Protegida',
    },
    navigation: {
      filterHeadingLiteral: 'Filtrar edição por secretaria municipal',
      allSecretariatsLabelLiteral: 'Todas as Secretarias',
      articlesCountSuffixLiteral: 'boletins publicados',
      jumpToSecretariatPrefixLiteral: 'Filtrar caderno de',
    },
    featuredLead: {
      sectionBadgeLiteral: 'Manchete de Capa • Dossiê em Destaque',
      readInObservatoryLabelLiteral: 'Conferir dados no Observatório',
      article: {
        ...FALLBACK_ARTICLE_SPECIFICATIONS.lead,
        headlineLiteral:
          'Auditoria cidadã acompanha execução dos termos de acolhimento e segurança alimentar',
        summaryLiteral:
          'Levantamento documental cruza convênios da Passarela da Cidadania e cozinhas solidárias com metas territoriais.',
        sourceReferenceLiteral: 'Portal da Transparência PMF • Termos 2026',
      },
    },
    statusLabels: {
      VERIFIED_AUDIT: 'Fonte Oficial Verificada',
      MONITORING_ACTIVE: 'Em Acompanhamento',
      CRITICAL_ALERT: 'Alerta Prioritário',
    },
    secretariatsSection: {
      sectionHeadingLiteral: 'Cadernos Setoriais por Secretaria',
      sectionSubtitleLiteral:
        'Cada pasta reúne um resumo executivo do período e os boletins vinculados a atos oficiais.',
      summaryHeadingLiteral: 'Resumo Executivo da Secretaria',
      sourcePrefixLiteral: 'Fonte:',
      secretariatsCollection: [
        {
          secretariatIdentifier: 'SOCIAL_ASSISTANCE',
          secretariatNameLiteral: 'Assistência Social e Direitos Humanos',
          executiveSummaryLiteral:
            'Monitoramento de abrigos municipais, abordagem social e fornecimento contínuo de refeições.',
          keyFocusAreaLiteral: 'Proteção Social Especial e Segurança Alimentar',
          articlesCollection: [
            {
              ...FALLBACK_ARTICLE_SPECIFICATIONS.social,
              headlineLiteral:
                'Relatório avalia capacidade de vagas e protocolos de acolhimento digno',
              summaryLiteral:
                'Apuração consolida ocupação e cumprimento das diretrizes MROSC no Centro e Continente.',
              sourceReferenceLiteral: 'Diário Oficial do Município • MROSC',
            },
          ],
        },
        {
          secretariatIdentifier: 'PUBLIC_HEALTH',
          secretariatNameLiteral: 'Saúde Pública e Atenção Primária',
          executiveSummaryLiteral:
            'Acompanhamento de medicamentos essenciais, consultórios na rua e cobertura básica.',
          keyFocusAreaLiteral: 'Consultório na Rua e Unidades Básicas',
          articlesCollection: [
            {
              ...FALLBACK_ARTICLE_SPECIFICATIONS.health,
              headlineLiteral:
                'Atendimentos itinerantes ampliam acesso para cidadãos sem documentação civil',
              summaryLiteral:
                'Equipes multiprofissionais reforçam acompanhamento clínico sem exigência prévia de residência fixa.',
              sourceReferenceLiteral: 'Boletim Técnico SMS • Atenção Primária',
            },
          ],
        },
        {
          secretariatIdentifier: 'INFRASTRUCTURE_SANITATION',
          secretariatNameLiteral: 'Infraestrutura, Moradia e Saneamento',
          executiveSummaryLiteral:
            'Fiscalização de drenagem, água potável e prevenção de remoções sem alternativa habitacional.',
          keyFocusAreaLiteral: 'Saneamento Básico e Direito à Cidade',
          articlesCollection: [
            {
              ...FALLBACK_ARTICLE_SPECIFICATIONS.infrastructure,
              headlineLiteral:
                'Nota técnica reforça urgência de pontos públicos de água potável e sanitários',
              summaryLiteral:
                'Indicadores territoriais recomendam instalação prioritária em corredores urbanos centrais.',
              sourceReferenceLiteral: 'Diagnóstico Territorial • Floripa Dignidade',
            },
          ],
        },
      ],
    },
    methodologyBanner: {
      headlineLiteral: 'Metodologia Editorial e Independência Cívica',
      descriptionLiteral:
        'Cada resumo publicado vincula-se a documentos oficiais ou relatos anonimizados conforme a LGPD.',
      legalBasisLiteral: 'Lei 12.527/2011 (LAI) • Lei 13.019/2014 (MROSC) • Lei 13.709/2018 (LGPD)',
    },
    metadata: {
      pageTitleLiteral: 'Transparência Ativa e Diário por Secretarias',
      pageDescriptionLiteral:
        'Periódico cívico com notícias resumidas e auditorias por secretarias municipais de Florianópolis.',
    },
  });
