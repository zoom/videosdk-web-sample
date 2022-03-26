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
import RecordingContext from '../../../context/recording-context';
import CameraButton from './camera';
import MicrophoneButton from './microphone';
import { ScreenShareButton } from './screen-share';
import ZoomMediaContext from '../../../context/media-context';
import { useUnmount,useMount } from '../../../hooks';
import { MediaDevice } from '../video-types';
import './video-footer.scss';
import { isAndroidBrowser, isSupportOffscreenCanvas } from '../../../utils/platform';
import { getPhoneCallStatusDescription, SELF_VIDEO_ID } from '../video-constants';
import { getRecordingButtons, RecordButtonProps, RecordingButton } from './recording';
import { DialoutState, RecordingStatus,MutedSource,AudioChangeAction, DialOutOption, VideoCapturingState } from '@zoom/videosdk';
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
  const [audio,setAudio]=useState('');
  const [isSupportPhone,setIsSupportPhone] = useState(false);
  const [phoneCountryList,setPhoneCountryList] = useState<any[]>([]);
  const [phoneCallStatus,setPhoneCallStatus]= useState<DialoutState>();
  const [isStartedScreenShare, setIsStartedScreenShare] = useState(false);
  const [isMirrored, setIsMirrored] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeMicrophone, setActiveMicrophone] = useState('');
  const [activeSpeaker, setActiveSpeaker] = useState('');
  const [activeCamera, setActiveCamera] = useState('');
  const [micList, setMicList] = useState<MediaDevice[]>([]);
  const [speakerList, setSpeakerList] = useState<MediaDevice[]>([]);
  const [cameraList, setCameraList] = useState<MediaDevice[]>([]);
  const { mediaStream } = useContext(ZoomMediaContext);
  const recordingClient = useContext(RecordingContext);
  const [recordingStatus, setRecordingStatus] = useState<'' | RecordingStatus>(recordingClient?.getCloudRecordingStatus() || '');
  const zmClient = useContext(ZoomContext);
  const onCameraClick = useCallback(async () => {
    if (isStartedVideo) {
      await mediaStream?.stopVideo();
      setIsStartedVideo(false);
    } else {
      if (
        isAndroidBrowser() ||
        (isSupportOffscreenCanvas() && !mediaStream?.isSupportMultipleVideos())
      ) {
        const videoElement = document.querySelector(
          `#${SELF_VIDEO_ID}`,
        ) as HTMLVideoElement;
        if (videoElement) {
          await mediaStream?.startVideo({ videoElement });
        }
      } else {
        await mediaStream?.startVideo({hd:true});
      }

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
        if(audio==='computer'){
          await mediaStream.stopAudio();
        }else if(audio==='phone'){
          await mediaStream.hangup();
          setPhoneCallStatus(undefined);
        }
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
  const onMirrorVideo = async () => {
    await mediaStream?.mirrorVideo(!isMirrored);
    setIsMirrored(!isMirrored);
  };
  const onPhoneCall = async (code:string,phoneNumber:string,name:string,option:DialOutOption)=>{
    await mediaStream?.inviteByPhone(code,phoneNumber,name,option);
  }
  const onPhoneCallCancel = async (code:string,phoneNumber:string,option:{callMe:boolean})=>{
    if([DialoutState.Calling,DialoutState.Ringing,DialoutState.Accepted].includes(phoneCallStatus as any)){
      await mediaStream?.cancelInviteByPhone(code,phoneNumber, option);
      await new Promise((resolve)=>{setTimeout(()=>{resolve(true)},3000)});
    }
    return Promise.resolve();
  }
  const onHostAudioMuted = useCallback((payload) => {
    const { action, source, type } = payload;
    if (action === AudioChangeAction.Join ) {
      setIsStartedAudio(true);
      setAudio(type);
    } else if (action === AudioChangeAction.Leave) {
      setIsStartedAudio(false);
    } else if (action === AudioChangeAction.Muted) {
      setIsMuted(true);
      if (source === MutedSource.PassiveByMuteOne) {
        message.info('Host muted you');
      }
    } else if (action === AudioChangeAction.Unmuted) {
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

  const onRecordingChange = useCallback(() =>{
    setRecordingStatus(recordingClient?.getCloudRecordingStatus() || '');
  }, [recordingClient]);

  const onDialOutChange = useCallback((payload)=>{
    setPhoneCallStatus(payload.code)
  },[])

  const onRecordingClick = async (key: string) => {
    switch(key) {
      case 'Record': {
        await recordingClient?.startCloudRecording();        
        break;
      }
      case 'Resume': {
        await recordingClient?.resumeCloudRecording();
        break;
      }
      case 'Stop': {
        await recordingClient?.stopCloudRecording();
        break;
      }
      case 'Pause': {
        await recordingClient?.pauseCloudRecording();
        break;
      }
      case 'Status': {
        break;
      }
      default: {
        await recordingClient?.startCloudRecording();
      }
    }
  };
  const onVideoCaptureChange = useCallback((payload)=>{
    if(payload.state === VideoCapturingState.Started){
      setIsStartedVideo(true);
    }else {
      setIsStartedVideo(false);
    }
  },[])

  useEffect(() => {
    zmClient.on('current-audio-change', onHostAudioMuted);
    zmClient.on('passively-stop-share', onPassivelyStopShare);
    zmClient.on('device-change', onDeviceChange);
    zmClient.on('recording-change', onRecordingChange);
    zmClient.on('dialout-state-change',onDialOutChange);
    zmClient.on('video-capturing-change',onVideoCaptureChange)
    return () => {
      zmClient.off('current-audio-change', onHostAudioMuted);
      zmClient.off('passively-stop-share', onPassivelyStopShare);
      zmClient.off('device-change', onDeviceChange);
      zmClient.off('recording-change', onRecordingChange)
      zmClient.off('dialout-state-change',onDialOutChange);
      zmClient.off('video-capturing-change',onVideoCaptureChange)
    };
  }, [zmClient, onHostAudioMuted, onPassivelyStopShare, onDeviceChange, onRecordingChange,onDialOutChange,onVideoCaptureChange]);
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
  useMount(()=>{
    setIsSupportPhone(!!mediaStream?.isSupportPhoneFeature());
    setPhoneCountryList(mediaStream?.getSupportCountryInfo()||[]);
  });
  const recordingButtons: RecordButtonProps[] = getRecordingButtons(recordingStatus, zmClient.isHost());
  return (
    <div className={classNames('video-footer', className)}>
      {isAudioEnable && (
      <MicrophoneButton
        isStartedAudio={isStartedAudio}
        isMuted={isMuted}
        isSupportPhone={isSupportPhone}
        audio={audio}
        phoneCountryList={phoneCountryList}
        onPhoneCallClick={onPhoneCall}
        onPhoneCallCancel={onPhoneCallCancel}
        phoneCallStatus={getPhoneCallStatusDescription(phoneCallStatus)}
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
        onMirrorVideo={onMirrorVideo}
        cameraList={cameraList}
        activeCamera={activeCamera}
        isMirrored={isMirrored}
      />
      {sharing && (
        <ScreenShareButton
          isStartedScreenShare={isStartedScreenShare}
          onScreenShareClick={onScreenShareClick}
        />
      )}
      {recordingButtons.map((button: RecordButtonProps) => {
        return <RecordingButton key={button.text} onClick={()=>{onRecordingClick(button.text)}} {...button} />
      })}
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
