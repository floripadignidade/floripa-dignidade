/**
 * @section Telemetry Logic - Metadata Encryption Atom
 * @description Átomo encarregado do cifrado simétrico de metadatos.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Cryptographic Sovereignty.
 * SANEADO Zenith: Erradicação de TS6059 mediante uso de Alias Soberano.
 *
 * @author Raz Podestá - MetaShark Tech
 */

/** 🛡️ SANEADO Zenith: Uso de alias redirecionado para evitar violação de rootDir */
import { InternalSystemException } from '@floripa-dignidade/exceptions';
import { ExtractTelemetryInfrastructureConfiguration } from '../drivers/ExtractTelemetryInfrastructureConfiguration';

export interface IEncryptedMetadataResult {
  readonly encryptedDataPayloadLiteral: string;
  readonly initializationVectorLiteral: string;
}

export const EncryptTelemetryMetadataSnapshot = async (
  metadataSnapshot: Record<string, unknown>,
): Promise<IEncryptedMetadataResult> => {
  const { cloudStorageAccessSecurityKeySecret } = ExtractTelemetryInfrastructureConfiguration();

  if (!cloudStorageAccessSecurityKeySecret) {
    throw new InternalSystemException('FALLO_LLAVE_CRIPTOGRAFICA_AUSENTE');
  }

  try {
    const textEncoderInstance = new TextEncoder();
    const serializedDataBuffer = textEncoderInstance.encode(JSON.stringify(metadataSnapshot));

    const rawKeyBuffer = textEncoderInstance.encode(
      cloudStorageAccessSecurityKeySecret.substring(0, 32).padEnd(32, '0'),
    );

    const cryptoKeyInstance = await crypto.subtle.importKey(
      'raw',
      rawKeyBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt'],
    );

    const initializationVectorBuffer = crypto.getRandomValues(new Uint8Array(12));

    const encryptedDataBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: initializationVectorBuffer,
      },
      cryptoKeyInstance,
      serializedDataBuffer,
    );

    const encryptedDataPayloadLiteral = btoa(
      String.fromCharCode(...new Uint8Array(encryptedDataBuffer)),
    );

    const initializationVectorLiteral = btoa(String.fromCharCode(...initializationVectorBuffer));

    return {
      encryptedDataPayloadLiteral,
      initializationVectorLiteral,
    };
  } catch (caughtError: unknown) {
    const errorDescriptionLiteral =
      caughtError instanceof Error ? caughtError.message : String(caughtError);

    throw new InternalSystemException('COLAPSO_EN_ALGORITMO_DE_CIFRADO_SRE', {
      errorTrace: errorDescriptionLiteral,
    });
  }
};
