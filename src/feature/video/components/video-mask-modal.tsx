import { Modal, Menu } from 'antd';
import { useRef, useCallback, useContext, useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import classNames from 'classnames';
import { useDebounceFn, usePrevious } from '../../../hooks';
import ZoomMediaContext from '../../../context/media-context';
import './video-mask-modal.scss';

const { Item: MenuItem } = Menu;
interface VideoMaskModelProps {
  visible: boolean;
  isMirrored: boolean;
  setVisible: (visible: boolean) => void;
}
const maskBackgroundList = [
  { key: 'blur', url: `${location.origin}/blur.png` },
  { key: 'moon', url: `${location.origin}/moon.jpg` }
];
export const VideoMaskModel = (props: VideoMaskModelProps) => {
  const { visible, isMirrored, setVisible } = props;
  const { mediaStream } = useContext(ZoomMediaContext);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const [clipPos, setClipPos] = useState({ x: 0, y: 0 });
  const [background, setBackground] = useState('blur');
  const [isConfiged, setIsConfiged] = useState(false);
  const previousBackground = usePrevious(background);
  const previousClipPos = usePrevious(clipPos);
  const onClipDrag = useDebounceFn((_event: any, data: any) => {
    const { x, y } = data;
    setClipPos({ x, y });
  }, 50).run;
  const onBackgroundClick = useCallback(({ key }: any) => {
    setBackground(key);
  }, []);
  const onClostVideoPreview = useCallback(() => {
    mediaStream?.stopPreviewVideoMask();
    setVisible(false);
    setIsConfiged(false);
  }, [mediaStream, setVisible]);
  useEffect(() => {
    if (visible) {
      const bg = maskBackgroundList.find((item) => item.key === background)?.url ?? null;
      const scale = 32 / 13;
      let x = Math.floor(clipPos.x * scale) + 256;
      if (isMirrored) {
        x = 1280 - x;
      }
      const y = Math.floor(clipPos.y * scale) + 256;
      const mask = {
        imageUrl: bg,
        cropped: true,
        rootWidth: 1280,
        rootHeight: 720,
        clip: [
          {
            type: 'circle',
            radius: 256,
            x,
            y
          }
        ]
      };
      if (canvasRef.current) {
        if (isConfiged) {
          if (background !== previousBackground || clipPos !== previousClipPos)
            mediaStream?.updateVideoMask(mask as any);
        } else {
          if (bg !== undefined) {
            mediaStream?.previewVideoMask(canvasRef.current, mask as any);
            setIsConfiged(true);
          }
        }
      }
    }
  }, [visible, mediaStream, background, clipPos, isConfiged, previousBackground, previousClipPos, isMirrored]);
  return (
    <Modal
      open={visible}
      className="video-mask-setting-dialog"
      title="Video Mask Setting"
      footer={null}
      closable
      onCancel={onClostVideoPreview}
      width={570}
    >
      <div className="video-preview">
        <canvas className="video-preview-canvas" ref={canvasRef} />
        {background !== 'none' && (
          <Draggable nodeRef={clipRef} bounds="parent" onDrag={onClipDrag} defaultPosition={clipPos}>
            <div className="video-clip" ref={clipRef} />
          </Draggable>
        )}
      </div>
      <h3>Choose background</h3>
      <Menu className="video-background-list" onSelect={onBackgroundClick} mode="horizontal">
        <MenuItem
          className={classNames('video-background-item', { 'video-background-item__active': background === 'none' })}
          key="none"
        >
          None
        </MenuItem>
        {maskBackgroundList.map((item) => (
          <MenuItem
            className={classNames('video-background-item', {
              'video-background-item__active': background === item.key
            })}
            key={item.key}
          >
            <img src={item.url} alt="" className="video-background-item-img" />
            {item.key === 'blur' && <span style={{ color: '#999', position: 'absolute' }}>Blur</span>}
          </MenuItem>
        ))}
      </Menu>
    </Modal>
  );
};
