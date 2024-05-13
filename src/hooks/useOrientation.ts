import { useState, useEffect, useCallback } from 'react';
export function useOrientation() {
  const [orientation, setOrientation] = useState('landscape');
  const isScreenOrientation = 'orientation' in window.screen;
  const onChange = useCallback(() => {
    if (isScreenOrientation) {
      setOrientation(screen.orientation.type.split('-')?.[0]);
    } else if ('matchMedia' in window) {
      const isLandscape = !!(window as any).matchMedia('(orientation: landscape)')?.matches;
      setOrientation(isLandscape ? 'landscape' : 'portrait');
    }
  }, [isScreenOrientation]);
  useEffect(() => {
    if (isScreenOrientation) {
      window.screen.orientation.addEventListener('change', onChange);
    } else {
      window.addEventListener('orientationchange', onChange);
    }
    onChange();
    return () => {
      if (isScreenOrientation) {
        window.screen.orientation.removeEventListener('change', onChange);
      } else {
        window.removeEventListener('orientationchange', onChange);
      }
    };
  }, [isScreenOrientation, onChange]);
  return orientation;
}
