import { z } from 'zod';

/**
 * @section Tools DNA - Build Auditor Linguistic Schema
 * @description Define el contrato para los mensajes del auditor de construcción.
 */
export const BuildAuditorI18nSchema = z.object({
  terminal: z.object({
    auditStartedLiteral: z.string(),
    checkingPathLiteral: z.string(),
    emptyDirectoryWarning: z.string(),
    ioErrorLiteral: z.string(),
    reportGeneratedLiteral: z.string(),
  }),
  errors: z.object({
    persistenceFault: z.string(),
  })
}).readonly();

export type IBuildAuditorI18n = z.infer<typeof BuildAuditorI18nSchema>;
