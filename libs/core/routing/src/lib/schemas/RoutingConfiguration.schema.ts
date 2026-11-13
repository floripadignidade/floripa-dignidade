/**
 * @section Routing Contracts - Internationalization and Authority Governance Schema
 * @description Define el contrato de integridad para la gestión de rutas localizadas
 * y el control de acceso perimetral. Consume el catálogo único de idiomas BCP 47
 * desde `@floripa-dignidade/contracts` (ADR 0030) garantizando escalabilidad a N idiomas
 * en Next.js 16+ sin duplicación de enumeraciones.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: ISO/IEC 11179 (Nomenclatura Técnica) e ISO/IEC 25010 (Mantenibilidad y Seguridad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import { DEFAULT_LOCALE_IDENTIFIER, SupportedLocaleSchema } from '@floripa-dignidade/contracts';
import type { ISupportedLocale, TSupportedLocale } from '@floripa-dignidade/contracts';

/**
 * Re-exportación simétrica del validador y tipos nominales de localización
 * desde la Única Fuente de Verdad (`@floripa-dignidade/contracts`).
 */
export { SupportedLocaleSchema };
export type { ISupportedLocale, TSupportedLocale };

/**
 * @name RoutingConfigurationSchema
 * @description Contrato de validación para la orquestación del proxy perimetral de navegación
 * y localización. Implementa inmutabilidad forzada en el ciclo de vida del Edge.
 */
export const RoutingConfigurationSchema = z
  .object({
    /**
     * Idioma base de la plataforma derivado dinámicamente del registro SSOT.
     */
    defaultLocale: SupportedLocaleSchema.default(DEFAULT_LOCALE_IDENTIFIER),

    /**
     * Colección de patrones de URL excluidos de la interceptación lingüística
     * (ejemplo: /api, /_next, /brand, /monitoring).
     */
    excludedPathPatternsCollection: z
      .array(z.string())
      .describe(
        'Patrones de URL que deben ser ignorados por el orquestador de idiomas para optimizar rendimiento.',
      ),

    /**
     * Mapa de autoridad de rutas (RBAC) que vincula prefijos URL con roles requeridos.
     */
    routeAuthorityMapping: z
      .record(z.string(), z.string())
      .describe('Diccionario que asocia rutas protegidas con roles de autoridad requeridos.'),
  })
  .readonly();

export type IRoutingConfiguration = z.infer<typeof RoutingConfigurationSchema>;
