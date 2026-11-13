import { z } from 'zod';

export const ObservatoryI18nSchema = z
  .object({
    metadata: z.object({
      pageTitleLiteral: z.string(),
      pageDescriptionLiteral: z.string(),
    }),
    dashboard: z.object({
      totalInvestedLabel: z.string(),
      anomalyCountLabel: z.string(),
      territorialReachLabel: z.string(),
      aiAuditStatusLabel: z.string(),
    }),
    table: z.object({
      columnEntity: z.string(),
      columnAmount: z.string(),
      columnIntegrityHash: z.string(),
      columnAiScore: z.string(),
    }),
    actions: z.object({
      exportCsvLabel: z.string(),
      printReportLabel: z.string(),
      restrictAccessToggle: z.string(),
    }),
  })
  .readonly();

export type IObservatoryI18n = z.infer<typeof ObservatoryI18nSchema>;
