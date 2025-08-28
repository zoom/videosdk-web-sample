import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import type { ZoomClient, MediaStream, Participant } from '../../../index-types';
import { useActiveMediaFailed } from './useActiveMediaFailed';

export function useMultiShare(zmClient: ZoomClient, mediaStream: MediaStream | null) {
  const [isStartedShare, setIsStartedShare] = useState(false);
  const [isRecieveSharing, setIsReceiveSharing] = useState(false);
  const [shareUserList, setShareUserList] = useState<Array<Participant>>(
    mediaStream?.getShareUserList() as Participant[]
  );
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
                setIsStartedShare(item.sharerOn);
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
    isStartedShare,
    isRecieveSharing,
    shareUserList: isRecieveSharing ? shareUserList : []
  };
}
