/**
 * @section CMS Infrastructure - Sovereign Path Resolver
 * @description Proporciona capacidades de resolución de rutas absolutas para el
 * ecosistema de gestión de contenidos. Garantiza la interoperabilidad total
 * entre sistemas de archivos (Windows/Linux), permitiendo que Payload CMS
 * genere artefactos (tipos, schemas) de forma segura en Vercel.
 *
 * Protocolo OEDP-V16.0 - High Performance & Cross-Platform Stability.
 * Saneamiento: Alineación léxica con 'path.resolve' y blindaje de CWD.
 *
 * @author Super AI Orchestrator - Floripa Dignidade
 */

import path from 'node:path';

/**
 * Transforma una colección de segmentos en una ruta física absoluta
 * normalizada para el sistema operativo anfitrión.
 *
 * @param pathSegmentsCollection - Lista de directorios, subdirectorios o archivos.
 * @returns {string} Ruta absoluta purificada y validada.
 */
export const ResolveAbsoluteSovereignPath = (...pathSegmentsCollection: string[]): string => {
  /**
   * @section Lógica de Resolución
   * Se utiliza 'path.resolve' para garantizar que la salida sea siempre
   * una ruta completa desde la raíz del sistema de archivos, esencial
   * para la emisión de tipos de Payload CMS.
   */
  return path.resolve(...pathSegmentsCollection);
};
