import { useEffect, useState, useCallback, useRef, useContext } from 'react';
import ZoomContext from '../../../context/zoom-context';
export function useCurrentAudioLevel() {
  const zmClient = useContext(ZoomContext);
  const [level, setLevel] = useState(0);
  const timerRef = useRef<number>();
  const onActiveSpeakerChange = useCallback(
    (payload: any) => {
      if (!zmClient.getCurrentUserInfo()?.muted) {
        if (Array.isArray(payload) && payload.length > 0) {
          const isCurrentUserSpeaking = payload.some(
            (item: { userId: number; displayName: string }) => item.userId === zmClient.getSessionInfo().userId
          );
          if (isCurrentUserSpeaking) {
            setLevel(9);
          } else {
            if (!timerRef.current) {
              setLevel(0);
            }
          }
        }
      }
    },
    [zmClient]
  );
  useEffect(() => {
    if (level) {
      timerRef.current = window.setTimeout(() => {
        setLevel(0);
        timerRef.current = 0;
      }, 1500);
    }
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [level]);
  useEffect(() => {
    zmClient.on('active-speaker', onActiveSpeakerChange);
    return () => {
      zmClient.off('active-speaker', onActiveSpeakerChange);
    };
  }, [zmClient, onActiveSpeakerChange]);
  return level;
}
