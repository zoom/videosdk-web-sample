import { useEffect, useRef, useCallback } from 'react';
import { ZoomClient, Participant } from '../../../index-types';

export function useCurrentParticipantChange(zmClient: ZoomClient, fn: (currentParticipant: Participant) => void) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const callback = useCallback(() => {
    const participants = zmClient.getAllUser();
    const currentParticipant = participants.find(
      (participant) => participant.userId === zmClient.getCurrentUserInfo()?.userId
    );
    if (currentParticipant) {
      fnRef.current?.(currentParticipant);
    }
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
}
