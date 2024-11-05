/* eslint-disable @typescript-eslint/member-ordering */
import { Modal, Menu } from 'antd';
import { useRef, useCallback, useContext, useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import classNames from 'classnames';
import { useDebounceFn, usePrevious } from '../../../hooks';
import ZoomMediaContext from '../../../context/media-context';
import './video-mask-modal.scss';
import { MediaStream } from '../../../index-types';
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';

const { Item: MenuItem } = Menu;

interface MaskClip {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MaskOption {
  imageUrl?: string | null;
  cropped?: boolean;
  rootWidth?: number;
  rootHeight?: number;
  clip?: MaskClip | Array<MaskClip>;
}

class FaceDetectionMask {
  private detector: FaceDetector | null = null;
  private video: HTMLVideoElement;
  private stream: MediaStream; // Replace with proper Zoom Video SDK type
  private background: string;

  constructor(videoElement: HTMLVideoElement, zoomVideo: MediaStream) {
    this.video = videoElement;
    this.stream = zoomVideo;
    this.initializeFaceDetector();
    this.background = '';
  }

  private async initializeFaceDetector() {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );

    this.detector = await FaceDetector.createFromModelPath(
      vision,
      'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite'
    );
  }

  private async detectFaces(video: HTMLVideoElement) {
    if (!this.detector) return null;
    const detections = await this.detector.detect(this.video);

    return detections;
  }

  private calculateMaskClips(faces: any): MaskClip[] {
    return faces.detections.map((face: any) => {
      const bbox = face.boundingBox;
      return {
        x: bbox.originX,
        y: bbox.originY,
        width: bbox.width,
        height: bbox.height
      };
    });
  }

  public updateBackground(background: string) {
    this.background = background;
  }

  public async processVideoFrame() {
    // Detect faces in the current video frame
    const faces = await this.detectFaces(this.video);
    const facesTemplateData = {
      detections: [
        {
          categories: [
            {
              score: 0.9358954429626465,
              index: 0,
              categoryName: '',
              displayName: ''
            }
          ],
          keypoints: [
            {
              x: 0.44195789098739624,
              y: 0.616001307964325,
              score: 0,
              label: ''
            },
            {
              x: 0.5032268762588501,
              y: 0.6369319558143616,
              score: 0,
              label: ''
            },
            {
              x: 0.5135393142700195,
              y: 0.6818786263465881,
              score: 0,
              label: ''
            },
            {
              x: 0.48947715759277344,
              y: 0.7754283547401428,
              score: 0,
              label: ''
            },
            {
              x: 0.31704455614089966,
              y: 0.6831821799278259,
              score: 0,
              label: ''
            },
            {
              x: 0.4669908583164215,
              y: 0.7047871947288513,
              score: 0,
              label: ''
            }
          ],
          boundingBox: {
            originX: 204,
            originY: 199,
            width: 125,
            height: 125,
            angle: 0
          }
        }
      ]
    };
    if (faces && faces.detections.length > 0) {
      // Calculate mask clips based on detected faces
      const clips: MaskClip[] = this.calculateMaskClips(faces);

      // Prepare mask options
      const maskOption: MaskOption = {
        imageUrl: this.background,
        // rootWidth: this.video.videoWidth,
        // rootHeight: this.video.videoHeight,
        rootWidth: 1280,
        rootHeight: 720,
        cropped: true,
        clip: clips
      };

      // Update video mask using Zoom Video SDK
      // console.log('faces', faces.detections[0].boundingBox);
      console.log('maskOption', maskOption);
      await this.stream.updateVideoMask(maskOption as any);
    }
  }

  public startProcessing(frameRate = 30) {
    // Process video frames at specified frame rate
    setInterval(() => {
      this.processVideoFrame();
    }, 1000 / frameRate);
  }

  public stopProcessing() {
    // Cleanup resources
    if (this.detector) {
      this.detector.close();
      this.detector = null;
    }
  }
}

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
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);
  const faceDetectionRef = useRef<FaceDetectionMask | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const initFaceDetection = useCallback(async () => {
    if (!videoRef.current) {
      videoRef.current = document.getElementById('ZOOM_WEB_SDK_SELF_VIDEO') as HTMLVideoElement;
    }

    if (!videoRef.current || !canvasRef.current || !mediaStream) {
      console.error('Required elements not found');
      return;
    }

    try {
      faceDetectionRef.current = new FaceDetectionMask(videoRef.current, mediaStream);

      // Start processing frames
      faceDetectionRef.current.startProcessing();
    } catch (error) {
      console.error('Failed to initialize face detection:', error);
      setIsAutoDetecting(false);
    }
  }, [mediaStream]);

  const toggleAutoDetection = useCallback(() => {
    setIsAutoDetecting((prev) => {
      const newState = !prev;
      if (newState) {
        initFaceDetection();
      } else {
        // Stop face detection when disabled
        if (faceDetectionRef.current) {
          faceDetectionRef.current.stopProcessing();
          faceDetectionRef.current = null;
        }
      }
      return newState;
    });
  }, [initFaceDetection]);

  useEffect(() => {
    if (!visible && faceDetectionRef.current) {
      faceDetectionRef.current.stopProcessing();
      faceDetectionRef.current = null;
      setIsAutoDetecting(false);
    }
  }, [visible]);

  const onCloseVideoPreview = useCallback(() => {
    if (faceDetectionRef.current) {
      faceDetectionRef.current.stopProcessing();
      faceDetectionRef.current = null;
    }
    mediaStream?.stopPreviewVideoMask();
    setVisible(false);
    setIsConfiged(false);
    setIsAutoDetecting(false);
  }, [mediaStream, setVisible]);

  useEffect(() => {
    if (visible) {
      const bg = maskBackgroundList.find((item) => item.key === background)?.url ?? null;
      if (bg) faceDetectionRef.current?.updateBackground(bg);
      else faceDetectionRef.current?.updateBackground('');
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
            defaultPosition={clipPos}
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
