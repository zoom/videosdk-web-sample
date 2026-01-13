import Icon from '@ant-design/icons';

import { IconMap as AnnotationIconMap } from './svgs/annotation';
import { IconMap as AudioIconMap } from './svgs/audio';
import { IconMap as ChatIconMap } from './svgs/chat';
import { IconMap as NetworkIconMap } from './svgs/network';
import { IconMap as ParticipantIconMap } from './svgs/participants';
import { IconMap as PortalIconMap } from './svgs/portal';
import { IconMap as RecordingIconMap } from './svgs/recording';
import { IconMap as ShareIconMap } from './svgs/share';
import { IconMap as VideoIconMap } from './svgs/video';

import { ReactComponent as IconLt } from './svgs/icon-lt.svg';
import { ReactComponent as IconSubtitle } from './svgs/icon-subtitles.svg';
import { ReactComponent as IconLeave } from './svgs/icon-leave.svg';
import { ReactComponent as IconLiveStream } from './svgs/icon-live-stream.svg';
import { ReactComponent as IconLive } from './svgs/icon-live.svg';
import { ReactComponent as IconMove } from './svgs/icon-move.svg';
import { ReactComponent as IconReconnect } from './svgs/icon-reconnect.svg';
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
import { ReactComponent as IconStatistic } from './svgs/video/icon-statistic.svg';
import { ReactComponent as IconChannel } from './svgs/icon-channel.svg';
import { ReactComponent as IconWhiteboard } from './svgs/icon-whiteboard.svg';
import { ReactComponent as IconRTMS } from './svgs/icon-rtms.svg';
import { ReactComponent as IconRTMSAnimated } from './svgs/icon-rtms-animated.svg';
const iconComponentMap: { [key: string]: any } = {
  ...AnnotationIconMap,
  ...AudioIconMap,
  ...ChatIconMap,
  ...NetworkIconMap,
  ...ParticipantIconMap,
  ...PortalIconMap,
  ...RecordingIconMap,
  ...ShareIconMap,
  ...VideoIconMap,
  'icon-lt': IconLt,
  'icon-subtitle': IconSubtitle,
  'icon-leave': IconLeave,
  'icon-live-stream': IconLiveStream,
  'icon-live': IconLive,
  'icon-move': IconMove,
  'icon-reconnect': IconReconnect,
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
  'icon-audio-no-devices': IconAudioNoDevices,
  'icon-channel': IconChannel,
  'icon-statistic': IconStatistic,
  'icon-whiteboard': IconWhiteboard,
  'icon-rtms': IconRTMS,
  'icon-rtms-animated': IconRTMSAnimated
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
export { AudoiAnimationIcon } from './svgs/audio';
