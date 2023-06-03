import { useState, useCallback, useMemo, useEffect } from 'react';
import produce from 'immer';
import { ZoomClient, MediaStream, Participant } from '../../../index-types';
import type { AdvancedFeatureSwitch } from '../video-types';

export const useAdvancedFeatureSwitch = (
  zmClient: ZoomClient,
  mediaStream: MediaStream | null,
  participants: Array<Participant>
) => {
  const [advancedSwitch, setAdvancedSwitch] = useState<Record<string, AdvancedFeatureSwitch>>({});
  useEffect(() => {
    const concernedUsers = participants.filter((u) => u.audio !== '' || u.bVideoOn);
    concernedUsers.forEach((user) => {
      const { userId, audio, bVideoOn, isSpeakerOnly } = user;
      setAdvancedSwitch(
        produce((draft) => {
          if (Object.hasOwn(draft, `${userId}`)) {
            const element = draft[`${userId}`];
            element.adjustVolumn.enabled = audio === 'computer' && !isSpeakerOnly;
            element.farEndCameraControl.enabled =
              zmClient.getSessionInfo().userId !== userId &&
              !!mediaStream?.getFarEndCameraPTZCapability(userId)?.pan &&
              bVideoOn;
          } else {
            const state = {
              adjustVolumn: {
                toggled: false,
                enabled: audio === 'computer' && !isSpeakerOnly
              },
              farEndCameraControl: {
                toggled: false,
                enabled:
                  zmClient.getSessionInfo().userId !== userId &&
                  !!mediaStream?.getFarEndCameraPTZCapability(userId)?.pan &&
                  bVideoOn
              }
            };
            Object.assign(draft, { [`${userId}`]: state });
          }
        })
      );
    });
  }, [zmClient, mediaStream, participants]);
  const toggleAdjustVolume = useCallback((userId: number) => {
    setAdvancedSwitch(
      produce((draft) => {
        const userItem = draft[`${userId}`];
        if (userItem !== undefined) {
          draft[`${userId}`].adjustVolumn.toggled = !draft[`${userId}`].adjustVolumn.toggled;
        }
      })
    );
  }, []);
  const toggleFarEndCameraControl = useCallback((userId: number) => {
    setAdvancedSwitch(
      produce((draft) => {
        const userItem = draft[`${userId}`];
        if (userItem !== undefined) {
          draft[`${userId}`].farEndCameraControl.toggled = !draft[`${userId}`].farEndCameraControl.toggled;
        }
      })
    );
  }, []);
  const retVal = useMemo(
    () => ({
      advancedSwitch,
      toggleAdjustVolume,
      toggleFarEndCameraControl
    }),
    [advancedSwitch, toggleAdjustVolume, toggleFarEndCameraControl]
  );
  return retVal;
};
