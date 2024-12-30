import type { ParticipantPropertiesPayload } from '@zoom/videosdk';
import { useEffect, useRef, useCallback } from 'react';
import { useMount } from '../../../hooks';
import type { ZoomClient, Participant } from '../../../index-types';
export function useParticipantsChange(
  zmClient: ZoomClient,
  fn: (participants: Participant[], currentUpdates?: ParticipantPropertiesPayload[]) => void
) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const currentUserIdRef = useRef(zmClient.getSessionInfo().userId);
  const callback = useCallback(
    (items?: ParticipantPropertiesPayload[]) => {
      const participants = zmClient.getAllUser();
      const currentUserUpdateItems = items?.filter((item) => item.userId === currentUserIdRef.current);
      fnRef.current?.(participants, currentUserUpdateItems);
    },
    [zmClient]
  );
  useEffect(() => {
    zmClient.on('user-added', callback);
    zmClient.on('user-removed', callback);
    zmClient.on('user-updated', callback);
    return () => {
      zmClient.off('user-added', callback);
      zmClient.off('user-removed', callback);
      zmClient.off('user-updated', callback);
    };
  }, [zmClient, callback]);
  useMount(() => {
    callback();
  });
}
