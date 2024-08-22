import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PiPContext } from './PiPContext';
import { getNewPiPWindow } from './utils';

export const PiPContextProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const isPiPSupported = 'documentPictureInPicture' in window;

  // Enabled Picture-in-Picture means PiP window will be opened/closed when it's necessary to user, if possible
  const [isEnabled, setIsEnabled] = useState(false);

  // `pipWindow` is reference to the Picture-in-Picture window
  // If `pipWindow !== null` then Picture-in-Picture window is opened
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const pipWindowRef = useRef<Window | null>(pipWindow);
  pipWindowRef.current = pipWindow;
  const hasPiPOpened = !!pipWindow;

  const openPiPWindow = useCallback(async (width = 500, height = 500) => {
    if (pipWindowRef.current) {
      // Don't allow multiple Picture-in-Picture windows
      return;
    }

    try {
      const newPiPWindow = await getNewPiPWindow({
        width,
        height,
        onHide: () => setPipWindow(null)
      });

      setPipWindow(newPiPWindow);
      console.log('- PiP: show Picture-in-Picture window');
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (isEnabled) {
      console.log('- PiP: enabled');
      openPiPWindow();
    } else {
      console.log('- PiP: disabled');
      pipWindowRef.current?.close();
      setPipWindow(null);
    }
  }, [openPiPWindow, isEnabled]);

  const enablePipWindow = useCallback(() => {
    if (!isPiPSupported) {
      console.warn('Document Picture-in-Picture is not supported in this browser.');

      return;
    }

    setIsEnabled(true);
  }, [isPiPSupported]);

  const disablePipWindow = useCallback(() => {
    setIsEnabled(false);
  }, []);

  const contextValue = useMemo(
    () => ({
      isSupported: isPiPSupported,
      isEnabled,
      pipWindow,
      hasPiPOpened,
      enablePipWindow,
      disablePipWindow
    }),
    [isPiPSupported, isEnabled, pipWindow, hasPiPOpened, enablePipWindow, disablePipWindow]
  );

  return <PiPContext.Provider value={contextValue}>{children}</PiPContext.Provider>;
};
