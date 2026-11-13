/**
 * @section WhatsApp Logic - Privacy Guardian Atom
 * @description Implementa el protocolo de protección de Información de Identificación
 * Personal (PII). Transforma identificadores telefónicos en tokens opacos para
 * rastro forense y logs de infraestructura, cumpliendo con LGPD/GDPR.
 *
 * Protocolo OEDP-V16.0 - Functional Atomicity & Privacy by Design.
 * @author Raz Podestá - MetaShark Tech
 */

/**
 * Aplica una máscara de seguridad sobre un identificador telefónico.
 * Conserva el código de país y los últimos dígitos para rastro técnico.
 *
 * @param phoneIdentifierLiteral - Número telefónico en formato E.164.
 * @returns {string} Identificador enmascarado (opaco).
 */
export const MaskSensitivePhoneIdentifier = (phoneIdentifierLiteral: string): string => {
  if (!phoneIdentifierLiteral || phoneIdentifierLiteral.length < 5) {
    return 'PROTECTED_IDENTITY';
  }

  /**
   * @section Lógica de Enmascaramiento ISO
   * Conservamos los primeros 4 caracteres (Prefijo internacional)
   * y los últimos 2 (Diferenciador forense).
   */
  const prefixSnapshotLiteral = phoneIdentifierLiteral.substring(0, 4);
  const suffixSnapshotLiteral = phoneIdentifierLiteral.slice(-2);

  return `${prefixSnapshotLiteral}****${suffixSnapshotLiteral}`;
};
