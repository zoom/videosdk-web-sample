import state from './simple-state';
import { toggleParticipantVideo } from './video/video-toggler';

const PARTICIPANT_CHANGE_TYPE = {
  ADD: 'add',
  REMOVE: 'remove',
  UPDATE: 'update'
};

const PEER_VIDEO_STATE_CHANGE_ACTION_TYPE = {
  Start: 'Start',
  Stop: 'Stop'
};

const onUserAddedListener = (zoomClient) => {
  zoomClient.on('user-added', (payload) => {
    console.log(`User added`, payload);

    state.participants = zoomClient.getAllUser();
  });
};

const onUserRemovedListener = (zoomClient) => {
  zoomClient.on('user-removed', (payload) => {
    console.log(`User removed`, payload);

    state.participants = zoomClient.getAllUser();
  });
};

const onUserUpdatedListener = (zoomClient) => {
  zoomClient.on('user-updated', (payload) => {
    console.log(`User updated`, payload);

    state.participants = zoomClient.getAllUser();
  });
};

const onPeerVideoStateChangedListener = (zoomClient, mediaStream) => {
  zoomClient.on('peer-video-state-change', async (payload) => {
    console.log('onPeerVideoStateChange', payload);
    const { action, userId } = payload;

    if (state.participants.findIndex((user) => user.userId === userId) === -1) {
      console.log('Detected unrecognized participant ID. Ignoring: ', userId);
      return;
    }

    if (action === PEER_VIDEO_STATE_CHANGE_ACTION_TYPE.Start) {
      toggleParticipantVideo(mediaStream, userId, true);
    } else if (action === PEER_VIDEO_STATE_CHANGE_ACTION_TYPE.Stop) {
      toggleParticipantVideo(mediaStream, userId, false);
    }
  });
};

const initClientEventListeners = (zoomClient, mediaStream) => {
  onUserAddedListener(zoomClient);
  onUserRemovedListener(zoomClient, mediaStream);
  onUserUpdatedListener(zoomClient);
  onPeerVideoStateChangedListener(zoomClient, mediaStream);
  // The started video before join the session
  setTimeout(() => {
    const peerParticipants = state.participants.filter((user) => user.userId !== state.selfId);
    if (peerParticipants.length > 0 && peerParticipants[0].bVideoOn === true) {
      toggleParticipantVideo(mediaStream, peerParticipants[0].userId, true);
    }
  }, 3000);
};

export default initClientEventListeners;
