import Draggable from 'react-draggable';
import { Button, Popconfirm, Dropdown } from 'antd';
import classNames from 'classnames';
import { useState, useEffect, useContext, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { SmallDashOutlined, CheckOutlined } from '@ant-design/icons';
import { IconFont } from '../../../../component/icon-font';
import ZoomMediaContext from '../../../../context/media-context';
import ZoomContext from '../../../../context/zoom-context';
import { ShareStatus } from '@zoom/videosdk';
import { getAntdDropdownMenu, getAntdItem } from '../video-footer-utils';
import './share-bar.scss';
import { SHARE_CANVAS_ID } from '../../video-constants';

const { Button: DropdownButton } = Dropdown;
interface ShareBarProps {
  className?: string;
  shareStatus?: ShareStatus;
  controllingUser?: { userId: number; displayName: string } | null;
}

const ShareBar = forwardRef((props: ShareBarProps, ref: any) => {
  const { controllingUser, shareStatus } = props;
  const { mediaStream } = useContext(ZoomMediaContext);
  const zmClient = useContext(ZoomContext);
  const [hideShareAudioTooltip, setHideShareAudioTooltip] = useState(false);
  const [shareAudioStatus, setShareAudioStatus] = useState(mediaStream?.getShareAudioStatus());
  const [isVideoShare, setIsVideoShare] = useState(mediaStream?.isOptimizeForSharedVideoEnabled());
  const draggableRef = useRef<HTMLDivElement>(null);
  const sharePreviewRef = useRef<HTMLVideoElement>(null);
  const onShareAudioChange = useCallback(() => {
    setShareAudioStatus(mediaStream?.getShareAudioStatus());
  }, [mediaStream]);
  const onShareAudioClick = useCallback(() => {
    if (shareAudioStatus?.isShareAudioEnabled) {
      if (shareAudioStatus.isShareAudioMuted) {
        mediaStream?.unmuteShareAudio().then(() => {
          setShareAudioStatus(mediaStream?.getShareAudioStatus());
        });
      } else {
        mediaStream?.muteShareAudio().then(() => {
          setShareAudioStatus(mediaStream?.getShareAudioStatus());
        });
      }
    }
  }, [mediaStream, shareAudioStatus]);

  const onSharePauseClick = useCallback(() => {
    if (shareStatus === ShareStatus.Paused) {
      mediaStream?.resumeShareScreen();
    } else if (shareStatus === ShareStatus.Sharing) {
      mediaStream?.pauseShareScreen();
    }
  }, [mediaStream, shareStatus]);
  useEffect(() => {
    zmClient.on('share-audio-change', onShareAudioChange);
    return () => {
      zmClient.off('share-audio-change', onShareAudioChange);
    };
  }, [zmClient, onShareAudioChange]);
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
  useEffect(() => {
    const sharePreview = sharePreviewRef.current;
    if (!sharePreview) return;

    // Clear stream when sharing ends
    if (shareStatus === ShareStatus.End) {
      if (sharePreview.srcObject) {
        const stream = sharePreview.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        sharePreview.srcObject = null;
      }
      return;
    }

    // Set up preview stream when sharing is active
    const setupPreviewStream = () => {
      const selfShareView = document.querySelector(`#${SHARE_CANVAS_ID}`) as HTMLCanvasElement | HTMLVideoElement;

      if (!selfShareView || sharePreview.srcObject) return;

      try {
        if (selfShareView instanceof HTMLVideoElement) {
          // Reuse video element's stream
          const stream = selfShareView.srcObject as MediaStream;
          if (stream) {
            sharePreview.srcObject = stream;
          }
        } else if (selfShareView instanceof HTMLCanvasElement) {
          // Capture canvas stream
          if ('captureStream' in selfShareView) {
            const stream = selfShareView.captureStream();
            sharePreview.srcObject = stream;
          } else if ('mozCaptureStream' in selfShareView) {
            // Firefox fallback
            const stream = (selfShareView as any).mozCaptureStream();
            sharePreview.srcObject = stream;
          }
        }
      } catch (error) {
        // Failed to set up share preview stream
      }
    };

    // Use requestAnimationFrame to ensure DOM is ready
    const rafId = requestAnimationFrame(setupPreviewStream);

    return () => {
      cancelAnimationFrame(rafId);
      // Clean up stream when effect re-runs
      if (sharePreview.srcObject) {
        const stream = sharePreview.srcObject as MediaStream;
        // Only stop tracks from captureStream, not from shared video srcObject
        if (stream && stream.getTracks()[0]?.label?.includes('canvas')) {
          stream.getTracks().forEach((track) => track.stop());
        }
      }
    };
  }, [shareStatus]);
  useImperativeHandle(ref, () => {
    return sharePreviewRef.current;
  }, []);
  return (
    <div className={classNames({ 'share-bar-hide': shareStatus === ShareStatus.End })}>
      <Draggable handle=".share-bar-move" nodeRef={draggableRef}>
        <div className="screen-share-control-bar" ref={draggableRef}>
          <Button className="share-bar-move" ghost icon={<IconFont type="icon-move" />} />
          <div className="share-bar-tip">
            {shareStatus === ShareStatus.Sharing ? "You're sharing the screen" : 'Your screen sharing is paused'}
          </div>
          <video className="share-bar-canvas" ref={sharePreviewRef} playsInline autoPlay muted />
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
            icon={<IconFont type={shareStatus === ShareStatus.Paused ? 'icon-resume' : 'icon-pause'} />}
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
    </div>
  );
});

export default ShareBar;
