/**
 * @file apps/content-manager-system/src/app/(payload)/layout.tsx
 * @section CMS Infrastructure - Payload Administrative Root Layout
 * @description Carcasa estructural oficial de Payload CMS 3.84+ en Next.js 16 App Router.
 * Provee los estilos administrativos de Payload, la función de servidor para Server Actions
 * internas, la política `noindex/nofollow/nocache` y el contexto de configuración e importMap
 * requerido por `/admin`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0031).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Confiabilidad) e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import '@payloadcms/next/css';
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts';
import type { Metadata } from 'next';
import type { ServerFunctionClient } from 'payload';
import React from 'react';

import payloadConfigurationReference from '../../payload.config';
import { importMap } from './admin/importMap';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

interface IPayloadLayoutProperties {
  readonly children: React.ReactNode;
}

const executePayloadServerFunction: ServerFunctionClient = async (serverFunctionArguments) => {
  'use server';

  return handleServerFunctions({
    ...serverFunctionArguments,
    config: payloadConfigurationReference,
    importMap,
  });
};

/**
 * Envuelve las rutas bajo `(payload)` con el proveedor oficial de interfaz y acciones de Payload CMS.
 *
 * @param propertiesSnapshot - Nodos hijos renderizados por Payload (`RootPage` o vistas administrativas).
 * @returns {React.ReactElement} Estructura HTML5 completa gestionada por `@payloadcms/next/layouts`.
 */
const PayloadRootLayout = ({ children }: IPayloadLayoutProperties): React.ReactElement => (
  <RootLayout
    config={payloadConfigurationReference}
    importMap={importMap}
    serverFunction={executePayloadServerFunction}
  >
    {children}
  </RootLayout>
);

export default PayloadRootLayout;
