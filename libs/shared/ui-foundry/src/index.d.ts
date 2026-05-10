/**
 * @section Shared UI DNA - Global Type Sanctuary
 * @description Autorización absoluta de identidades para motores de terceros.
 */

/// <reference types="next" />
/// <reference types="next/types/global" />

import type React from 'react';

/** 🛡️ PUENTES AMBIENTALES SOBERANOS */
declare module 'next/link' {
  import { LinkProps } from 'next/dist/client/link';
  import { FC, PropsWithChildren } from 'react';
  const Link: FC<PropsWithChildren<LinkProps & { className?: string; 'aria-label'?: string; onClick?: () => void }>>;
  export default Link;
}

declare module 'next/image' {
  import { ImageProps } from 'next/dist/shared/lib/get-img-props';
  import { FC } from 'react';
  const Image: FC<ImageProps>;
  export default Image;
}

declare module 'lucide-react';
declare module 'framer-motion';
declare module 'tailwind-merge';
declare module 'clsx';
