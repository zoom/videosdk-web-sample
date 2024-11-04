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

interface Detection {
  bbox: [number, number, number, number];
  class: string;
  score: number;
}

const maskBackgroundList = [
  { key: 'blur', url: `${location.origin}/blur.png` },
  { key: 'moon', url: `${location.origin}/moon.jpg` }
];

const DETECTION_INTERVAL = 100; // 10 times per second
const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const CLIP_RADIUS = 256;

export const VideoMaskModel = (props: VideoMaskModelProps) => {
  const { visible, isMirrored, setVisible } = props;
  const { mediaStream } = useContext(ZoomMediaContext);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const detectionRef = useRef<number>();

  const [clipPos, setClipPos] = useState({ x: 0, y: 0 });
  const [background, setBackground] = useState('blur');
  const [isConfiged, setIsConfiged] = useState(false);
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);

  const previousBackground = usePrevious(background);
  const previousClipPos = usePrevious(clipPos);

  // Setup face detection
  const setupFaceDetection = useCallback(async () => {
    if (!(window as any).cocoSsd) {
      console.error('COCO-SSD model not loaded');
      return;
    }
    try {
      const model = await (window as any).cocoSsd.load();
      videoRef.current = document.getElementById('ZOOM_WEB_SDK_SELF_VIDEO') as HTMLVideoElement;

      if (!videoRef.current) {
        console.error('Video element not found');
        return;
      }

      const detectFrame = async () => {
        if (!videoRef.current || !visible || !isAutoDetecting) return;

        try {
          const predictions = await model.detect(videoRef.current);
          const person = predictions.find((p: any) => p.class === 'person');

          if (person) {
            // Convert detection bbox to mask position
            const [x, y, width, height] = person.bbox;
            console.log(person.bbox);
            const scale = 32 / 13;

            // Center the mask on the detected face
            const centerX = x + width / 2;
            const centerY = y + height / 3; // Adjust to focus more on face than body

            // Scale and offset the position
            let adjustedX = centerX * scale - CLIP_RADIUS;
            const adjustedY = centerY * scale - CLIP_RADIUS;

            // Handle mirroring
            if (isMirrored) {
              adjustedX = CANVAS_WIDTH - adjustedX - CLIP_RADIUS * 2;
            }

            setClipPos({
              x: adjustedX / scale,
              y: adjustedY / scale
            });
          }
        } catch (error) {
          console.error('Detection error:', error);
        }

        // Schedule next detection
        detectionRef.current = window.setTimeout(detectFrame, DETECTION_INTERVAL);
      };

      detectFrame();
    } catch (error) {
      console.error('Failed to load COCO-SSD model:', error);
    }
  }, [visible, isMirrored, isAutoDetecting]);

  // Handle auto-detection toggle
  const toggleAutoDetection = useCallback(() => {
    setIsAutoDetecting((prev) => !prev);
  }, []);

  // Cleanup detection on unmount or visibility change
  useEffect(() => {
    if (!visible || !isAutoDetecting) {
      if (detectionRef.current) {
        clearTimeout(detectionRef.current);
      }
    } else {
      setupFaceDetection();
    }

    return () => {
      if (detectionRef.current) {
        clearTimeout(detectionRef.current);
      }
    };
  }, [visible, isAutoDetecting, setupFaceDetection]);

  const onClipDrag = useDebounceFn((_event: any, data: any) => {
    if (!isAutoDetecting) {
      const { x, y } = data;
      setClipPos({ x, y });
    }
  }, 50).run;

  const onBackgroundClick = useCallback(({ key }: any) => {
    setBackground(key);
  }, []);

  const onCloseVideoPreview = useCallback(() => {
    mediaStream?.stopPreviewVideoMask();
    setVisible(false);
    setIsConfiged(false);
    setIsAutoDetecting(false);
  }, [mediaStream, setVisible]);

  useEffect(() => {
    if (visible) {
      const bg = maskBackgroundList.find((item) => item.key === background)?.url ?? null;
      const scale = 32 / 13;
      let x = Math.floor(clipPos.x * scale) + CLIP_RADIUS;
      if (isMirrored) {
        x = CANVAS_WIDTH - x;
      }
      const y = Math.floor(clipPos.y * scale) + CLIP_RADIUS;

      const mask = {
        imageUrl: bg,
        cropped: true,
        rootWidth: CANVAS_WIDTH,
        rootHeight: CANVAS_HEIGHT,
        clip: [
          {
            type: 'circle',
            radius: CLIP_RADIUS,
            x,
            y
          }
        ]
      };

      if (canvasRef.current) {
        if (isConfiged) {
          if (background !== previousBackground || clipPos !== previousClipPos)
            mediaStream?.updateVideoMask(mask as any);
          console.log('updateVideoMask');
        } else {
          if (bg !== undefined) {
            mediaStream?.previewVideoMask(canvasRef.current, mask as any);
            setIsConfiged(true);
          }
        }
      }
    }
  }, [visible, mediaStream, background, clipPos, isConfiged, previousBackground, previousClipPos, isMirrored]);

  const maskStyle = {
    position: 'absolute',
    width: '180px', // Adjusted from default size
    height: '220px', // Adjusted for better face proportions
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    border: '2px solid white',
    borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', // Modified to better match face shape
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none'
    // existing styles...
  };

  return (
    <Modal
      open={visible}
      className="video-mask-setting-dialog"
      title="Video Mask Setting"
      footer={null}
      closable
      onCancel={onCloseVideoPreview}
      width={570}
    >
      <div className="video-preview">
        <canvas className="video-preview-canvas" ref={canvasRef} />
        {background !== 'none' && (
          <Draggable
            nodeRef={clipRef}
            bounds="parent"
            onDrag={onClipDrag}
            position={clipPos}
            disabled={isAutoDetecting}
          >
            <div className="video-clip" ref={clipRef} />
          </Draggable>
        )}
      </div>
      <div className="controls">
        <button className={classNames('auto-detect-btn', { active: isAutoDetecting })} onClick={toggleAutoDetection}>
          {isAutoDetecting ? 'Disable Auto-Detection' : 'Enable Auto-Detection'}
        </button>
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
