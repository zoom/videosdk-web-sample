import { createPortal } from 'react-dom';
import { usePiPContext } from './context/PiPContext';
import { VideoSingleView } from './VideoSingleView';
import { useRef } from 'react';

export const VideoSinglePiP = () => {
  const { pipWindow } = usePiPContext();

  if (!pipWindow) {
    return null;
  }

  return createPortal(<VideoSinglePiPLayout />, pipWindow.document.body);
};

const VideoSinglePiPLayout = () => {
  const videoWrapperRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLCanvasElement | null>(null);

  return (
    <div className="viewport">
      <VideoSingleView videoWrapperRef={videoWrapperRef} videoRef={videoRef} isRecieveSharing={false} />;
    </div>
  );
};
