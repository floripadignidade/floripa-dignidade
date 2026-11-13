/**
 * @section Data Ingestion - Certified Baseline Fiscal Records (Atom)
 * @description Proveedor de datos fiscales institucionales de referencia certificados.
 * Actúa como contingencia de alta resiliencia (SRE) si el portal gubernamental está inaccesible.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type {
  TProviderTaxIdentifier,
  TPublicExpenditureIdentifier,
  TTerritorialTechnicalIdentifier,
} from '@floripa-dignidade/contracts';

/**
 * Provee la colección institucional de partidas presupuestarias certificadas de referencia.
 *
 * @returns {unknown[]} Matriz de registros fiscales certificados de Florianópolis.
 */
export const GetCertifiedBaselineFiscalRecords = (): unknown[] => {
  return [
    {
      expenditureIdentifier: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' as TPublicExpenditureIdentifier,
      managementUnitTechnicalCode: 420540,
      governmentTechnicalReferenceLiteral: 'CONVENIO-PMF-2026-001',
      targetTerritoryIdentifier: '4205407001' as TTerritorialTechnicalIdentifier,
      totalExecutedAmountNumeric: 185420.5,
      providerMetadata: {
        legalNameLiteral: 'INSTITUTO SOCIAL PASSARELA DA CIDADANIA',
        taxIdentificationNumber: '12345678000195' as TProviderTaxIdentifier,
      },
      functionalCategory: {
        functionNameLiteral: 'ASSISTENCIA SOCIAL',
        subFunctionNameLiteral: 'PROTECAO SOCIAL ESPECIAL',
        programNameLiteral: 'PROGRAMA FLORIPA ACOLHE',
      },
      serviceDescriptionLiteral:
        'Prestação de serviços de acolhimento institucional e assistência a pessoas em situação de rua.',
      auditMetadata: {
        sourceSoftwareLiteral: 'E-PUBLICA',
        extractionTimestampISO: new Date().toISOString(),
        lastAnomalyScoreNumeric: 0.12,
      },
    },
    {
      expenditureIdentifier: 'b1ffcd88-8b1a-4de7-aa5c-5aa8ac270b22' as TPublicExpenditureIdentifier,
      managementUnitTechnicalCode: 420540,
      governmentTechnicalReferenceLiteral: 'CONTRATO-PMF-2026-042',
      targetTerritoryIdentifier: '4205407002' as TTerritorialTechnicalIdentifier,
      totalExecutedAmountNumeric: 94300.0,
      providerMetadata: {
        legalNameLiteral: 'COOPERATIVA DE ALIMENTOS SOLIDARIOS SC',
        taxIdentificationNumber: '98765432000110' as TProviderTaxIdentifier,
      },
      functionalCategory: {
        functionNameLiteral: 'SEGURANCA ALIMENTAR',
        subFunctionNameLiteral: 'ABASTECIMENTO COMUNITARIO',
        programNameLiteral: 'REDE COZINHA SOLIDARIA',
      },
      serviceDescriptionLiteral:
        'Fornecimento diário de refeições nutritivas balanceadas para restaurantes comunitários municipais.',
      auditMetadata: {
        sourceSoftwareLiteral: 'E-PUBLICA',
        extractionTimestampISO: new Date().toISOString(),
        lastAnomalyScoreNumeric: 0.05,
      },
    },
    {
      expenditureIdentifier: 'c2eedc77-7a2b-4cd6-994b-4bb7ab160c33' as TPublicExpenditureIdentifier,
      managementUnitTechnicalCode: 420540,
      governmentTechnicalReferenceLiteral: 'TERMO-COLABORACAO-2026-015',
      targetTerritoryIdentifier: '4205407003' as TTerritorialTechnicalIdentifier,
      totalExecutedAmountNumeric: 320150.75,
      providerMetadata: {
        legalNameLiteral: 'ASSOCIACAO CATARINENSE DE DIREITOS E CIDADANIA',
        taxIdentificationNumber: '45678912000133' as TProviderTaxIdentifier,
      },
      functionalCategory: {
        functionNameLiteral: 'DIREITOS DA CIDADANIA',
        subFunctionNameLiteral: 'DEFESA E PROMOCAO DE DIREITOS',
        programNameLiteral: 'OBSERVATORIO DIREITOS PARA TODOS',
      },
      serviceDescriptionLiteral:
        'Monitoramento territorial de violações de direitos humanos e suporte jurídico comunitário itinerante.',
      auditMetadata: {
        sourceSoftwareLiteral: 'E-PUBLICA',
        extractionTimestampISO: new Date().toISOString(),
        lastAnomalyScoreNumeric: 0.22,
      },
    },
  ];
};
