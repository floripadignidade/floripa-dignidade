/**
 * @section Storage Logic - Physical Upload Dispatcher
 * @description Átomo encargado exclusivamente de la comunicación I/O con el
 * servidor de almacenamiento S3/Supabase.
 *
 * Protocolo OEDP-V17.0 - Hardware Isolation & Network Resilience.
 */

import { InternalSystemException } from '@floripa-dignidade/exceptions';

interface IUploadParameters {
  readonly uploadEndpointLiteral: string;
  readonly cloudSecurityKeySecret: string;
  readonly mimeTypeLiteral: string;
  readonly binaryBody: Uint8Array;
}

/**
 * Ejecuta el PUT/POST físico hacia la nube soberana.
 * 🛡️ SANEADO Zenith: El cuerpo se castea a 'any' temporalmente para resolver
 * la sobrecarga de Fetch (TS2769) sin perder la integridad del dato.
 */
export const ExecuteCloudStorageUpload = async (
  parameters: IUploadParameters
): Promise<void> => {
  const networkResponse = await fetch(parameters.uploadEndpointLiteral, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${parameters.cloudSecurityKeySecret}`,
      'apikey': parameters.cloudSecurityKeySecret,
      'Content-Type': parameters.mimeTypeLiteral,
      'x-upsert': 'true'
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: parameters.binaryBody as any,
    signal: AbortSignal.timeout(30000)
  });

  if (!networkResponse.ok) {
    throw new InternalSystemException('STORAGE_UPLOAD_REJECTED', {
      httpStatusNumeric: networkResponse.status,
      statusTextLiteral: networkResponse.statusText
    });
  }
};
