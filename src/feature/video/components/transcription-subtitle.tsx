import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import './transcription-subtitle.scss';
interface TranscriptionSubtitleProps {
  text?: string;
}
export const TranscriptionSubtitle = (props: TranscriptionSubtitleProps) => {
  const { text } = props;
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<number>();
  useEffect(() => {
    if (text) {
      setVisible(true);
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => {
        setVisible(false);
      }, 3000);
    }
  }, [text]);
  return (
    <div className={classNames('transcript-subtitle', { 'transcript-subtitle-show': visible })}>
      <p className="transcript-subtitle-message">{text}</p>
    </div>
  );
};
