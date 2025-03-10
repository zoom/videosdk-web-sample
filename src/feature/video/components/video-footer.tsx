import { useState, useCallback, useContext, useEffect } from 'react';
import classNames from 'classnames';
import { message, Modal, Form, Select, Checkbox, Tooltip } from 'antd';
import { SoundOutlined } from '@ant-design/icons';
import ZoomContext from '../../../context/zoom-context';
import CameraButton from './camera';
import MicrophoneButton from './microphone';
import { ScreenShareButton } from './screen-share';
import AudioVideoStatisticModal from './audio-video-statistic';
import ZoomMediaContext from '../../../context/media-context';
import { useUnmount, useMount } from '../../../hooks';
import type { MediaDevice } from '../video-types';
import './video-footer.scss';
import { isAndroidOrIOSBrowser } from '../../../utils/platform';
import { getPhoneCallStatusDescription } from '../video-constants';
import { type RecordButtonProps, getRecordingButtons, RecordingButton } from './recording';
import {
  type DialOutOption,
  type Processor,
  DialoutState,
  RecordingStatus,
  MutedSource,
  AudioChangeAction,
  SharePrivilege,
  MobileVideoFacingMode,
  LiveStreamStatus,
  ShareStatus
} from '@zoom/videosdk';
import { LiveTranscriptionButton } from './live-transcription';
import { LeaveButton } from './leave';
import { TranscriptionSubtitle } from './transcription-subtitle';
import IsoRecordingModal from './recording-ask-modal';
import { LiveStreamButton, LiveStreamModal } from './live-stream';
import { IconFont } from '../../../component/icon-font';
import { VideoMaskModel } from './video-mask-modal';
import { useParticipantsChange } from '../hooks/useParticipantsChange';
interface VideoFooterProps {
  className?: string;
  selfShareCanvas?: HTMLCanvasElement | HTMLVideoElement | null;
  sharing?: boolean;
}

const isAudioEnable = typeof AudioWorklet === 'function';
const VideoFooter = (props: VideoFooterProps) => {
  const { className, selfShareCanvas, sharing } = props;
  const zmClient = useContext(ZoomContext);
  const { mediaStream } = useContext(ZoomMediaContext);
  const liveTranscriptionClient = zmClient.getLiveTranscriptionClient();
  const liveStreamClient = zmClient.getLiveStreamClient();
  const recordingClient = zmClient.getRecordingClient();
  const [isStartedAudio, setIsStartedAudio] = useState(
    zmClient.getCurrentUserInfo() && zmClient.getCurrentUserInfo().audio !== ''
  );
  const [isStartedVideo, setIsStartedVideo] = useState(zmClient.getCurrentUserInfo()?.bVideoOn);
  const [audio, setAudio] = useState(zmClient.getCurrentUserInfo()?.audio);
  const [isSupportPhone, setIsSupportPhone] = useState(false);
  const [phoneCountryList, setPhoneCountryList] = useState<any[]>([]);
  const [phoneCallStatus, setPhoneCallStatus] = useState<DialoutState>();
  const [isStartedLiveTranscription, setIsStartedLiveTranscription] = useState(false);
  const [isDisableCaptions, setIsDisableCaptions] = useState(false);
  const [isMirrored, setIsMirrored] = useState(false);
  const [isBlur, setIsBlur] = useState(mediaStream?.getVirtualbackgroundStatus().imageSrc === 'blur');
  const [isMuted, setIsMuted] = useState(!!zmClient.getCurrentUserInfo()?.muted);
  const [activeMicrophone, setActiveMicrophone] = useState(mediaStream?.getActiveMicrophone());
  const [activeSpeaker, setActiveSpeaker] = useState(mediaStream?.getActiveSpeaker());
  const [activeCamera, setActiveCamera] = useState(mediaStream?.getActiveCamera());
  const [micList, setMicList] = useState<MediaDevice[]>(mediaStream?.getMicList() ?? []);
  const [speakerList, setSpeakerList] = useState<MediaDevice[]>(mediaStream?.getSpeakerList() ?? []);
  const [cameraList, setCameraList] = useState<MediaDevice[]>(mediaStream?.getCameraList() ?? []);
  const [statisticVisible, setStatisticVisible] = useState(false);
  const [selecetedStatisticTab, setSelectedStatisticTab] = useState('audio');
  const [isComputerAudioDisabled, setIsComputerAudioDisabled] = useState(false);
  const [sharePrivilege, setSharePrivileg] = useState(SharePrivilege.Unlocked);
  const [caption, setCaption] = useState({ text: '', isOver: false });
  const [activePlaybackUrl, setActivePlaybackUrl] = useState('');
  const [activeProcessor, setActiveProcessor] = useState<Processor | undefined>();
  const [isMicrophoneForbidden, setIsMicrophoneForbidden] = useState(false);
  const [createdProcessorList, setCreatedProcessorList] = useState<Processor[]>([]);
  const [recordingStatus, setRecordingStatus] = useState<'' | RecordingStatus>(
    recordingClient?.getCloudRecordingStatus() || ''
  );
  const [recordingIsoStatus, setRecordingIsoStatus] = useState<'' | RecordingStatus>('');
  const [liveStreamVisible, setLiveStreamVisible] = useState(false);
  const [liveStreamStatus, setLiveStreamStatus] = useState(liveStreamClient?.getLiveStreamStatus());
  // Video Mask
  const [videoMaskVisible, setVideoMaskVisible] = useState(false);

  const [isSecondaryAudioStarted, setIsSecondaryAudioStarted] = useState(false);
  const [secondaryMicForm] = Form.useForm();
  useParticipantsChange(zmClient, () => {
    const currentUser = zmClient.getCurrentUserInfo();
    setIsMuted(!!currentUser?.muted);
    setIsStartedVideo(!!currentUser?.bVideoOn);
  });
  const onCameraClick = useCallback(async () => {
    if (isStartedVideo) {
      await mediaStream?.stopVideo();
      if (activePlaybackUrl) {
        await mediaStream?.switchMicrophone('default');
        setActiveMicrophone(mediaStream?.getActiveMicrophone());
        setActivePlaybackUrl('');
      }
    } else {
      const startVideoOptions = {
        hd: true,
        fullHd: true,
        ptz: mediaStream?.isBrowserSupportPTZ(),
        originalRatio: true
      };
      if (mediaStream?.isSupportVirtualBackground() && isBlur) {
        Object.assign(startVideoOptions, { virtualBackground: { imageUrl: 'blur' } });
      }
      await mediaStream?.startVideo(startVideoOptions);
    }
  }, [mediaStream, isStartedVideo, isBlur, activePlaybackUrl]);
  const onMicrophoneClick = useCallback(async () => {
    if (isStartedAudio) {
      if (isMuted) {
        await mediaStream?.unmuteAudio();
      } else {
        await mediaStream?.muteAudio();
      }
    } else {
      try {
        if (activePlaybackUrl) {
          await mediaStream?.startAudio({ mediaFile: { url: activePlaybackUrl, loop: true } });
        } else {
          await mediaStream?.startAudio({ highBitrate: true });
        }
        setActiveMicrophone(mediaStream?.getActiveMicrophone());
      } catch (e: any) {
        if (e.type === 'INSUFFICIENT_PRIVILEGES' && e.reason === 'USER_FORBIDDEN_MICROPHONE') {
          setIsMicrophoneForbidden(true);
        }
        console.warn(e);
      }
      // setIsStartedAudio(true);
    }
  }, [mediaStream, isStartedAudio, isMuted, activePlaybackUrl]);
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
        if (audio === 'computer') {
          await mediaStream.stopAudio();
          setIsMicrophoneForbidden(false);
        } else if (audio === 'phone') {
          await mediaStream.hangup();
          setPhoneCallStatus(undefined);
        }
      } else if (type === 'statistic') {
        setSelectedStatisticTab('audio');
        setStatisticVisible(true);
      } else if (type === 'secondary audio') {
        if (isSecondaryAudioStarted) {
          await mediaStream.stopSecondaryAudio();
          setIsSecondaryAudioStarted(false);
        } else {
          const selectedMic = secondaryMicForm.getFieldValue('mic');
          if (!mediaStream.getMicList().some((item) => item.deviceId === selectedMic)) {
            secondaryMicForm.setFieldValue('mic', undefined);
          }
          Modal.confirm({
            title: 'Start secondary audio',
            content: (
              <Form form={secondaryMicForm}>
                <Form.Item label="Microphone" name="mic" required>
                  <Select
                    options={mediaStream.getMicList().map((item) => ({
                      value: item.deviceId,
                      label: item.label,
                      disabled:
                        item.deviceId === mediaStream.getActiveMicrophone() ||
                        item.label ===
                          mediaStream.getMicList()?.find((item) => item.deviceId === mediaStream.getActiveMicrophone())
                            ?.label
                    }))}
                  />
                </Form.Item>
                <Form.Item label="Contraintes" name="constraints">
                  <Checkbox.Group
                    options={[
                      { label: 'AGC', value: 'autoGainControl' },
                      {
                        label: 'ANC',
                        value: 'noiseSuppression'
                      },
                      {
                        label: 'AEC',
                        value: 'echoCancellation'
                      }
                    ]}
                  />
                </Form.Item>
              </Form>
            ),
            onOk: async () => {
              try {
                const data = await secondaryMicForm.validateFields();
                const { mic, constraints } = data;
                const option = { autoGainControl: false, noiseSuppression: false, echoCancellation: false };
                if (constraints) {
                  constraints.forEach((key: string) => {
                    Object.assign(option, { [`${key}`]: true });
                  });
                }
                await mediaStream.startSecondaryAudio(mic, option);
                setIsSecondaryAudioStarted(true);
              } catch (e) {
                console.warn(e);
              }
            }
          });
        }
      }
    }
  };
  const onSwitchCamera = async (key: string) => {
    if (mediaStream) {
      if (activeCamera !== key) {
        await mediaStream.switchCamera(key);
        setActiveCamera(mediaStream.getActiveCamera());
        if (activePlaybackUrl) {
          await mediaStream.switchMicrophone('default');
          setActiveMicrophone(mediaStream.getActiveMicrophone());
          setActivePlaybackUrl('');
        }
      }
    }
  };
  const onMirrorVideo = async () => {
    await mediaStream?.mirrorVideo(!isMirrored);
    setIsMirrored(!isMirrored);
  };
  const onBlurBackground = async () => {
    const isSupportVirtualBackground = mediaStream?.isSupportVirtualBackground();
    if (isSupportVirtualBackground) {
      if (isBlur) {
        await mediaStream?.updateVirtualBackgroundImage(undefined);
      } else {
        await mediaStream?.updateVirtualBackgroundImage('blur');
      }
    } else {
      setVideoMaskVisible(true);
    }

    setIsBlur(!isBlur);
  };
  const onPhoneCall = async (code: string, phoneNumber: string, name: string, option: DialOutOption) => {
    await mediaStream?.inviteByPhone(code, phoneNumber, name, option);
  };
  const onPhoneCallCancel = async (code: string, phoneNumber: string, option: { callMe: boolean }) => {
    if ([DialoutState.Calling, DialoutState.Ringing, DialoutState.Accepted].includes(phoneCallStatus as any)) {
      await mediaStream?.cancelInviteByPhone(code, phoneNumber, option);
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 3000);
      });
    }
    return Promise.resolve();
  };
  const onHostAudioMuted = useCallback(
    (payload: any) => {
      const { action, source, type } = payload;
      const currentUser = zmClient.getCurrentUserInfo();
      setIsStartedAudio(currentUser.audio === 'computer' || currentUser.audio === 'phone');
      setAudio(currentUser.audio);
      if (action === AudioChangeAction.Join) {
        setIsStartedAudio(true);
        setAudio(type);
      } else if (action === AudioChangeAction.Leave) {
        setIsStartedAudio(false);
      } else if (action === AudioChangeAction.Muted) {
        if (source === MutedSource.PassiveByMuteOne) {
          message.info('Host muted you');
        }
      } else if (action === AudioChangeAction.Unmuted) {
        if (source === 'passive') {
          message.info('Host unmuted you');
        }
      }
    },
    [zmClient]
  );
  const onScreenShareClick = useCallback(async () => {
    if (mediaStream?.getShareStatus() === ShareStatus.End && selfShareCanvas) {
      await mediaStream?.startShareScreen(selfShareCanvas, { requestReadReceipt: true });
    }
  }, [mediaStream, selfShareCanvas]);

  const onLiveTranscriptionClick = useCallback(async () => {
    if (isDisableCaptions) {
      message.info('Captions has been disable by host.');
    } else if (isStartedLiveTranscription) {
      message.info('Live transcription has started.');
    } else if (!isStartedLiveTranscription) {
      await liveTranscriptionClient?.startLiveTranscription();
      setIsStartedLiveTranscription(true);
    }
  }, [isStartedLiveTranscription, isDisableCaptions, liveTranscriptionClient]);

  const onDisableCaptions = useCallback(
    async (disable: boolean) => {
      if (disable && !isDisableCaptions) {
        await liveTranscriptionClient?.disableCaptions(disable);
        setIsStartedLiveTranscription(false);
        setIsDisableCaptions(true);
      } else if (!disable && isDisableCaptions) {
        await liveTranscriptionClient?.disableCaptions(disable);
        setIsDisableCaptions(false);
      }
    },
    [isDisableCaptions, liveTranscriptionClient]
  );

  const onLeaveClick = useCallback(async () => {
    await zmClient.leave();
  }, [zmClient]);

  const onEndClick = useCallback(async () => {
    await zmClient.leave(true);
  }, [zmClient]);

  const onPassivelyStopShare = useCallback(({ reason }: any) => {
    console.log('passively stop reason:', reason);
  }, []);
  const onDeviceChange = useCallback(() => {
    if (mediaStream) {
      setMicList(mediaStream.getMicList());
      setSpeakerList(mediaStream.getSpeakerList());
      if (!isAndroidOrIOSBrowser()) {
        setCameraList(mediaStream.getCameraList());
      }
      setActiveMicrophone(mediaStream.getActiveMicrophone());
      setActiveSpeaker(mediaStream.getActiveSpeaker());
      setActiveCamera(mediaStream.getActiveCamera());
    }
  }, [mediaStream]);

  const onRecordingChange = useCallback(() => {
    setRecordingStatus(recordingClient?.getCloudRecordingStatus() || '');
  }, [recordingClient]);

  const onRecordingISOChange = useCallback(
    (payload: any) => {
      if (payload?.userId === zmClient.getSessionInfo().userId || payload?.status === RecordingStatus.Ask) {
        setRecordingIsoStatus(payload?.status);
      }
      console.log('recording-iso-change', payload);
    },
    [zmClient]
  );

  const onDialOutChange = useCallback((payload: any) => {
    setPhoneCallStatus(payload.code);
  }, []);

  const onRecordingClick = async (key: string) => {
    switch (key) {
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
  const onShareAudioChange = useCallback(
    (payload: any) => {
      const { state } = payload;
      if (state === 'on') {
        if (!mediaStream?.isSupportMicrophoneAndShareAudioSimultaneously()) {
          setIsComputerAudioDisabled(true);
        }
      } else if (state === 'off') {
        setIsComputerAudioDisabled(false);
      }
    },
    [mediaStream]
  );
  const onHostAskToUnmute = useCallback(
    (payload: any) => {
      const { reason } = payload;
      Modal.confirm({
        title: 'Unmute audio',
        content: `Host ask to unmute audio, reason: ${reason}`,
        onOk: async () => {
          await mediaStream?.unmuteAudio();
        },
        onCancel() {
          console.log('cancel');
        }
      });
    },
    [mediaStream]
  );

  const onCaptionStatusChange = useCallback((payload: any) => {
    const { autoCaption } = payload;
    if (autoCaption) {
      message.info('Auto live transcription enabled!');
    }
  }, []);

  const onCaptionMessage = useCallback((payload: any) => {
    const { text, done } = payload;
    setCaption({
      text,
      isOver: done
    });
  }, []);

  const onCaptionDisable = useCallback((payload: any) => {
    setIsDisableCaptions(payload);
    if (payload) {
      setIsStartedLiveTranscription(false);
    }
  }, []);

  const onCanSeeMyScreen = useCallback(() => {
    message.info('Users can now see your screen', 1);
  }, []);
  const onSelectVideoPlayback = useCallback(
    async (url: string) => {
      if (activePlaybackUrl !== url) {
        await mediaStream?.switchCamera({ url, loop: true });
        if (isStartedAudio) {
          await mediaStream?.switchMicrophone({ url, loop: true });
        } else {
          await mediaStream?.startAudio({ mediaFile: { url, loop: true } });
        }
        setActivePlaybackUrl(url);
      }
    },
    [isStartedAudio, activePlaybackUrl, mediaStream]
  );

  const onLiveStreamClick = useCallback(() => {
    if (liveStreamStatus === LiveStreamStatus.Ended) {
      setLiveStreamVisible(true);
    } else if (liveStreamStatus === LiveStreamStatus.InProgress) {
      liveStreamClient?.stopLiveStream();
    }
  }, [liveStreamStatus, liveStreamClient]);
  const onLiveStreamStatusChange = useCallback((status: any) => {
    setLiveStreamStatus(status);
    if (status === LiveStreamStatus.Timeout) {
      message.error('Start live streaming timeout');
    }
  }, []);
  const updateWatermarkImage = useCallback((processor: Processor, imageUrl: string) => {
    const img = document.createElement('img');
    img.width = 640;
    img.height = 360;
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      createImageBitmap(img).then((ibm) => {
        processor?.port?.postMessage({
          cmd: 'update_watermark_image',
          data: ibm
        });
      });
    };
  }, []);
  const onProcessorClick = useCallback(async (processor: any) => {
    let tempProcessor = createdProcessorList?.find((p) => p.name === processor.name);
    if (!tempProcessor) {
      try {
        tempProcessor = await mediaStream?.createProcessor(processor);

        setCreatedProcessorList([...createdProcessorList, tempProcessor as Processor]);
      } catch (e) {
        console.log(e);
      }
      if (activeProcessor) {
        if (processor.name === activeProcessor?.name) {
          mediaStream?.removeProcessor(activeProcessor);
          setActiveProcessor(undefined);
        } else {
          mediaStream?.removeProcessor(activeProcessor);
          mediaStream?.addProcessor(tempProcessor as Processor);
          if (tempProcessor?.name === 'watermark-processor') {
            updateWatermarkImage(tempProcessor, `${location.origin}/zoom.svg`);
          }
          setActiveProcessor(tempProcessor as Processor);
        }
      } else {
        try {
          await mediaStream?.addProcessor(tempProcessor as Processor);
          setActiveProcessor(tempProcessor as Processor);
          if (tempProcessor?.name === 'watermark-processor') {
            updateWatermarkImage(tempProcessor, `${location.origin}/zoom.svg`);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);
  const onVideoScreenshotTaken = useCallback((payload: any) => {
    const { displayName, userId } = payload;
    message.info(`${displayName}(User:${userId}) just took a screenshot of your video`);
  }, []);
  const onShareViewScreenshotTaken = useCallback((payload: any) => {
    const { displayName, userId } = payload;
    message.info(`${displayName}(User:${userId}) just took a screenshot of your sharing`);
  }, []);
  useEffect(() => {
    zmClient.on('current-audio-change', onHostAudioMuted);
    zmClient.on('passively-stop-share', onPassivelyStopShare);
    zmClient.on('device-change', onDeviceChange);
    zmClient.on('recording-change', onRecordingChange);
    zmClient.on('individual-recording-change', onRecordingISOChange);
    zmClient.on('dialout-state-change', onDialOutChange);
    zmClient.on('share-audio-change', onShareAudioChange);
    zmClient.on('host-ask-unmute-audio', onHostAskToUnmute);
    zmClient.on('caption-status', onCaptionStatusChange);
    zmClient.on('caption-message', onCaptionMessage);
    zmClient.on('caption-host-disable', onCaptionDisable);
    zmClient.on('share-can-see-screen', onCanSeeMyScreen);
    zmClient.on('live-stream-status', onLiveStreamStatusChange);
    zmClient.on('video-screenshot-taken', onVideoScreenshotTaken);
    zmClient.on('share-content-screenshot-taken', onShareViewScreenshotTaken);
    return () => {
      zmClient.off('current-audio-change', onHostAudioMuted);
      zmClient.off('passively-stop-share', onPassivelyStopShare);
      zmClient.off('device-change', onDeviceChange);
      zmClient.off('recording-change', onRecordingChange);
      zmClient.off('individual-recording-change', onRecordingISOChange);
      zmClient.off('dialout-state-change', onDialOutChange);
      zmClient.off('share-audio-change', onShareAudioChange);
      zmClient.off('host-ask-unmute-audio', onHostAskToUnmute);
      zmClient.off('caption-status', onCaptionStatusChange);
      zmClient.off('caption-message', onCaptionMessage);
      zmClient.off('caption-host-disable', onCaptionDisable);
      zmClient.off('share-can-see-screen', onCanSeeMyScreen);
      zmClient.off('live-stream-status', onLiveStreamStatusChange);
      zmClient.off('video-screenshot-taken', onVideoScreenshotTaken);
      zmClient.off('share-content-screenshot-taken', onShareViewScreenshotTaken);
    };
  }, [
    zmClient,
    onHostAudioMuted,
    onPassivelyStopShare,
    onDeviceChange,
    onRecordingChange,
    onDialOutChange,
    onShareAudioChange,
    onHostAskToUnmute,
    onCaptionStatusChange,
    onCaptionMessage,
    onCanSeeMyScreen,
    onRecordingISOChange,
    onCaptionDisable,
    onLiveStreamStatusChange,
    onVideoScreenshotTaken,
    onShareViewScreenshotTaken
  ]);
  useUnmount(() => {
    if (zmClient.getSessionInfo().isInMeeting) {
      if (isStartedAudio) {
        mediaStream?.stopAudio();
      }
      if (isStartedVideo) {
        mediaStream?.stopVideo();
      }
      mediaStream?.stopShareScreen();
    }
  });
  useMount(() => {
    if (mediaStream) {
      setIsSupportPhone(!!mediaStream.isSupportPhoneFeature());
      setPhoneCountryList(mediaStream.getSupportCountryInfo() || []);
      setSharePrivileg(mediaStream.getSharePrivilege());
      if (isAndroidOrIOSBrowser()) {
        setCameraList([
          { deviceId: MobileVideoFacingMode.User, label: 'Front-facing' },
          { deviceId: MobileVideoFacingMode.Environment, label: 'Rear-facing' }
        ]);
      }
    }
  });
  useEffect(() => {
    if (mediaStream && zmClient.getSessionInfo().isInMeeting && statisticVisible) {
      mediaStream.subscribeAudioStatisticData();
      mediaStream.subscribeVideoStatisticData();
      mediaStream.subscribeShareStatisticData();
    }
    return () => {
      if (zmClient.getSessionInfo().isInMeeting) {
        mediaStream?.unsubscribeAudioStatisticData();
        mediaStream?.unsubscribeVideoStatisticData();
        mediaStream?.unsubscribeShareStatisticData();
      }
    };
  }, [mediaStream, zmClient, statisticVisible]);
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
          disabled={isComputerAudioDisabled}
          isMicrophoneForbidden={isMicrophoneForbidden}
          isSecondaryAudioStarted={isSecondaryAudioStarted}
        />
      )}
      <CameraButton
        isStartedVideo={isStartedVideo}
        onCameraClick={onCameraClick}
        onSwitchCamera={onSwitchCamera}
        onMirrorVideo={onMirrorVideo}
        onSelectVideoProcessor={onProcessorClick}
        onVideoStatistic={() => {
          setSelectedStatisticTab('video');
          setStatisticVisible(true);
        }}
        onBlurBackground={onBlurBackground}
        onSelectVideoPlayback={onSelectVideoPlayback}
        activePlaybackUrl={activePlaybackUrl}
        activeProcessor={activeProcessor?.name}
        cameraList={cameraList}
        activeCamera={activeCamera}
        isMirrored={isMirrored}
        isBlur={isBlur}
      />
      {sharing && (
        <ScreenShareButton
          sharePrivilege={sharePrivilege}
          isHostOrManager={zmClient.isHost() || zmClient.isManager()}
          onScreenShareClick={onScreenShareClick}
          onSharePrivilegeClick={async (privilege) => {
            await mediaStream?.setSharePrivilege(privilege);
            setSharePrivileg(privilege);
          }}
        />
      )}
      {!zmClient?.getCurrentUserInfo()?.subsessionId &&
        recordingButtons.map((button: RecordButtonProps) => {
          return (
            <RecordingButton
              key={button.text}
              onClick={() => {
                onRecordingClick(button.text);
              }}
              {...button}
            />
          );
        })}
      {liveTranscriptionClient?.getLiveTranscriptionStatus().isLiveTranscriptionEnabled && (
        <>
          <LiveTranscriptionButton
            isStartedLiveTranscription={isStartedLiveTranscription}
            isDisableCaptions={isDisableCaptions}
            isHost={zmClient.isHost()}
            onDisableCaptions={onDisableCaptions}
            onLiveTranscriptionClick={onLiveTranscriptionClick}
          />
          <TranscriptionSubtitle text={caption.text} />
        </>
      )}
      {liveStreamClient?.isLiveStreamEnabled() && zmClient.isHost() && (
        <>
          <LiveStreamButton
            isLiveStreamOn={liveStreamStatus === LiveStreamStatus.InProgress}
            onLiveStreamClick={onLiveStreamClick}
          />
          <LiveStreamModal
            visible={liveStreamVisible}
            setVisible={setLiveStreamVisible}
            onStartLiveStream={(streanUrl: string, streamKey: string, broadcastUrl: string) => {
              liveStreamClient.startLiveStream(streanUrl, streamKey, broadcastUrl);
            }}
          />
        </>
      )}
      {liveStreamStatus === LiveStreamStatus.InProgress && (
        <IconFont type="icon-live" style={{ position: 'fixed', top: '45px', left: '10px', color: '#f00' }} />
      )}
      {isSecondaryAudioStarted && (
        <Tooltip title="Secondary audio on">
          <SoundOutlined style={{ position: 'fixed', top: '45px', left: '10px', color: '#f60', fontSize: '24px' }} />
        </Tooltip>
      )}
      <LeaveButton onLeaveClick={onLeaveClick} isHost={zmClient.isHost()} onEndClick={onEndClick} />

      <AudioVideoStatisticModal
        visible={statisticVisible}
        setVisible={setStatisticVisible}
        defaultTab={selecetedStatisticTab}
        isStartedAudio={isStartedAudio}
        isMuted={isMuted}
        isStartedVideo={isStartedVideo}
      />

      {recordingIsoStatus === RecordingStatus.Ask && (
        <IsoRecordingModal
          onClick={() => {
            recordingClient?.acceptIndividualRecording();
          }}
          onCancel={() => {
            recordingClient?.declineIndividualRecording();
          }}
        />
      )}
      {!mediaStream?.isSupportVirtualBackground() && (
        <VideoMaskModel visible={videoMaskVisible} setVisible={setVideoMaskVisible} isMirrored={isMirrored} />
      )}
    </div>
  );
};
export default VideoFooter;
