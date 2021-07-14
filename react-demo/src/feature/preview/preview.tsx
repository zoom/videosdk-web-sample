import React, { useCallback, useContext, useEffect, useState, useRef } from 'react';
import produce from 'immer';
import ZoomVideo from "@zoom/videosdk";
import classNames from 'classnames';
import { useMount } from '../../hooks';
import './preview.scss';
import MicrophoneButton from '../video/components/microphone';
import CameraButton from '../video/components/camera';
import { message } from 'antd';

let prevMicFeedbackStyle = '';
let  micFeedBackInteval: any = '';

const localAudio = ZoomVideo.createLocalAudioTrack();
const localVideo = ZoomVideo.createLocalVideoTrack();
const AUDIO_MASK = 1,
    MIC_MASK = 2,
    VIDEO_MASK = 4;

let PREVIEW_VIDEO: any;

const updateMicFeedbackStyle = () => {
  const newVolumeIntensity = localAudio.getCurrentVolume();
  let newMicFeedbackStyle = '';

  if (newVolumeIntensity === 0) {
      newMicFeedbackStyle = '';
  } else if (newVolumeIntensity <= 0.05) {
      newMicFeedbackStyle = 'mic-feedback__very-low';
  } else if (newVolumeIntensity <= 0.1) {
      newMicFeedbackStyle = 'mic-feedback__low';
  } else if (newVolumeIntensity <= 0.15) {
      newMicFeedbackStyle = 'mic-feedback__medium';
  } else if (newVolumeIntensity <= 0.2) {
      newMicFeedbackStyle = 'mic-feedback__high';
  } else if (newVolumeIntensity <= 0.25) {
      newMicFeedbackStyle = 'mic-feedback__very-high';
  } else {
      newMicFeedbackStyle = 'mic-feedback__max';
  }
  const micIcon: any = document.getElementById('auido-volume-feedback');
  if (prevMicFeedbackStyle !== '' && micIcon) {
      micIcon.classList.toggle(prevMicFeedbackStyle);
  }

  if (newMicFeedbackStyle !== '' && micIcon) {
      micIcon.classList.toggle(newMicFeedbackStyle);
  }
  console.log(newMicFeedbackStyle, newVolumeIntensity);
  prevMicFeedbackStyle = newMicFeedbackStyle;
};

const encodePreviewOptions = (isJoinAudio: boolean, isMuteAudio: boolean, isStartVideo: boolean) => {
  let res = 0;
  res = (res | +isStartVideo) << 1;
  res = (res | +isMuteAudio) << 1;
  res = (res | +isJoinAudio);
  return res;
}
const decodePreviewOptions = (val: number) => {
  /*
      LSB: audio,
      MSB: video
   */
  let isJoinAudio = !!((val & AUDIO_MASK) === AUDIO_MASK);
  let isMuteAudio = !!((val & MIC_MASK) === MIC_MASK);
  let isStartVideo = !!((val & VIDEO_MASK) === VIDEO_MASK);
  return {isStartVideo, isMuteAudio, isJoinAudio};
}

const PreviewContainer = () => {

  const [isJoinAudio, setIsJoinAudio] = useState<boolean>(false);
  const [isMuteAudio, setIsMuteAudio] = useState<boolean>(false);
  const [isStartVideo, setIsStartVideo] = useState<boolean>(false);
  const onMicrophoneClick = () => {
    if(isJoinAudio) {
      if(isMuteAudio) {
        localAudio.unmute().then(()=>{
          micFeedBackInteval = setInterval(updateMicFeedbackStyle, 500);
          setIsMuteAudio(!isMuteAudio);
        });
      } else {
        localAudio.mute().then(()=>{
          if (micFeedBackInteval) {
            clearInterval(micFeedBackInteval);
          }
          setIsMuteAudio(!isMuteAudio);
        });
      }
      // localAudio.stop().then(()=>{
      //   if (micFeedBackInteval) {
      //     clearInterval(micFeedBackInteval);
      //   }
      //   setIsJoinAudio(!isJoinAudio);
      // });
    } else {
      localAudio.start().then(()=>{        
        setIsJoinAudio(!isJoinAudio);
        setIsMuteAudio(true);
      });
    }
    
  };

  const toggleVideo = () => {
    if(isStartVideo) {
      localVideo.stop().then(()=>{
        setIsStartVideo(!isStartVideo);
      });
    }
    else {
      localVideo.start(PREVIEW_VIDEO).then(()=>{
        setIsStartVideo(!isStartVideo);
      });
    }
    
  }

  useEffect(() => {
    const encodeVal = encodePreviewOptions(isJoinAudio, isMuteAudio, isStartVideo);
                  console.log("preview encode val", encodeVal)
                  const decodeOption = decodePreviewOptions(encodeVal);
                  console.log("preview config", decodePreviewOptions(encodeVal));
                  message.info(JSON.stringify(decodeOption, null, 2));
  }, [isJoinAudio, isMuteAudio, isStartVideo]);
 
  useMount(() => {
    PREVIEW_VIDEO = document.getElementById('js-preview-video');
    ZoomVideo.getDevices().then((res)=>{
      console.log(res);
    });
  });

  return (
    <div className="js-preview-view">
      <div id="js-preview-view" className="container preview__root">
            <span>
                <h1>Audio And Video Preview</h1>
            </span>
            <div className="container video-app">
                <video id="js-preview-video" className="preview-video" muted={true} data-video="0"></video>
                <div className="video-footer video-operations-preview">
                  <MicrophoneButton
                    isStartedAudio={isJoinAudio}
                    isMuted={isMuteAudio}
                    onMicrophoneClick={onMicrophoneClick}
                  />
                  <CameraButton isStartedVideo={isStartVideo} onCameraClick={toggleVideo} />
                </div>
            </div>
        </div>
    </div>
  );
};

export default PreviewContainer;
