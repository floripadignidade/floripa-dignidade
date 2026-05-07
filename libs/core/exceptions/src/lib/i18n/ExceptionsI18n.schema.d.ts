/**
 * @section Exception DNA - Linguistic Integrity Schema
 * @description Define el contrato soberano para los diccionarios de traducción
 * del búnker de excepciones. Garantiza que cada código de error posea una
 * representación humana validada antes de ser ensamblada por el Weaver.
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & ReadOnly Integrity.
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */
import { z } from 'zod';
/**
 * @name ExceptionsLinguisticDictionarySchema
 * @description Aduana de validación para las almas lingüísticas (JSON).
 * Implementa inmutabilidad absoluta para prevenir ruidos en el motor de renderizado.
 */
export declare const ExceptionsLinguisticDictionarySchema: z.ZodReadonly<z.ZodObject<{
    /**
     * Mapeo de Mensajes de Error Localizados.
     * Cada llave debe corresponder a un literal del catálogo ErrorCode.
     */
    localizedErrorMessagesMapping: z.ZodReadonly<z.ZodObject<{
        VALIDATION_FAILED: z.ZodString;
        UNAUTHORIZED_ACCESS: z.ZodString;
        INTERNAL_SYSTEM_FAILURE: z.ZodString;
        RESOURCE_NOT_FOUND: z.ZodString;
        EXTERNAL_SERVICE_TIMEOUT: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        VALIDATION_FAILED: string;
        UNAUTHORIZED_ACCESS: string;
        INTERNAL_SYSTEM_FAILURE: string;
        RESOURCE_NOT_FOUND: string;
        EXTERNAL_SERVICE_TIMEOUT: string;
    }, {
        VALIDATION_FAILED: string;
        UNAUTHORIZED_ACCESS: string;
        INTERNAL_SYSTEM_FAILURE: string;
        RESOURCE_NOT_FOUND: string;
        EXTERNAL_SERVICE_TIMEOUT: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    localizedErrorMessagesMapping: Readonly<{
        VALIDATION_FAILED: string;
        UNAUTHORIZED_ACCESS: string;
        INTERNAL_SYSTEM_FAILURE: string;
        RESOURCE_NOT_FOUND: string;
        EXTERNAL_SERVICE_TIMEOUT: string;
    }>;
}, {
    localizedErrorMessagesMapping: Readonly<{
        VALIDATION_FAILED: string;
        UNAUTHORIZED_ACCESS: string;
        INTERNAL_SYSTEM_FAILURE: string;
        RESOURCE_NOT_FOUND: string;
        EXTERNAL_SERVICE_TIMEOUT: string;
    }>;
}>>;
/**
 * @section ADN Tipado (Verbatim Module Syntax)
 * Interfaz inmutable del diccionario para el compilador de internacionalización.
 */
export type IExceptionsLinguisticDictionary = z.infer<typeof ExceptionsLinguisticDictionarySchema>;
//# sourceMappingURL=ExceptionsI18n.schema.d.ts.map