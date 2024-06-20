import { useEffect, useState, useCallback, useRef, useContext } from 'react';
import ZoomContext from '../../../context/zoom-context';
export function useAudioLevel() {
  const zmClient = useContext(ZoomContext);
  const [level, setLevel] = useState(0);
  const onAudioLevelChange = useCallback(({ level }: any) => {
    setLevel(level);
  }, []);
  useEffect(() => {
    zmClient.on('current-audio-level-change', onAudioLevelChange);
    return () => {
      zmClient.off('current-audio-level-change', onAudioLevelChange);
    };
  }, [zmClient, onAudioLevelChange]);
  return level;
}
