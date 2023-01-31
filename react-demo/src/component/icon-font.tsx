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
  'icon-network-bad': IconNetworkBad
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
