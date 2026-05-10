/**
 * @section Messaging Logic - Inbox Query Builder
 * @description Átomo de lógica pura encargado de generar las cadenas de filtrado
 * para el protocolo PostgREST. Garantiza que las consultas al Ledger sean
 * consistentes y sigan la política de exclusión de rastro eliminado.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Pure Logic.
 */

interface IInboxFiltersResult {
  readonly notificationsQueryLiteral: string;
  readonly messagesQueryLiteral: string;
}

/**
 * Construye los filtros técnicos para la recuperación del buzón.
 *
 * @param citizenIdentifier - UUID del ciudadano bajo auditoría.
 * @returns {IInboxFiltersResult} Diccionario de filtros para el enjambre de red.
 */
export const BuildInboxQueryFilters = (
  citizenIdentifier: string
): IInboxFiltersResult => {
  // Filtro para Alertas: Destinatario exacto y omitir eliminadas lógicamente.
  const notificationsQueryLiteral =
    `recipient_id=eq.${citizenIdentifier}&interaction_status=neq.TRASHED_DELETED&order=dispatch_timestamp.desc`;

  // Filtro para Mensajes: Emisor O Receptor y omitir eliminados lógicamente.
  const messagesQueryLiteral =
    `or=(sender_id.eq.${citizenIdentifier},recipient_id.eq.${citizenIdentifier})&current_status=neq.TRASHED_DELETED&order=transmission_timestamp.desc`;

  return Object.freeze({
    notificationsQueryLiteral,
    messagesQueryLiteral
  });
};
