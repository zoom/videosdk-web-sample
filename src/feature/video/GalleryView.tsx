import React, { useState, useContext, useRef, useEffect, useCallback } from 'react';
import classnames from 'classnames';
import _ from 'lodash';
import { RouteComponentProps } from 'react-router-dom';
import ZoomContext from '../../context/zoom-context';
import ZoomMediaContext from '../../context/media-context';
import AvatarActionContext from './context/avatar-context';
import { usePiPContext } from './context/PiPContext';
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
import { CanvasContainer } from './CanvasContainer';
import './video.scss';
import { useRenderVideo } from './hooks/useRenderVideo';

interface Props {
  videoRef: React.MutableRefObject<HTMLCanvasElement | null>;
  videoWrapperRef: React.MutableRefObject<HTMLDivElement | null>;
  isRecieveSharing: boolean;
}

export const GalleryView = ({ videoWrapperRef, videoRef, isRecieveSharing }: Props) => {
  const zmClient = useContext(ZoomContext);
  const {
    mediaStream,
    video: { decode: isVideoDecodeReady }
  } = useContext(ZoomMediaContext);
  const canvasDimension = useCanvasDimension(mediaStream, videoWrapperRef, videoRef);
  const { page, pageSize, totalPage, totalSize, setPage } = usePagination(zmClient, canvasDimension);
  const { visibleParticipants, layout } = useGalleryLayout(
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
    const item = layout[currentUserIndex];
    if (item && canvasDimension) {
      selfVideoLayout = { ...item, y: canvasDimension.height - item.y - item.height };
    }
  }
  const avatarActionState = useAvatarAction(zmClient, visibleParticipants);
  const networkQuality = useNetworkQuality(zmClient);
  const activeVideo = useActiveVideo(zmClient);

  return (
    <div
      className={classnames('video-container', {
        'video-container-in-sharing': isRecieveSharing
      })}
    >
      <CanvasContainer videoWrapperRef={videoWrapperRef} videoRef={videoRef} />
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
            if (index > layout.length - 1) {
              return null;
            }
            const dimension = layout[index];
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
      </AvatarActionContext.Provider>

      {totalPage > 1 && <Pagination page={page} totalPage={totalPage} setPage={setPage} inSharing={isRecieveSharing} />}
    </div>
  );
};
