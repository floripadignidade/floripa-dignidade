/**
 * @section User Management & Identity - Identity Logic Atoms
 * @description Átomo encargado exclusivamente de la comunicación física I/O con el
 * Tier de Datos. Ejecuta la actualización parcial (PATCH) del Ledger de identidad
 * mediante protocolo Stateless, garantizando la persistencia de los coeficientes
 * de autoridad bajo estándares de resiliencia SRE.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Calidad: ISO/IEC 25010 (Modularidad y Tolerancia a Fallos).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { InternalSystemException } from '@floripa-dignidade/exceptions';

/* 1. ADN ESTRUCTURAL (Consumo desde SSOT Contracts) */
import type { IIdentityPhysicalRecord } from '@floripa-dignidade/contracts';

/**
 * @interface ITransmitIdentityAuthorityParameters
 * @description Contrato inmutable para la operación de red del Ledger de identidad.
 * Sigue la norma ISO 11179 de Objeto + Propiedad + Representación.
 */
interface ITransmitIdentityAuthorityParameters {
  /** URL absoluta del búnker de datos primario. */
  readonly primaryCloudUrlLiteral: string;
  /** Llave de acceso de alta autoridad validada por la aduana de entorno. */
  readonly cloudSecurityKeySecret: string;
  /** Identificador nominal de la identidad a actualizar. */
  readonly identityIdentifierLiteral: string;
  /** Snapshot de los datos mapeados para la persistencia física. */
  readonly ledgerRecordSnapshot: IIdentityPhysicalRecord;
}

/**
 * Ejecuta el despacho físico del rastro de identidad hacia la infraestructura cloud.
 * Implementa el patrón "Atomic I/O" con protección de timeout de hardware.
 *
 * @param parametersSnapshot - Diccionario de configuración y datos para la transmisión.
 * @throws {InternalSystemException} Si la infraestructura rechaza la conexión o el parche.
 *
 * @prompt_ia: "Verifica que el endpoint de red utilice el filtro 'eq' para asegurar
 * que el parche solo impacte un único registro de identidad por transacción."
 */
export const TransmitIdentityAuthorityLedgerPatch = async (
  parametersSnapshot: ITransmitIdentityAuthorityParameters,
): Promise<void> => {
  const {
    primaryCloudUrlLiteral,
    cloudSecurityKeySecret,
    identityIdentifierLiteral,
    ledgerRecordSnapshot,
  } = parametersSnapshot;

  /**
   * @section Construcción de Identidad de Red
   * Apuntamos a la tabla maestra 'citizen_identities_ledger' mediante filtrado inyectado.
   * Se utiliza el identificador físico inalterable para el destino del parche.
   */
  const targetEndpointPathLiteral = `/rest/v1/citizen_identities_ledger?citizen_id=eq.${identityIdentifierLiteral}`;
  const targetAbsoluteUrlLiteral = `${primaryCloudUrlLiteral}${targetEndpointPathLiteral}`;

  try {
    const networkResponse = await fetch(targetAbsoluteUrlLiteral, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: cloudSecurityKeySecret,
        Authorization: `Bearer ${cloudSecurityKeySecret}`,
        /**
         * 'Prefer: return=minimal' optimiza el rendimiento al no
         * solicitar el objeto actualizado de vuelta.
         */
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(ledgerRecordSnapshot),

      /**
       * 🛡️ LEY DE RESILIENCIA:
       * 'keepalive' garantiza que la transacción finalice aunque la conexión
       * del cliente se interrumpa abruptamente.
       */
      keepalive: true,

      /**
       * SRE Guard: Límite de 8 segundos para evitar bloqueos por latencia de red
       * en el Edge Runtime.
       */
      signal: AbortSignal.timeout(8000),
    });

    if (!networkResponse.ok) {
      throw new Error(`DATABASE_ENGINE_REJECTION_HTTP_${networkResponse.status}`);
    }
  } catch (caughtError: unknown) {
    /**
     * @section Gestión Forense de I/O
     * Transformamos el colapso de red en una excepción institucional para el Sentinel.
     */
    const errorDescriptionLiteral =
      caughtError instanceof Error ? caughtError.message : String(caughtError);

    throw new InternalSystemException('IDENTITY_PERSISTENCE_TRANSACTION_FAULT', {
      originalErrorLiteral: errorDescriptionLiteral,
      targetIdentityIdentifier: identityIdentifierLiteral,
      httpStatusNumeric: errorDescriptionLiteral.includes('HTTP')
        ? parseInt(errorDescriptionLiteral.split('_').pop() || '500', 10)
        : 500,
    });
  }
};
