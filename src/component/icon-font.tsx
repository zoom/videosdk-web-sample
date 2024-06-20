import React from 'react';
import Icon from '@ant-design/icons';
import { ReactComponent as IconAdvanced } from './svgs/icon-advanced.svg';
import { ReactComponent as IconChat } from './svgs/icon-chat.svg';
import { ReactComponent as IconGroup } from './svgs/icon-group.svg';
import { ReactComponent as IconHeadset } from './svgs/icon-headset.svg';
import { ReactComponent as IconMeeting } from './svgs/icon-meeting.svg';
import { ReactComponent as IconPause } from './svgs/icon-pause.svg';
import { ReactComponent as IconRemoteControl } from './svgs/icon-remote-control.svg';
import { ReactComponent as IconResume } from './svgs/icon-resume.svg';
import { ReactComponent as IconShare } from './svgs/icon-share.svg';
import { ReactComponent as IconSpotlight } from './svgs/icon-spotlight.svg';
import { ReactComponent as IconStart } from './svgs/icon-start.svg';
import { ReactComponent as IconStop } from './svgs/icon-stop.svg';

import { ReactComponent as IconPhone } from './svgs/icon-phone.svg';
import { ReactComponent as IconPhoneOff } from './svgs/icon-phone-off.svg';

import { ReactComponent as IconRecording } from './svgs/icon-recording-default.svg';
import { ReactComponent as IconRecordingHovered } from './svgs/icon-recording-hovered.svg';
import { ReactComponent as IconRecordingAnimated } from './svgs/icon-recording-animated.svg';
import { ReactComponent as IconRecordingAnimatedHovered } from './svgs/icon-recording-animated-hovered.svg';
import { ReactComponent as IconRecordingStop } from './svgs/icon-recording-stop.svg';
import { ReactComponent as IconRecordingStopHovered } from './svgs/icon-recording-stop-hovered.svg';
import { ReactComponent as IconRecordingResume } from './svgs/icon-recording-resume.svg';
import { ReactComponent as IconRecordingResumeHovered } from './svgs/icon-recording-resume-hovered.svg';
import { ReactComponent as IconRecordingPause } from './svgs/icon-recording-pause.svg';
import { ReactComponent as IconRecordingPauseHovered } from './svgs/icon-recording-pause-hovered.svg';
import { ReactComponent as IconLt } from './svgs/icon-lt.svg';
import { ReactComponent as IconSubtitle } from './svgs/icon-subtitles.svg';
import { ReactComponent as IconLeave } from './svgs/icon-leave.svg';
import { ReactComponent as IconStopLeave } from './svgs/icon-stop-leave.svg';
import { ReactComponent as IconControl } from './svgs/icon-control.svg';
import { ReactComponent as IconSwitch } from './svgs/icon-switch.svg';
import { ReactComponent as IconNetworkGood } from './svgs/icon-network-good.svg';
import { ReactComponent as IconNetworkNormal } from './svgs/icon-network-normal.svg';
import { ReactComponent as IconNetworkBad } from './svgs/icon-network-bad.svg';
import { ReactComponent as IconLiveStream } from './svgs/icon-live-stream.svg';
import { ReactComponent as IconLive } from './svgs/icon-live.svg';
import { ReactComponent as IconMove } from './svgs/icon-move.svg';
import { ReactComponent as IconAudioOn } from './svgs/icon-audio-on.svg';
import { ReactComponent as IconAudioOff } from './svgs/icon-audio-off.svg';
import { ReactComponent as IconReconnect } from './svgs/icon-reconnect.svg';
import { ReactComponent as IconCorrectCircle } from './svgs/icon-correct-circle.svg';
import { ReactComponent as IconDownload } from './svgs/icon-download.svg';
import { ReactComponent as IconChatUpload } from './svgs/icon-chat-upload.svg';
import { ReactComponent as IconPenddingCircle } from './svgs/icon-pending-circle.svg';
import { ReactComponent as IconWarningCircle } from './svgs/icon-warning-circle.svg';
import { ReactComponent as IconCorrect } from './svgs/icon-correct.svg';
import { ReactComponent as IconLoading } from './svgs/icon-loading.svg';

import { ReactComponent as IconParticipantAudioMuted } from './svgs/participants/audio-muted.svg';
import { ReactComponent as IconParticipantAudioUnmuted } from './svgs/participants/audio-unmuted.svg';
import { ReactComponent as IconParticipantAudioUnmutedAnimated } from './svgs/participants/audio-unmuted-animated.svg';
import { ReactComponent as IconParticipantSharingDesktopAudio } from './svgs/participants/sharing-desktop-audio.svg';
import { ReactComponent as IconParticipantSharingScreen } from './svgs/participants/sharing-screen.svg';
import { ReactComponent as IconParticipantVideoOff } from './svgs/participants/video-off.svg';
import { ReactComponent as IconParticipantVideoOn } from './svgs/participants/video-on.svg';
import { ReactComponent as IconAudioMuted } from './svgs/audio/audio-muted.svg';
import { ReactComponent as IconAudioUnmuted } from './svgs/audio/audio-unmuted.svg';
import { ReactComponent as IconAudioDisallow } from './svgs/audio/audio-disallow.svg';
import { ReactComponent as IconAudioNoDevices } from './svgs/audio/audio-no-devices.svg';

const iconComponentMap: { [key: string]: any } = {
  'icon-advanced': IconAdvanced,
  'icon-chat': IconChat,
  'icon-group': IconGroup,
  'icon-headset': IconHeadset,
  'icon-meeting': IconMeeting,
  'icon-pause': IconPause,
  'icon-remote-control': IconRemoteControl,
  'icon-resume': IconResume,
  'icon-share': IconShare,
  'icon-spotlight': IconSpotlight,
  'icon-start': IconStart,
  'icon-stop': IconStop,
  'icon-recording': IconRecording,
  'icon-recording-hover': IconRecordingHovered,
  'icon-recording-stop': IconRecordingStop,
  'icon-recording-stop-hover': IconRecordingStopHovered,
  'icon-recording-resume': IconRecordingResume,
  'icon-recording-resume-hover': IconRecordingResumeHovered,
  'icon-recording-pause': IconRecordingPause,
  'icon-recording-pause-hover': IconRecordingPauseHovered,
  'icon-recording-animated': IconRecordingAnimated,
  'icon-recording-animated-hover': IconRecordingAnimatedHovered,
  'icon-phone': IconPhone,
  'icon-phone-off': IconPhoneOff,
  'icon-lt': IconLt,
  'icon-subtitle': IconSubtitle,
  'icon-leave': IconLeave,
  'icon-stop-leave': IconStopLeave,
  'icon-control': IconControl,
  'icon-switch': IconSwitch,
  'icon-network-good': IconNetworkGood,
  'icon-network-normal': IconNetworkNormal,
  'icon-network-bad': IconNetworkBad,
  'icon-live-stream': IconLiveStream,
  'icon-live': IconLive,
  'icon-move': IconMove,
  'icon-audio-on': IconAudioOn,
  'icon-audio-off': IconAudioOff,
  'icon-reconnect': IconReconnect,
  'icon-correct-circle': IconCorrectCircle,
  'icon-download': IconDownload,
  'icon-chat-upload': IconChatUpload,
  'icon-pendding-circle': IconPenddingCircle,
  'icon-warning-circle': IconWarningCircle,
  'icon-correct': IconCorrect,
  'icon-loading': IconLoading,
  'icon-participant-audio-muted': IconParticipantAudioMuted,
  'icon-participant-audio-unmuted': IconParticipantAudioUnmuted,
  'icon-participant-audio-unmuted-animated': IconParticipantAudioUnmutedAnimated,
  'icon-participant-sharing-desktop-audio': IconParticipantSharingDesktopAudio,
  'icon-participant-sharing-screen': IconParticipantSharingScreen,
  'icon-participant-video-off': IconParticipantVideoOff,
  'icon-participant-video-on': IconParticipantVideoOn,
  'icon-audio-muted': IconAudioMuted,
  'icon-audio-unmuted': IconAudioUnmuted,
  'icon-audio-disallow': IconAudioDisallow,
  'icon-audio-no-devices': IconAudioNoDevices
};
interface IconFontProps {
  type: string;
  style?: any;
}
export const IconFont = (props: IconFontProps) => {
  const { type, style } = props;
  const component = iconComponentMap[type];
  return component ? <Icon component={component} style={{ ...(style || {}) }} /> : null;
};
