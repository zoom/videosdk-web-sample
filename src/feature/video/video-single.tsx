import { useContext, useRef, useState, useCallback, useEffect, useMemo } from 'react';
import type { RouteComponentProps } from 'react-router-dom';
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
import type { Participant } from '../../index-types';
import { SELF_VIDEO_ID } from './video-constants';
import { useNetworkQuality } from './hooks/useNetworkQuality';
import { useAvatarAction } from './hooks/useAvatarAction';
import { usePrevious } from '../../hooks';
import './video.scss';
import { isShallowEqual } from '../../utils/util';

const VideoContainer: React.FunctionComponent<RouteComponentProps> = (_props) => {
  const zmClient = useContext(ZoomContext);
  const {
    mediaStream,
    video: { decode: isVideoDecodeReady }
  } = useContext(ZoomMediaContext);
  const videoRef = useRef<HTMLCanvasElement | null>(null);
  const selfVideoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const selfVideoRef = useRef<HTMLVideoElement | null>(null);
  const shareViewRef = useRef<{ selfShareRef: HTMLCanvasElement | HTMLVideoElement | null }>(null);
  const [isRecieveSharing, setIsRecieveSharing] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activeVideo, setActiveVideo] = useState<number>(mediaStream?.getActiveVideoId() ?? 0);
  const previousActiveUser = useRef<Participant>();
  const canvasDimension = useCanvasDimension(mediaStream, videoRef);
  const selfCanvasDimension = useCanvasDimension(mediaStream, selfVideoCanvasRef);
  const networkQuality = useNetworkQuality(zmClient);
  const previousCanvasDimension = usePrevious(canvasDimension);

  useParticipantsChange(zmClient, (payload) => {
    setParticipants(payload);
  });
  const onActiveVideoChange = useCallback((payload: any) => {
    const { userId } = payload;
    setActiveVideo(userId);
  }, []);
  const onCurrentVideoChange = useCallback(
    (payload: any) => {
      const { state } = payload;
      const element = (
        mediaStream?.isRenderSelfViewWithVideoElement() ? selfVideoRef.current : selfVideoCanvasRef.current
      ) as HTMLVideoElement | HTMLCanvasElement;
      if (state === 'Started') {
        mediaStream?.renderVideo(element, zmClient.getSessionInfo().userId, element?.width, element?.height, 0, 0, 3);
      } else {
        mediaStream?.stopRenderVideo(element, zmClient.getSessionInfo().userId);
      }
    },
    [mediaStream, zmClient]
  );
  useEffect(() => {
    zmClient.on('video-active-change', onActiveVideoChange);
    zmClient.on('video-capturing-change', onCurrentVideoChange);
    return () => {
      zmClient.off('video-active-change', onActiveVideoChange);
      zmClient.off('video-capturing-change', onCurrentVideoChange);
    };
  }, [zmClient, onActiveVideoChange, onCurrentVideoChange]);
  // active user = regard as `video-active-change` payload, excluding the case where it is self and the video is turned on.
  // In this case, the self video is rendered seperately.
  const activeUser = useMemo(
    () =>
      participants.find(
        (user) => user.userId === activeVideo && !(user.userId === zmClient.getSessionInfo().userId && user.bVideoOn)
      ),
    [participants, activeVideo, zmClient]
  );
  const isCurrentUserStartedVideo = zmClient.getCurrentUserInfo()?.bVideoOn;
  useEffect(() => {
    if (mediaStream && videoRef.current) {
      if (activeUser?.bVideoOn !== previousActiveUser.current?.bVideoOn) {
        if (activeUser?.bVideoOn) {
          mediaStream.renderVideo(
            videoRef.current,
            activeUser.userId,
            canvasDimension.width,
            canvasDimension.height,
            0,
            0,
            VideoQuality.Video_360P as any
          );
        } else {
          if (previousActiveUser.current?.bVideoOn) {
            mediaStream.stopRenderVideo(videoRef.current, previousActiveUser.current?.userId);
          }
        }
      }
      if (activeUser?.bVideoOn && previousActiveUser.current?.bVideoOn) {
        if (activeUser.userId !== previousActiveUser.current.userId) {
          mediaStream.stopRenderVideo(videoRef.current, previousActiveUser.current?.userId);
          mediaStream.renderVideo(
            videoRef.current,
            activeUser.userId,
            canvasDimension.width,
            canvasDimension.height,
            0,
            0,
            VideoQuality.Video_360P as any
          );
        } else {
          if (!isShallowEqual(canvasDimension, previousCanvasDimension)) {
            mediaStream.adjustRenderedVideoPosition(
              videoRef.current,
              activeUser.userId,
              canvasDimension.width,
              canvasDimension.height,
              0,
              0
            );
          }
        }
      }
      previousActiveUser.current = activeUser;
    }
  }, [
    mediaStream,
    activeUser,
    isVideoDecodeReady,
    canvasDimension,
    previousCanvasDimension,
    zmClient,
    isCurrentUserStartedVideo
  ]);
  useEffect(() => {
    if (
      selfVideoCanvasRef.current &&
      selfCanvasDimension.width > 0 &&
      selfCanvasDimension.height > 0 &&
      isCurrentUserStartedVideo
    ) {
      mediaStream?.adjustRenderedVideoPosition(
        selfVideoCanvasRef.current,
        zmClient.getSessionInfo().userId,
        selfCanvasDimension.width,
        selfCanvasDimension.height,
        0,
        0
      );
    }
  }, [selfCanvasDimension, mediaStream, zmClient, isCurrentUserStartedVideo]);
  const avatarActionState = useAvatarAction(zmClient, activeUser ? [activeUser] : []);
  return (
    <div className="viewport">
      <ShareView ref={shareViewRef} onRecieveSharingChange={setIsRecieveSharing} />
      <div
        className={classnames('video-container', 'single-video-container', {
          'video-container-in-sharing': isRecieveSharing
        })}
      >
        {mediaStream?.isRenderSelfViewWithVideoElement() ? (
          <video
            id={SELF_VIDEO_ID}
            autoPlay
            muted
            playsInline
            className={classnames('self-video', {
              'single-self-video': participants.length === 1,
              'self-video-show': isCurrentUserStartedVideo
            })}
            ref={selfVideoRef}
          />
        ) : (
          <canvas
            id={SELF_VIDEO_ID}
            width="254"
            height="143"
            className={classnames('self-video', {
              'single-self-video': participants.length === 1,
              'self-video-show': isCurrentUserStartedVideo
            })}
            ref={selfVideoCanvasRef}
          />
        )}
        <div className="single-video-wrap">
          <canvas className="video-canvas" id="video-canvas" width="800" height="600" ref={videoRef} />

          <AvatarActionContext.Provider value={avatarActionState}>
            {activeUser && (
              <Avatar
                participant={activeUser}
                isActive={false}
                className="single-view-avatar"
                networkQuality={networkQuality[`${activeUser.userId}`]}
              />
            )}
          {zmClient.getSessionInfo()?.isInMeeting && <RemoteCameraControlPanel />}
          </AvatarActionContext.Provider>
        </div>
      </div>
      <VideoFooter className="video-operations" sharing selfShareCanvas={shareViewRef.current?.selfShareRef} />
      <ReportBtn />
    </div>
  );
};

export default VideoContainer;
