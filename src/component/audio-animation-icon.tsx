import Icon from '@ant-design/icons';
import { useState, useCallback, useRef } from 'react';
import { ReactComponent as AudioPlayingStep1 } from './svgs/audio-animate/audio_playing_step1.svg';
import { ReactComponent as AudioPlayingStep2 } from './svgs/audio-animate/audio_playing_step2.svg';
import { ReactComponent as AudioPlayingStep3 } from './svgs/audio-animate/audio_playing_step3.svg';
import { ReactComponent as AudioPlayingStep4 } from './svgs/audio-animate/audio_playing_step4.svg';
import { ReactComponent as AudioPlayingStep5 } from './svgs/audio-animate/audio_playing_step5.svg';
import { ReactComponent as AudioPlayingStep6 } from './svgs/audio-animate/audio_playing_step6.svg';
import { ReactComponent as AudioPlayingStep7 } from './svgs/audio-animate/audio_playing_step7.svg';
import { ReactComponent as AudioPlayingStep8 } from './svgs/audio-animate/audio_playing_step8.svg';
import { ReactComponent as AudioPlayingStep9 } from './svgs/audio-animate/audio_playing_step9.svg';
import { useAnimationFrame } from '../hooks/useAnimationFrame';
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
  const [step, setStep] = useState({ value: 1, ascending: true });
  const stopRef = useRef(0);
  const maxStep = level || 9;
  const rafCallback = useCallback(() => {
    if (stopRef.current === 0) {
      setStep((step) => {
        if (step.value === maxStep) {
          return {
            value: step.value - 1,
            ascending: false
          };
        } else if (step.value === 1) {
          return {
            value: step.value + 1,
            ascending: true
          };
        } else {
          return {
            value: step.ascending ? step.value + 1 : step.value - 1,
            ascending: step.ascending
          };
        }
      });
      stopRef.current = 6;
    } else {
      stopRef.current = stopRef.current - 1;
    }
  }, [maxStep]);
  useAnimationFrame(rafCallback);
  return (
    <Icon
      className={className}
      component={audioPlayingStepMap[`icon-audio-playing-step${step.value}`]}
      viewBox="0 0 24 24"
      style={{ ...(style || {}) }}
    />
  );
};
