/**
 * @file apps/floripa-dignidade/src/app/[locale]/transparencia/i18n/schemas/TransparencyPage.i18n.schema.ts
 * @section Transparency Gazette Contracts - Linguistic Integrity Schema (Atom)
 * @description Contrato Zod inmutable para validar los diccionarios localizados del
 * Periódico de Transparencia Activa por Secretarías (`/[locale]/transparencia`),
 * incluyendo soporte multimedia HTTPS seguro y literales accesibles WAI-ARIA APG / WCAG 2.2
 * para el carrusel editorial Hero (ADR 0034 / ADR 0035).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

const RELATIVE_ASSET_PATH_REGEX = /^\/(?!\/)[^\s]*$/;
const URL_SAFE_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const createRequiredLiteralSchema = (semanticDescriptionLiteral: string) =>
  z
    .string()
    .trim()
    .min(1, { message: 'TRANSPARENCY_PAGE_I18N_EMPTY_TRANSLATION_LITERAL' })
    .describe(semanticDescriptionLiteral);

const isSafeCoverImageSourceBoolean = (candidateUrlLiteral: string): boolean => {
  if (RELATIVE_ASSET_PATH_REGEX.test(candidateUrlLiteral)) {
    return true;
  }

  if (!candidateUrlLiteral.startsWith('https://')) {
    return false;
  }

  return z.string().url().safeParse(candidateUrlLiteral).success;
};

/**
 * @name SafeCoverImageUrlSchema
 * @description Valida orígenes de imagen HTTPS remotos (Supabase/CMS) o rutas públicas internas.
 */
export const SafeCoverImageUrlSchema = z
  .string()
  .trim()
  .min(1, { message: 'TRANSPARENCY_COVER_IMAGE_URL_EMPTY' })
  .refine(isSafeCoverImageSourceBoolean, {
    message: 'TRANSPARENCY_COVER_IMAGE_URL_MUST_BE_HTTPS_OR_INTERNAL_PATH',
  })
  .describe('URL HTTPS de portada en media-vault/CMS o ruta estática interna segura.');

/**
 * @name EditorialVerificationStatusSchema
 * @description Taxonomía de estado de auditoría editorial para cada noticia o boletín.
 */
export const EditorialVerificationStatusSchema = z
  .enum(['VERIFIED_AUDIT', 'MONITORING_ACTIVE', 'CRITICAL_ALERT'])
  .describe('Clasificación del estado de verificación documental de la noticia.');

export type TEditorialVerificationStatus = z.infer<typeof EditorialVerificationStatusSchema>;

/**
 * @name TransparencyNewsArticleI18nSchema
 * @description Contrato inmutable de una noticia o boletín resumido dentro del periódico cívico.
 */
export const TransparencyNewsArticleI18nSchema = z
  .object({
    articleIdentifier: createRequiredLiteralSchema('Identificador único del boletín periodístico.'),
    secretariatIdentifier: createRequiredLiteralSchema('Identificador de la secretaría vinculada.'),
    slugLiteral: z
      .string()
      .trim()
      .regex(URL_SAFE_SLUG_REGEX, { message: 'INVALID_TRANSPARENCY_ARTICLE_SLUG' })
      .optional()
      .describe('Slug URL-safe opcional para enlazar con el artículo editorial completo.'),
    headlineLiteral: createRequiredLiteralSchema('Titular periodístico de la noticia o boletín.'),
    summaryLiteral: createRequiredLiteralSchema('Resumen ejecutivo legible para el ciudadano.'),
    publishedDateIsoLiteral: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'TRANSPARENCY_ARTICLE_DATE_MUST_BE_ISO_DATE' })
      .describe('Fecha de publicación normalizada en formato ISO YYYY-MM-DD.'),
    sourceReferenceLiteral: createRequiredLiteralSchema(
      'Referencia documental pública (Diário Oficial, Contrato o Portal PMF).',
    ),
    verificationStatusLiteral: EditorialVerificationStatusSchema,
    targetActionPathLiteral: z
      .string()
      .trim()
      .regex(RELATIVE_ASSET_PATH_REGEX, { message: 'INVALID_TRANSPARENCY_INTERNAL_PATH' })
      .describe('Ruta interna segura hacia el Observatorio o canal de denuncias.'),
    coverImageUrlLiteral: SafeCoverImageUrlSchema.optional(),
    coverImageAltLiteral: createRequiredLiteralSchema(
      'Texto alternativo accesible (WCAG 2.2) descriptivo de la fotografía de portada.',
    ).optional(),
  })
  .readonly();

export type ITransparencyNewsArticleI18n = z.infer<typeof TransparencyNewsArticleI18nSchema>;

/**
 * @name SecretariatDeskI18nSchema
 * @description Cuaderno editorial de una secretaría municipal con resumen ejecutivo y noticias.
 */
export const SecretariatDeskI18nSchema = z
  .object({
    secretariatIdentifier: createRequiredLiteralSchema('Identificador técnico de la secretaría.'),
    secretariatNameLiteral: createRequiredLiteralSchema('Nombre oficial de la secretaría.'),
    executiveSummaryLiteral: createRequiredLiteralSchema(
      'Resumen ejecutivo del período fiscal y políticas vigiladas en la secretaría.',
    ),
    keyFocusAreaLiteral: createRequiredLiteralSchema(
      'Eje prioritario o programa municipal monitoreado.',
    ),
    articlesCollection: z.array(TransparencyNewsArticleI18nSchema).min(1).readonly(),
  })
  .readonly();

export type ISecretariatDeskI18n = z.infer<typeof SecretariatDeskI18nSchema>;

/**
 * @name TransparencyHeroCarouselI18nSchema
 * @description Contrato inmutable de controles accesibles y diapositivas del Hero Carrusel (ADR 0035).
 */
export const TransparencyHeroCarouselI18nSchema = z
  .object({
    carouselAriaLabelLiteral: createRequiredLiteralSchema('Etiqueta ARIA de la región carrusel.'),
    carouselRoleDescriptionLiteral: createRequiredLiteralSchema(
      'Descripción localizada del rol carrusel para lectores de pantalla.',
    ),
    slideRoleDescriptionLiteral: createRequiredLiteralSchema(
      'Descripción localizada de rol para cada diapositiva individual.',
    ),
    pauseRotationLabelLiteral: createRequiredLiteralSchema(
      'Etiqueta accesible del botón para pausar la rotación automática.',
    ),
    resumeRotationLabelLiteral: createRequiredLiteralSchema(
      'Etiqueta accesible del botón para reanudar la rotación automática.',
    ),
    previousSlideLabelLiteral: createRequiredLiteralSchema(
      'Etiqueta accesible del control lateral hacia la diapositiva anterior.',
    ),
    nextSlideLabelLiteral: createRequiredLiteralSchema(
      'Etiqueta accesible del control lateral hacia la siguiente diapositiva.',
    ),
    readMoreLabelLiteral: createRequiredLiteralSchema(
      'Texto de acción principal en cada diapositiva del Hero.',
    ),
    viewInObservatoryLabelLiteral: createRequiredLiteralSchema(
      'Texto de acción secundaria hacia el Observatorio de Gastos.',
    ),
    slidePositionTemplateLiteral: createRequiredLiteralSchema(
      'Plantilla de posición de diapositiva con marcadores {current} y {total}.',
    ),
    dotNavigationAriaLabelLiteral: createRequiredLiteralSchema(
      'Etiqueta ARIA del grupo de indicadores circulares de posición.',
    ),
    featuredSlidesCollection: z
      .array(TransparencyNewsArticleI18nSchema)
      .min(1)
      .readonly()
      .optional(),
  })
  .readonly();

export type ITransparencyHeroCarouselI18n = z.infer<typeof TransparencyHeroCarouselI18nSchema>;

/**
 * @name TransparencyPageI18nSchema
 * @description Contrato maestro inmutable para los diccionarios de `transparency.json`.
 */
export const TransparencyPageI18nSchema = z
  .object({
    hero: z
      .object({
        editionBadgeLiteral: createRequiredLiteralSchema(
          'Insignia legal y territorial de portada.',
        ),
        editionLabelLiteral: createRequiredLiteralSchema('Etiqueta de edición o periodicidad.'),
        headlineMainLiteral: createRequiredLiteralSchema('Titular principal de primera plana.'),
        headlineAccentLiteral: createRequiredLiteralSchema('Énfasis cromático del titular Hero.'),
        leadDescriptionLiteral: createRequiredLiteralSchema(
          'Bajada editorial de propuesta cívica.',
        ),
        primaryCtaLabelLiteral: createRequiredLiteralSchema('Acción hacia Observatorio de Gastos.'),
        secondaryCtaLabelLiteral: createRequiredLiteralSchema('Acción hacia Canal de Denuncias.'),
      })
      .readonly(),
    heroCarousel: TransparencyHeroCarouselI18nSchema.optional(),
    navigation: z
      .object({
        filterHeadingLiteral: createRequiredLiteralSchema('Título del filtro por secretarías.'),
        allSecretariatsLabelLiteral: createRequiredLiteralSchema('Opción para mostrar todas.'),
        articlesCountSuffixLiteral: createRequiredLiteralSchema('Sufijo de conteo de boletines.'),
        jumpToSecretariatPrefixLiteral: createRequiredLiteralSchema(
          'Prefijo accesible del filtro.',
        ),
      })
      .readonly(),
    featuredLead: z
      .object({
        sectionBadgeLiteral: createRequiredLiteralSchema(
          'Etiqueta de noticia principal de portada.',
        ),
        readInObservatoryLabelLiteral: createRequiredLiteralSchema('Enlace al detalle fiscal.'),
        article: TransparencyNewsArticleI18nSchema,
      })
      .readonly(),
    statusLabels: z
      .object({
        VERIFIED_AUDIT: createRequiredLiteralSchema('Etiqueta para auditoría verificada.'),
        MONITORING_ACTIVE: createRequiredLiteralSchema('Etiqueta para monitoreo en curso.'),
        CRITICAL_ALERT: createRequiredLiteralSchema('Etiqueta para alerta crítica ciudadana.'),
      })
      .readonly(),
    secretariatsSection: z
      .object({
        sectionHeadingLiteral: createRequiredLiteralSchema('Título de secciones por secretaría.'),
        sectionSubtitleLiteral: createRequiredLiteralSchema('Subtítulo de cuadernos temáticos.'),
        summaryHeadingLiteral: createRequiredLiteralSchema('Etiqueta del resumen de secretaría.'),
        sourcePrefixLiteral: createRequiredLiteralSchema('Prefijo de fuente documental.'),
        secretariatsCollection: z.array(SecretariatDeskI18nSchema).min(3).readonly(),
      })
      .readonly(),
    methodologyBanner: z
      .object({
        headlineLiteral: createRequiredLiteralSchema('Título del sello metodológico.'),
        descriptionLiteral: createRequiredLiteralSchema('Explicación de verificación documental.'),
        legalBasisLiteral: createRequiredLiteralSchema('Base legal LAI / MROSC aplicable.'),
      })
      .readonly(),
    metadata: z
      .object({
        pageTitleLiteral: createRequiredLiteralSchema('Título SEO de la página.'),
        pageDescriptionLiteral: createRequiredLiteralSchema('Descripción SEO de la página.'),
      })
      .readonly(),
  })
  .readonly();

export type ITransparencyPageI18n = z.infer<typeof TransparencyPageI18nSchema>;
