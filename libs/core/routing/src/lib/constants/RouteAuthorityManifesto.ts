/**
 * @section Routing Constants - Route Authority Manifesto (SSOT Bridge)
 * @description Define el mapa inmutable de control de acceso basado en roles (RBAC)
 * para los prefijos de ruta protegidos del portal ciudadano. Consume directamente
 * el catálogo único de roles de `@floripa-dignidade/contracts` (SSOT), valida la
 * estructura del manifiesto con Zod y sella el mapa en tiempo de ejecución.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Seguridad y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  IDENTITY_ACCESS_ROLES_COLLECTION,
  IdentityAccessRoleSchema,
  type TIdentityAccessRole,
} from '@floripa-dignidade/contracts';
import { z } from 'zod';

/**
 * @name TRouteAuthorityRole
 * @description Tipo nominal canónico para los niveles de autoridad reconocidos por el enrutador.
 */
export type TRouteAuthorityRole = TIdentityAccessRole;

/**
 * @name SovereignAuthorityRoleLiteral
 * @description Alias de retrocompatibilidad histórica para consumidores legados del enrutador.
 * @deprecated Utilizar canónicamente `TRouteAuthorityRole` o `TIdentityAccessRole` desde `@floripa-dignidade/contracts`.
 */
export type SovereignAuthorityRoleLiteral = TIdentityAccessRole;

/**
 * @name RouteProtectionManifestoSchema
 * @description Aduana Zod inmutable que certifica que cada prefijo comience por `/` y apunte a un rol válido.
 */
export const RouteProtectionManifestoSchema = z
  .record(
    z.string().trim().startsWith('/', { message: 'PROTECTED_ROUTE_PREFIX_MUST_START_WITH_SLASH' }),
    IdentityAccessRoleSchema,
  )
  .readonly()
  .describe('Mapa inmutable de prefijos de ruta protegidos y niveles mínimos de autoridad RBAC.');

const rawRouteProtectionManifestoSnapshot: Readonly<Record<string, TRouteAuthorityRole>> = {
  '/administracion': IDENTITY_ACCESS_ROLES_COLLECTION.PLATFORM_GLOBAL_MANAGER,
  '/auditoria': IDENTITY_ACCESS_ROLES_COLLECTION.INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR,
  '/gestion': IDENTITY_ACCESS_ROLES_COLLECTION.ORGANIZATION_OPERATOR,
  '/perfil': IDENTITY_ACCESS_ROLES_COLLECTION.IDENTITY_REGISTERED,
};

/**
 * @name ROUTE_PROTECTION_MANIFESTO
 * @description Mapa inmutable y certificado por Zod que asocia prefijos de ruta con el rol mínimo requerido.
 */
export const ROUTE_PROTECTION_MANIFESTO: Readonly<Record<string, TRouteAuthorityRole>> =
  Object.freeze(RouteProtectionManifestoSchema.parse(rawRouteProtectionManifestoSnapshot));
