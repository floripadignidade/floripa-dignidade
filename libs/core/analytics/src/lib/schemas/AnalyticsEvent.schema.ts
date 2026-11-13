import { z } from 'zod';

export const UserIdentifierSchema = z.string().uuid().brand<'UserIdentifier'>();
export type UserIdentifier = z.infer<typeof UserIdentifierSchema>;

export const AnalyticsEventSchema = z
  .object({
    eventName: z
      .enum([
        'PAGE_VIEW',
        'CLICK',
        'SCROLL_DEPTH',
        'WEB_VITALS_LCP',
        'WEB_VITALS_INP',
        'WEB_VITALS_CLS',
      ])
      .describe('Categoría estandarizada del evento analítico'),

    userIdentifier: UserIdentifierSchema.optional().describe(
      'Identificador del usuario en caso de estar logueado.',
    ),

    eventPayload: z
      .record(z.string(), z.unknown())
      .describe('Carga útil del evento (coordenadas, tiempos de renderizado, URLs)'),

    capturedAtMilliseconds: z
      .number()
      .describe(
        'Timestamp de precisión generado en el momento exacto de la interacción en el cliente',
      ),
  })
  .readonly();

export type IAnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;
