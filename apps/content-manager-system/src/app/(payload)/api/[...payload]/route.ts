/**
 * @section CMS Infrastructure - REST API Orchestrator
 * @description Manejador universal para las peticiones REST del ecosistema.
 * Expone dinámicamente los endpoints de todas las colecciones y gestiona
 * la seguridad de las transacciones bajo el estándar HTTP/2.
 *
 * Protocolo OEDP-V16.0 - High Performance & Edge Readiness.
 * Vision: Seamless Data Flow between Supabase and Next.js App Router.
 *
 * @author Raz Podestá - MetaShark Tech
 */

import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
} from '@payloadcms/next/routes';

/* 1. Configuración Soberana (Única Fuente de Verdad) */
import config from '../../../../payload.config';

/**
 * @section Exportación de Métodos HTTP
 * Cada exportación delega la lógica al motor interno de Payload,
 * inyectando nuestra configuración nivelada y validada por la aduana.
 */

export const GET = REST_GET(config);
export const POST = REST_POST(config);
export const PATCH = REST_PATCH(config);
export const DELETE = REST_DELETE(config);
export const OPTIONS = REST_OPTIONS(config);
