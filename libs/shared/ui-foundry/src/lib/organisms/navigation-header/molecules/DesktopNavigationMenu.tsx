/**
 * @section UI Molecule - Desktop Navigation Menu
 * @description Ensamble de enlaces institucionales para hardware de escritorio.
 */

import React from 'react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { NavigationLink } from '../atoms/NavigationLink';
import type { IMainNavigationHeaderI18n } from '@floripa-dignidade/shared-ui-contracts';

interface IDesktopNavigationProperties {
  readonly dictionary: IMainNavigationHeaderI18n['navigationPaths'];
}

export const DesktopNavigationMenu: React.FC<IDesktopNavigationProperties> = ({ dictionary }) => (
  <NavigationMenu.Root className="hidden lg:flex relative">
    <NavigationMenu.List className="flex gap-12 items-center">
      <NavigationLink hrefLiteral="/identidad" labelLiteral={dictionary.identity} />
      <NavigationLink hrefLiteral="/transparencia" labelLiteral={dictionary.transparency} />
      <NavigationLink hrefLiteral="/prensa" labelLiteral={dictionary.press} />
    </NavigationMenu.List>
  </NavigationMenu.Root>
);
