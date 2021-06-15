/* eslint-disable no-nested-ternary */
import React from 'react';
import { Button, Tooltip } from 'antd';
import classNames from 'classnames';
import { AudioOutlined, AudioMutedOutlined } from '@ant-design/icons';
import { IconFont } from '../../../component/icon-font';
import './microphone.scss';
interface MicrophoneButtonProps {
  isStartedAudio: boolean;
  isMuted: boolean;
  onMicrophoneClick: () => void;
  className?: string;
}
const MicrophoneButton = (props: MicrophoneButtonProps) => {
  const { isStartedAudio, isMuted, onMicrophoneClick, className } = props;
  const tooltipText = isStartedAudio ? (isMuted ? 'unmute' : 'mute') : 'start audio';
  return (
    <Tooltip title={tooltipText}>
      <Button
        className={classNames('microphone-button', className)}
        icon={
          isStartedAudio ? (
            isMuted ? (
              <AudioMutedOutlined />
            ) : (
              <AudioOutlined />
            )
          ) : (
            <IconFont type="icon-headset" />
          )
        }
        ghost
        shape="circle"
        size="large"
        onClick={onMicrophoneClick}
      />
    </Tooltip>
  );
};

export default MicrophoneButton;
