/**
 * @section UI Logic - Search Hardware Sentry Hook
 * @description Orquestador sensorial para atajos de teclado y estados de entrada.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export const useSearchHardwareSentry = (isShortcutEnabled: boolean) => {
  const inputReference = useRef<HTMLInputElement>(null);
  const [isInputFocusedBoolean, setIsInputFocusedBoolean] = useState(false);

  useEffect(() => {
    if (!isShortcutEnabled) return;

    const handleKeyDownAction = (event: KeyboardEvent) => {
      const isCommandActive = (event.metaKey || event.ctrlKey) && event.key === 'k';
      if (isCommandActive) {
        event.preventDefault();
        inputReference.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDownAction);
    return () => window.removeEventListener('keydown', handleKeyDownAction);
  }, [isShortcutEnabled]);

  const handleFocusAction = () => setIsInputFocusedBoolean(true);
  const handleBlurAction = () => setTimeout(() => setIsInputFocusedBoolean(false), 200);

  return { inputReference, isInputFocusedBoolean, handleFocusAction, handleBlurAction };
};
