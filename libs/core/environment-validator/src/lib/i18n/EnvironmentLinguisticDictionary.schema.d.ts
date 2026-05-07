/**
 * @section Environment DNA - Linguistic Integrity Schema
 * @description Define o contrato soberano para os dicionários de tradução
 * da auditoria de infraestrutura. Garante que os logs de SRE e mensagens
 * de bloqueio de hardware possuam representações textuais validadas.
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & ReadOnly Integrity.
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */
import { z } from 'zod';
/**
 * @name EnvironmentLinguisticDictionarySchema
 * @description Aduana de validação para as almas linguísticas (JSON) do búnker de ambiente.
 * Impede que mensagens críticas de infraestrutura sejam emitidas sem tradução.
 */
export declare const EnvironmentLinguisticDictionarySchema: z.ZodReadonly<z.ZodObject<{
    /**
     * Coleção de sinais para o rastro telemétrico (SRE).
     */
    logs: z.ZodReadonly<z.ZodObject<{
        INTEGRITY_VIOLATION: z.ZodString;
        VERIFICATION_SUCCESS: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        INTEGRITY_VIOLATION: string;
        VERIFICATION_SUCCESS: string;
    }, {
        INTEGRITY_VIOLATION: string;
        VERIFICATION_SUCCESS: string;
    }>>;
    /**
     * Coleção de descrições para exceções técnicas.
     */
    errors: z.ZodReadonly<z.ZodObject<{
        ENVIRONMENT_ADN_CORRUPT: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        ENVIRONMENT_ADN_CORRUPT: string;
    }, {
        ENVIRONMENT_ADN_CORRUPT: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    errors: Readonly<{
        ENVIRONMENT_ADN_CORRUPT: string;
    }>;
    logs: Readonly<{
        INTEGRITY_VIOLATION: string;
        VERIFICATION_SUCCESS: string;
    }>;
}, {
    errors: Readonly<{
        ENVIRONMENT_ADN_CORRUPT: string;
    }>;
    logs: Readonly<{
        INTEGRITY_VIOLATION: string;
        VERIFICATION_SUCCESS: string;
    }>;
}>>;
/**
 * @section ADN Tipado (Verbatim Module Syntax)
 * Interface inalterável para o motor de compilação de internacionalização.
 */
export type IEnvironmentLinguisticDictionary = z.infer<typeof EnvironmentLinguisticDictionarySchema>;
//# sourceMappingURL=EnvironmentLinguisticDictionary.schema.d.ts.map