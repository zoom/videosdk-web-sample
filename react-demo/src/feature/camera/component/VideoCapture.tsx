import './VideoCapture.scss';

import { useEffect } from 'react';
import { captureElementScreenshot } from 'video-canvas-screenshot';
import { SELF_VIDEO_ID } from '../../video/video-constants';

interface Props {
  onCapture: (base64Image: string) => void;
}

const VideoCapture = ({ onCapture }: Props) => {
  useEffect(() => {
    const originalParent = document.getElementById('original-parent');
    const originalCanvas = document.getElementById(SELF_VIDEO_ID);
    const destination = document.querySelector('.VideoCapture__inner');
    if (originalCanvas && destination && originalParent) {
      destination.appendChild(originalCanvas);
      return () => {
        originalParent.appendChild(originalCanvas);
      };
    }
  }, []);

  const captureFrame = () => {
    const canvasElement = document.getElementById(SELF_VIDEO_ID) as HTMLCanvasElement | null;
    if (!canvasElement) return;
    captureElementScreenshot(canvasElement, onCapture);
  };

  return (
    <div className="VideoCapture">
      <div className="VideoCapture__inner">
        <button onClick={captureFrame} />
      </div>
    </div>
  );
};

export default VideoCapture;
