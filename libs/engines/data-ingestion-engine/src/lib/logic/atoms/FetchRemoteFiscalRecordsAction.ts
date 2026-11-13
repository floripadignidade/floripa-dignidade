/**
 * @section Data Ingestion - Municipal HTTP Data Client (Atom)
 * @description Átomo de red encargado de consultar el endpoint de datos abiertos
 * municipal con timeout preventivo (SRE) y conmutación automática al baseline certificado.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Rendimiento).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  EmitTelemetrySignal,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

import {
  HTTP_TRANSMISSION_TIMEOUT_IN_MILLISECONDS_QUANTITY,
  MUNICIPAL_OPEN_DATA_ENDPOINT_URL_LITERAL,
} from './schemas/SyncMunicipalityExpenditure.schema';

import { GetCertifiedBaselineFiscalRecords } from './GetCertifiedBaselineFiscalRecords';

const CLIENT_MODULE_IDENTIFIER = 'MUNICIPAL_HTTP_DATA_CLIENT_ATOM' as ModuleIdentifier;

export interface IFetchRemoteRecordsResult {
  readonly rawRecordsCollectionSnapshot: unknown[];
  readonly isFallbackAppliedBoolean: boolean;
}

/**
 * Consulta el endpoint HTTP de datos abiertos municipal con protección de tiempo límite.
 *
 * @param municipalitySlugLiteral - Identificador del municipio a consultar.
 * @param initialMonthYearLiteral - Periodo inicial en formato MM/AAAA.
 * @param finalMonthYearLiteral - Periodo final en formato MM/AAAA.
 * @param correlationIdentifier - Identificador de correlación para auditoría forense.
 * @returns {Promise<IFetchRemoteRecordsResult>}
 */
export const FetchRemoteFiscalRecordsAction = async (
  municipalitySlugLiteral: string,
  initialMonthYearLiteral: string,
  finalMonthYearLiteral: string,
  correlationIdentifier: string,
): Promise<IFetchRemoteRecordsResult> => {
  const queryParameters = new URLSearchParams({
    municipio: municipalitySlugLiteral,
    periodoInicial: initialMonthYearLiteral,
    periodoFinal: finalMonthYearLiteral,
    formato: 'json',
  });

  const targetRequestUrlLiteral = `${MUNICIPAL_OPEN_DATA_ENDPOINT_URL_LITERAL}?${queryParameters.toString()}`;

  try {
    const incomingResponse = await fetch(targetRequestUrlLiteral, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Floripa-Dignidade-Data-Ingestion-Engine/1.2.1',
        'X-Correlation-Identifier': correlationIdentifier,
      },
      signal: AbortSignal.timeout(HTTP_TRANSMISSION_TIMEOUT_IN_MILLISECONDS_QUANTITY),
    });

    if (!incomingResponse.ok) {
      throw new Error(`REMOTE_PORTAL_HTTP_FAULT_CODE_${incomingResponse.status}`);
    }

    const parsedResponseBody: unknown = await incomingResponse.json();

    if (Array.isArray(parsedResponseBody) && parsedResponseBody.length > 0) {
      return {
        rawRecordsCollectionSnapshot: parsedResponseBody,
        isFallbackAppliedBoolean: false,
      };
    }

    throw new Error('REMOTE_PORTAL_EMPTY_PAYLOAD');
  } catch (caughtHttpError: unknown) {
    const errorMessageLiteral =
      caughtHttpError instanceof Error ? caughtHttpError.message : String(caughtHttpError);

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: CLIENT_MODULE_IDENTIFIER,
      operationCodeLiteral: 'REMOTE_FETCH_FALLBACK_TRIGGERED' as OperationCode,
      correlationIdentifier,
      messageContentLiteral:
        'Servicio remoto no disponible o con latencia excedida. Aplicando contingencia de referencia.',
      semanticIntentTag: 'MUNICIPAL_INGESTION_CONTINGENCY',
      contextMetadataSnapshot: {
        targetRequestUrlLiteral,
        errorMessageLiteral,
      },
    });

    return {
      rawRecordsCollectionSnapshot: GetCertifiedBaselineFiscalRecords(),
      isFallbackAppliedBoolean: true,
    };
  }
};
