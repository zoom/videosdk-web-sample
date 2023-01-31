import type { NetworkQuality } from '@zoom/videosdk';
import produce from 'immer';
import { useState, useCallback, useEffect } from 'react';
import { ZoomClient } from '../../../index-types';

export function useNetworkQuality(zmClient: ZoomClient) {
  const [networkQuality, setNetworkQuality] = useState<Record<string, NetworkQuality>>({});
  const onNetworkChange = useCallback((payload) => {
    const { userId, type, level } = payload;
    setNetworkQuality(
      produce((draft) => {
        if (draft[`${userId}`] !== undefined) {
          if (type === 'uplink') {
            draft[`${userId}`].uplink = level;
          } else {
            draft[`${userId}`].downlink = level;
          }
        } else {
          Object.assign(draft, {
            [`${userId}`]: {
              [`${type}`]: level
            }
          });
        }
      })
    );
  }, []);
  useEffect(() => {
    zmClient.on('network-quality-change', onNetworkChange);
    return () => {
      zmClient.off('network-quality-change', onNetworkChange);
    };
  }, [zmClient, onNetworkChange]);
  return networkQuality;
}
