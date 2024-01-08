import Draggable from 'react-draggable';
import { Button, Popconfirm, Dropdown } from 'antd';
import classNames from 'classnames';
import { useState, useEffect, useContext, useCallback, useRef, forwardRef } from 'react';
import { SmallDashOutlined, CheckOutlined } from '@ant-design/icons';
import { IconFont } from '../../../component/icon-font';
import ZoomMediaContext from '../../../context/media-context';
import ZoomContext from '../../../context/zoom-context';
import { ShareStatus } from '@zoom/videosdk';
import { SHARE_CANVAS_ID } from '../video-constants';
import { getAntdDropdownMenu, getAntdItem } from './video-footer-utils';
import './share-bar.scss';
import { Participant } from '../../../index-types';

const { Button: DropdownButton } = Dropdown;
interface ShareBarProps {
  className?: string;
  controllingUser?: { userId: number; displayName: string } | null;
}

const ShareBar = forwardRef((props: ShareBarProps, ref: any) => {
  const { controllingUser } = props;
  const { mediaStream } = useContext(ZoomMediaContext);
  const zmClient = useContext(ZoomContext);
  const [status, setStatus] = useState<ShareStatus | undefined>(mediaStream?.getShareStatus());
  const [hideShareAudioTooltip, setHideShareAudioTooltip] = useState(false);
  const [shareAudioStatus, setShareAudioStatus] = useState(mediaStream?.getShareAudioStatus());
  const [isVideoShare, setIsVideoShare] = useState(mediaStream?.isOptimizeForSharedVideoEnabled());
  const draggableRef = useRef<HTMLDivElement>(null);
  const onShareAudioChange = useCallback(() => {
    setShareAudioStatus(mediaStream?.getShareAudioStatus());
  }, [mediaStream]);
  const onShareAudioClick = useCallback(() => {
    if (shareAudioStatus?.isShareAudioEnabled) {
      if (shareAudioStatus.isShareAudioMuted) {
        mediaStream?.unmuteShareAudio();
      } else {
        mediaStream?.muteShareAudio();
      }
    }
  }, [mediaStream, shareAudioStatus]);

  const onSharePauseClick = useCallback(() => {
    if (status === ShareStatus.Paused) {
      mediaStream?.resumeShareScreen();
    } else if (status === ShareStatus.Sharing) {
      mediaStream?.pauseShareScreen();
    }
  }, [mediaStream, status]);
  const onShareStatusChange = useCallback(() => {
    if (status !== mediaStream?.getShareStatus()) {
      setStatus(mediaStream?.getShareStatus());
    }
  }, [status, mediaStream]);
  useEffect(() => {
    zmClient.on('share-audio-change', onShareAudioChange);
    zmClient.on('user-updated', onShareStatusChange);
    return () => {
      zmClient.off('share-audio-change', onShareAudioChange);
      zmClient.off('user-updated', onShareStatusChange);
    };
  }, [zmClient, onShareAudioChange, onShareStatusChange]);
  const menuItems = [];
  if (mediaStream?.isSupportOptimizedForSharedVideo()) {
    menuItems.push(getAntdItem('Optimize for video clip', 'video share', isVideoShare && <CheckOutlined />));
  }
  if (controllingUser) {
    menuItems.push(getAntdItem('Stop remote control', 'stop control'));
  }
  const onMenuClick = useCallback(
    (payload: { key: string }) => {
      const { key } = payload;
      if (key === 'video share') {
        mediaStream?.enableOptimizeForSharedVideo(!isVideoShare);
        setIsVideoShare(!isVideoShare);
      } else if (key === 'stop control') {
        mediaStream?.stopRemoteControl();
      }
    },
    [mediaStream, isVideoShare]
  );
  return (
    <div className={classNames({ 'share-bar-hide': status === ShareStatus.End })}>
      (
      <Draggable handle=".share-bar-move" nodeRef={draggableRef}>
        <div className="screen-share-control-bar" ref={draggableRef}>
          <Button className="share-bar-move" ghost icon={<IconFont type="icon-move" />} />
          <div className="share-bar-tip">
            {status === ShareStatus.Sharing ? "You're sharing the screen" : 'Your screen sharing is paused'}
          </div>
          {mediaStream?.isStartShareScreenWithVideoElement() ? (
            <video id={SHARE_CANVAS_ID} className="share-bar-canvas" ref={ref} />
          ) : (
            <canvas id={SHARE_CANVAS_ID} className="share-bar-canvas" ref={ref} />
          )}
          {shareAudioStatus?.isShareAudioEnabled && (
            <Popconfirm
              title="Your microphone is disabled when sharing computer audio. When you pause or stop sharing audio, your microphone will be reactivated."
              disabled={mediaStream?.isSupportMicrophoneAndShareAudioSimultaneously() || hideShareAudioTooltip}
              showCancel={false}
              okText="Got it"
              okType="link"
              onConfirm={() => setHideShareAudioTooltip(true)}
            >
              <Button
                icon={<IconFont type={shareAudioStatus.isShareAudioMuted ? 'icon-audio-off' : 'icon-audio-on'} />}
                className="share-bar-btn"
                ghost
                onClick={onShareAudioClick}
              />
            </Popconfirm>
          )}
          <Button
            icon={<IconFont type={status === ShareStatus.Paused ? 'icon-resume' : 'icon-pause'} />}
            className="share-bar-btn"
            ghost
            onClick={onSharePauseClick}
          />
          <Button
            icon={<IconFont type="icon-stop" />}
            className="share-bar-btn"
            type="primary"
            danger
            onClick={() => {
              mediaStream?.stopShareScreen();
            }}
          >
            Stop Share
          </Button>
          {menuItems.length > 0 && (
            <DropdownButton
              className={classNames('share-bar-btn', 'share-bar-more')}
              size="small"
              menu={getAntdDropdownMenu(menuItems, onMenuClick, 'share-dropdown-menu')}
              trigger={['click']}
              type="ghost"
              icon={<SmallDashOutlined />}
              placement="bottomRight"
            />
          )}
        </div>
      </Draggable>
      )
    </div>
  );
});

export default ShareBar;
