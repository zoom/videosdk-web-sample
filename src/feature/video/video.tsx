import React, { useState, useContext, useRef, useEffect, useCallback } from 'react';
import classnames from 'classnames';
import _ from 'lodash';
import { RouteComponentProps } from 'react-router-dom';
import ZoomContext from '../../context/zoom-context';
import ZoomMediaContext from '../../context/media-context';
import AvatarActionContext from './context/avatar-context';
import Avatar from './components/avatar';
import VideoFooter from './components/video-footer';
import Pagination from './components/pagination';
import { useCanvasDimension } from './hooks/useCanvasDimension';
import { useGalleryLayout } from './hooks/useGalleryLayout';
import { usePagination } from './hooks/usePagination';
import { useActiveVideo } from './hooks/useAvtiveVideo';
import { useAvatarAction } from './hooks/useAvatarAction';
import { useNetworkQuality } from './hooks/useNetworkQuality';
import ReportBtn from './components/report-btn';
import ShareView from './components/share-view';
import RemoteCameraControlPanel from './components/remote-camera-control';
import { SELF_VIDEO_ID } from './video-constants';

import './video.scss';
const VideoContainer: React.FunctionComponent<RouteComponentProps> = (props) => {
  const zmClient = useContext(ZoomContext);
  const {
    mediaStream,
    video: { decode: isVideoDecodeReady }
  } = useContext(ZoomMediaContext);
  const videoRef = useRef<HTMLCanvasElement | null>(null);
  const shareViewRef = useRef<{ selfShareRef: HTMLCanvasElement | HTMLVideoElement | null }>(null);
  const [isRecieveSharing, setIsRecieveSharing] = useState(false);
  const canvasDimension = useCanvasDimension(mediaStream, videoRef);
  const activeVideo = useActiveVideo(zmClient);
  const { page, pageSize, totalPage, totalSize, setPage } = usePagination(zmClient, canvasDimension);
  const { visibleParticipants, layout: videoLayout } = useGalleryLayout(
    zmClient,
    mediaStream,
    isVideoDecodeReady,
    videoRef,
    canvasDimension,
    {
      page,
      pageSize,
      totalPage,
      totalSize
    }
  );
  /**
   * position for self video
   */
  const currentUserIndex = visibleParticipants.findIndex(
    (user) => user.userId === zmClient.getCurrentUserInfo()?.userId
  );
  let selfVideoLayout = null;
  if (currentUserIndex > -1) {
    const item = videoLayout[currentUserIndex];
    if (item && canvasDimension) {
      selfVideoLayout = { ...item, y: canvasDimension.height - item.y - item.height };
    }
  }
  const avatarActionState = useAvatarAction(zmClient, visibleParticipants);
  const networkQuality = useNetworkQuality(zmClient);
  return (
    <div className="viewport">
      <ShareView ref={shareViewRef} onRecieveSharingChange={setIsRecieveSharing} />
      <div
        className={classnames('video-container', {
          'video-container-in-sharing': isRecieveSharing
        })}
      >
        <canvas className="video-canvas" id="video-canvas" width="800" height="600" ref={videoRef} />
        {selfVideoLayout && mediaStream?.isRenderSelfViewWithVideoElement() && (
          <video
            id={SELF_VIDEO_ID}
            className="self-video-tag"
            playsInline
            muted
            autoPlay
            style={{
              display: 'block',
              width: `${selfVideoLayout.width}px`,
              height: `${selfVideoLayout.height}px`,
              top: `${selfVideoLayout.y}px`,
              left: `${selfVideoLayout.x}px`,
              pointerEvents: 'none'
            }}
          />
        )}
        <AvatarActionContext.Provider value={avatarActionState}>
          <ul className="avatar-list">
            {visibleParticipants.map((user, index) => {
              if (index > videoLayout.length - 1) {
                return null;
              }
              const dimension = videoLayout[index];
              const { width, height, x, y } = dimension;
              const { height: canvasHeight } = canvasDimension;
              return (
                <Avatar
                  participant={user}
                  key={user.userId}
                  isActive={activeVideo === user.userId}
                  networkQuality={networkQuality[`${user.userId}`]}
                  style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    top: `${canvasHeight - y - height}px`,
                    left: `${x}px`
                  }}
                />
              );
            })}
          </ul>
          <RemoteCameraControlPanel />
        </AvatarActionContext.Provider>
      </div>
      <VideoFooter className="video-operations" sharing selfShareCanvas={shareViewRef.current?.selfShareRef} />

      {totalPage > 1 && <Pagination page={page} totalPage={totalPage} setPage={setPage} inSharing={isRecieveSharing} />}
      <ReportBtn />
    </div>
  );
};

export default VideoContainer;
