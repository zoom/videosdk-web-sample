import { SubsessionStatus } from '@zoom/videosdk';
import { useState, useEffect, useCallback } from 'react';
import { SubsessionClient, ZoomClient } from '../../../index-types';
import { formatCountdown } from '../subsession-utils';

export function useSubsessionCountdown(zmClient: ZoomClient, ssClient: SubsessionClient | null) {
  const [subsessionCountdown, setSubsessionCountdown] = useState(-1);
  const onSubsessionCountdown = useCallback(({ countdown }) => {
    setSubsessionCountdown(countdown);
  }, []);
  useEffect(() => {
    zmClient.on('subsession-countdown', onSubsessionCountdown);
    return () => {
      zmClient.off('subsession-countdown', onSubsessionCountdown);
    };
  }, [zmClient, onSubsessionCountdown]);
  return {
    subsessionCountdown,
    formattedSubsessionCountdown:
      ssClient?.getSubsessionStatus() === SubsessionStatus.InProgress && subsessionCountdown >= 0
        ? formatCountdown(subsessionCountdown)
        : ''
  };
}
