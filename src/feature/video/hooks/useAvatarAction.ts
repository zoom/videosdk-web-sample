import { useReducer, useMemo, useEffect } from 'react';
import produce from 'immer';
import { ZoomClient, Participant } from '../../../index-types';
import { AvatarContext } from '../context/avatar-context';

const avatarActionReducer = produce((draft, action) => {
  switch (action.type) {
    case 'toggle-local-volume': {
      const {
        payload: { userId }
      } = action;
      const userItem = draft[`${userId}`];
      if (userItem !== undefined) {
        draft[`${userId}`].localVolumeAdjust.toggled = !draft[`${userId}`].localVolumeAdjust.toggled;
      }
      break;
    }
    case 'toggle-far-end-camera-control': {
      const {
        payload: { userId }
      } = action;
      const userItem = draft[`${userId}`];
      if (userItem !== undefined) {
        draft[`${userId}`].farEndCameraControl.toggled = !draft[`${userId}`].farEndCameraControl.toggled;
      }
      break;
    }
    case 'update-avatar-action-enable': {
      const {
        payload: { user, currentUserId, isUnifiedRender }
      } = action;
      const { userId, audio, bVideoOn, isSpeakerOnly } = user;
      if (Object.hasOwn(draft, `${userId}`)) {
        const element = draft[`${userId}`];
        element.localVolumeAdjust.enabled = audio === 'computer' && !isSpeakerOnly && currentUserId !== userId;
        element.farEndCameraControl.enabled = bVideoOn && currentUserId !== userId;
        element.videoResolutionAdjust.enabled = isUnifiedRender && bVideoOn && currentUserId !== userId;
      } else {
        const state = {
          localVolumeAdjust: {
            toggled: false,
            enabled: audio === 'computer' && !isSpeakerOnly && currentUserId !== userId
          },
          farEndCameraControl: {
            toggled: false,
            enabled: bVideoOn && currentUserId !== userId
          },
          videoResolutionAdjust: {
            toggled: false,
            enabled: isUnifiedRender && bVideoOn && currentUserId !== userId
          }
        };
        Object.assign(draft, { [`${userId}`]: state });
      }
      break;
    }
    case 'update-local-volume': {
      const {
        payload: { userId, volume }
      } = action;
      const userItem = draft[`${userId}`];
      if (userItem !== undefined) {
        draft[`${userId}`].localVolumeAdjust.volume = volume;
      }
      break;
    }
    case 'set-is-controlling-remote-camera': {
      const { payload } = action;
      draft.isControllingRemoteCamera = payload;
      break;
    }
    case 'set-spotlighted-videos': {
      const { payload } = action;
      draft.spotlightedUserList = payload;
      break;
    }
    case 'toggle-video-resolution-adjust': {
      const {
        payload: { userId }
      } = action;
      const userItem = draft[`${userId}`];
      if (userItem !== undefined) {
        draft[`${userId}`].videoResolutionAdjust.toggled = !draft[`${userId}`].videoResolutionAdjust.toggled;
      }
      break;
    }
    default:
      break;
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
}, {} as AvatarContext);

export const useAvatarAction = (zmClient: ZoomClient, participants: Array<Participant>, isUnifiedRender = false) => {
  const [avatarActionState, dispatch] = useReducer(avatarActionReducer, {});
  useEffect(() => {
    const currentUserId = zmClient.getSessionInfo().userId;
    participants.forEach((user) => {
      dispatch({ type: 'update-avatar-action-enable', payload: { user, currentUserId, isUnifiedRender } });
    });
  }, [zmClient, participants, isUnifiedRender]);
  const value = useMemo(
    () => ({
      avatarActionState,
      dispatch
    }),
    [avatarActionState, dispatch]
  );
  return value;
};
