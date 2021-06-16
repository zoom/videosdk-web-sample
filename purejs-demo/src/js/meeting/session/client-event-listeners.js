import state from './simple-state';
import { toggleParticipantVideo } from './video/video-toggler';

const PARTICIPANT_CHANGE_TYPE = {
    ADD: 'add', 
    REMOVE: 'remove',
};

const PEER_VIDEO_STATE_CHANGE_ACTION_TYPE = {
    Start: 'Start',
    Stop: 'Stop',
};

const handleParticipantChange = (payloadEntry, addRemoveType) => {
    const { userId } = payloadEntry;

    // For this demo, only a single participant is handled to keep things simple
    // and succinct. This can be extended into a participant array/set here 
    if (userId === undefined) {
        return;
    }
    
    switch (addRemoveType) {
        case PARTICIPANT_CHANGE_TYPE.ADD:
            if (userId !== state.selfId && !state.hasParticipant) {
                state.participantId = userId;
                state.hasParticipant = !state.hasParticipant;
            } else {
                console.log('Detected new participant. Ignoring: ', userId);
                console.log('State has participant: ', state.hasParticipant);
                console.log('Participant ID: ', state.participantId);
            }
            break;
        case PARTICIPANT_CHANGE_TYPE.REMOVE:
            if (userId !== state.selfId && state.hasParticipant) {
                state.resetParticipantId();
                state.hasParticipant = !state.hasParticipant;
            } else {
                console.log('Detected unknown participant leaving. Ignoring: ', userId);
                console.log('Participant ID: ', state.participantId);
            }
            break;
        default:
            console.log('Unexpected ADD_REMOVE_TYPE');
            break;
    }
    
}

const onUserAddedListener = (zoomClient) => {
    zoomClient.on('user-added', (payload) => {
        console.log(`User added`, payload);

        payload?.forEach((payloadEntry) => handleParticipantChange(payloadEntry, PARTICIPANT_CHANGE_TYPE.ADD));
    });
};

const onUserRemovedListener = (zoomClient) => {
    zoomClient.on('user-removed', (payload) => {
        console.log(`User removed`, payload);

        payload?.forEach((payloadEntry) => handleParticipantChange(payloadEntry, PARTICIPANT_CHANGE_TYPE.REMOVE));
    });
};

const onPeerVideoStateChangedListener = (zoomClient, mediaStream) => {
    zoomClient.on('peer-video-state-change', async (payload) => {
        console.log('onPeerVideoStateChange', payload);
        
        const { action, userId } = payload;

        if (userId !== state.participantId) {
            console.log('Detected unrecognized participant ID. Ignoring: ', userId);
            return;
        }

        if (action === PEER_VIDEO_STATE_CHANGE_ACTION_TYPE.Start) {
            toggleParticipantVideo(mediaStream, true);
        } else if (action === 'Stop') {
            toggleParticipantVideo(mediaStream, false);
        }
    });
};

const initClientEventListeners = (zoomClient, mediaStream) => {
    onUserAddedListener(zoomClient);
    onUserRemovedListener(zoomClient, mediaStream);
    onPeerVideoStateChangedListener(zoomClient, mediaStream);
};

export default initClientEventListeners;
