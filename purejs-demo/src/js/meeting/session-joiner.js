import sessionConfig from '../config';
import { generateSessionToken } from '../tool';
import initClientEventListeners from './session/client-event-listeners';
import initButtonClickHandlers from "./session/button-click-handlers";
import state from './session/simple-state';

/**
 * Creates a zoom video client, and uses it to join/start a video session. It:
 *      1) Creates a zoom client
 *      2) Initializes the zoom client
 *      3) Tries to join a session, grabbing its Stream once successful
 *      4) Initializes the zoom client's important "on" event listeners
 *          - Very important, as failing to do so ASAP can miss important updates
 *      5) Joins the audio stream on mute
 */
const joinSession = async (zmClient) => {
  const videoSDKLibDir = '/lib';
  const zmClientInitParams = {
    language: 'en-US',
    dependentAssets: `${window.location.origin}${videoSDKLibDir}`
  };
  const sessionToken = generateSessionToken(
    sessionConfig.sdkKey,
    sessionConfig.sdkSecret,
    sessionConfig.topic,
    sessionConfig.password,
    sessionConfig.sessionKey
  );

    let mediaStream;

  const initAndJoinSession = async () => {
    await zmClient.init(zmClientInitParams.language, zmClientInitParams.dependentAssets);

    try {
      await zmClient.join(sessionConfig.topic, sessionToken, sessionConfig.name, sessionConfig.password);
      mediaStream = zmClient.getMediaStream();
      state.selfId = zmClient.getSessionInfo().userId;
    } catch (e) {
      console.error(e);
    }
  };

    const startAudioMuted = async () => {
        await mediaStream.startAudio();
        if (!mediaStream.isAudioMuted()) {
            mediaStream.muteAudio();
        }
    };

    const join = async () => {
        console.log('======= Initializing video session =======');
        await initAndJoinSession();
        /**
         * Note: it is STRONGLY recommended to initialize the client listeners as soon as 
         * the session is initialized. Once the user joins the session, updates are sent to
         * the event listeners that help update the session's participant state.
         * 
         * If you choose not to do so, you'll have to manually deal with race conditions.
         * You should be able to call "zmClient.getAllUser()" after the app has reached 
         * steady state, meaning a sufficiently-long time
         */
        console.log('======= Initializing client event handlers =======');
        initClientEventListeners(zmClient, mediaStream);
        console.log('======= Starting audio muted =======');
        await startAudioMuted();
        console.log('======= Initializing button click handlers =======');
        await initButtonClickHandlers(zmClient, mediaStream);
        console.log('======= Session joined =======');
    };

    await join();
    return zmClient;
};

export default joinSession;