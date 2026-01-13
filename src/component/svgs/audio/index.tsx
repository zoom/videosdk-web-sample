import Icon from '@ant-design/icons';
import { ReactComponent as AudioPlayingStep1 } from './audio-volume-level1.svg';
import { ReactComponent as AudioPlayingStep2 } from './audio-volume-level2.svg';
import { ReactComponent as AudioPlayingStep3 } from './audio-volume-level3.svg';
import { ReactComponent as AudioPlayingStep4 } from './audio-volume-level4.svg';
import { ReactComponent as AudioPlayingStep5 } from './audio-volume-level5.svg';
import { ReactComponent as AudioPlayingStep6 } from './audio-volume-level6.svg';
import { ReactComponent as AudioPlayingStep7 } from './audio-volume-level7.svg';
import { ReactComponent as AudioPlayingStep8 } from './audio-volume-level8.svg';
import { ReactComponent as AudioPlayingStep9 } from './audio-volume-level9.svg';

import { ReactComponent as IconHeadset } from './icon-headset.svg';
import { ReactComponent as IconAudioMuted } from './audio-muted.svg';
import { ReactComponent as IconAudioUnmuted } from './audio-unmuted.svg';
import { ReactComponent as IconAudioDisallow } from './audio-disallow.svg';
import { ReactComponent as IconAudioNoDevices } from './audio-no-devices.svg';
import { ReactComponent as IconPhone } from './icon-phone.svg';
import { ReactComponent as IconPhoneOff } from './icon-phone-off.svg';
import { ReactComponent as IconAudioOn } from './icon-audio-on.svg';
import { ReactComponent as IconAudioOff } from './icon-audio-off.svg';
interface IconFontProps {
  className?: string;
  style?: object;
  level?: number;
}

const audioPlayingStepMap: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  'icon-audio-playing-step1': AudioPlayingStep1,
  'icon-audio-playing-step2': AudioPlayingStep2,
  'icon-audio-playing-step3': AudioPlayingStep3,
  'icon-audio-playing-step4': AudioPlayingStep4,
  'icon-audio-playing-step5': AudioPlayingStep5,
  'icon-audio-playing-step6': AudioPlayingStep6,
  'icon-audio-playing-step7': AudioPlayingStep7,
  'icon-audio-playing-step8': AudioPlayingStep8,
  'icon-audio-playing-step9': AudioPlayingStep9
};
export const AudoiAnimationIcon = (props: IconFontProps) => {
  const { className, style, level } = props;
  const sStyle: React.CSSProperties = { pointerEvents: 'none' };
  if (style) {
    Object.assign(sStyle, style);
  }
  return (
    <Icon
      className={className}
      component={audioPlayingStepMap[`icon-audio-playing-step${level}`]}
      viewBox="0 0 24 24"
      style={sStyle}
    />
  );
};

export const IconMap = {
  'icon-headset': IconHeadset,
  'icon-audio-muted': IconAudioMuted,
  'icon-audio-unmuted': IconAudioUnmuted,
  'icon-audio-disallow': IconAudioDisallow,
  'icon-audio-no-devices': IconAudioNoDevices,
  'icon-phone': IconPhone,
  'icon-phone-off': IconPhoneOff,
  'icon-audio-on': IconAudioOn,
  'icon-audio-off': IconAudioOff
};
