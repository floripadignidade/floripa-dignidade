/**
 * @section Observatory Contracts - Observatory Header Schema (Atom)
 * @description Define el contrato Zod inmutable para la validación de propiedades
 * del componente `ObservatoryHeader`. Garantiza la integridad de los literales
 * localizados y habilita la inyección opcional de un manejador de exportación.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad y Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @name ObservatoryHeaderPropertiesSchema
 * @description Aduana Zod inmutable para las propiedades de entrada de `ObservatoryHeader`.
 */
export const ObservatoryHeaderPropertiesSchema = z
  .object({
    /** Título institucional localizado del observatorio de cuentas públicas. */
    titleLiteral: z.string().trim().min(1),

    /** Descripción localizada de auditoría ciudadana y transparencia activa. */
    descriptionLiteral: z.string().trim().min(1),

    /** Etiqueta localizada para el disparador de exportación de reportes. */
    exportActionLabelLiteral: z.string().trim().min(1),

    /** Callback opcional invocado tras registrar la intención de exportación. */
    onExportAction: z.function().args().returns(z.void()).optional(),
  })
  .readonly();

export type IObservatoryHeaderProperties = z.input<typeof ObservatoryHeaderPropertiesSchema>;
