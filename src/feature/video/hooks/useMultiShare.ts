import { useCallback, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import type { ZoomClient, MediaStream, Participant } from '../../../index-types';
import { useActiveMediaFailed } from './useActiveMediaFailed';
import { ShareStatus } from '@zoom/videosdk';

export function useMultiShare(zmClient: ZoomClient, mediaStream: MediaStream | null) {
  const [isRecieveSharing, setIsReceiveSharing] = useState(false);
  const [shareStatus, setShareStatus] = useState(mediaStream?.getShareStatus());

  const [shareUserList, setShareUserList] = useState<Array<Participant>>(
    mediaStream?.getShareUserList() as Participant[]
  );
  const isStartedShare = useMemo(() => shareStatus !== ShareStatus.End, [shareStatus]);
  const [searchParams] = useSearchParams();
  useActiveMediaFailed(zmClient);
  const isSimultaneousShareView = searchParams.get('simultaneousShareView') === '1' && isStartedShare;
  const onUserShareChange = useCallback(
    (payload: any) => {
      if (Array.isArray(payload) && payload.length > 0) {
        payload.forEach((item) => {
          if (item.sharerOn !== undefined) {
            const currentUserId = zmClient.getSessionInfo().userId;
            const isCurrentUser = item.userId === currentUserId;

            if (mediaStream) {
              const userList = mediaStream.getShareUserList();
              setShareUserList(userList.filter((user) => user.userId !== currentUserId));
              if (isCurrentUser) {
                setShareStatus(mediaStream.getShareStatus());
              }
            }
          }
        });
      }
    },
    [zmClient, mediaStream]
  );
  const onPeerShareChange = useCallback(() => {
    if (mediaStream) {
      const userList = mediaStream.getShareUserList();
      const currentUser = zmClient.getCurrentUserInfo();
      setShareUserList(userList.filter((user) => user.userGuid !== currentUser.userGuid));
    }
  }, [mediaStream, zmClient]);
  useEffect(() => {
    zmClient.on('user-updated', onUserShareChange);
    zmClient.on('peer-share-state-change', onPeerShareChange);
    return () => {
      zmClient.off('user-updated', onUserShareChange);
      zmClient.off('peer-share-state-change', onPeerShareChange);
    };
  }, [zmClient, onUserShareChange, onPeerShareChange]);
  useEffect(() => {
    const currentUserId = zmClient.getSessionInfo().userId;
    const peerShareUser = shareUserList?.filter((user) => user.userId !== currentUserId);
    if (isStartedShare) {
      setIsReceiveSharing(isSimultaneousShareView && !!peerShareUser && peerShareUser.length > 0);
    } else {
      setIsReceiveSharing(!!shareUserList && shareUserList?.length > 0);
    }
  }, [zmClient, shareUserList, isSimultaneousShareView, isStartedShare]);
  return {
    shareStatus,
    isRecieveSharing,
    shareUserList: isRecieveSharing ? shareUserList : []
  };
}
