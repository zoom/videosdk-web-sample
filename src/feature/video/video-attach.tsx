import { useState, useContext, useRef, useEffect, useCallback } from 'react';
// eslint-disable-next-line no-duplicate-imports
import classnames from 'classnames';
import { Radio } from 'antd';
import _ from 'lodash';
import { type VideoPlayer, VideoQuality } from '@zoom/videosdk';
import type { Participant } from '../../index-types';
import ZoomContext from '../../context/zoom-context';
import ZoomMediaContext from '../../context/media-context';
import AvatarActionContext from './context/avatar-context';
import ShareView from './components/share-view/share-view';
import Pagination from './components/pagination';
import VideoFooter from './components/video-footer';
import ReportBtn from './components/report-btn';
import Avatar from './components/avatar';
import Draggable from './components/draggable';
import RemoteCameraControlPanel from './components/remote-camera-control';
import WhiteboardView from './components/whiteboard-view';
import { useActiveVideo } from './hooks/useAvtiveVideo';
import { useAvatarAction } from './hooks/useAvatarAction';
import { useNetworkQuality } from './hooks/useNetworkQuality';
import { useParticipantsChange } from './hooks/useParticipantsChange';
import { usePrevious } from '../../hooks';
import { useVideoAspect } from './hooks/useVideoAspectRatio';
import { useGridLayout } from './hooks/useGridLayout';
import { useVideoGridStyle } from './hooks/useVideoGridStyle';
import { usePagination } from './hooks/useAttachPagination';
import { useSpotlightVideo } from './hooks/useSpotlightVideo';
import { isAndroidOrIOSBrowser } from '../../utils/platform';

interface ExtendedParticipant extends Participant {
  spotlighted?: boolean;
}

const VideoContainer = () => {
  const { mediaStream } = useContext(ZoomMediaContext);
  const preferPageCount = mediaStream?.getMaxRenderableVideos();
  const zmClient = useContext(ZoomContext);
  const { page, pageSize, totalPage, setPage } = usePagination(zmClient, preferPageCount || 4);
  const shareViewRef = useRef<{ selfShareRef: HTMLCanvasElement | HTMLVideoElement | null }>(null);
  const wbViewRef = useRef<{ whiteboardContainerRef: HTMLDivElement | null }>(null);

  const videoPlayerListRef = useRef<Record<string, VideoPlayer>>({});
  const [isShareViewActive, setIsShareViewActive] = useState(false);
  const [spotlightUsers, setSpotlightUsers] = useState<number[]>([]);
  const [participants, setParticipants] = useState<ExtendedParticipant[]>([]);
  const [currentPageParticipants, setCurrentPageParticipants] = useState<Participant[]>([]);
  const [currentUser, setCurrentUser] = useState<Participant>(zmClient.getCurrentUserInfo());
  const [subscribers, setSubscribers] = useState<number[]>([]);
  const [isWhiteboardInProgress, setIsWhiteboardInProgress] = useState(false);
  const activeVideo = useActiveVideo(zmClient);
  const avatarActionState = useAvatarAction(zmClient, participants, true);
  const networkQuality = useNetworkQuality(zmClient);
  const previousSubscribers = usePrevious(subscribers);
  const aspectRatio = useVideoAspect(zmClient);
  const optionsOfVideoResolution = [
    { label: '1080P', value: VideoQuality.Video_1080P },
    { label: '720P', value: VideoQuality.Video_720P },
    { label: '360P', value: VideoQuality.Video_360P },
    { label: '180P', value: VideoQuality.Video_180P },
    { label: '90P', value: VideoQuality.Video_90P }
  ];

  useSpotlightVideo(zmClient, mediaStream, (p) => {
    setSpotlightUsers(p.map((user) => user.userId));
  });

  useParticipantsChange(zmClient, (allParticipants, updatedParticipants) => {
    let participants: ExtendedParticipant[] = [];
    let tempCurUserInfo: Participant | null = null;
    // enhance failover logic
    if (!currentUser?.userId) {
      tempCurUserInfo = zmClient.getCurrentUserInfo();
      setCurrentUser(tempCurUserInfo);
    }
    updatedParticipants?.forEach((p) => {
      if (p?.userId === currentUser?.userId && Object.keys(p).length > 1) {
        setCurrentUser((c) => ({
          ...c,
          ...p
        }));
      }
    });

    if (allParticipants.length > 0) {
      participants = allParticipants
        .filter((p) => p.userId !== (currentUser?.userId || tempCurUserInfo?.userId))
        .sort((user1, user2) => Number(user2.bVideoOn) - Number(user1.bVideoOn));
    }
    setParticipants(participants);
  });

  useEffect(() => {
    let currPageParticipants: ExtendedParticipant[] = participants
      .map((p) => ({ ...p, spotlighted: spotlightUsers.includes(p?.userId) }))
      .sort((user1, user2) => Number(user2.spotlighted) - Number(user1.spotlighted))
      .slice(page * pageSize, page * pageSize + pageSize);
    setCurrentPageParticipants(currPageParticipants);
    setSubscribers(currPageParticipants.filter((user) => user.bVideoOn).map((u) => u.userId));
  }, [pageSize, page, participants, spotlightUsers]);

  const setVideoPlayerRef = (userId: number, element: VideoPlayer | null) => {
    if (element) {
      videoPlayerListRef.current[`${userId}`] = element;
    } else {
      delete videoPlayerListRef.current[`${userId}`];
    }
  };
  useEffect(() => {
    const addedUsers = subscribers.filter((user) => !(previousSubscribers || []).includes(user));
    const removedUsers = (previousSubscribers || []).filter((user) => !subscribers.includes(user));
    if (removedUsers.length > 0) {
      removedUsers.forEach(async (userId) => {
        await mediaStream?.detachVideo(userId);
        delete videoPlayerListRef.current[`${userId}`];
      });
    }
    if (addedUsers.length > 0) {
      addedUsers.forEach((userId) => {
        const attachment = videoPlayerListRef.current[`${userId}`];
        if (attachment) {
          mediaStream?.attachVideo(userId, VideoQuality.Video_720P, attachment);
        }
      });
    }
  }, [subscribers, previousSubscribers, mediaStream]);
  useEffect(() => {
    if (currentUser?.bVideoOn) {
      const attachment = videoPlayerListRef.current[`${currentUser?.userId}`];
      if (attachment) {
        mediaStream?.attachVideo(currentUser?.userId, VideoQuality.Video_720P, attachment);
      }
    } else {
      mediaStream?.detachVideo(currentUser?.userId);
      delete videoPlayerListRef.current[`${currentUser?.userId}`];
    }
  }, [currentUser, mediaStream]);

  const onVideoResolutionChange = useCallback(
    ({ target: { value } }: any, userId: number) => {
      const attachment = videoPlayerListRef.current[`${userId}`];
      mediaStream?.attachVideo(userId, value, attachment);
    },
    [videoPlayerListRef, mediaStream]
  );
  const { gridColumns, gridRows } = useGridLayout({
    isRecieveSharingOrWhiteboard: isShareViewActive || isWhiteboardInProgress,
    spotlightUsers,
    pageSize,
    currentPageParticipants
  });

  const { getVideoGridStyle } = useVideoGridStyle({
    currentPageParticipants
  });
  return (
    <div className="viewport">
      <ShareView ref={shareViewRef} onShareViewActiveChange={setIsShareViewActive} />
      <WhiteboardView ref={wbViewRef} onWhiteboardStatusChange={setIsWhiteboardInProgress} />
      <Draggable
        className="unified-self-view"
        customstyle={{
          width: isAndroidOrIOSBrowser() ? '50vw' : '30vw'
        }}
      >
        <video-player-container class="unified-self-view-container">
          <AvatarActionContext.Provider value={avatarActionState}>
            {currentUser?.bVideoOn && (
              <div>
                <video-player
                  class="video-player"
                  ref={(element) => {
                    setVideoPlayerRef(currentUser?.userId, element);
                  }}
                />
              </div>
            )}
            {currentUser && (
              <Avatar
                participant={currentUser as Participant}
                key={currentUser?.userId as number}
                isActive={false}
                networkQuality={networkQuality[`${currentUser?.userId}`]}
              />
            )}
          </AvatarActionContext.Provider>
        </video-player-container>
      </Draggable>
      {/* </div> */}

      <div
        className={classnames('video-container', 'video-container-attach', {
          'video-container-in-sharing': isShareViewActive || isWhiteboardInProgress
        })}
      >
        <video-player-container class="video-container-wrap">
          <AvatarActionContext.Provider value={avatarActionState}>
            <ul
              className="user-list"
              style={{
                gridTemplateColumns: `repeat(${gridColumns}, minmax(128px, 1fr))`,
                gridTemplateRows: `repeat(${gridRows}, auto)`
              }}
            >
              {currentPageParticipants.map((user, index) => {
                return (
                  <div
                    className={classnames('video-cell', { 'video-cell-spotlight': (user as any).spotlighted })}
                    key={user.userId}
                    style={getVideoGridStyle(index)}
                  >
                    {avatarActionState?.avatarActionState[user?.userId]?.videoResolutionAdjust?.toggled && (
                      <div className="change-video-resolution">
                        <Radio.Group
                          options={optionsOfVideoResolution}
                          onChange={(value) => {
                            onVideoResolutionChange(value, user.userId);
                          }}
                          defaultValue={VideoQuality.Video_720P}
                          optionType="button"
                          buttonStyle="solid"
                        />
                      </div>
                    )}
                    <div
                      className="aspact-ratio"
                      style={
                        aspectRatio[`${user.userId}`]
                          ? { aspectRatio: aspectRatio[`${user.userId}`] }
                          : { aspectRatio: '16/9' }
                      }
                    >
                      {user.bVideoOn && (
                        <video-player
                          class="video-player"
                          ref={(element) => {
                            setVideoPlayerRef(user.userId, element);
                          }}
                        />
                      )}
                      <Avatar
                        participant={user}
                        key={user.userId}
                        isActive={activeVideo === user.userId}
                        networkQuality={networkQuality[`${user.userId}`]}
                      />
                    </div>
                  </div>
                );
              })}
            </ul>
            {zmClient.getSessionInfo()?.isInMeeting && <RemoteCameraControlPanel />}
          </AvatarActionContext.Provider>
        </video-player-container>
      </div>
      <VideoFooter
        className="video-operations"
        whiteboardContainer={wbViewRef.current?.whiteboardContainerRef}
        selfShareCanvas={shareViewRef.current?.selfShareRef}
      />
      {totalPage > 1 && (
        <Pagination
          page={page}
          totalPage={totalPage}
          setPage={setPage}
          inSharing={isShareViewActive || isWhiteboardInProgress}
        />
      )}
      <ReportBtn />
    </div>
  );
};
export default VideoContainer;
