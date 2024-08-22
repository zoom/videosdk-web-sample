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
import { VideoView } from './VideoView';
import { VideoPiP } from './VideoPiP';

interface Props extends RouteComponentProps {
  disableMultipleVideos?: boolean;
}

const VideoContainer = ({ disableMultipleVideos }: Props) => {
  const videoWrapperRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLCanvasElement | null>(null);
  const shareViewRef = useRef<{ selfShareRef: HTMLCanvasElement | HTMLVideoElement | null }>(null);
  const { hasPiPOpened } = usePiPContext();
  const [isRecieveSharing, setIsRecieveSharing] = useState(false);

  return (
    <div className="viewport">
      <ShareView ref={shareViewRef} onRecieveSharingChange={setIsRecieveSharing} />
      {!hasPiPOpened && (
        <VideoView videoWrapperRef={videoWrapperRef} videoRef={videoRef} isRecieveSharing={isRecieveSharing} />
      )}
      <VideoPiP />
      <VideoFooter
        className="video-operations"
        sharing
        selfShareCanvas={shareViewRef.current?.selfShareRef}
        disableMultipleVideos={disableMultipleVideos}
      />
    </div>
  );
};

export default VideoContainer;
