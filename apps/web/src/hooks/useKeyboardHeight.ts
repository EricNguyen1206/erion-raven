import { useEffect, useState } from 'react';

/**
 * useKeyboardHeight Hook
 * 
 * Detects virtual keyboard appearance on mobile devices using the Visual Viewport API.
 * Returns the current keyboard height in pixels.
 * 
 * @returns {number} Current keyboard height (0 when keyboard is closed)
 */
export function useKeyboardHeight(): number {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    // Only run on devices that support visualViewport (mobile browsers)
    if (!window.visualViewport) {
      return;
    }

    const handleResize = () => {
      const viewport = window.visualViewport;
      if (!viewport) return;

      // Calculate keyboard height by comparing window inner height to viewport height
      // When keyboard opens, viewport.height shrinks but window.innerHeight stays same
      const newKeyboardHeight = window.innerHeight - viewport.height;

      // Only set positive values (keyboard open), ignore negative (shouldn't happen)
      setKeyboardHeight(Math.max(0, newKeyboardHeight));
    };

    // Listen for viewport resize (triggers when keyboard opens/closes)
    window.visualViewport.addEventListener('resize', handleResize);

    // Initial check
    handleResize();

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, []);

  return keyboardHeight;
}
