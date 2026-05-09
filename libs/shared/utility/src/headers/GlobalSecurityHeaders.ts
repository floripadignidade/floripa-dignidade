/**
 * @section Infrastructure DNA - Global Security Headers Wrapper
 * @description Envoltorio de tipos para la colección institucional de cabeceras
 * de seguridad. Proporciona compatibilidad entre el silo de datos JSON y el
 * sistema de tipos del monorepo, facilitando su inyección en Next.js.
 *
 * Protocolo OEDP-V17.0 - Universal Artifact Pattern & ISO Naming.
 * 🛡️ LEY SRE: Los valores reales residen en el archivo JSON adyacente para permitir
 * que sean consumidos por herramientas de infraestructura (Node.js) sin compilación.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import SecurityHeadersSiloSnapshot from './GlobalSecurityHeaders.json';

/**
 * @interface ISecurityHeader
 * @description Representación técnica de una tupla de cabecera HTTP.
 */
export interface ISecurityHeader {
  /** Nombre normalizado de la cabecera (ej: "X-Frame-Options"). */
  readonly key: string;
  /** Valor de la directiva de seguridad (ej: "DENY"). */
  readonly value: string;
}

/**
 * @name GLOBAL_SECURITY_HEADERS_COLLECTION
 * @description Colección inmutable de cabeceras de seguridad institucional.
 * Alineado con los estándares de endurecimiento (Hardening) de la ONG.
 */
export const GLOBAL_SECURITY_HEADERS_COLLECTION: readonly ISecurityHeader[] =
  SecurityHeadersSiloSnapshot as readonly ISecurityHeader[];
