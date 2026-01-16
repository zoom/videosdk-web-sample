import { useRef, useContext, useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import classnames from 'classnames';
import Draggable from 'react-draggable';
import _ from 'lodash';
import { useSearchParams } from 'react-router';
import { ShareStatus, type VideoPlayer } from '@zoom/videosdk';
import ZoomContext from '../../../../context/zoom-context';
import ZoomMediaContext from '../../../../context/media-context';
import { usePrevious } from '../../../../hooks';
import { isShallowEqual } from '../../../../utils/util';
import { ShareViewType, SHARE_CANVAS_ID } from '../../video-constants';
import { useShare } from '../../hooks/useShare';
import { useRemoteControl } from '../../hooks/useRemoteControl';
import { useAnnotation } from '../../hooks/useAnnotation';
import { useShareViewSize } from '../../hooks/useShareViewSize';
import ShareBar from './share-bar';
import ShareIndicationBar from './share-indication';
import { AnnotationButton, AnnotationToolbox } from '../annotation';
import './share-view.scss';
import type { ShareViewProps } from './share-view-types';

const DragThreshod = 50;

const SingleShareView = forwardRef((props: ShareViewProps, ref: any) => {
  const { onShareViewActiveChange } = props;
  const zmClient = useContext(ZoomContext);
  const { mediaStream } = useContext(ZoomMediaContext);
  const selfShareViewRef = useRef<(HTMLCanvasElement & HTMLVideoElement) | null>(null);
  const shareCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const shareVideoPlayerRef = useRef<VideoPlayer | null>(null);
  const shareViewContainerRef = useRef<HTMLDivElement | null>(null);
  const shareViewViewportRef = useRef<HTMLDivElement | null>(null);
  const selfShareViewContainerRef = useRef<HTMLDivElement | null>(null);

  const [viewType, setViewType] = useState<string>(ShareViewType.FitWindow);
  const [showAnnotationToolbox, setShowAnnotationToolbox] = useState(false);
  const [originalViewPosition, setOriginalViewPosition] = useState({ x: 0, y: 0 });
  const [isLargeSelfShareView, setIsLargeSelfShareView] = useState(false);
  const [searchParams] = useSearchParams();
  const isVideoPlayer = searchParams.get('useVideoPlayer') === '1';
  const { isRecieveSharing, sharedContentDimension, shareUserList, activeSharingId, shareStatus, setActiveSharingId } =
    useShare(zmClient, mediaStream, isVideoPlayer ? shareVideoPlayerRef : shareCanvasRef);
  const { isControllingUser, controllingUser } = useRemoteControl(
    zmClient,
    mediaStream,
    selfShareViewRef.current,
    isVideoPlayer ? shareVideoPlayerRef.current : shareCanvasRef.current
  );
  const { canAnnotation, canRedo, canUndo, isAnnotationStarted, onToggleAnnotation } = useAnnotation({
    shareStatus,
    isRecieveSharing,
    activeSharingId
  });

  // Use custom hook for share view size calculation
  const { viewSize: shareViewSize } = useShareViewSize(
    shareViewContainerRef,
    isRecieveSharing,
    sharedContentDimension,
    viewType
  );

  // Use custom hook for self share view size calculation
  const { viewSize: selfShareViewSize } = useShareViewSize(
    selfShareViewContainerRef,
    isLargeSelfShareView,
    sharedContentDimension
  );

  const previousViewType = usePrevious(viewType);
  const previousShareViewSize = usePrevious(shareViewSize);

  const handleAnnotationToggle = useCallback(async () => {
    if (!showAnnotationToolbox) {
      // Starting annotation
      await onToggleAnnotation();
      setShowAnnotationToolbox(true);
    } else {
      // Stopping annotation
      await onToggleAnnotation();
      setShowAnnotationToolbox(false);
    }
  }, [showAnnotationToolbox, onToggleAnnotation]);
  const onShareViewDrag = useCallback(
    (_event: any, { x, y }: any) => {
      const { width, height } = sharedContentDimension;
      const { width: vWidth, height: vHeight } = shareViewSize;
      setOriginalViewPosition((payload) => {
        let nX = payload.x;
        let nY = payload.y;
        if ((x < 0 && Math.abs(x) < width - DragThreshod) || (x > 0 && x < vWidth - DragThreshod)) {
          nX = x;
        }
        if ((y < 0 && Math.abs(y) < height - DragThreshod) || (y > 0 && y < vHeight - DragThreshod)) {
          nY = y;
        }
        return {
          x: nX,
          y: nY
        };
      });
    },
    [sharedContentDimension, shareViewSize]
  );

  useEffect(() => {
    if (
      shareViewSize.width > 0 &&
      (!isShallowEqual(shareViewSize, previousShareViewSize) ||
        (previousViewType !== viewType && viewType === ShareViewType.OriginalSize))
    ) {
      const pixelRatio = window.devicePixelRatio ?? 1;
      mediaStream?.updateSharingCanvasDimension(shareViewSize.width * pixelRatio, shareViewSize.height * pixelRatio);
    }
  }, [mediaStream, previousShareViewSize, shareViewSize, viewType, previousViewType]);
  useImperativeHandle(ref, () => {
    return {
      selfShareRef: selfShareViewRef.current
    };
  }, []);
  useEffect(() => {
    if (isAnnotationStarted) {
      if (shareStatus !== ShareStatus.End) {
        setIsLargeSelfShareView(true);
      }
    } else {
      setShowAnnotationToolbox(false);
    }
  }, [isAnnotationStarted, shareStatus]);
  useEffect(() => {
    if (shareStatus === ShareStatus.End) {
      setIsLargeSelfShareView(false);
      setShowAnnotationToolbox(false);
    }
  }, [shareStatus]);
  useEffect(() => {
    onShareViewActiveChange(isRecieveSharing || isLargeSelfShareView);
  }, [isRecieveSharing, isLargeSelfShareView, onShareViewActiveChange]);
  return (
    <>
      <ShareBar controllingUser={controllingUser} shareStatus={shareStatus} />
      <div
        className={classnames('share-view', {
          'share-view-in-sharing': isRecieveSharing,
          'share-view-original': isRecieveSharing && viewType === ShareViewType.OriginalSize
        })}
        ref={shareViewContainerRef}
      >
        {isRecieveSharing && (
          <ShareIndicationBar
            shareUserList={shareUserList}
            activeSharingId={activeSharingId}
            isControllingUser={isControllingUser}
            viewType={viewType}
            setViewType={setViewType}
            setActiveSharingId={setActiveSharingId}
          />
        )}
        <Draggable
          nodeRef={shareViewViewportRef}
          disabled={isControllingUser || viewType !== ShareViewType.OriginalSize}
          position={viewType === ShareViewType.OriginalSize ? originalViewPosition : { x: 0, y: 0 }}
          onDrag={onShareViewDrag}
        >
          <div
            className={classnames('share-view-viewport', {
              'share-view-viewport-original': viewType === ShareViewType.OriginalSize,
              'share-view-viewport-in-control': isControllingUser
            })}
            style={{
              width: `${shareViewSize.width}px`,
              height: `${shareViewSize.height}px`
            }}
            ref={shareViewViewportRef}
          >
            {isVideoPlayer ? (
              <video-player-container class="share-view-canvas">
                <video-player ref={shareVideoPlayerRef} />
              </video-player-container>
            ) : (
              <canvas className="share-view-canvas" ref={shareCanvasRef} />
            )}
          </div>
        </Draggable>
      </div>
      <div
        className={classnames('self-share-view-container', { 'self-share-view-in-annotation': isLargeSelfShareView })}
        ref={selfShareViewContainerRef}
      >
        <div
          className="self-share-canvas-wrapper"
          style={{
            width: `${selfShareViewSize.width}px`,
            height: `${selfShareViewSize.height}px`
          }}
        >
          {mediaStream?.isStartShareScreenWithVideoElement() ? (
            <video id={SHARE_CANVAS_ID} className="self-share-canvas" ref={selfShareViewRef} />
          ) : (
            <canvas id={SHARE_CANVAS_ID} className="self-share-canvas" ref={selfShareViewRef} />
          )}
        </div>
      </div>
      <AnnotationButton
        showToolbox={showAnnotationToolbox}
        onToggle={handleAnnotationToggle}
        canAnnotation={canAnnotation}
      />
      {showAnnotationToolbox && (
        <AnnotationToolbox
          onClose={handleAnnotationToggle}
          isPresenter={!isRecieveSharing}
          isHost={zmClient.isHost()}
          canRedo={canRedo}
          canUndo={canUndo}
        />
      )}
    </>
  );
});

export default SingleShareView;
