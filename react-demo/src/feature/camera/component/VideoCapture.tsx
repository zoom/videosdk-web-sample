import './VideoCapture.scss';

import { useRef, useEffect } from 'react';

interface Props {
  mediaStream: MediaStream;
  onCapture: (base64Image: string) => void;
}

const VideoCapture = ({ mediaStream, onCapture }: Props) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement) {
      videoElement.srcObject = mediaStream;
    }
  }, [mediaStream]);

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const base64Image = canvas.toDataURL('image/jpeg');
    onCapture(base64Image);
  };

  return (
    <div className="VideoCapture">
      <div className="VideoCapture__inner">
        <video ref={videoRef} autoPlay playsInline muted className="VideoCapture__video" />
        <canvas ref={canvasRef} className="VideoCapture__canvas" />
        <button
          onClick={(event: any) => {
            event.preventDefault();
            captureFrame();
          }}
        />
      </div>
    </div>
  );
};

export default VideoCapture;
