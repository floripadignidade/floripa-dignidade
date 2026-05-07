/**
 * @section Exception Logic - HTTP to Domain Mapper
 * @description Átomo encargado de la traducción de protocolos. Transforma códigos de
 * estado HTTP y mensajes de red en instancias de excepciones soberanas niveladas.
 * Actúa como el intérprete en las fronteras de los API Gateways.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & High Performance SRE.
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */
import type { GlobalBaseException } from '../codes/GlobalBaseException';
/**
 * Traduce un fallo de red o estado HTTP a una excepción del dominio de Floripa Dignidade.
 * Proporciona un triaje automático basado en la familia del código de estado.
 *
 * @param httpStatusCodeNumeric - Código físico recibido (4xx o 5xx).
 * @param customMessageLiteral - Descripción del contexto del error.
 * @param contextMetadataCollection - Snapshot de variables para auditoría forense.
 * @returns {GlobalBaseException} Instancia de una excepción especializada.
 */
export declare const MapHttpErrorToException: (httpStatusCodeNumeric: number, customMessageLiteral: string, contextMetadataCollection?: Record<string, unknown>) => GlobalBaseException;
//# sourceMappingURL=MapHttpErrorToException.d.ts.map