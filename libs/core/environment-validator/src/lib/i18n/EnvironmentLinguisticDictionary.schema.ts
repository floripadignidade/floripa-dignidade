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
export const EnvironmentLinguisticDictionarySchema = z
  .object({
    /**
     * Coleção de sinais para o rastro telemétrico (SRE).
     */
    logs: z
      .object({
        INTEGRITY_VIOLATION: z
          .string()
          .describe('Alerta de segurança emitido quando o ADN do hardware está corrompido.'),

        VERIFICATION_SUCCESS: z
          .string()
          .describe('Confirmação nominal de que todos os segredos cloud foram validados.'),
      })
      .readonly(),

    /**
     * Coleção de descrições para exceções técnicas.
     */
    errors: z
      .object({
        ENVIRONMENT_ADN_CORRUPT: z
          .string()
          .describe('Mensagem de colapso utilizada no bloqueio do servidor (Fail-Fast).'),
      })
      .readonly(),
  })
  .readonly();

/**
 * @section ADN Tipado (Verbatim Module Syntax)
 * Interface inalterável para o motor de compilação de internacionalização.
 */
export type IEnvironmentLinguisticDictionary = z.infer<
  typeof EnvironmentLinguisticDictionarySchema
>;
