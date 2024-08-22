import { createContext, useContext } from 'react';

interface PiPContextType {
  isSupported: boolean;
  isEnabled: boolean;
  pipWindow: Window | null;
  hasPiPOpened: boolean;
  enablePipWindow: () => void;
  disablePipWindow: () => void;
}

export const PiPContext = createContext<PiPContextType>(null as unknown as PiPContextType);

export const usePiPContext = () => {
  return useContext(PiPContext);
};
