/**
 * @section Messaging Logic - Presence Sensor Atom
 * @description Átomo encargado exclusivamente de recuperar el token de despacho
 * PWA vinculado a una identidad. Actúa como el puente hacia el Ledger de Presencia.
 *
 * Protocolo OEDP-V16.0 - Functional Atomicity & High Performance SRE.
 */

import { InternalSystemException } from '@floripa-dignidade/exceptions';

/**
 * Consulta el Tier de Datos para obtener el secreto de notificación del hardware.
 *
 * @param citizenIdentifier - UUID del ciudadano bajo auditoría.
 * @param cloudUrl - Endpoint de Supabase REST.
 * @param cloudKey - Llave de seguridad institucional.
 * @returns {Promise<string | null>} El token secreto o null si no hay registro.
 */
export const GetCitizenPushToken = async (
  citizenIdentifier: string,
  cloudUrl: string,
  cloudKey: string,
): Promise<string | null> => {
  const presenceResponse = await fetch(
    `${cloudUrl}/rest/v1/user_presence_ledger?citizen_id=eq.${citizenIdentifier}&select=push_token`,
    { headers: { apikey: cloudKey, Authorization: `Bearer ${cloudKey}` } },
  );

  if (!presenceResponse.ok) {
    throw new InternalSystemException('FALLO_LECTURA_TOKEN_PRESENCIA', {
      httpStatus: presenceResponse.status,
    });
  }

  const presenceDataCollection = await presenceResponse.json();

  /** Retornamos el primer token válido detectado en el enjambre de dispositivos. */
  return presenceDataCollection[0]?.push_token ?? null;
};
