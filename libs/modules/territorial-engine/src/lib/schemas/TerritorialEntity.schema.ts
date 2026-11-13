/**
 * @section Territorial DNA - Normalized Internal Schema
 * @description Define la estructura soberana de las entidades geográficas.
 * Transforma datos crudos del IBGE en nodos de identidad con alta precisión técnica.
 * Actúa como la Única Fuente de Verdad (SSOT) para el mapeo de impacto social.
 *
 * Protocolo OEDP-V17.0 - ISO Standard Naming & Branded Identity.
 * SANEADO Zenith: Inyección de jerarquía relacional y descriptores ontológicos para IA.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @section IDENTIDADES SOBERANAS (Branded Types)
 * @description Sello de marca nominal que protege la integridad de los IDs geográficos.
 * Evita la colisión de ADN entre códigos IBGE y otros identificadores del sistema.
 */
export const TerritorialTechnicalIdentifierSchema = z
  .string()
  .min(3)
  .describe('Identificador técnico único (IBGE Standard) con sello de soberanía institucional.')
  .brand<'TerritorialTechnicalIdentifier'>();

/** 🛡️ ADN Tipado: Exportación nominal para integración total con el enjambre. */
export type TTerritorialTechnicalIdentifier = z.infer<typeof TerritorialTechnicalIdentifierSchema>;

/**
 * @section COMPONENTES ATÓMICOS
 */

/**
 * Jerarquía Administrativa del Territorio (Ontología de Jurisdicción).
 * Define el ámbito de actuación del registro.
 */
export const AdministrativeHierarchySchema = z
  .enum(['MUNICIPALITY', 'DISTRICT', 'NEIGHBORHOOD'])
  .describe('Nivel de jurisdicción administrativa del nodo territorial.');

/** Representación literal del nivel jerárquico. */
export type TAdministrativeHierarchy = z.infer<typeof AdministrativeHierarchySchema>;

/**
 * Coordenadas Geográficas de Precisión (Swiss-Watch Standard).
 * Utilizado para el renderizado de Mapas de Calor e Impacto Regional.
 */
export const GeographicCoordinatesSchema = z
  .object({
    latitudeNumeric: z
      .number()
      .min(-90)
      .max(90)
      .describe('Latitud decimal capturada para el centroide del territorio.'),
    longitudeNumeric: z
      .number()
      .min(-180)
      .max(180)
      .describe('Longitud decimal capturada para el centroide del territorio.'),
  })
  .readonly();

/** Interfaz inmutable de coordenadas. */
export type TGeographicCoordinates = z.infer<typeof GeographicCoordinatesSchema>;

/**
 * @name TerritorialEntitySchema
 * @description Contrato maestro para la gestión de búnkeres geográficos.
 * Estructura la memoria inmutable del territorio para auditoría y analítica.
 */
export const TerritorialEntitySchema = z
  .object({
    /** Identidad Brindada: ID técnico del IBGE o Hash Soberano. */
    territorialTechnicalIdentifier: TerritorialTechnicalIdentifierSchema,

    /**
     * Referencia al ancestro inmediato para navegación de grafo.
     * Permite reconstruir la cadena: Barrio -> Distrito -> Municipio.
     */
    parentTerritoryIdentifier: TerritorialTechnicalIdentifierSchema.nullable().describe(
      'Referencia al territorio superior en la jerarquía administrativa.',
    ),

    /** Nombre oficial purificado (Upper Case, Sin Abreviaturas). */
    officialTerritoryNameLiteral: z
      .string()
      .min(2, { message: 'IDENTITY.ERRORS.INVALID_TERRITORY_NAME' })
      .transform((value) => value.toUpperCase().trim())
      .describe('Denominación oficial saneada para búsqueda y visualización.'),

    /** Clasificación técnica de la capa administrativa. */
    administrativeHierarchyLevel: AdministrativeHierarchySchema,

    /** Centroide para Mapas de Calor e Impacto Analytics. */
    geographicCentroidMetadata: GeographicCoordinatesSchema.optional(),

    /** 🛡️ SANEADO Zenith: Huella digital de contenido para detección de mutaciones. */
    contentIntegrityHashFingerprint: z
      .string()
      .length(64)
      .optional()
      .describe(
        'Firma SHA-256 del registro para garantizar la soberanía del dato ante el Sentinel.',
      ),

    /** Fecha de la última validación de soberanía contra el IBGE. */
    lastSovereignSyncTimestampISO: z
      .string()
      .datetime()
      .describe('Marca temporal inmutable de la última sincronización con la base gubernamental.'),
  })
  .readonly(); // Inmutabilidad absoluta del rastro geográfico.

/** 🛡️ ADN Tipado para exportación Verbatim */
export type ITerritorialEntity = z.infer<typeof TerritorialEntitySchema>;
