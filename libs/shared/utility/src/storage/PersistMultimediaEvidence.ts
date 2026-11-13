/**
 * @section Storage Logic - Multimedia Evidence Orchestrator
 * @description Orquestador supremo encargado del volcado de evidencia ciudadana.
 * Coordina la validación estructural, la transformación binaria isomórfica y
 * el despacho físico hacia el Tier de Datos (Supabase/S3).
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Swarm Intelligence.
 * SANEADO Zenith: Resolución de colisiones de tipos (TS2561/TS2339) y blindaje I/O.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ValidateEnvironmentAduana } from '@floripa-dignidade/environment-validator';
import { InternalSystemException, ValidationException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  ReportForensicException,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 1. ADN Estructural y Átomos del Enjambre (Swarm Logic) */
import { MultimediaEvidencePayloadSchema } from './schemas/MultimediaEvidence.schema';
import { GenerateSovereignStoragePath } from './logic/GenerateSovereignStoragePath';
import { TransformToSovereignBinary } from './logic/TransformToSovereignBinary';
import { ExecuteCloudStorageUpload } from './logic/ExecuteCloudStorageUpload';
import { BuildStorageAccessUrl } from './logic/BuildStorageAccessUrl';

/** Identificador técnico del aparato para el Neural Sentinel. */
const ORCHESTRATOR_IDENTIFIER = 'MULTIMEDIA_VAULT_ORCHESTRATOR';

/**
 * @interface IMultimediaVaultResult
 * @description Contrato de salida inmutable tras la consolidación de la evidencia.
 */
export interface IMultimediaVaultResult {
  /** URL pública final para visualización del recurso. */
  readonly evidenceUrlLiteral: string;
  /** Ruta jerárquica interna dentro del bucket S3. */
  readonly storagePathLiteral: string;
}

/**
 * Ejecuta el pipeline de salvaguarda de evidencia multimedia en la nube.
 * Implementa el patrón "Cloud Sovereign" (ADR 0015) utilizando REST sobre S3.
 *
 * @param rawPayloadSnapshot - Diccionario de datos crudos con referencia al archivo binario.
 * @returns {Promise<IMultimediaVaultResult>} Coordenadas de acceso públicas al recurso.
 * @throws {ValidationException} Si el archivo supera el límite de peso o tipo mime.
 * @throws {InternalSystemException} Si la nube rechaza el archivo o expira el tiempo.
 */
export const PersistMultimediaEvidence = async (
  rawPayloadSnapshot: unknown,
): Promise<IMultimediaVaultResult> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  /** Identidad criptográfica única para el archivo físico. */
  const evidenceIdentifierLiteral = crypto.randomUUID();

  return await TraceExecutionTime(
    ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_MULTIMEDIA_INGESTION_FLOW',
    correlationIdentifier,
    async () => {
      try {
        /**
         * 1. CAPTURA DE SOBERANÍA (Hardware Isolation)
         * 🛡️ SANEADO Zenith: Inyección de 'await' mandatorio para resolver el
         * contrato asíncrono de secretos inyectados por el motor de infraestructura.
         */
        const {
          S3_BUCKET: bucketNameLiteral,
          S3_ENDPOINT: storageUrlLiteral,
          SUPABASE_SERVICE_ROLE_KEY: cloudSecurityKeySecret,
        } = await ValidateEnvironmentAduana();

        // 2. ADUANA DE ADN (Border Security)
        const validationResult = MultimediaEvidencePayloadSchema.safeParse(rawPayloadSnapshot);

        if (!validationResult.success) {
          throw new ValidationException('ADN_MULTIMEDIA_CORRUPTO', {
            structuralIssuesCollection: validationResult.error.flatten(),
          });
        }

        const validatedPayload = validationResult.data;
        const { institutionalContextMetadata } = validatedPayload;

        // 3. TRANSFORMACIÓN BINARIA (Delegación Atómica Isomórfica)
        const binaryContentBody = await TransformToSovereignBinary(
          validatedPayload.fileBlobReference,
        );

        // 4. CÁLCULO DE JURISDICCIÓN FÍSICA (Sovereign Routing)
        const storagePathLiteral = GenerateSovereignStoragePath(
          validatedPayload,
          evidenceIdentifierLiteral,
        );

        // 5. DESPACHO FÍSICO A LA NUBE (Cloud I/O)
        /**
         * 🛡️ SANEADO Zenith: Alineación con la nueva firma del despachador.
         */
        const targetUploadEndpointLiteral = `${storageUrlLiteral}/storage/v1/object/${bucketNameLiteral}/${storagePathLiteral}`;

        await ExecuteCloudStorageUpload({
          targetUploadEndpointLiteral,
          cloudAccessSecurityKeySecret: cloudSecurityKeySecret,
          contentMimeTypeLiteral: institutionalContextMetadata.mimeTypeLiteral,
          binaryContentBody,
        });

        // 6. GENERACIÓN DE IDENTIDAD DE ACCESO PÚBLICO
        const evidenceUrlLiteral = BuildStorageAccessUrl(
          storageUrlLiteral,
          bucketNameLiteral,
          storagePathLiteral,
        );

        // 7. REPORTE DE ÉXITO OPERACIONAL (SRE Visibility)
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'EVIDENCE_VAULTED_NOMINAL_SUCCESS',
          correlationIdentifier,
          messageContentLiteral:
            'Evidencia multimedia consolidada exitosamente en la bóveda de la nube.',
          contextMetadataSnapshot: {
            storagePathLiteral,
            mimeTypeLiteral: institutionalContextMetadata.mimeTypeLiteral,
            fileSizeInBytesQuantity: validatedPayload.fileSizeInBytesQuantity,
          },
        });

        return {
          evidenceUrlLiteral,
          storagePathLiteral,
        };
      } catch (caughtError: unknown) {
        // 8. GESTIÓN FORENSE DE COLAPSO (Resilience Layer)

        // Si el error ya es una excepción de validación, la propagamos intacta.
        if (caughtError instanceof ValidationException) {
          throw caughtError;
        }

        const errorDescriptionLiteral =
          caughtError instanceof Error ? caughtError.message : String(caughtError);

        /**
         * Reportamos el colapso al Neural Sentinel.
         * SANEADO: Se usa ReportForensicException para estandarizar el rastro.
         */
        const normalizedException = new InternalSystemException('FALLO_EN_BOVEDA_MULTIMEDIA_SRE', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
        });

        ReportForensicException(normalizedException, correlationIdentifier);

        throw normalizedException;
      }
    },
  );
};
