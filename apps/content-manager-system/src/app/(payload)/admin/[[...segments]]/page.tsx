/**
 * @section CMS Infrastructure - Admin Catch-all Page Orchestrator
 * @description Orquestador de renderizado para el panel administrativo de Payload CMS.
 * Gestiona dinámicamente la jerarquía de rutas bajo '/admin' mediante el paso
 * directo de promesas al motor de vistas, cumpliendo con el rigor de Next.js 16 y Payload 3.84.
 *
 * Protocolo OEDP-V18.1 - High Performance & Async Contract Integrity.
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Calidad y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { generatePageMetadata, RootPage } from '@payloadcms/next/views';
import type { Metadata } from 'next';

/* 1. Configuración Central Institucional y Mapa de Dependencias */
import payloadConfigurationReference from '../../../../payload.config';
import { importMap } from '../importMap';

/**
 * @interface IAdminPageProperties
 * @description Contrato inmutable de propiedades inyectadas por Next.js 16 en el App Router.
 * Sigue la norma ISO de Objeto + Propiedad + Representación.
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
 * Delega el procesamiento de las promesas de ruta al motor de vistas de Payload.
 *
 * @param propertiesSnapshot - Propiedades asíncronas de la ruta solicitada.
 * @returns {Promise<Metadata>} Metadatos procesados por el motor de vistas.
 */
export const generateMetadata = ({
  params,
  searchParams,
}: IAdminPageProperties): Promise<Metadata> => {
  return generatePageMetadata({
    config: payloadConfigurationReference,
    params,
    searchParams,
  });
};

/**
 * Componente Raíz de la Interfaz Administrativa.
 * Realiza el ensamblaje asíncrono entre el motor de vistas de Payload y el App Router de Next.js.
 *
 * @param propertiesSnapshot - Propiedades asíncronas de la solicitud.
 * @returns {Promise<React.ReactElement>} La vista administrativa renderizada y sincronizada.
 */
const AdminPage = ({ params, searchParams }: IAdminPageProperties): Promise<React.ReactElement> => {
  return RootPage({
    config: payloadConfigurationReference,
    importMap,
    params,
    searchParams,
  });
};

export default AdminPage;
