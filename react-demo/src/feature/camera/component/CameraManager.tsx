import './CameraManager.scss';

import { useEffect, useState } from 'react';
import VideoCapture from './VideoCapture';
import { CloseOutlined } from '@ant-design/icons';

const constraints: MediaStreamConstraints = {
  video: {
    facingMode: 'environment',
    width: 1280,
    height: 960,
    frameRate: 15
  },
  audio: false
};

interface CameraManagerProps {
  onSubmit: (imgSrc: string) => Promise<void>;
  onClose: () => void;
}

const CameraManager = (props: CameraManagerProps) => {
  const { onSubmit, onClose } = props;

  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!mediaStream) {
      navigator.mediaDevices.getUserMedia(constraints).then(setMediaStream);
    }
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
      }
    };
  }, [mediaStream]);

  const handleCapture = async (imageSrc: string) => {
    if (imageSrc) {
      setImgSrc(imageSrc);
    }
  }

  return (
    <div className="CameraManager">
      <div className="CameraManager__close">
        <CloseOutlined style={{ fontSize: '26px', color: '#fff' }} onClick={onClose} />
      </div>
      {mediaStream && <VideoCapture mediaStream={mediaStream} onCapture={handleCapture} />}
    </div>
  );
}
export default CameraManager;
