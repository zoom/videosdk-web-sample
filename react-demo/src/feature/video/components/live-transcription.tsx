import React from 'react';
import { Button, Tooltip } from 'antd';
import classNames from 'classnames';
import { IconFont } from '../../../component/icon-font';
import './live-transcription.scss';
interface LiveTranscriptionButtonProps {
  isStartedLiveTranscription: boolean;
  onLiveTranscriptionClick: () => void;
}

interface LiveTranscriptionLockButtonProps {
  isLockedLiveTranscription: boolean;
  onLiveTranscriptionLockClick: () => void;
}

const LiveTranscriptionButton = (props: LiveTranscriptionButtonProps) => {
  const { isStartedLiveTranscription, onLiveTranscriptionClick } = props;
  return (
    <Button
      className={classNames('vc-button', {
        'started-transcription': isStartedLiveTranscription
      })}
      icon={<IconFont type="icon-subtitle" />}
      // eslint-disable-next-line react/jsx-boolean-value
      ghost={true}
      shape="circle"
      size="large"
      onClick={onLiveTranscriptionClick}
    />
  );
};

export { LiveTranscriptionButton };
