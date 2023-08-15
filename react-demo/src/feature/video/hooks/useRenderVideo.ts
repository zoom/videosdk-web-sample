import { useEffect, MutableRefObject } from 'react';
import { usePrevious, usePersistFn } from '../../../hooks';
import { isShallowEqual } from '../../../utils/util';
import { CellLayout } from '../video-types';
import { MediaStream, Participant } from '../../../index-types';
/**
 * gallery view without SharedArrayBuffer mode, self video is present by Video Element
 */
const isSkipSelfVideo = !window.crossOriginIsolated;
export function useRenderVideo(
  mediaStream: MediaStream | null,
  isVideoDecodeReady: boolean,
  videoRef: MutableRefObject<HTMLCanvasElement | null>,
  layout: CellLayout[],
  subscribedVideos: number[],
  participants: Participant[],
  currentUserId?: number
) {
  const renderedVideos = subscribedVideos.slice(0, layout.length);
  const previousRenderedVideos = usePrevious(renderedVideos);
  const previousLayout = usePrevious(layout);
  const previousParticipants = usePrevious(participants);
  const previousIsVideoDecodeReady = usePrevious(isVideoDecodeReady);

  useEffect(() => {
    if (videoRef.current && layout && layout.length > 0 && isVideoDecodeReady) {
      const addedSubscribers = renderedVideos.filter((id) => !(previousRenderedVideos || []).includes(id));
      const removedSubscribers = (previousRenderedVideos || []).filter((id: number) => !renderedVideos.includes(id));
      const unalteredSubscribers = renderedVideos.filter((id) => (previousRenderedVideos || []).includes(id));
      if (removedSubscribers.length > 0) {
        removedSubscribers.forEach(async (userId: number) => {
          if (!isSkipSelfVideo || (isSkipSelfVideo && userId !== currentUserId)) {
            await mediaStream?.stopRenderVideo(videoRef.current as HTMLCanvasElement, userId);
          }
        });
      }
      if (addedSubscribers.length > 0) {
        addedSubscribers.forEach(async (userId) => {
          const index = participants.findIndex((user) => user.userId === userId);
          const cellDimension = layout[index];
          if (cellDimension && (!isSkipSelfVideo || (isSkipSelfVideo && userId !== currentUserId))) {
            const { width, height, x, y, quality } = cellDimension;
            await mediaStream?.renderVideo(videoRef.current as HTMLCanvasElement, userId, width, height, x, y, quality);
          }
        });
      }
      if (unalteredSubscribers.length > 0) {
        // layout changed
        if (
          previousLayout &&
          (layout.length !== previousLayout.length || !isShallowEqual(layout[0], previousLayout[0]))
        ) {
          unalteredSubscribers.forEach(async (userId) => {
            const index = participants.findIndex((user) => user.userId === userId);
            const cellDimension = layout[index];
            if (cellDimension && (!isSkipSelfVideo || (isSkipSelfVideo && userId !== currentUserId))) {
              const { width, height, x, y, quality } = cellDimension;
              if (previousLayout?.[index] && previousLayout[index].quality !== quality) {
                await mediaStream?.renderVideo(
                  videoRef.current as HTMLCanvasElement,
                  userId,
                  width,
                  height,
                  x,
                  y,
                  quality
                );
              }
              setTimeout(async () => {
                await mediaStream?.adjustRenderedVideoPosition(
                  videoRef.current as HTMLCanvasElement,
                  userId,
                  width,
                  height,
                  x,
                  y
                );
              }, 0);
            }
          });
        }
        // the order of participants changed
        const participantsIds = participants.map((user) => user.userId);
        const previousParticipantsIds = previousParticipants?.map((user) => user.userId);
        if (participantsIds.join('-') !== previousParticipantsIds?.join('-')) {
          unalteredSubscribers.forEach(async (userId) => {
            const index = participantsIds.findIndex((id) => id === userId);
            const previousIndex = previousParticipantsIds?.findIndex((id) => id === userId);
            if (index !== previousIndex) {
              const cellDimension = layout[index];
              if (cellDimension && (!isSkipSelfVideo || (isSkipSelfVideo && userId !== currentUserId))) {
                const { width, height, x, y } = cellDimension;
                await mediaStream?.adjustRenderedVideoPosition(
                  videoRef.current as HTMLCanvasElement,
                  userId,
                  width,
                  height,
                  x,
                  y
                );
              }
            }
          });
        }
      }
    }
  }, [
    mediaStream,
    isVideoDecodeReady,
    videoRef,
    layout,
    previousLayout,
    participants,
    previousParticipants,
    renderedVideos,
    previousRenderedVideos,
    currentUserId
  ]);

  useEffect(() => {
    if (previousIsVideoDecodeReady === false && isVideoDecodeReady === true && subscribedVideos.length > 0) {
      subscribedVideos.forEach(async (userId) => {
        const index = participants.findIndex((user) => user.userId === userId);
        const cellDimension = layout[index];
        if (cellDimension && (!isSkipSelfVideo || (isSkipSelfVideo && userId !== currentUserId))) {
          const { width, height, x, y, quality } = cellDimension;
          await mediaStream?.renderVideo(videoRef.current as HTMLCanvasElement, userId, width, height, x, y, quality);
        }
      });
    }
  }, [
    mediaStream,
    videoRef,
    layout,
    participants,
    subscribedVideos,
    isVideoDecodeReady,
    previousIsVideoDecodeReady,
    currentUserId
  ]);
  const stopAllVideos = usePersistFn((videoCanvasDOM: HTMLCanvasElement) => {
    if (subscribedVideos.length > 0) {
      subscribedVideos.forEach((userId) => {
        mediaStream?.stopRenderVideo(videoCanvasDOM, userId);
      });
    }
  });
  useEffect(() => {
    const videoCanvasDOM = videoRef.current;
    return () => {
      stopAllVideos(videoCanvasDOM);
    };
  }, [videoRef, stopAllVideos]);
}
