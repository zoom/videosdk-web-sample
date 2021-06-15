import React, { useCallback, useContext, useEffect, useState, useRef } from 'react';
import produce from 'immer';
import ZoomVideo from "@zoom/videosdk";
import classNames from 'classnames';
import { useMount } from '../../hooks';
import './preview.scss';
import MicrophoneButton from '../video/components/microphone';
import CameraButton from '../video/components/camera';
import { message } from 'antd';

ZoomVideo.createLocalAudioTrack();
const localAudio = ZoomVideo.createLocalAudioTrack();
const localVideo = ZoomVideo.createLocalVideoTrack();
type DeviceList = { label: string, deviceId: string };
const PREVIEW_VIDEO_DIMS = {
  Width: 800,
  Height: 450,
};
const AUDIO_MASK = 1,
    MIC_MASK = 2,
    VIDEO_MASK = 4;

let PREVIEW_VIDEO: any;

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
  const toggleJoinAudio = () => {
    if(isJoinAudio) {
      localAudio.stop().then(()=>{
        setIsJoinAudio(!isJoinAudio);
      });
    } else {
      localAudio.start().then(()=>{
        setIsJoinAudio(!isJoinAudio);
      });
    }
    
  };


  const toggleMute = () => {
    if(isMuteAudio) {
      localAudio.unmute().then(()=>{
        setIsMuteAudio(!isMuteAudio);
      });
    } else {
      localAudio.mute().then(()=>{
        setIsMuteAudio(!isMuteAudio);
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
    
  }, [isJoinAudio, isMuteAudio, isStartVideo]);
 
  useMount(() => {
    PREVIEW_VIDEO = document.getElementById('js-preview-video');
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
                    onMicrophoneClick={toggleJoinAudio}
                  />
                  <MicrophoneButton
                    isStartedAudio={isMuteAudio}
                    isMuted={isMuteAudio}
                    onMicrophoneClick={toggleMute}
                  />
                  <CameraButton isStartedVideo={isStartVideo} onCameraClick={toggleVideo} />
                </div>
                <button id="js-preview-encode" type="button" onClick={()=>{
                  const encodeVal = encodePreviewOptions(isJoinAudio, isMuteAudio, isStartVideo);
                  console.log("preview encode val", encodeVal)
                  const decodeOption = decodePreviewOptions(encodeVal);
                  console.log("preview config", decodePreviewOptions(encodeVal));
                  message.info(JSON.stringify(decodeOption, null, 2));
                }} className="join-button">
                Get preview option
                </button>
            </div>
        </div>
    </div>
  );
};

export default PreviewContainer;
