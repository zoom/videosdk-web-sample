import { useState, useContext, useRef, useEffect, useCallback, useMemo } from 'react';
// eslint-disable-next-line no-duplicate-imports
import type React from 'react';
import classnames from 'classnames';
import _ from 'lodash';
import type { RouteComponentProps } from 'react-router-dom';
import { type VideoPlayer, VideoQuality } from '@zoom/videosdk';
import ZoomContext from '../../context/zoom-context';
import ZoomMediaContext from '../../context/media-context';
import AvatarActionContext from './context/avatar-context';
import ShareView from './components/share-view';
import Pagination from './components/pagination';
import { usePagination } from './hooks/useAttachPagination';
import VideoFooter from './components/video-footer';
import ReportBtn from './components/report-btn';
import Avatar from './components/avatar';
import { useActiveVideo } from './hooks/useAvtiveVideo';
import { useAvatarAction } from './hooks/useAvatarAction';
import { useNetworkQuality } from './hooks/useNetworkQuality';
import { useParticipantsChange } from './hooks/useParticipantsChange';
import type { Participant } from '../../index-types';
import { usePrevious } from '../../hooks';
import { useVideoAspect } from './hooks/useVideoAspectRatio';
import { Radio } from 'antd';
// import Draggable from 'react-draggable';
import Draggable from './components/draggable';
import { useSpotlightVideo } from './hooks/useSpotlightVideo';
import RemoteCameraControlPanel from './components/remote-camera-control';
import { isAndroidOrIOSBrowser } from '../../utils/platform';

interface ExtendedParticipant extends Participant {
  spotlighted?: boolean;
}

type VideoAttachProps = RouteComponentProps;

const VideoContainer: React.FunctionComponent<VideoAttachProps> = (props) => {
  const preferPageCount = Number(new URLSearchParams(props.location.search).get('videoCount') || 4);
  const zmClient = useContext(ZoomContext);
  const { page, pageSize, totalPage, setPage } = usePagination(zmClient, preferPageCount);
  const { mediaStream } = useContext(ZoomMediaContext);
  const shareViewRef = useRef<{ selfShareRef: HTMLCanvasElement | HTMLVideoElement | null }>(null);

  const videoPlayerListRef = useRef<Record<string, VideoPlayer>>({});
  const [isRecieveSharing, setIsRecieveSharing] = useState(false);
  const [spotlightUsers, setSpotlightUsers] = useState<number[]>([]);
  const [participants, setParticipants] = useState<ExtendedParticipant[]>([]);
  const [currentPageParticipants, setCurrentPageParticipants] = useState<Participant[]>([]);
  const [currentUser, setCurrentUser] = useState<Participant>(zmClient.getCurrentUserInfo());
  const [subscribers, setSubscribers] = useState<number[]>([]);
  const activeVideo = useActiveVideo(zmClient);
  const avatarActionState = useAvatarAction(zmClient, participants, true);
  const networkQuality = useNetworkQuality(zmClient);
  const previousSubscribers = usePrevious(subscribers);
  const aspectRatio = useVideoAspect(zmClient);
  const optionsOfVideoResolution = [
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
      if (p?.userId === currentUser?.userId) {
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
    }
  };
  useEffect(() => {
    const addedUsers = subscribers.filter((user) => !(previousSubscribers || []).includes(user));
    const removedUsers = (previousSubscribers || []).filter((user) => !subscribers.includes(user));
    if (removedUsers.length > 0) {
      removedUsers.forEach((userId) => {
        mediaStream?.detachVideo(userId);
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
    }
  }, [currentUser, mediaStream]);

  const onVideoResolutionChange = useCallback(
    ({ target: { value } }: any, userId: number) => {
      const attachment = videoPlayerListRef.current[`${userId}`];
      mediaStream?.attachVideo(userId, value, attachment);
    },
    [videoPlayerListRef, mediaStream]
  );
  const gridColumns = useMemo(() => {
    if (isRecieveSharing) return 1;
    if (spotlightUsers.length) {
      return Math.sqrt(pageSize) * 2;
    }
    return Math.sqrt(pageSize);
  }, [spotlightUsers, isRecieveSharing, pageSize]);
  const gridRows = useMemo(() => {
    if (isRecieveSharing) {
      return pageSize;
    }
    if (spotlightUsers.length) {
      return Math.sqrt(pageSize) * 2;
    }
    return Math.sqrt(pageSize);
  }, [spotlightUsers, isRecieveSharing, pageSize]);
  return (
    <div className="viewport">
      <ShareView ref={shareViewRef} onRecieveSharingChange={setIsRecieveSharing} />
      {/* <div
        className="unified-self-view"
        style={{
          width: isAndroidOrIOSBrowser() ? '50vw' : '30vw'
        }}
      > */}
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
        className={classnames('video-container', 'video-container-attech', {
          'video-container-in-sharing': isRecieveSharing
        })}
      >
        <video-player-container class="video-container-wrap">
          <AvatarActionContext.Provider value={avatarActionState}>
            <ul
              className="user-list"
              style={{
                gridTemplateColumns: `repeat(${gridColumns}, minmax(128px, 1fr))`,
                gridTemplateRows: `repeat(${gridRows},minmax(72px, 1fr))`
              }}
            >
              {currentPageParticipants.map((user) => {
                return (
                  <div
                    className={classnames('video-cell', { 'video-cell-spotlight': (user as any).spotlighted })}
                    key={user.userId}
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
                      style={aspectRatio[`${user.userId}`] ? { aspectRatio: aspectRatio[`${user.userId}`] } : {}}
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
      <VideoFooter className="video-operations" sharing selfShareCanvas={shareViewRef.current?.selfShareRef} />
      {totalPage > 1 && <Pagination page={page} totalPage={totalPage} setPage={setPage} inSharing={isRecieveSharing} />}
      <ReportBtn />
    </div>
  );
};
export default VideoContainer;
