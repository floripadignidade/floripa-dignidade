/**
 * @section Impact Analytics DNA - Agnostic Expenditure Input
 * @description Contrato de entrada que permite al motor procesar gastos sin
 * depender de módulos externos de negocio.
 *
 * Protocolo OEDP-V17.0 - Boundary Protection.
 */

import { z } from 'zod';

export const ExpenditureInputSchema = z
  .object({
    expenditureIdentifier: z.string().describe('Identificador único del gasto.'),
    targetTerritoryIdentifier: z.string().describe('Código técnico del territorio (IBGE).'),
    totalExecutedAmountNumeric: z.number().nonnegative().describe('Monto financiero neto.'),
  })
  .readonly();

export type IExpenditureInput = z.infer<typeof ExpenditureInputSchema>;
