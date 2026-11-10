/**
 * @section Shared Utility Logic - Citizen Identity Privacy Masking Orchestrator
 * @description Orquestador de lógica pura encargado de coordinar la protección
 * perimetral y anonimización de datos sensibles de identificación personal (PII).
 * Implementa la salvaguarda de cumplimiento con la LGPD (Lei 13.709/2018), delegando
 * el enmascaramiento físico en átomos de estrategia especializados bajo rastro de
 * telemetría forense inalterable y tipado nominal sellado.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Seguridad y Mantenibilidad).
 * SANEADO: Purga definitiva de metáforas informales ("Sovereign"), erradicación de abreviaturas
 * en funciones de transformación e inyección de tipos nominales bridados con Zod.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/* 1. Infraestructura Core de Telemetría y Trazabilidad */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 2. Contratos de ADN Estructural (Importación Canónica Relativa) */
import {
  MaskIdentityParametersSchema,
  type IMaskIdentityParameters,
  type TIdentityMaskingStrategy,
} from './schemas/MaskSovereignIdentity.schema.js';

/* 3. Enjambre Atómico de Estrategias de Anonimización */
import { ApplyBrazilianDocumentMask } from './masking/ApplyBrazilianDocumentMask.js';
import { ApplyCitizenNameMask } from './masking/ApplyCitizenNameMask.js';
import { ApplyElectronicMailMask } from './masking/ApplyElectronicMailMask.js';

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const MASKING_ORCHESTRATOR_IDENTIFIER =
  'PRIMARY_PRIVACY_PROTECTION_ORCHESTRATOR' as ModuleIdentifier;

/**
 * @name MaskedIdentityLiteralSchema
 * @description Contrato Zod con sellado de marca nominal para literales de identidad anonimizados.
 */
export const MaskedIdentityLiteralSchema = z
  .string()
  .min(1, { message: 'LA_IDENTIDAD_ENMASCARADA_NO_PUEDE_ESTAR_VACIA' })
  .brand<'MaskedIdentityLiteral'>();

/** Tipo nominal inmutable para la representación anonimizada de una identidad protegida. */
export type TMaskedIdentityLiteral = z.infer<typeof MaskedIdentityLiteralSchema>;

/**
 * Ejecuta la anonimización de una identidad ciudadana basada en la estrategia solicitada.
 * Implementa medición de latencia en la ejecución, validación de contrato de entrada
 * y delegación en funciones puras deterministas.
 *
 * @param maskingParametersSnapshot - Snapshot inmutable conteniendo el dato sensible y la estrategia de máscara.
 * @returns {Promise<TMaskedIdentityLiteral>} Promesa que resuelve en la cadena de identidad anonimizada y sellada nominalmente.
 */
export const MaskCitizenIdentity = async (
  maskingParametersSnapshot: IMaskIdentityParameters,
): Promise<TMaskedIdentityLiteral> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    MASKING_ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_PII_PROTECTION_TRANSACTION' as OperationCode,
    correlationIdentifier,
    async (): Promise<TMaskedIdentityLiteral> => {
      // 1. VALIDACIÓN PERIMETRAL DE ENTRADA (Contract Guard)
      const validationResultSnapshot = MaskIdentityParametersSchema.safeParse(
        maskingParametersSnapshot,
      );

      if (!validationResultSnapshot.success) {
        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'WARNING',
          moduleIdentifierLiteral: MASKING_ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'MASKING_CONTRACT_VIOLATION' as OperationCode,
          correlationIdentifier,
          messageContentLiteral:
            'Violación de contrato en parámetros de anonimización de identidad.',
          semanticIntentTag: 'PII_VALIDATION_WARNING',
          contextMetadataSnapshot: {
            validationIssuesCollection:
              validationResultSnapshot.error.flatten(),
          },
        });

        return 'IDENTITY_PROTECTION_FAULT' as TMaskedIdentityLiteral;
      }

      const { rawIdentityLiteral, maskingStrategyLiteral } =
        validationResultSnapshot.data;

      // 2. FILTRO DE ATOMICIDAD: Validación de contenido mínimo
      if (!rawIdentityLiteral || rawIdentityLiteral.trim() === '') {
        return 'PROTECTED_SENSITIVE_DATA' as TMaskedIdentityLiteral;
      }

      // 3. NORMALIZACIÓN TÉCNICA INSTITUCIONAL (ISO/IEC 11179)
      const normalizedInputLiteral = rawIdentityLiteral.toUpperCase().trim();

      // 4. TRIAJE DETERMINISTA DE ESTRATEGIAS (Swarm Delegation)
      const maskingStrategiesMapping: Record<
        TIdentityMaskingStrategy,
        (unmaskedValueLiteral: string) => string
      > = {
        BRAZILIAN_DOCUMENT: ApplyBrazilianDocumentMask,
        CITIZEN_NAME: ApplyCitizenNameMask,
        ELECTRONIC_MAIL: (electronicMailInputLiteral: string) =>
          ApplyElectronicMailMask(electronicMailInputLiteral.toLowerCase()),
      };

      const executeMaskingAction =
        maskingStrategiesMapping[maskingStrategyLiteral];

      const anonymizedIdentityResultLiteral = executeMaskingAction(
        normalizedInputLiteral,
      );

      // 5. REPORTE DE TELEMETRÍA FORENSE (Visibilidad Operativa)
      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: 'DEBUG',
        moduleIdentifierLiteral: MASKING_ORCHESTRATOR_IDENTIFIER,
        operationCodeLiteral: 'PRIVACY_SHIELD_APPLIED' as OperationCode,
        correlationIdentifier,
        messageContentLiteral: `Protocolo LGPD aplicado exitosamente mediante estrategia [${maskingStrategyLiteral}].`,
        semanticIntentTag: 'PII_PROTECTION_ENFORCEMENT',
        contextMetadataSnapshot: {
          maskingStrategyLiteral,
        },
      });

      return anonymizedIdentityResultLiteral as TMaskedIdentityLiteral;
    },
  );
};

/**
 * @name MaskSovereignIdentity
 * @description Alias institucional de compatibilidad histórica para prevenir roturas en el monorepo.
 * @deprecated Utilizar canónicamente 'MaskCitizenIdentity' bajo el estándar OEDP-V18.1.
 */
export const MaskSovereignIdentity = MaskCitizenIdentity;