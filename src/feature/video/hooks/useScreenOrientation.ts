import { useState, useEffect } from 'react';
import { isAndroidOrIOSBrowser } from '../../../utils/platform';

export const useScreenOrientation = () => {
  const [isMobilePortrait, setIsMobilePortrait] = useState(false);

  useEffect(() => {
    const updateOrientation = () => {
      if (!isAndroidOrIOSBrowser()) {
        setIsMobilePortrait(false);
        return;
      }

      if (screen.orientation) {
        // Use screen.orientation.type to determine orientation
        const isPortrait = screen.orientation.type.includes('portrait');
        setIsMobilePortrait(isPortrait);
      } else {
        // Fallback for older browsers
        const isPortrait = window.innerHeight > window.innerWidth;
        setIsMobilePortrait(isPortrait);
      }
    };

    // Initial check
    updateOrientation();

    // Listen for orientation changes
    if (screen.orientation) {
      screen.orientation.addEventListener('change', updateOrientation);
    } else {
      // Fallback for older browsers
      window.addEventListener('orientationchange', updateOrientation);
      window.addEventListener('resize', updateOrientation);
    }

    return () => {
      if (screen.orientation) {
        screen.orientation.removeEventListener('change', updateOrientation);
      } else {
        window.removeEventListener('orientationchange', updateOrientation);
        window.removeEventListener('resize', updateOrientation);
      }
    };
  }, []);

  return { isMobilePortrait };
};
