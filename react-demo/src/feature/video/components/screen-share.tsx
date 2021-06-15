import React from 'react';
import { Button, Tooltip } from 'antd';
import classNames from 'classnames';
import { IconFont } from '../../../component/icon-font';
import './screen-share.scss';
interface ScreenShareButtonProps {
  isStartedScreenShare: boolean;
  onScreenShareClick: () => void;
}
const ScreenShareButton = (props: ScreenShareButtonProps) => {
  const { isStartedScreenShare, onScreenShareClick } = props;
  return (
    <Tooltip
      title={isStartedScreenShare ? 'stop screen share' : 'start screen share'}
    >
      <Button
        className={classNames('screen-share-button', {
          'started-share': isStartedScreenShare,
        })}
        icon={<IconFont type="icon-share" />}
        // eslint-disable-next-line react/jsx-boolean-value
        ghost={true}
        shape="circle"
        size="large"
        onClick={onScreenShareClick}
      />
    </Tooltip>
  );
};

export default ScreenShareButton;
