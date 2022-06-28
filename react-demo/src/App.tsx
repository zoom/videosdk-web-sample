import React, {
  useEffect,
  useContext,
  useState,
  useCallback,
  useReducer,
  useMemo
} from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import ZoomVideo, { ConnectionState } from "@zoom/videosdk";
import { message, Modal } from "antd";
import "antd/dist/antd.css";
import produce from "immer";
import Home from "./feature/home/home";
import Video from "./feature/video/video";
import VideoSingle from "./feature/video/video-single";
import VideoNonSAB from "./feature/video/video-non-sab";
import Preview from "./feature/preview/preview";
import ZoomContext from "./context/zoom-context";
import ZoomMediaContext from "./context/media-context";
import ChatContext from "./context/chat-context";
import CommandContext from "./context/cmd-context";
import RecordingContext from "./context/recording-context";
import LoadingLayer from "./component/loading-layer";
import Chat from "./feature/chat/chat";
import Command from "./feature/command/command";
import { ChatClient, CommandChannelClient, MediaStream, RecordingClient } from "./index-types";
import "./App.css";
import { isAndroidBrowser } from "./utils/platform";

declare global {
  interface Window {
    webEndpoint: string | undefined;
    zmClient: any | undefined;
    mediaStream: any | undefined;
    crossOriginIsolated:boolean
  }
}

interface AppProps {
  meetingArgs: {
    sdkKey: string;
    topic: string;
    signature: string;
    name: string;
    password?: string;
    enforceGalleryView?: string;
  };
}
const mediaShape = {
  audio: {
    encode: false,
    decode: false,
  },
  video: {
    encode: false,
    decode: false,
  },
  share: {
    encode: false,
    decode: false,
  },
};
const mediaReducer = produce((draft, action) => {
  switch (action.type) {
    case "audio-encode": {
      draft.audio.encode = action.payload;
      break;
    }
    case "audio-decode": {
      draft.audio.decode = action.payload;
      break;
    }
    case "video-encode": {
      draft.video.encode = action.payload;
      break;
    }
    case "video-decode": {
      draft.video.decode = action.payload;
      break;
    }
    case "share-encode": {
      draft.share.encode = action.payload;
      break;
    }
    case "share-decode": {
      draft.share.decode = action.payload;
      break;
    }
    case "reset-media":{
     Object.assign(draft,{...mediaShape});
      break;
    }

    default:
      break;
  }
}, mediaShape);

function App(props: AppProps) {
  const {
    meetingArgs: { sdkKey, topic, signature, name, password, enforceGalleryView }
  } = props;
  const [loading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("");
  const [isFailover, setIsFailover] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("closed");
  const [mediaState, dispatch] = useReducer(mediaReducer, mediaShape);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [chatClient, setChatClient] = useState<ChatClient | null>(null);
  const [recordingClient, setRecordingClient] = useState<RecordingClient | null>(null);
  const [commandClient, setCommandClient] = useState<CommandChannelClient | null>(null);
  const [isSupportGalleryView, setIsSupportGalleryView] = useState<boolean>(
    true
  );
  const zmClient = useContext(ZoomContext);
  const webEndpoint = 'zoom.us';
  const mediaContext = useMemo(() => ({ ...mediaState, mediaStream }), [mediaState, mediaStream]);
  const galleryViewWithoutSAB = !!enforceGalleryView && !window.crossOriginIsolated;
  useEffect(() => {
    const init = async () => {
      await zmClient.init(
        "en-US",
        `${window.location.origin}/lib`,
        {
          webEndpoint,
          enforceMultipleVideos:galleryViewWithoutSAB
        }
      );
      try {
        setLoadingText("Joining the session...");
        await zmClient.join(topic, signature, name, password);
        const stream = zmClient.getMediaStream();
        setMediaStream(stream);
        setIsSupportGalleryView(stream.isSupportMultipleVideos() && !isAndroidBrowser());
        const chatClient = zmClient.getChatClient();
        const commandClient = zmClient.getCommandClient();
        const recordingClient = zmClient.getRecordingClient();
        setChatClient(chatClient);
        setCommandClient(commandClient);
        setRecordingClient(recordingClient);
        setIsLoading(false);
      } catch (e: any) {
        console.log('Error joining meeting', e);
        setIsLoading(false);
        message.error(e.reason);
      }
    };
    init();
    return () => {
      ZoomVideo.destroyClient();
    };
  }, [sdkKey, signature, zmClient, topic, name, password, webEndpoint, galleryViewWithoutSAB]);
  const onConnectionChange = useCallback(
    (payload) => {
      if (payload.state === ConnectionState.Reconnecting) {
        setIsLoading(true);
        setIsFailover(true);
        setStatus("connecting");
        const { reason } = payload;
        if (reason === "failover") {
          setLoadingText("Session Disconnected,Try to reconnect");
        }
      } else if (payload.state === ConnectionState.Connected) {
        setStatus("connected");
        if (isFailover) {
          setIsLoading(false);
        }
      } else if (payload.state === ConnectionState.Closed) {
        setStatus("closed");
        dispatch({type:'reset-media'});
        if (payload.reason === "ended by host") {
          Modal.warning({
            title: "Meeting ended",
            content: "This meeting has been ended by host",
          });
        }
      }
    },
    [isFailover]
  );
  const onMediaSDKChange = useCallback((payload) => {
    const { action, type, result } = payload;
    dispatch({ type: `${type}-${action}`, payload: result === "success" });
  }, []);

  const onDialoutChange = useCallback((payload) => {
    console.log('onDialoutChange', payload);
  }, []);

  const onAudioMerged = useCallback((payload) => {
    console.log('onAudioMerged', payload);
  }, []);

  const onLeaveOrJoinSession = useCallback(async () => {
    if (status === "closed") {
      setIsLoading(true);
      await zmClient.join(topic, signature, name, password);
      setIsLoading(false);
    } else if (status === "connected") {
      await zmClient.leave();
      message.warn("You have left the session.");
    }
  }, [zmClient, status, topic, signature, name, password]);
  useEffect(() => {
    zmClient.on("connection-change", onConnectionChange);
    zmClient.on("media-sdk-change", onMediaSDKChange);
    zmClient.on("dialout-state-change", onDialoutChange);
    zmClient.on("merged-audio", onAudioMerged);
    return () => {
      zmClient.off("connection-change", onConnectionChange);
      zmClient.off("media-sdk-change", onMediaSDKChange);
      zmClient.off("dialout-state-change", onDialoutChange);
      zmClient.off("merged-audio", onAudioMerged);
    };
  }, [zmClient, onConnectionChange, onMediaSDKChange, onDialoutChange, onAudioMerged]);
  return (
    <div className="App">
      {loading && <LoadingLayer content={loadingText} />}
      {!loading && (
        <ZoomMediaContext.Provider value={mediaContext}>
          <ChatContext.Provider value={chatClient}>
          <RecordingContext.Provider value={recordingClient}>
            <CommandContext.Provider value={commandClient} >
            <Router>
              <Switch>
                <Route
                  path="/"
                  render={(props) => (
                    <Home
                      {...props}
                      status={status}
                      onLeaveOrJoinSession={onLeaveOrJoinSession}
                    />
                  )}
                  exact
                />
                <Route
                  path="/index.html"
                  render={(props) => (
                    <Home
                      {...props}
                      status={status}
                      onLeaveOrJoinSession={onLeaveOrJoinSession}
                    />
                  )}
                  exact
                />
                <Route path="/preview" component={Preview} />
                <Route path="/video" component={isSupportGalleryView ? Video : galleryViewWithoutSAB ? VideoNonSAB : VideoSingle} />
                <Route path="/chat" component={Chat} />
                <Route path="/command" component={Command} />
              </Switch>
            </Router>
            </CommandContext.Provider>
            </RecordingContext.Provider>
          </ChatContext.Provider>
        </ZoomMediaContext.Provider>
      )}
    </div>
  );
}

export default App;
