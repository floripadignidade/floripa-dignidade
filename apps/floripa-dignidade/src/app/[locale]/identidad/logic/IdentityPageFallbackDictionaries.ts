/**
 * @file apps/floripa-dignidade/src/app/[locale]/identidad/logic/IdentityPageFallbackDictionaries.ts
 * @section Institutional Identity - In-Memory Fallbacks (Atom)
 * @description Proveedor de respaldos lingüísticos en memoria validados contra
 * `IdentityPageI18nSchema` para garantizar disponibilidad continua (cero 404 ni pantalla en blanco).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { DEFAULT_LOCALE_IDENTIFIER } from '@floripa-dignidade/contracts';

import {
  IdentityPageI18nSchema,
  type IIdentityPageI18n,
} from '../i18n/schemas/IdentityPage.i18n.schema';

const DEFAULT_BASE_LANGUAGE_LITERAL = DEFAULT_LOCALE_IDENTIFIER.split('-')[0] ?? 'pt';

const PORTUGUESE_FALLBACK: IIdentityPageI18n = IdentityPageI18nSchema.parse({
  hero: {
    badgeLabelLiteral: 'Transparência • Direitos Humanos • Florianópolis',
    headlineMainLiteral: 'A dignidade cidadã não é negociável:',
    headlineAccentLiteral: 'é uma conquista ativa',
    descriptionLiteral:
      'O Floripa Dignidade é uma organização da sociedade civil dedicada à defesa intransigente dos direitos humanos, fiscalização rigorosa do orçamento público municipal e acolhimento territorial de populações vulneráveis em Florianópolis.',
  },
  framework: {
    badgeLiteral: 'Marco Regulatório das OSCs',
    headlineLiteral: 'Constituição Jurídica e Governança Pública',
    descriptionLiteral:
      'Estruturada sob os parâmetros da Lei Federal 13.019/2014 (MROSC), a organização atua com autonomia política e partidária para auditar contratos públicos, termos de colaboração e serviços de acolhimento social.',
    legalFormLiteral: 'Associação Civil sem Fins Lucrativos (OSC)',
    territorialJurisdictionLiteral: 'Florianópolis e Região Metropolitana • Santa Catarina',
  },
  pillarsSection: {
    badgeLiteral: 'Tríade de Impacto',
    headlineLiteral: 'Pão, Teto e Lei: As Três Sementes de Cidadania',
    descriptionLiteral:
      'Nossa atuação integra socorro material imediato, moradia digna e garantia jurídica perante a administração pública e o Poder Judiciário.',
    pillarsCollection: [
      {
        identifier: 'PAO',
        titleLiteral: 'Pão',
        subtitleLiteral: 'Segurança Alimentar e Sobrevivência',
        descriptionLiteral:
          'Articulação de cozinhas solidárias, fiscalização de contratos de alimentação pública e distribuição emergencial de suprimentos essenciais.',
      },
      {
        identifier: 'TETO',
        titleLiteral: 'Teto',
        subtitleLiteral: 'Acolhimento e Habitação Digna',
        descriptionLiteral:
          'Vigilância dos centros de acolhimento municipal, combate à violência contra pessoas em situação de rua e defesa do direito à moradia.',
      },
      {
        identifier: 'LEI',
        titleLiteral: 'Lei',
        subtitleLiteral: 'Defesa Jurídica e Auditoria Fiscal',
        descriptionLiteral:
          'Ação jurídica popular, auditoria algorítmica de gastos públicos municipais e canal protegido contra violações e abusos de autoridade.',
      },
    ],
  },
  actions: {
    primaryCtaLabelLiteral: 'Explorar Gastos Públicos',
    secondaryCtaLabelLiteral: 'Canal de Denúncia Cívica',
  },
  metadata: {
    pageTitleLiteral: 'Identidade Institucional e Governança',
    pageDescriptionLiteral:
      'Conheça a missão, estrutura jurídica (MROSC) e os três pilares de impacto social do Floripa Dignidade.',
  },
});

const SPANISH_FALLBACK: IIdentityPageI18n = IdentityPageI18nSchema.parse({
  hero: {
    badgeLabelLiteral: 'Transparencia • Derechos Humanos • Florianópolis',
    headlineMainLiteral: 'La dignidad ciudadana no es negociable:',
    headlineAccentLiteral: 'es una conquista activa',
    descriptionLiteral:
      'Floripa Dignidade es una organización de la sociedad civil dedicada a la defensa intransigente de los derechos humanos, la fiscalización rigurosa del presupuesto público municipal y el amparo territorial de poblaciones vulnerables en Florianópolis.',
  },
  framework: {
    badgeLiteral: 'Marco Regulatorio de las OSC',
    headlineLiteral: 'Constitución Jurídica y Gobernanza Pública',
    descriptionLiteral:
      'Estructurada bajo los parámetros de la Ley Federal brasileña 13.019/2014 (MROSC), la organización opera con total autonomía política y partidaria para auditar contratos públicos, convenios de colaboración y servicios de acogida social.',
    legalFormLiteral: 'Asociación Civil sin Fines de Lucro (OSC)',
    territorialJurisdictionLiteral: 'Florianópolis y Región Metropolitana • Santa Catarina',
  },
  pillarsSection: {
    badgeLiteral: 'Tríada de Impacto',
    headlineLiteral: 'Pan, Techo y Ley: Las Tres Semillas de Ciudadanía',
    descriptionLiteral:
      'Nuestra labor integra socorro material inmediato, vivienda digna y garantía jurídica ante la administración pública y el Poder Judicial.',
    pillarsCollection: [
      {
        identifier: 'PAO',
        titleLiteral: 'Pan',
        subtitleLiteral: 'Seguridad Alimentaria y Subsistencia',
        descriptionLiteral:
          'Coordinación de cocinas solidarias, fiscalización de contratos de alimentación pública y distribución de suministros vitales.',
      },
      {
        identifier: 'TETO',
        titleLiteral: 'Techo',
        subtitleLiteral: 'Acogimiento y Vivienda Digna',
        descriptionLiteral:
          'Vigilancia de centros municipales de acogida, combate a la violencia contra personas en situación de calle y defensa del hábitat.',
      },
      {
        identifier: 'LEI',
        titleLiteral: 'Ley',
        subtitleLiteral: 'Defensa Jurídica y Auditoría Fiscal',
        descriptionLiteral:
          'Litigio estratégico popular, auditoría algorítmica del gasto público y canal protegido contra abusos de autoridad.',
      },
    ],
  },
  actions: {
    primaryCtaLabelLiteral: 'Explorar Gastos Públicos',
    secondaryCtaLabelLiteral: 'Canal de Denuncia Cívica',
  },
  metadata: {
    pageTitleLiteral: 'Identidad Institucional y Gobernanza',
    pageDescriptionLiteral:
      'Conoce la misión, estructura jurídica (MROSC) y los tres pilares de impacto social de Floripa Dignidade.',
  },
});

const ENGLISH_FALLBACK: IIdentityPageI18n = IdentityPageI18nSchema.parse({
  hero: {
    badgeLabelLiteral: 'Transparency • Human Rights • Florianópolis',
    headlineMainLiteral: 'Citizen dignity is non-negotiable:',
    headlineAccentLiteral: 'it is an active conquest',
    descriptionLiteral:
      'Floripa Dignidade is a civil society organization dedicated to the steadfast defense of human rights, independent public budget auditing, and territorial support for vulnerable communities across Florianópolis.',
  },
  framework: {
    badgeLiteral: 'Civil Society Regulatory Framework',
    headlineLiteral: 'Legal Constitution and Public Governance',
    descriptionLiteral:
      'Structured under Brazilian Federal Law 13.019/2014 (MROSC), the organization maintains full political and partisan independence to audit municipal contracts, collaboration agreements, and public shelter facilities.',
    legalFormLiteral: 'Non-Profit Civil Association (CSO)',
    territorialJurisdictionLiteral: 'Florianópolis Metropolitan Area • Santa Catarina, Brazil',
  },
  pillarsSection: {
    badgeLiteral: 'Impact Triad',
    headlineLiteral: 'Bread, Shelter and Law: The Three Seeds of Citizenship',
    descriptionLiteral:
      'Our civic intervention connects immediate material relief, safe shelter, and legal defense before public authorities and judicial courts.',
    pillarsCollection: [
      {
        identifier: 'PAO',
        titleLiteral: 'Bread',
        subtitleLiteral: 'Food Security and Vital Support',
        descriptionLiteral:
          'Solidarity kitchen networking, municipal food program auditing, and emergency supplies dispatch.',
      },
      {
        identifier: 'TETO',
        titleLiteral: 'Shelter',
        subtitleLiteral: 'Protected Housing and Human Dignity',
        descriptionLiteral:
          'Public shelter monitoring, protection of unsheltered populations against institutional violence, and housing rights defense.',
      },
      {
        identifier: 'LEI',
        titleLiteral: 'Law',
        subtitleLiteral: 'Legal Defense and Fiscal Auditing',
        descriptionLiteral:
          'Strategic public-interest litigation, algorithmic municipal expenditure auditing, and safe reporting channels.',
      },
    ],
  },
  actions: {
    primaryCtaLabelLiteral: 'Explore Public Expenditure',
    secondaryCtaLabelLiteral: 'Citizen Reporting Channel',
  },
  metadata: {
    pageTitleLiteral: 'Institutional Identity and Governance',
    pageDescriptionLiteral:
      "Discover Floripa Dignidade's mission, legal constitution (MROSC), and three impact pillars.",
  },
});

const FALLBACKS_MAP: Readonly<Record<string, IIdentityPageI18n>> = Object.freeze({
  pt: PORTUGUESE_FALLBACK,
  es: SPANISH_FALLBACK,
  en: ENGLISH_FALLBACK,
});

export const ResolveIdentityPageInMemoryFallback = (
  requestedLocaleLiteral: string,
): IIdentityPageI18n => {
  const baseLanguageLiteral =
    requestedLocaleLiteral.split('-')[0]?.toLowerCase() ?? DEFAULT_BASE_LANGUAGE_LITERAL;

  return (
    FALLBACKS_MAP[baseLanguageLiteral] ??
    FALLBACKS_MAP[DEFAULT_BASE_LANGUAGE_LITERAL] ??
    PORTUGUESE_FALLBACK
  );
};
