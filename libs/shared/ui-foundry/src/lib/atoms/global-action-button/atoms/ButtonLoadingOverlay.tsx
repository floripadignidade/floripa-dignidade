'use client';

/**
 * @section Shared UI Foundry - Button Loading Overlay (Atom)
 * @description Átomo encargado exclusivamente del rastro visual de carga.
 * Protocolo OEDP-V17.0 - High Performance UI.
 */

import React from 'react';

interface IButtonLoadingOverlayProperties {
  readonly isVisibleBoolean: boolean;
}

export const ButtonLoadingOverlay: React.FC<IButtonLoadingOverlayProperties> = ({
  isVisibleBoolean,
}) => {
  if (!isVisibleBoolean) return null;

  return (
    <span
      className="flex items-center justify-center absolute inset-0 bg-inherit pointer-events-none"
      aria-hidden="true"
    >
      <svg
        className="animate-spin h-5 w-5 text-current"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </span>
  );
};
