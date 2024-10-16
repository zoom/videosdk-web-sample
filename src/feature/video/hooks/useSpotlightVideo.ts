import { useEffect, useRef, useCallback } from 'react';
import { ZoomClient, Participant, MediaStream } from '../../../index-types';
import { useMount } from '../../../hooks';
export function useSpotlightVideo(
  zmClient: ZoomClient,
  mediaStream: MediaStream | null,
  fn?: (participants: Participant[], updatedUserIDs?: number[]) => void
) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const callback = useCallback(
    (updatedParticipants?: number[]) => {
      const participants = mediaStream?.getSpotlightedUserList() ?? [];
      fnRef.current?.(participants, updatedParticipants);
    },
    [mediaStream]
  );
  useEffect(() => {
    zmClient.on('video-spotlight-change', callback);
    return () => {
      zmClient.off('video-spotlight-change', callback);
    };
  }, [zmClient, callback]);
  useMount(() => {
    callback();
  });
}
