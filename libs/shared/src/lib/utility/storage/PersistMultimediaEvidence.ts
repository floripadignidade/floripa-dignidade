/**
 * @section Storage Logic - Multimedia Evidence Orchestrator
 * @description Orquestador supremo encargado del volcado de evidencia.
 * Coordina la validación, transformación binaria y despacho físico.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Swarm Intelligence.
 * SANEADO Zenith: Atomización completa. Resolución de TS2307 y TS2769.
 */

import { ValidateEnvironmentAduana } from '@floripa-dignidade/environment-validator';
import { InternalSystemException, ValidationException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 1. ADN Estructural y Átomos del Enjambre */
import { MultimediaEvidencePayloadSchema } from './schemas/MultimediaEvidence.schema';
import { GenerateSovereignStoragePath } from './logic/GenerateSovereignStoragePath';
import { TransformToSovereignBinary } from './logic/TransformToSovereignBinary';
import { ExecuteCloudStorageUpload } from './logic/ExecuteCloudStorageUpload';
import { BuildStorageAccessUrl } from './logic/BuildStorageAccessUrl';

/** Identificador técnico para el Neural Sentinel. */
const ORCHESTRATOR_IDENTIFIER = 'MULTIMEDIA_VAULT_ORCHESTRATOR';

export const PersistMultimediaEvidence = async (
  rawPayloadSnapshot: unknown,
): Promise<{ readonly evidenceUrl: string; readonly storagePath: string }> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();
  const evidenceIdentifier = crypto.randomUUID();

  // 1. CAPTURA DE SOBERANÍA (Hardware Isolation)
  const {
    S3_BUCKET: bucketNameLiteral,
    S3_ENDPOINT: storageUrlLiteral,
    SUPABASE_SERVICE_ROLE_KEY: cloudSecurityKeySecret,
  } = ValidateEnvironmentAduana();

  return await TraceExecutionTime(
    ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_MULTIMEDIA_INGESTION_FLOW',
    correlationIdentifier,
    async () => {
      try {
        // 2. ADUANA DE ADN
        const validationResult = MultimediaEvidencePayloadSchema.safeParse(rawPayloadSnapshot);
        if (!validationResult.success) {
          throw new ValidationException('ADN_MULTIMEDIA_CORRUPTO', {
            issues: validationResult.error.flatten(),
          });
        }

        const validatedPayload = validationResult.data;

        // 3. TRANSFORMACIÓN BINARIA (Delegación Atómica)
        const binaryBody = await TransformToSovereignBinary(validatedPayload.fileBlobReference);

        // 4. CÁLCULO DE JURISDICCIÓN FÍSICA
        const targetStoragePathLiteral = GenerateSovereignStoragePath(validatedPayload, evidenceIdentifier);

        // 5. DESPACHO FÍSICO (Delegación Atómica)
        const uploadEndpointLiteral = `${storageUrlLiteral}/storage/v1/object/${bucketNameLiteral}/${targetStoragePathLiteral}`;

        await ExecuteCloudStorageUpload({
          uploadEndpointLiteral,
          cloudSecurityKeySecret,
          mimeTypeLiteral: validatedPayload.contextMetadata.mimeTypeLiteral,
          binaryBody
        });

        // 6. GENERACIÓN DE IDENTIDAD DE ACCESO
        const evidenceUrl = BuildStorageAccessUrl(storageUrlLiteral, bucketNameLiteral, targetStoragePathLiteral);

        // 7. REPORTE SRE (Visibility)
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'EVIDENCE_VAULTED_NOMINAL',
          correlationIdentifier,
          messageContentLiteral: 'Evidencia multimedia consolidada exitosamente en la nube.',
          contextMetadataSnapshot: { storagePath: targetStoragePathLiteral }
        });

        return { evidenceUrl, storagePath: targetStoragePathLiteral };

      } catch (caughtError: unknown) {
        if (caughtError instanceof ValidationException) throw caughtError;

        const errorDescriptionLiteral = caughtError instanceof Error ? caughtError.message : String(caughtError);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'STORAGE_ORCHESTRATION_COLLAPSE',
          correlationIdentifier,
          messageContentLiteral: 'Fallo crítico en el orquestador de almacenamiento.',
          contextMetadataSnapshot: { errorTrace: errorDescriptionLiteral }
        });

        throw new InternalSystemException('FALLO_EN_BÓVEDA_MULTIMEDIA_SRE', {
          originalError: errorDescriptionLiteral,
          correlationIdentifier,
        });
      }
    },
  );
};
