import { z } from 'zod';

/**
 * @section Component DNA - Search Discovery
 * Protocolo OEDP-V13.0 - Visual Integrity
 */
export const GlobalSearchWidgetPropertiesSchema = z.object({
  placeholderTextLiteral: z.string()
    .default('¿Qué estás buscando? (Ej: Denuncias, Transparencia...)')
    .describe('Texto de sugerencia dentro del campo de entrada'),

  isSearchOverlayVisible: z.boolean()
    .default(false)
    .describe('Estado de visibilidad del panel de resultados'),

  minimumCharacterQuantityToSearch: z.number()
    .default(3)
    .describe('Cantidad mínima de caracteres para disparar el algoritmo'),

  isKeyboardShortcutEnabled: z.boolean()
    .default(true)
    .describe('Habilita el acceso rápido vía CMD+K / CTRL+K'),
}).readonly();

export type IGlobalSearchWidgetProperties = z.infer<typeof GlobalSearchWidgetPropertiesSchema>;
