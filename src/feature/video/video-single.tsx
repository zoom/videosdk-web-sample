import React, { useContext, useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { VideoQuality } from '@zoom/videosdk';
import classnames from 'classnames';
import _ from 'lodash';
import ZoomContext from '../../context/zoom-context';
import ZoomMediaContext from '../../context/media-context';
import AvatarActionContext from './context/avatar-context';
import Avatar from './components/avatar';
import VideoFooter from './components/video-footer';
import ShareView from './components/share-view';
import RemoteCameraControlPanel from './components/remote-camera-control';
import ReportBtn from './components/report-btn';
import { useParticipantsChange } from './hooks/useParticipantsChange';
import { useCanvasDimension } from './hooks/useCanvasDimension';
import { Participant } from '../../index-types';
import { SELF_VIDEO_ID } from './video-constants';
import { useNetworkQuality } from './hooks/useNetworkQuality';
import { useAvatarAction } from './hooks/useAvatarAction';
import { usePrevious } from '../../hooks';
import './video.scss';
import { VideoSingleView } from './VideoSingleView';
import { VideoSinglePiP } from './VideoSinglePiP';
import { isShallowEqual } from '../../utils/util';
import { usePiPContext } from './context/PiPContext';

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
        <VideoSingleView videoRef={videoRef} videoWrapperRef={videoWrapperRef} isRecieveSharing={isRecieveSharing} />
      )}
      <VideoSinglePiP />
      <VideoFooter
        className="video-operations"
        sharing
        selfShareCanvas={shareViewRef.current?.selfShareRef}
        disableMultipleVideos={disableMultipleVideos}
      />
      <ReportBtn />
    </div>
  );
};

export default VideoContainer;
