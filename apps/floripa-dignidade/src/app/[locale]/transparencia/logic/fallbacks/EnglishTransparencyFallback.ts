/**
 * @file apps/floripa-dignidade/src/app/[locale]/transparencia/logic/fallbacks/EnglishTransparencyFallback.ts
 * @section Transparency Gazette - English In-Memory Fallback (Atom)
 * @description Respaldo institucional inmutable en memoria para idioma inglés (en-US).
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

export const ENGLISH_TRANSPARENCY_FALLBACK: ITransparencyPageI18n =
  TransparencyPageI18nSchema.parse({
    hero: {
      editionBadgeLiteral: 'Proactive Transparency • Law 12.527/2011 • Florianópolis',
      editionLabelLiteral: 'Civic Gazette by Secretariat',
      headlineMainLiteral: 'Public transparency gazette:',
      headlineAccentLiteral: 'audited facts by secretariat',
      leadDescriptionLiteral:
        'Follow journalistic briefings, executive summaries, and civic oversight alerts covering municipal contracts and services in Florianópolis.',
      primaryCtaLabelLiteral: 'Open Expenditure Observatory',
      secondaryCtaLabelLiteral: 'Submit Protected Report',
    },
    navigation: {
      filterHeadingLiteral: 'Filter edition by municipal secretariat',
      allSecretariatsLabelLiteral: 'All Secretariats',
      articlesCountSuffixLiteral: 'published briefings',
      jumpToSecretariatPrefixLiteral: 'Filter desk for',
    },
    featuredLead: {
      sectionBadgeLiteral: 'Front Page Lead • Featured Dossier',
      readInObservatoryLabelLiteral: 'Inspect figures in Observatory',
      article: {
        ...FALLBACK_ARTICLE_SPECIFICATIONS.lead,
        headlineLiteral:
          'Civic audit tracks municipal shelter agreements and food security execution',
        summaryLiteral:
          'Documentary review cross-checks Passarela da Cidadania agreements and solidarity kitchens against territorial goals.',
        sourceReferenceLiteral: 'PMF Transparency Portal • Terms 2026',
      },
    },
    statusLabels: {
      VERIFIED_AUDIT: 'Official Source Verified',
      MONITORING_ACTIVE: 'Active Monitoring',
      CRITICAL_ALERT: 'Priority Alert',
    },
    secretariatsSection: {
      sectionHeadingLiteral: 'Sectoral Desks by Secretariat',
      sectionSubtitleLiteral:
        'Each municipal department compiles an executive summary alongside briefings linked to official records.',
      summaryHeadingLiteral: 'Secretariat Executive Summary',
      sourcePrefixLiteral: 'Source:',
      secretariatsCollection: [
        {
          secretariatIdentifier: 'SOCIAL_ASSISTANCE',
          secretariatNameLiteral: 'Social Assistance and Human Rights',
          executiveSummaryLiteral:
            'Monitoring municipal shelters, street outreach teams, and continuous meal distribution.',
          keyFocusAreaLiteral: 'Special Social Protection and Food Security',
          articlesCollection: [
            {
              ...FALLBACK_ARTICLE_SPECIFICATIONS.social,
              headlineLiteral: 'Report assesses bed capacity and dignified shelter protocols',
              summaryLiteral:
                'Review consolidates occupancy logs and MROSC compliance across Downtown and Mainland units.',
              sourceReferenceLiteral: 'Municipal Official Gazette • MROSC',
            },
          ],
        },
        {
          secretariatIdentifier: 'PUBLIC_HEALTH',
          secretariatNameLiteral: 'Public Health and Primary Care',
          executiveSummaryLiteral:
            'Tracking essential medicine stocks, mobile street clinics, and primary care coverage.',
          keyFocusAreaLiteral: 'Street Outreach Clinics and Primary Care Units',
          articlesCollection: [
            {
              ...FALLBACK_ARTICLE_SPECIFICATIONS.health,
              headlineLiteral: 'Mobile outreach lowers access barriers for undocumented citizens',
              summaryLiteral:
                'Multidisciplinary teams reinforce clinical follow-ups without requiring proof of fixed address.',
              sourceReferenceLiteral: 'SMS Technical Bulletin • Primary Care',
            },
          ],
        },
        {
          secretariatIdentifier: 'INFRASTRUCTURE_SANITATION',
          secretariatNameLiteral: 'Infrastructure, Housing and Sanitation',
          executiveSummaryLiteral:
            'Inspection of drainage, clean drinking water access, and prevention of forced evictions.',
          keyFocusAreaLiteral: 'Basic Sanitation and Right to the City',
          articlesCollection: [
            {
              ...FALLBACK_ARTICLE_SPECIFICATIONS.infrastructure,
              headlineLiteral: 'Technical note stresses urgency for public drinking water stations',
              summaryLiteral:
                'Territorial indicators recommend priority installation along central urban corridors.',
              sourceReferenceLiteral: 'Territorial Diagnosis • Floripa Dignidade',
            },
          ],
        },
      ],
    },
    methodologyBanner: {
      headlineLiteral: 'Editorial Methodology and Civic Independence',
      descriptionLiteral:
        'Every published briefing links back to official public records or testimonies anonymized under LGPD.',
      legalBasisLiteral:
        'Law 12.527/2011 (FOIA) • Law 13.019/2014 (MROSC) • Law 13.709/2018 (LGPD)',
    },
    metadata: {
      pageTitleLiteral: 'Proactive Transparency and Secretariat Gazette',
      pageDescriptionLiteral:
        'Civic gazette with summarized news briefings and audits organized by municipal secretariats in Florianópolis.',
    },
  });
