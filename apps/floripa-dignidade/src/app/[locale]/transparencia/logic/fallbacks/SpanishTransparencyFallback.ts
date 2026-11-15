/**
 * @file apps/floripa-dignidade/src/app/[locale]/transparencia/logic/fallbacks/SpanishTransparencyFallback.ts
 * @section Transparency Gazette - Spanish In-Memory Fallback (Atom)
 * @description Respaldo institucional inmutable en memoria para idioma español (es-ES).
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

export const SPANISH_TRANSPARENCY_FALLBACK: ITransparencyPageI18n =
  TransparencyPageI18nSchema.parse({
    hero: {
      editionBadgeLiteral: 'Transparencia Activa • Ley 12.527/2011 • Florianópolis',
      editionLabelLiteral: 'Diario Cívico por Secretarías',
      headlineMainLiteral: 'Periódico de transparencia pública:',
      headlineAccentLiteral: 'hechos auditados por secretaría',
      leadDescriptionLiteral:
        'Consulta síntesis periodísticas, resúmenes ejecutivos y alertas de fiscalización sobre contratos y servicios municipales en Florianópolis.',
      primaryCtaLabelLiteral: 'Abrir Observatorio de Gastos',
      secondaryCtaLabelLiteral: 'Enviar Denuncia Protegida',
    },
    navigation: {
      filterHeadingLiteral: 'Filtrar edición por secretaría municipal',
      allSecretariatsLabelLiteral: 'Todas las Secretarías',
      articlesCountSuffixLiteral: 'boletines publicados',
      jumpToSecretariatPrefixLiteral: 'Filtrar cuaderno de',
    },
    featuredLead: {
      sectionBadgeLiteral: 'Titular de Portada • Dossier Destacado',
      readInObservatoryLabelLiteral: 'Verificar datos en el Observatorio',
      article: {
        ...FALLBACK_ARTICLE_SPECIFICATIONS.lead,
        headlineLiteral:
          'Auditoría ciudadana sigue la ejecución de convenios de acogida y seguridad alimentaria',
        summaryLiteral:
          'Relevamiento documental cruza contratos de la Passarela da Cidadania y cocinas solidarias con metas territoriales.',
        sourceReferenceLiteral: 'Portal de Transparencia PMF • Convenios 2026',
      },
    },
    statusLabels: {
      VERIFIED_AUDIT: 'Fuente Oficial Verificada',
      MONITORING_ACTIVE: 'En Seguimiento',
      CRITICAL_ALERT: 'Alerta Prioritaria',
    },
    secretariatsSection: {
      sectionHeadingLiteral: 'Cuadernos Sectoriales por Secretaría',
      sectionSubtitleLiteral:
        'Cada cartera reúne un resumen ejecutivo del período y los boletines vinculados a actos oficiales.',
      summaryHeadingLiteral: 'Resumen Ejecutivo de la Secretaría',
      sourcePrefixLiteral: 'Fuente:',
      secretariatsCollection: [
        {
          secretariatIdentifier: 'SOCIAL_ASSISTANCE',
          secretariatNameLiteral: 'Asistencia Social y Derechos Humanos',
          executiveSummaryLiteral:
            'Monitoreo de albergues municipales, abordaje social y suministro continuo de comidas.',
          keyFocusAreaLiteral: 'Protección Social Especial y Seguridad Alimentaria',
          articlesCollection: [
            {
              ...FALLBACK_ARTICLE_SPECIFICATIONS.social,
              headlineLiteral: 'Informe evalúa capacidad de plazas y protocolos de acogida digna',
              summaryLiteral:
                'La investigación consolida ocupación y cumplimiento de directrices MROSC en Centro y Continente.',
              sourceReferenceLiteral: 'Diario Oficial del Municipio • MROSC',
            },
          ],
        },
        {
          secretariatIdentifier: 'PUBLIC_HEALTH',
          secretariatNameLiteral: 'Salud Pública y Atención Primaria',
          executiveSummaryLiteral:
            'Seguimiento de medicamentos esenciales, consultorios móviles y cobertura básica.',
          keyFocusAreaLiteral: 'Consultorio en la Calle y Centros de Salud',
          articlesCollection: [
            {
              ...FALLBACK_ARTICLE_SPECIFICATIONS.health,
              headlineLiteral:
                'Atenciones itinerantes amplían acceso para ciudadanos sin documentación civil',
              summaryLiteral:
                'Equipos multiprofesionales refuerzan el seguimiento clínico sin exigir comprobante previo de domicilio fijo.',
              sourceReferenceLiteral: 'Boletín Técnico SMS • Atención Primaria',
            },
          ],
        },
        {
          secretariatIdentifier: 'INFRASTRUCTURE_SANITATION',
          secretariatNameLiteral: 'Infraestructura, Vivienda y Saneamiento',
          executiveSummaryLiteral:
            'Fiscalización de drenaje, agua potable y prevención de desalojos sin alternativa habitacional.',
          keyFocusAreaLiteral: 'Saneamiento Básico y Derecho a la Ciudad',
          articlesCollection: [
            {
              ...FALLBACK_ARTICLE_SPECIFICATIONS.infrastructure,
              headlineLiteral:
                'Nota técnica refuerza urgencia de puntos públicos de agua potable y sanitarios',
              summaryLiteral:
                'Indicadores territoriales recomiendan instalación prioritaria en corredores urbanos centrales.',
              sourceReferenceLiteral: 'Diagnóstico Territorial • Floripa Dignidade',
            },
          ],
        },
      ],
    },
    methodologyBanner: {
      headlineLiteral: 'Metodología Editorial e Independencia Cívica',
      descriptionLiteral:
        'Cada resumen publicado se vincula a documentos oficiales o testimonios anonimizados conforme a la LGPD.',
      legalBasisLiteral: 'Ley 12.527/2011 (LAI) • Ley 13.019/2014 (MROSC) • Ley 13.709/2018 (LGPD)',
    },
    metadata: {
      pageTitleLiteral: 'Transparencia Activa y Diario por Secretarías',
      pageDescriptionLiteral:
        'Periódico cívico con noticias resumidas y auditorías por secretarías municipales de Florianópolis.',
    },
  });
