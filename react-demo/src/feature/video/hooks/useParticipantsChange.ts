import { useEffect, useRef, useCallback } from 'react';
import { useMount } from '../../../hooks';
import { ZoomClient, Participant } from '../../../index-types';
export function useParticipantsChange(
  zmClient: ZoomClient,
  fn: (participants: Participant[]) => void,
) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const callback = useCallback(() => {
    const participants = zmClient.getAllUser();
    fnRef.current && fnRef.current(participants);
  }, [zmClient]);
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
