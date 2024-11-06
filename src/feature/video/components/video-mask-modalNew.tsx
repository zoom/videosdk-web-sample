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

    const runningMode = 'IMAGE';
    this.detector = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
        delegate: 'GPU'
      },
      runningMode
    });
  }

  private async detectFaces(video: HTMLVideoElement) {
    if (!this.detector) return null;
    const detections = await this.detector.detect(this.video).detections;
    const res: any[] = [];
    if (detections.length <= 2) {
      for (let detection of detections) {
        // Destructure keypoints from detection
        // left eye, right eye, nose tip, mouth, left eye tragion, and right eye tragion.
        const [leftEye, rightEye, noseTip, mouth, leftEyeTragion, rightEyeTragion] = detection.keypoints;
        const { boundingBox } = detection;

        // console.log('boundingBox', boundingBox);

        // // Calculate the center point between the eyes
        const centerEyes = {
          x: (rightEye.x + leftEye.x) / 2,
          y: (rightEye.y + leftEye.y) / 2
        };

        // Calculate the angle of the line between the eyes relative to horizontal
        const angle = Math.atan2(centerEyes.y - rightEye.y, centerEyes.x - rightEye.x);

        // Calculate the center of the face using eyes and nose
        const centerFace = {
          x: (centerEyes.x + noseTip.x) / 2,
          y: (centerEyes.y + noseTip.y) / 2
        };

        // Push measurements to results array
        if (boundingBox?.width && boundingBox?.height) {
          res.push({
            x: centerFace.x * this.video.width,
            y: centerFace.y * this.video.height,
            rx: boundingBox?.width / 2,
            ry: boundingBox?.height / 1.5,
            angle: angle * (180 / Math.PI) // Convert radians to degrees
          });
        }
      }
    }

    return res;
  }

  private calculateMaskClips(faces: any): MaskClip[] {
    const clips: MaskClip[] = [];
    for (let face of faces) {
      const { x: dX, y: dY, rx: dRx, ry: dRy, angle } = face;
      let start = Date.now();

      // Calculate maximum radius to accommodate rotated ellipse
      const maxRadius = Math.max(dRx, dRy);

      // Create SVG string with template literals
      const ellipseSVG = `
<svg width="${maxRadius * 2}" height="${maxRadius * 2}" xmlns="http://www.w3.org/2000/svg">
  <ellipse 
    rx="${dRx}" 
    ry="${dRy}" 
    cx="${maxRadius}" 
    cy="${maxRadius}" 
    fill="red" 
    transform="rotate(${angle} ${maxRadius} ${maxRadius})" 
  />
</svg>`;

      // Create blob and URL
      const blob = new Blob([ellipseSVG], {
        type: 'image/svg+xml'
      });
      const ellipseURL = URL.createObjectURL(blob);

      // Calculate position
      const x = dX - maxRadius;
      const y = dY - maxRadius;

      let end = Date.now();
      console.log(`ZoomService: Prepare SVG execution time: ${end - start} ms`);

      clips.push({
        type: 'svg',
        x,
        y,
        width: maxRadius * 2,
        height: maxRadius * 2,
        svg: ellipseURL
      } as any);
    }

    return clips;
  }

  public updateBackground(background: string) {
    this.background = background;
  }

  public async processVideoFrame() {
    // Detect faces in the current video frame
    const faces = await this.detectFaces(this.video);

    if (faces && faces.length > 0) {
      // Calculate mask clips based on detected faces
      console.log(faces);
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
