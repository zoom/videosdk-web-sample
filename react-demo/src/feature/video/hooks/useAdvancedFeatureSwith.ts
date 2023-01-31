import { useState, useCallback, useMemo } from 'react';
import produce from 'immer';
import { ZoomClient, MediaStream } from '../../../index-types';
import { useParticipantsChange } from './useParticipantsChange';
import type { AdvancedFeatureSwitch } from '../video-types';

export const useAdvancedFeatureSwitch = (zmClient: ZoomClient, mediaStream: MediaStream | null) => {
  const [advancedSwitch, setAdvancedSwitch] = useState<Record<string, AdvancedFeatureSwitch>>({});
  useParticipantsChange(zmClient, (participants, updatedParticipants) => {
    if (!updatedParticipants) {
      const data = participants.reduce((payload, current) => {
        Object.assign(payload, {
          [`${current.userId}`]: {
            adjustVolumn: {
              toggled: false,
              enabled: current.audio === 'computer'
            },
            farEndCameraControl: {
              toggled: false,
              enabled: current.bVideoOn && mediaStream?.getFarEndCameraPTZCapability(current.userId)?.pan
            }
          }
        });
        return payload;
      }, {});
      setAdvancedSwitch(data);
    } else {
      const concernedItems = updatedParticipants.filter(
        (item) => item.audio !== undefined || item.bVideoOn !== undefined
      );
      concernedItems.forEach((item) => {
        const { userId } = item;
        if (Object.hasOwn(advancedSwitch, `${userId}`)) {
          setAdvancedSwitch(
            produce((draft) => {
              const element = draft[`${userId}`];
              if (item.audio !== undefined) {
                element.adjustVolumn.enabled = item.audio === 'computer';
              } else if (item.bVideoOn !== undefined) {
                element.farEndCameraControl.enabled =
                  zmClient.getSessionInfo().userId !== userId &&
                  !!mediaStream?.getFarEndCameraPTZCapability(userId)?.pan &&
                  item.bVideoOn;
              }
            })
          );
        } else {
          setAdvancedSwitch(
            produce((draft) => {
              const initState = {
                adjustVolumn: {
                  toggled: false,
                  enabled: false
                },
                farEndCameraControl: {
                  toggled: false,
                  enabled: false
                }
              };
              if (item.audio !== undefined) {
                initState.adjustVolumn.enabled = item.audio === 'computer';
              } else if (item.bVideoOn !== undefined) {
                initState.farEndCameraControl.enabled =
                  zmClient.getSessionInfo().userId !== userId &&
                  !!mediaStream?.getFarEndCameraPTZCapability(userId)?.pan &&
                  item.bVideoOn;
              }
              Object.assign(draft, { [`${userId}`]: initState });
            })
          );
        }
      });
    }
  });
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
