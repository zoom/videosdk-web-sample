import { SubsessionStatus } from '@zoom/videosdk';
import { useState, useEffect, useCallback } from 'react';
import type { ZoomClient } from '../../../index-types';

export function useSubsessionClosingCountdown(zmClient: ZoomClient, subsessionStatus: SubsessionStatus) {
  const [closingCountdown, setClosingCountdown] = useState(-1);
  const onClosingCoutdown = useCallback(({ countdown }: any) => {
    setClosingCountdown(countdown);
  }, []);
  useEffect(() => {
    zmClient.on('closing-subsession-countdown', onClosingCoutdown);
    return () => {
      zmClient.off('closing-subsession-countdown', onClosingCoutdown);
    };
  }, [zmClient, onClosingCoutdown]);
  useEffect(() => {
    if (subsessionStatus !== SubsessionStatus.Closing) {
      setClosingCountdown(-1);
    }
  }, [subsessionStatus]);
  return closingCountdown;
}
