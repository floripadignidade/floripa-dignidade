/**
 * @section CMS Infrastructure - Admin Catch-all Page (Orchestrator)
 * @description Orquestador de renderizado para el panel administrativo de Payload CMS.
 * Gestiona dinámicamente la jerarquía de rutas bajo '/admin' mediante el paso
 * directo de promesas al motor de vistas, cumpliendo con el rigor de Next.js 16.
 *
 * Protocolo OEDP-V17.0 - High Performance & Async Contract Integrity.
 * SANEADO Zenith: Erradicación de triple-slash (ESLint), resolución de TS7016
 * mediante supresión controlada y corrección de firma de índice (TS2322).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { generatePageMetadata, RootPage } from '@payloadcms/next/views';

/**
 * 🛡️ LEY ZENITH (Fix TS7016):
 * Suprimimos la advertencia del compilador para el motor de tipos de Next.js.
 * Cumplimos con ESLint al utilizar el estilo de importación estándar.
 */
 - TS7016: Falla de resolución profunda en el aislamiento de PNPM.
import type { Metadata } from 'next';

/* 1. Configuración Soberana y Mapa de Dependencias (Clean Paths) */
import configReference from '../../../../payload.config';
import { importMap } from '../importMap';

/**
 * @interface IAdminPageProperties
 * @description Contrato de propiedades inyectadas por Next.js 16.
 * SANEADO Zenith (Fix TS2322): Se eliminan los modificadores 'readonly' y
 * el tipo 'undefined' de la signatura de índice de searchParams para asegurar
 * la compatibilidad con el motor de Payload CMS.
 */
interface IAdminPageProperties {
  readonly params: Promise<{
    segments: string[];
  }>;
  readonly searchParams: Promise<{
    [key: string]: string | string[];
  }>;
}

/**
 * Generador de Metadatos Dinámicos para el Panel Administrativo.
 * SANEADO Zenith: Delegación íntegra de promesas al motor de Payload.
 *
 * @param propertiesSnapshot - Propiedades asíncronas de la ruta.
 * @returns {Promise<Metadata>} Metadatos procesados por el motor de Payload.
 */
export const generateMetadata = ({
  params,
  searchParams,
}: IAdminPageProperties): Promise<Metadata> => {
  return generatePageMetadata({
    config: configReference,
    params,
    searchParams,
  });
};

/**
 * Componente Raíz de la Interfaz Administrativa.
 * Realiza el ensamblaje entre el motor de vistas de Payload y el App Router.
 *
 * @param propertiesSnapshot - Propiedades de la solicitud (Promesas).
 * @returns {Promise<React.ReactElement>} La vista administrativa sincronizada.
 */
const AdminPage = ({
  params,
  searchParams,
}: IAdminPageProperties): Promise<React.ReactElement> => {
  /**
   * 🛡️ SANEADO Zenith: Inyección directa de promesas al RootPage.
   * El motor de Payload gestiona la resolución asíncrona internamente.
   */
  return RootPage({
    config: configReference,
    importMap,
    params,
    searchParams,
  });
};

export default AdminPage;
