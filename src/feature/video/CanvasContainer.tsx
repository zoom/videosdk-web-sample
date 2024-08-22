interface Props {
  videoWrapperRef: React.MutableRefObject<HTMLDivElement | null>;
  videoRef: React.MutableRefObject<HTMLCanvasElement | null>;
}

export const CanvasContainer = ({ videoWrapperRef, videoRef }: Props) => {
  return (
    <div className="video-canvas-wrapper" ref={videoWrapperRef}>
      <canvas className="video-canvas" id="video-canvas" width="800" height="600" ref={videoRef} />
    </div>
  );
};
