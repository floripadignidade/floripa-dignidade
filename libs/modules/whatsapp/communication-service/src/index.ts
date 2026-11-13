/**
 * @section WhatsApp Service - Package Entry Point
 * @description Orquestador soberano del búnker de comunicación con Meta.
 * Centraliza las capacidades de recepción validada de señales, triaje cognitivo
 * de eventos y transformación de mensajes en evidencia forense para la ONG.
 *
 * Protocolo OEDP-V16.0 - Single Source Resolution & Clean Paths.
 * @author Raz Podestá - MetaShark Tech
 */

/**
 * @version 1.2.2
 * Estatus: Sincronizado tras corrección de rutas de ADN estructural.
 */
export const MODULE_WHATSAPP_SERVICE_VERSION = '1.2.2';

/**
 * @section ADN Estructural (Schemas & Types)
 * Exportación de contratos Zod para el parseo seguro de señales de Meta.
 * SANEADO: Sincronización de ruta con el archivo '.schema'.
 */
export type {
  IWhatsAppMessage,
  IWhatsAppWebhookPayload,
} from './lib/schemas/WhatsAppWebhook.schema';

export {
  WhatsAppMessageSchema,
  WhatsAppWebhookPayloadSchema,
} from './lib/schemas/WhatsAppWebhook.schema';

/**
 * @section Almas Lingüísticas (i18n)
 * Expone los esquemas de traducción para la auditoría de diccionarios.
 */
export type { IWhatsAppCommunicationI18n } from './lib/i18n/WhatsAppCommunicationI18n.schema';
export { WhatsAppCommunicationI18nSchema } from './lib/i18n/WhatsAppCommunicationI18n.schema';

/**
 * @section Escudos Criptográficos (Security Logic)
 */
export { ValidateMetaSignature } from './lib/logic/atomic/ValidateMetaSignature';

/**
 * @section Orquestadores Cognitivos (Processors)
 * Motores de triaje que coordinan el flujo sanguíneo digital hacia la IA.
 */
export { ProcessIncomingWhatsAppEvent } from './lib/logic/orchestrators/ProcessIncomingWhatsAppEvent';
