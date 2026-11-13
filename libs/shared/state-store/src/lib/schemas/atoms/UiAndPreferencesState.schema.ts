/**
 * @section Shared State Store - UI and User Preferences Schemas (Atom)
 * @description Define los contratos Zod inmutables para el estado efímero de interfaz
 * y las preferencias persistentes del ciudadano, conectando la localización al catálogo
 * único SSOT de `@floripa-dignidade/contracts` (ADR 0030).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { DEFAULT_LOCALE_IDENTIFIER, SupportedLocaleSchema } from '@floripa-dignidade/contracts';
import { z } from 'zod';

/**
 * @name UiNavigationStateSchema
 * @description Dominio 1: Estado volátil de paneles, menú móvil y modales activos en UI.
 */
export const UiNavigationStateSchema = z
  .object({
    isSearchPanelOpenBoolean: z
      .boolean()
      .default(false)
      .describe('Indica si el panel de búsqueda global se encuentra desplegado.'),
    isMobileMenuOpenBoolean: z
      .boolean()
      .default(false)
      .describe('Indica si el cajón de navegación móvil está abierto.'),
    activeModalIdentifierLiteral: z
      .string()
      .nullable()
      .default(null)
      .describe('Identificador técnico del modal activo en primer plano o null si no hay ninguno.'),
  })
  .readonly();

/**
 * @name UserPreferenceStateSchema
 * @description Dominio 2: Preferencias persistentes de idioma BCP 47, tema visual y privacidad LGPD.
 */
export const UserPreferenceStateSchema = z
  .object({
    preferredLinguisticLocaleLiteral: SupportedLocaleSchema.default(
      DEFAULT_LOCALE_IDENTIFIER,
    ).describe('Código BCP 47 activo seleccionado por el ciudadano desde el registro único SSOT.'),
    visualThemeModeLiteral: z
      .enum(['LIGHT', 'DARK', 'SYSTEM'])
      .default('SYSTEM')
      .describe('Modo de renderizado cromático preferido por el usuario.'),
    hasAcceptedPrivacyPolicyBoolean: z
      .boolean()
      .default(false)
      .describe('Confirma si el ciudadano aceptó explícitamente la política de privacidad LGPD.'),
  })
  .readonly();
