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
  'icon-stop': IconStop
};
interface IconFontProps {
  type: string;
  style?: any;
}
export const IconFont = (props: IconFontProps) => {
  const { type, style } = props;
  const component = iconComponentMap[type];
  return component ? (
    <Icon component={component} style={{ ...(style || {}) }} />
  ) : null;
};
