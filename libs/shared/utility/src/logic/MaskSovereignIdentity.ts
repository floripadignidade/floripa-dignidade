/**
 * @section Utility Logic - Sovereign Identity Masking Orchestrator
 * @description Orquestador de lógica pura encargado de delegar el enmascaramiento
 * de PII a los átomos de estrategia correspondientes.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Swarm Intelligence.
 * SANEADO Zenith: Erradicación de complejidad ciclomática (Fix ESLint).
 *
 * @author Raz Podestá - MetaShark Tech
 */

import { ApplyBrazilianDocumentMask } from './masking/ApplyBrazilianDocumentMask';
import { ApplyCitizenNameMask } from './masking/ApplyCitizenNameMask';
import { ApplyElectronicMailMask } from './masking/ApplyElectronicMailMask';

export type TIdentityMaskingStrategy =
  | 'BRAZILIAN_DOCUMENT'
  | 'CITIZEN_NAME'
  | 'ELECTRONIC_MAIL';

interface IMaskIdentityParameters {
  readonly rawIdentityLiteral: string;
  readonly maskingStrategyLiteral: TIdentityMaskingStrategy;
}

/**
 * Despacha la identidad hacia la estrategia de opacidad seleccionada.
 */
export const MaskSovereignIdentity = (parameters: IMaskIdentityParameters): string => {
  const { rawIdentityLiteral, maskingStrategyLiteral } = parameters;

  if (!rawIdentityLiteral || rawIdentityLiteral.trim() === '') {
    return 'DADO_SENSÍVEL_PROTEGIDO';
  }

  const normalizedInputLiteral = rawIdentityLiteral.toUpperCase().trim();

  /**
   * @section Triaje de Estrategia (Swarm Delegation)
   * 🛡️ LEY ZENITH: Al delegar en funciones puras externas, la complejidad
   * de este archivo cae de 14 a 4, satisfaciendo el linter.
   */
  const strategiesMapping: Record<TIdentityMaskingStrategy, (input: string) => string> = {
    BRAZILIAN_DOCUMENT: ApplyBrazilianDocumentMask,
    CITIZEN_NAME: ApplyCitizenNameMask,
    ELECTRONIC_MAIL: (input) => ApplyElectronicMailMask(input.toLowerCase())
  };

  const executeMaskingAction = strategiesMapping[maskingStrategyLiteral];

  return executeMaskingAction(normalizedInputLiteral);
};
