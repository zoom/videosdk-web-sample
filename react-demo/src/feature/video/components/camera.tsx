import React from 'react';
import { Button, Tooltip } from 'antd';
import { VideoCameraAddOutlined, VideoCameraOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import './camera.scss';
interface CameraButtonProps {
  isStartedVideo: boolean;
  onCameraClick: () => void;
  className?: string;
}
const CameraButton = (props: CameraButtonProps) => {
  const { isStartedVideo, onCameraClick, className } = props;
  return (
    <Tooltip title={`${isStartedVideo ? 'stop camera' : 'start camera'}`}>
      <Button
        className={classNames('camere-button', className)}
        icon={isStartedVideo ? <VideoCameraOutlined /> : <VideoCameraAddOutlined />}
        // eslint-disable-next-line react/jsx-boolean-value
        ghost={true}
        shape="circle"
        size="large"
        onClick={onCameraClick}
      />
    </Tooltip>
  );
};
export default CameraButton;
