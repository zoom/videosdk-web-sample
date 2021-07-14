import React, {
  useState,
  useCallback,
  useContext,
  useEffect,
  MutableRefObject,
} from 'react';
import classNames from 'classnames';
import { message } from 'antd';
import ZoomContext from '../../../context/zoom-context';
import CameraButton from './camera';
import MicrophoneButton from './microphone';
import { ScreenShareButton, ScreenShareLockButton } from './screen-share';
import ZoomMediaContext from '../../../context/media-context';
import { useUnmount } from '../../../hooks';
import { MediaDevice } from '../video-types';
import './video-footer.scss';
interface VideoFooterProps {
  className?: string;
  shareRef?: MutableRefObject<HTMLCanvasElement | null>;
  sharing?: boolean;
}
const isAudioEnable = typeof AudioWorklet === 'function';
const VideoFooter = (props: VideoFooterProps) => {
  const { className, shareRef, sharing } = props;
  const [isStartedAudio, setIsStartedAudio] = useState(false);
  const [isStartedVideo, setIsStartedVideo] = useState(false);
  const [isStartedScreenShare, setIsStartedScreenShare] = useState(false);
  const [isLockedScreenShare, setIsLockedScreenShare] = useState(false);
  
  const [isMuted, setIsMuted] = useState(true);
  const [activeMicrophone, setActiveMicrophone] = useState('');
  const [activeSpeaker, setActiveSpeaker] = useState('');
  const [activeCamera, setActiveCamera] = useState('');
  const [micList, setMicList] = useState<MediaDevice[]>([]);
  const [speakerList, setSpeakerList] = useState<MediaDevice[]>([]);
  const [cameraList, setCameraList] = useState<MediaDevice[]>([]);
  const { mediaStream } = useContext(ZoomMediaContext);
  const zmClient = useContext(ZoomContext);
  const onCameraClick = useCallback(async () => {
    if (isStartedVideo) {
      await mediaStream?.stopVideo();
      setIsStartedVideo(false);
    } else {
      await mediaStream?.startVideo();
      setIsStartedVideo(true);
    }
  }, [mediaStream, isStartedVideo]);
  const onMicrophoneClick = useCallback(async () => {
    if (isStartedAudio) {
      if (isMuted) {
        await mediaStream?.unmuteAudio();
        setIsMuted(false);
      } else {
        await mediaStream?.muteAudio();
        setIsMuted(true);
      }
    } else {
      await mediaStream?.startAudio();
      setIsStartedAudio(true);
    }
  }, [mediaStream, isStartedAudio, isMuted]);
  const onMicrophoneMenuClick = async (key: string) => {
    if (mediaStream) {
      const [type, deviceId] = key.split('|');
      if (type === 'microphone') {
        if (deviceId !== activeMicrophone) {
          await mediaStream.switchMicrophone(deviceId);
          setActiveMicrophone(mediaStream.getActiveMicrophone());
        }
      } else if (type === 'speaker') {
        if (deviceId !== activeSpeaker) {
          await mediaStream.switchSpeaker(deviceId);
          setActiveSpeaker(mediaStream.getActiveSpeaker());
        }
      } else if (type === 'leave audio') {
        await mediaStream.stopAudio();
        setIsStartedAudio(false);
      }
    }
  };
  const onSwitchCamera = async (key: string) => {
    if (mediaStream) {
      if (activeCamera !== key) {
        await mediaStream.switchCamera(key);
        setActiveCamera(mediaStream.getActiveCamera());
      }
    }
  };
  const onHostAudioMuted = useCallback((payload) => {
    const { action, source, type } = payload;
    if (action === 'join' && type === 'computer') {
      setIsStartedAudio(true);
    } else if (action === 'leave') {
      setIsStartedAudio(false);
    } else if (action === 'muted') {
      setIsMuted(true);
      if (source === 'passive(mute one)') {
        message.info('Host muted you');
      }
    } else if (action === 'unmuted') {
      setIsMuted(false);
      if (source === 'passive') {
        message.info('Host unmuted you');
      }
    }
  }, []);
  const onScreenShareClick = useCallback(async () => {
    if (!isStartedScreenShare && shareRef && shareRef.current) {
      await mediaStream?.startShareScreen(shareRef.current);
      setIsStartedScreenShare(true);
    } else if (isStartedScreenShare) {
      await mediaStream?.stopShareScreen();
      setIsStartedScreenShare(false);
    }
  }, [mediaStream, isStartedScreenShare, shareRef]);
  const onPassivelyStopShare = useCallback(({ reason }) => {
    console.log('passively stop reason:', reason);
    setIsStartedScreenShare(false);
  }, []);
  const onDeviceChange = useCallback(() => {
    if (mediaStream) {
      setMicList(mediaStream.getMicList());
      setSpeakerList(mediaStream.getSpeakerList());
      setCameraList(mediaStream.getCameraList());
      setActiveMicrophone(mediaStream.getActiveMicrophone());
      setActiveSpeaker(mediaStream.getActiveSpeaker());
      setActiveCamera(mediaStream.getActiveCamera());
    }
  }, [mediaStream]);
  useEffect(() => {
    zmClient.on('current-audio-change', onHostAudioMuted);
    zmClient.on('passively-stop-share', onPassivelyStopShare);
    zmClient.on('device-change', onDeviceChange);
    return () => {
      zmClient.off('current-audio-change', onHostAudioMuted);
      zmClient.off('passively-stop-share', onPassivelyStopShare);
      zmClient.off('device-change', onDeviceChange);
    };
  }, [zmClient, onHostAudioMuted, onPassivelyStopShare, onDeviceChange]);
  useUnmount(() => {
    if (isStartedAudio) {
      mediaStream?.stopAudio();
    }
    if (isStartedVideo) {
      mediaStream?.stopVideo();
    }
    if (isStartedScreenShare) {
      mediaStream?.stopShareScreen();
    }
  });
  return (
    <div className={classNames('video-footer', className)}>
      {isAudioEnable && (
      <MicrophoneButton
        isStartedAudio={isStartedAudio}
        isMuted={isMuted}
        onMicrophoneClick={onMicrophoneClick}
          onMicrophoneMenuClick={onMicrophoneMenuClick}
          microphoneList={micList}
          speakerList={speakerList}
          activeMicrophone={activeMicrophone}
          activeSpeaker={activeSpeaker}
        />
      )}
      <CameraButton
        isStartedVideo={isStartedVideo}
        onCameraClick={onCameraClick}
        onSwitchCamera={onSwitchCamera}
        cameraList={cameraList}
        activeCamera={activeCamera}
      />
      {sharing && (
        <ScreenShareButton
          isStartedScreenShare={isStartedScreenShare}
          onScreenShareClick={onScreenShareClick}
        />
      )}
      {/* {(zmClient.isManager() || zmClient.isHost())&& (
        <ScreenShareLockButton
        isLockedScreenShare={isLockedScreenShare}
        onScreenShareLockClick={()=>{
          mediaStream?.lockShare(!isLockedScreenShare);
          setIsLockedScreenShare(!isLockedScreenShare);
        }}
      />
      )} */}
    </div>
  );
};
export default VideoFooter;
