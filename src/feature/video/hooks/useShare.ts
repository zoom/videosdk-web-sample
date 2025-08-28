import { type MutableRefObject, useState, useCallback, useEffect } from 'react';
import { usePrevious, useUnmount } from '../../../hooks';
import type { ZoomClient, MediaStream, Participant } from '../../../index-types';
import { useSearchParams } from 'react-router';
import type { VideoPlayer } from '@zoom/videosdk';
import { useActiveMediaFailed } from './useActiveMediaFailed';

export function useShare(
  zmClient: ZoomClient,
  mediaStream: MediaStream | null,
  shareRef: MutableRefObject<HTMLCanvasElement | VideoPlayer | null>
) {
  // State declarations
  const [isRecieveSharing, setIsReceiveSharing] = useState(false);
  const [isStartedShare, setIsStartedShare] = useState(false);
  const [activeSharingId, setActiveSharingId] = useState(0);
  const [sharedContentDimension, setSharedContentDimension] = useState({
    width: 0,
    height: 0
  });
  const [shareUserList, setShareUserList] = useState<Array<Participant> | undefined>(mediaStream?.getShareUserList());

  // Derived state and hooks
  const [searchParams] = useSearchParams();
  const isSimultaneousShareView = searchParams.get('simultaneousShareView') === '1' && isStartedShare;
  const isVideoPlayer = searchParams.get('useVideoPlayer') === '1';
  const previousIsRecieveSharing = usePrevious(isRecieveSharing);
  const previousActiveSharingId = usePrevious(activeSharingId);

  useActiveMediaFailed(zmClient);

  // Event handlers
  const onActiveShareChange = useCallback(({ state, userId }: any) => {
    setActiveSharingId(userId);
    setIsReceiveSharing(state === 'Active');
  }, []);

  const onSharedContentDimensionChange = useCallback(({ width, height }: any) => {
    setSharedContentDimension({ width, height });
  }, []);

  const onPeerShareChange = useCallback(() => {
    if (mediaStream) {
      setShareUserList(mediaStream.getShareUserList());
    }
  }, [mediaStream]);

  const onCurrentUserUpdate = useCallback(
    (payload: any) => {
      if (Array.isArray(payload) && payload.length > 0) {
        payload.forEach((item) => {
          if (item.sharerOn !== undefined) {
            const currentUserId = zmClient.getSessionInfo().userId;
            const isCurrentUser = item.userId === currentUserId;

            if (mediaStream) {
              const userList = mediaStream.getShareUserList();
              setShareUserList(userList);
              if (isCurrentUser) {
                setIsStartedShare(item.sharerOn);
              }
            }
          }
        });
      }
    },
    [zmClient, mediaStream]
  );

  const onShareContentChange = useCallback((payload: any) => {
    setActiveSharingId(payload.userId);
  }, []);

  // Event listeners setup
  useEffect(() => {
    zmClient.on('active-share-change', onActiveShareChange);
    zmClient.on('share-content-dimension-change', onSharedContentDimensionChange);
    zmClient.on('user-updated', onCurrentUserUpdate);
    zmClient.on('peer-share-state-change', onPeerShareChange);
    zmClient.on('share-content-change', onShareContentChange);

    return () => {
      zmClient.off('active-share-change', onActiveShareChange);
      zmClient.off('share-content-dimension-change', onSharedContentDimensionChange);
      zmClient.off('user-updated', onCurrentUserUpdate);
      zmClient.off('peer-share-state-change', onPeerShareChange);
      zmClient.off('share-content-change', onShareContentChange);
    };
  }, [
    zmClient,
    onActiveShareChange,
    onSharedContentDimensionChange,
    onCurrentUserUpdate,
    onPeerShareChange,
    onShareContentChange
  ]);

  // Initialize active shared user
  useEffect(() => {
    if (mediaStream) {
      const activeSharedUserId = mediaStream.getActiveShareUserId();
      if (activeSharedUserId) {
        setIsReceiveSharing(true);
        setActiveSharingId(activeSharedUserId);
      }
    }
  }, [mediaStream]);

  // Handle share view attach/detach
  useEffect(() => {
    const handleShareViewChange = async () => {
      if (shareRef.current && previousIsRecieveSharing !== isRecieveSharing) {
        if (isRecieveSharing) {
          if (isVideoPlayer) {
            await mediaStream?.attachShareView(activeSharingId, shareRef.current as VideoPlayer);
          } else {
            await mediaStream?.startShareView(shareRef.current as HTMLCanvasElement, activeSharingId);
          }
        } else if (previousIsRecieveSharing === true && isRecieveSharing === false) {
          if (isVideoPlayer) {
            await mediaStream?.detachShareView(activeSharingId, shareRef.current as VideoPlayer);
          } else {
            await mediaStream?.stopShareView();
          }
        }
      }
    };
    handleShareViewChange();
  }, [
    mediaStream,
    shareRef,
    previousIsRecieveSharing,
    isRecieveSharing,
    activeSharingId,
    shareUserList,
    isVideoPlayer
  ]);

  // Handle active sharing ID changes for video player
  useEffect(() => {
    const handleActiveShareChange = async () => {
      if (
        mediaStream &&
        shareRef.current &&
        isRecieveSharing &&
        !!previousActiveSharingId &&
        !!activeSharingId &&
        isVideoPlayer
      ) {
        if (previousActiveSharingId !== activeSharingId) {
          await mediaStream.detachShareView(previousActiveSharingId, shareRef.current as VideoPlayer);
          await mediaStream.attachShareView(activeSharingId, shareRef.current as VideoPlayer);
        }
      }
    };
    handleActiveShareChange();
  }, [isVideoPlayer, mediaStream, isRecieveSharing, activeSharingId, previousActiveSharingId, shareRef]);

  // Handle simultaneous share logic
  useEffect(() => {
    if (isStartedShare) {
      const currentUserId = zmClient.getSessionInfo().userId;
      const peerShareUser = shareUserList?.filter((user) => user.userId !== currentUserId);

      if (peerShareUser?.length) {
        setIsReceiveSharing(isSimultaneousShareView);
        if (
          (isSimultaneousShareView && activeSharingId === 0) ||
          activeSharingId === currentUserId ||
          !peerShareUser.map((user) => user.userId).includes(activeSharingId)
        ) {
          setActiveSharingId(peerShareUser[0].userId);
        }
      } else {
        setIsReceiveSharing(false);
      }
    }
  }, [isStartedShare, isSimultaneousShareView, shareUserList, activeSharingId, zmClient]);

  // Cleanup on unmount
  useUnmount(async () => {
    if (isRecieveSharing && zmClient.getSessionInfo().isInMeeting) {
      if (isVideoPlayer) {
        mediaStream?.detachShareView(activeSharingId, shareRef.current as VideoPlayer);
      } else {
        mediaStream?.stopShareView();
      }
    }
  });

  return {
    isRecieveSharing,
    isStartedShare,
    sharedContentDimension,
    shareUserList: isRecieveSharing
      ? shareUserList?.filter((user) => user.userId !== zmClient.getSessionInfo().userId)
      : [],
    activeSharingId,
    setActiveSharingId
  };
}
