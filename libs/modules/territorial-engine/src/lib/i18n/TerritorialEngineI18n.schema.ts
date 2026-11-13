import { z } from 'zod';

/**
 * @section Territorial DNA - Linguistic Integrity Schema
 */
export const TerritorialEngineI18nSchema = z
  .object({
    logs: z.object({
      IBGE_CONNECTION_ERROR: z.string(),
      SYNC_NOMINAL: z.string(),
      DATA_NORMALIZED: z.string(),
    }),
    errors: z.object({
      MUNICIPALITY_NOT_FOUND: z.string(),
      PERSISTENCE_FAULT: z.string(),
      ADN_CORRUPTION: z.string(),
    }),
  })
  .readonly();

export type ITerritorialEngineI18n = z.infer<typeof TerritorialEngineI18nSchema>;
