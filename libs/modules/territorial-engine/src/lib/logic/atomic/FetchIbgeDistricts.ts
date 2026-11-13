/**
 * @section Territorial Logic - IBGE External Fetcher
 * @description Átomo de red encargado de la consulta física a la API de
 * Localidades del IBGE. Implementa vigilancia SRE y validación de ADN.
 *
 * Protocolo OEDP-V16.0 - High Performance SRE & ISO Technical Naming.
 * SANEADO Zenith: Resolución de TS2307 y erradicación de abreviaturas.
 *
 * @author Raz Podestá - MetaShark Tech
 */

import { EmitTelemetrySignal, TraceExecutionTime } from '@floripa-dignidade/telemetry';

import { InternalSystemException } from '@floripa-dignidade/exceptions';
import { IbgeDistrictCollectionSchema } from '../../schemas/IbgeTerritorialProtocols.schema';
import type { IIbgeDistrictCollection } from '../../schemas/IbgeTerritorialProtocols.schema';

/** Constantes de configuración de datos abiertos */
const MUNICIPALITY_CODE_FLORIANOPOLIS_LITERAL = '4205407';
const IBGE_LOCALITIES_API_ENDPOINT_LITERAL = `https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${MUNICIPALITY_CODE_FLORIANOPOLIS_LITERAL}/distritos`;

/**
 * Recupera la colección oficial de distritos desde la infraestructura del IBGE.
 *
 * @param correlationIdentifier - Identificador único para el rastro forense.
 * @returns {Promise<IIbgeDistrictCollection>} Lista de distritos validada por Zod.
 */
export const FetchIbgeDistricts = async (
  correlationIdentifier: string,
): Promise<IIbgeDistrictCollection> => {
  return await TraceExecutionTime(
    'TERRITORIAL_NETWORK_ADAPTER',
    'FETCH_IBGE_DISTRICTS_OPERATION',
    correlationIdentifier,
    async () => {
      try {
        const networkResponse = await fetch(IBGE_LOCALITIES_API_ENDPOINT_LITERAL, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'User-Agent': 'Floripa-Dignidade-Sovereign-Bot/1.0',
          },
          /** SRE: Tiempo máximo de espera de 15 segundos antes de abortar */
          signal: AbortSignal.timeout(15000),
        });

        if (!networkResponse.ok) {
          throw new Error(`IBGE_PROVIDER_HTTP_ERROR_${networkResponse.status}`);
        }

        const rawDataCollectionPayload = await networkResponse.json();

        // ADUANA DE ADN (Safe Parsing)
        const validationResult = IbgeDistrictCollectionSchema.safeParse(rawDataCollectionPayload);

        if (!validationResult.success) {
          throw new Error('IBGE_DATA_CONTRACT_VIOLATION');
        }

        return validationResult.data;
      } catch (caughtError: unknown) {
        const errorDescriptionLiteral =
          caughtError instanceof Error ? caughtError.message : String(caughtError);

        void EmitTelemetrySignal({
          severityLevel: 'CRITICAL',
          moduleIdentifier: 'TERRITORIAL_FETCH_ADAPTER',
          operationCode: 'IBGE_COMMUNICATION_FAULT',
          correlationIdentifier,
          message: 'Fallo crítico al intentar sincronizar con los datos abiertos del IBGE.',
          contextMetadata: { errorDescriptionLiteral },
        });

        throw new InternalSystemException('FALLO_EN_CONEXION_TERRITORIAL_EXTERNA', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
        });
      }
    },
  );
};
