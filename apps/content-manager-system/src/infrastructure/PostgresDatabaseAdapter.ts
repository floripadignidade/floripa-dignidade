/**
 * @file apps/content-manager-system/src/infrastructure/PostgresDatabaseAdapter.ts
 * @section CMS Infrastructure - Postgres Database Adapter
 * @description Configura el adaptador de persistencia oficial para Payload CMS 3.x.
 * Implementa pooling optimizado para entornos serverless con timeout calibrado para
 * negociaciones TLS iniciales contra Supabase Pooler (ADR 0015 / ADR 0031).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Cloud-Primary).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { postgresAdapter } from '@payloadcms/db-postgres';

/**
 * Genera la instancia del adaptador de PostgreSQL validada para Payload CMS.
 *
 * @param databaseUrlLiteral - Cadena de conexión física validada por `ValidateEnvironmentAduana`.
 * @returns Adaptador configurado para el motor relacional de Payload.
 */
export const CreatePostgresDatabaseAdapter = (databaseUrlLiteral: string) => {
  return postgresAdapter({
    pool: {
      connectionString: databaseUrlLiteral,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    },
  });
};
