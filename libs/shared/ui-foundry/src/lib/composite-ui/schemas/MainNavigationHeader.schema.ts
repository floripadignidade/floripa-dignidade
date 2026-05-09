import { z } from 'zod';

export const MainNavigationHeaderPropertiesSchema = z.object({
  activeNavigationPathLiteral: z.string().optional(),
  isStickyEnabled: z.boolean().default(true),
  isSearchEnabled: z.boolean().default(true),
}).readonly();

export type IMainNavigationHeaderProperties = z.infer<typeof MainNavigationHeaderPropertiesSchema>;
