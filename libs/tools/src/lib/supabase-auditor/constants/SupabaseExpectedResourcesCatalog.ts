/**
 * @file libs/tools/src/lib/supabase-auditor/constants/SupabaseExpectedResourcesCatalog.ts
 * @section Supabase Auditor - Expected Ecosystem Resources Catalog (SSOT)
 * @description Única Fuente de Verdad (SSOT) para el inventario de recursos requeridos en
 * PostgreSQL y Supabase Storage por el Portal, el control de migraciones únicas, los módulos
 * de negocio y Payload CMS 3.84+. Valida su estructura inmutable mediante Zod al cargar.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @name ExpectedTableCategorySchema
 * @description Clasificación funcional de las tablas esperadas en el esquema `public`.
 */
export const ExpectedTableCategorySchema = z
  .enum(['OPERATIONAL_LEDGER', 'CMS_COLLECTION', 'CMS_INTERNAL'])
  .describe('Clasificación arquitectónica de la tabla esperada en PostgreSQL.');

export type TExpectedTableCategory = z.infer<typeof ExpectedTableCategorySchema>;

/**
 * @name ExpectedDatabaseTableSpecSchema
 * @description Especificación inmutable de una tabla esperada y sus requisitos de seguridad RLS.
 */
export const ExpectedDatabaseTableSpecSchema = z
  .object({
    schemaNameLiteral: z.string().trim().min(1),
    tableNameLiteral: z.string().trim().min(1),
    categoryLiteral: ExpectedTableCategorySchema,
    isRlsRequiredBoolean: z.boolean(),
    sourceReferenceLiteral: z.string().trim().min(1),
  })
  .readonly();

export type IExpectedDatabaseTableSpec = z.infer<typeof ExpectedDatabaseTableSpecSchema>;

/**
 * @name ExpectedResourcesCatalogSchema
 * @description Aduana Zod que certifica la integridad del catálogo de recursos esperados.
 */
export const ExpectedResourcesCatalogSchema = z
  .object({
    requiredExtensionsCollection: z.array(z.string().trim().min(1)).readonly(),
    expectedTablesCollection: z.array(ExpectedDatabaseTableSpecSchema).readonly(),
    expectedFunctionsCollection: z.array(z.string().trim().min(1)).readonly(),
    expectedTriggersCollection: z.array(z.string().trim().min(1)).readonly(),
    expectedStorageBucketsCollection: z.array(z.string().trim().min(1)).readonly(),
  })
  .readonly();

export type IExpectedResourcesCatalog = z.infer<typeof ExpectedResourcesCatalogSchema>;

type TPublicTableSpecificationTuple = readonly [
  tableNameLiteral: string,
  categoryLiteral: TExpectedTableCategory,
  isRlsRequiredBoolean: boolean,
  sourceReferenceLiteral: string,
];

const MASTER_SQL_SOURCE_LITERAL = 'database/00_migration_master_schema.sql';
const OPERATIONAL_SQL_SOURCE_LITERAL = 'database/02_ecosystem_operational_ledgers.sql';
const CMS_APP_SOURCE_LITERAL = 'apps/content-manager-system';
const CMS_CORE_SOURCE_LITERAL = 'payload-cms-core';

const EXPECTED_PUBLIC_TABLES_TUPLES: readonly TPublicTableSpecificationTuple[] = [
  ['ecosystem_schema_migrations', 'OPERATIONAL_LEDGER', true, MASTER_SQL_SOURCE_LITERAL],
  ['citizen_identities_ledger', 'OPERATIONAL_LEDGER', true, MASTER_SQL_SOURCE_LITERAL],
  ['newsletter_subscribers', 'OPERATIONAL_LEDGER', true, OPERATIONAL_SQL_SOURCE_LITERAL],
  ['system_telemetry_logs', 'OPERATIONAL_LEDGER', true, OPERATIONAL_SQL_SOURCE_LITERAL],
  ['system_notifications_ledger', 'OPERATIONAL_LEDGER', true, OPERATIONAL_SQL_SOURCE_LITERAL],
  ['direct_messages_ledger', 'OPERATIONAL_LEDGER', true, OPERATIONAL_SQL_SOURCE_LITERAL],
  ['user_presence_ledger', 'OPERATIONAL_LEDGER', true, OPERATIONAL_SQL_SOURCE_LITERAL],
  ['communication_groups_ledger', 'OPERATIONAL_LEDGER', true, OPERATIONAL_SQL_SOURCE_LITERAL],
  ['group_memberships_ledger', 'OPERATIONAL_LEDGER', true, OPERATIONAL_SQL_SOURCE_LITERAL],
  ['territorial_master_data', 'OPERATIONAL_LEDGER', true, OPERATIONAL_SQL_SOURCE_LITERAL],
  ['project_financial_ledger', 'OPERATIONAL_LEDGER', true, OPERATIONAL_SQL_SOURCE_LITERAL],
  ['citizen_users', 'CMS_COLLECTION', false, CMS_APP_SOURCE_LITERAL],
  ['organizations', 'CMS_COLLECTION', false, CMS_APP_SOURCE_LITERAL],
  ['media_vault', 'CMS_COLLECTION', false, CMS_APP_SOURCE_LITERAL],
  ['payload_locked_documents', 'CMS_INTERNAL', false, CMS_CORE_SOURCE_LITERAL],
  ['payload_locked_documents_rels', 'CMS_INTERNAL', false, CMS_CORE_SOURCE_LITERAL],
  ['payload_preferences', 'CMS_INTERNAL', false, CMS_CORE_SOURCE_LITERAL],
  ['payload_preferences_rels', 'CMS_INTERNAL', false, CMS_CORE_SOURCE_LITERAL],
  ['payload_migrations', 'CMS_INTERNAL', false, CMS_CORE_SOURCE_LITERAL],
];

const RAW_EXPECTED_RESOURCES_CATALOG: IExpectedResourcesCatalog = {
  requiredExtensionsCollection: Object.freeze(['uuid-ossp', 'pgcrypto']),
  expectedTablesCollection: Object.freeze(
    EXPECTED_PUBLIC_TABLES_TUPLES.map(
      ([tableNameLiteral, categoryLiteral, isRlsRequiredBoolean, sourceReferenceLiteral]) =>
        Object.freeze({
          schemaNameLiteral: 'public',
          tableNameLiteral,
          categoryLiteral,
          isRlsRequiredBoolean,
          sourceReferenceLiteral,
        }),
    ),
  ),
  expectedFunctionsCollection: Object.freeze(['fn_update_citizen_mutation_timestamp']),
  expectedTriggersCollection: Object.freeze(['trg_citizen_identity_update_timestamp']),
  expectedStorageBucketsCollection: Object.freeze(['media-vault']),
};

/**
 * @name SUPABASE_EXPECTED_RESOURCES_CATALOG
 * @description Catálogo SSOT validado e inmutable de recursos requeridos en Supabase.
 */
export const SUPABASE_EXPECTED_RESOURCES_CATALOG: IExpectedResourcesCatalog = Object.freeze(
  ExpectedResourcesCatalogSchema.parse(RAW_EXPECTED_RESOURCES_CATALOG),
);
