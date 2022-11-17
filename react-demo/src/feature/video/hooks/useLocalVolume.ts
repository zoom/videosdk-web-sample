import { useState, useCallback, useMemo, useContext } from 'react';
import { produce } from 'immer';
import MediaContext from '../../../context/media-context';
export function useLocalVolume() {
  const { mediaStream } = useContext(MediaContext);
  const [userVolumeList, setUserVolumeList] = useState<{ userId: number; volume: number }[]>([]);
  const setLocalVolume = useCallback(
    async (userId: number, volume: number) => {
      await mediaStream?.adjustUserAudioVolumeLocally(userId, volume);
      setUserVolumeList(
        produce((draft) => {
          const user = draft.find((u) => u.userId === userId);
          if (user) {
            user.volume = volume;
          } else {
            draft.push({ userId, volume });
          }
        })
      );
    },
    [mediaStream]
  );
  const value = useMemo(
    () => ({
      userVolumeList,
      setLocalVolume
    }),
    [userVolumeList, setLocalVolume]
  );
  return value;
}
