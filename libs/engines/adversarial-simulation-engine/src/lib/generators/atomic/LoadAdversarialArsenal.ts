/**
 * @section Adversarial Generators - Arsenal Loader Atom
 * @description Átomo encargado de consolidar todos los vectores de ataque
 * disponibles en el búnker. Actúa como el proveedor SSOT de armamento lógico.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Arsenal Management.
 * @author Raz Podestá - MetaShark Tech
 */

import { GenerateCrossSiteScriptingPayload } from '../GenerateCrossSiteScriptingPayload';
import { GenerateSqlInjectionPayload } from '../GenerateSqlInjectionPayload';
import type { IAdversarialPayload } from '../schemas/AdversarialPayload.schema';

/**
 * Carga y combina ráfagas de ataque multiformes.
 *
 * @returns {IAdversarialPayload[]} Colección completa de vectores de inyección.
 */
export const LoadAdversarialArsenal = (): IAdversarialPayload[] => {
  return [...GenerateSqlInjectionPayload(), ...GenerateCrossSiteScriptingPayload()];
};
