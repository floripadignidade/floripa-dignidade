/**
 * @section Telemetry DNA - Linguistic Integrity Schema
 * @description Define el contrato soberano para los diccionarios de traducción
 * del sistema nervioso central. Garantiza que cada señal emitida posea
 * una representación textual validada para auditoría y logs semánticos.
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & ReadOnly Integrity.
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */
import { z } from 'zod';
/**
 * @name TelemetryLinguisticDictionarySchema
 * @description Aduana de validación para las almas lingüísticas (JSON) del búnker
 * de telemetría. Impede que el sistema nervioso emita señales sin una
 * descripción humana clara en los idiomas soportados.
 */
export declare const TelemetryLinguisticDictionarySchema: z.ZodReadonly<z.ZodObject<{
    /**
     * Mapeo de Señales Telemétricas Localizadas.
     * Define la representación textual de los hitos del flujo de ejecución.
     */
    telemetrySignalsMapping: z.ZodReadonly<z.ZodObject<{
        START_PROCESS: z.ZodString;
        END_PROCESS: z.ZodString;
        LATENCY_REPORT: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        START_PROCESS: string;
        END_PROCESS: string;
        LATENCY_REPORT: string;
    }, {
        START_PROCESS: string;
        END_PROCESS: string;
        LATENCY_REPORT: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    telemetrySignalsMapping: Readonly<{
        START_PROCESS: string;
        END_PROCESS: string;
        LATENCY_REPORT: string;
    }>;
}, {
    telemetrySignalsMapping: Readonly<{
        START_PROCESS: string;
        END_PROCESS: string;
        LATENCY_REPORT: string;
    }>;
}>>;
/**
 * @section ADN Tipado (Verbatim Module Syntax)
 * Interfaz inmutable del diccionario para el compilador de internacionalización (Weaver).
 */
export type ITelemetryLinguisticDictionary = z.infer<typeof TelemetryLinguisticDictionarySchema>;
//# sourceMappingURL=TelemetryLinguisticDictionary.schema.d.ts.map