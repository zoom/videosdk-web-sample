import { useCallback, useEffect, useState, MutableRefObject } from 'react';
import { getVideoLayout } from '../video-layout-helper';
import { useRenderVideo } from './useRenderVideo';
import { Dimension, Pagination, CellLayout } from '../video-types';
import { ZoomClient, MediaStream, Participant } from '../../../index-types';
import { useParticipantsChange } from './useParticipantsChange';
/**
 * Default order of video:
 *  1. video's participants first
 *  2. self on the second position
 */
export function useGalleryLayout(
  zmClient: ZoomClient,
  mediaStream: MediaStream | null,
  isVideoDecodeReady: boolean,
  videoRef: MutableRefObject<HTMLCanvasElement | null>,
  dimension: Dimension,
  pagination: Pagination
) {
  const [visibleParticipants, setVisibleParticipants] = useState<Participant[]>([]);
  const [layout, setLayout] = useState<CellLayout[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [subscribedVideos, setSubscribedVideos] = useState<number[]>([]);
  const { page, pageSize, totalPage, totalSize } = pagination;
  let size = pageSize;
  if (page === totalPage - 1) {
    size = Math.min(size, totalSize % pageSize || size);
  }

  useEffect(() => {
    setLayout(getVideoLayout(dimension.width, dimension.height, size));
  }, [dimension, size]);

  useParticipantsChange(zmClient, () => {
    const participants = zmClient.getAllUser();
    setParticipants(participants);
  });

  useEffect(() => {
    if (participants.length > 0) {
      let pageParticipants: Participant[] = [];
      if (participants.length === 1) {
        pageParticipants = participants;
      } else {
        pageParticipants = participants
          .filter((user) => user.userId !== zmClient.getSessionInfo().userId)
          .sort((user1, user2) => Number(user2.bVideoOn) - Number(user1.bVideoOn));
        const currentUser = zmClient.getCurrentUserInfo();
        if (currentUser) {
          pageParticipants.splice(1, 0, currentUser);
        }
        pageParticipants = pageParticipants.filter((_user, index) => Math.floor(index / pageSize) === page);
        if (pageParticipants.length < pageSize) {
          const vacantSize = pageSize - pageParticipants.length;
          const paddingParticipants = participants.filter(
            (_user, index) => index >= pageSize * (totalPage - 1) - vacantSize && index < pageSize * (totalPage - 1)
          );
          pageParticipants = paddingParticipants.concat(pageParticipants);
        }
      }
      setVisibleParticipants(pageParticipants);
      const videoParticipants = pageParticipants.filter((user) => user.bVideoOn).map((user) => user.userId);
      setSubscribedVideos(videoParticipants);
    }
  }, [zmClient, pageSize, page, totalPage, participants]);
  useEffect(() => {
    setParticipants(zmClient.getAllUser());
  }, [zmClient]);

  useRenderVideo(
    mediaStream,
    isVideoDecodeReady,
    videoRef,
    layout,
    subscribedVideos,
    visibleParticipants,
    zmClient.getSessionInfo().userId
  );
  return {
    visibleParticipants,
    layout
  };
}
