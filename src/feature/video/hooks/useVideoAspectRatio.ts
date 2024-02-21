import { useState, useCallback, useEffect } from 'react';
import { ZoomClient } from '../../../index-types';
export function useVideoAspect(zmClient: ZoomClient) {
  const [aspectRatio, setAspectRatio] = useState<Record<string, number>>({});
  const onVideoAspectRatioChange = useCallback((payload: any) => {
    const { userId, aspectRatio } = payload;
    setAspectRatio((s) => {
      return { ...s, [`${userId}`]: aspectRatio };
    });
  }, []);
  useEffect(() => {
    zmClient.on('video-aspect-ratio-change', onVideoAspectRatioChange);
    return () => {
      zmClient.off('video-aspect-ratio-change', onVideoAspectRatioChange);
    };
  });
  return aspectRatio;
}
