import { type MutableRefObject, useState, useCallback, useEffect } from 'react';
import { usePrevious, useUnmount } from '../../../hooks';
import type { ZoomClient, MediaStream, Participant } from '../../../index-types';
import { Modal, message as toast } from 'antd';
import { ActiveMediaFailedCode } from '@zoom/videosdk';
interface ErrMessagePayload {
  message: string;
  code: number;
  type: string;
}
export function useShare(
  zmClient: ZoomClient,
  mediaStream: MediaStream | null,
  shareRef: MutableRefObject<HTMLCanvasElement | HTMLVideoElement | null>
) {
  const [isRecieveSharing, setIsReceiveSharing] = useState(false);
  const [isStartedShare, setIsStartedShare] = useState(false);
  const [activeSharingId, setActiveSharingId] = useState(0);
  const [sharedContentDimension, setSharedContentDimension] = useState({
    width: 0,
    height: 0
  });
  const [sharUserList, setShareUserId] = useState<Array<Participant> | undefined>(mediaStream?.getShareUserList());
  const onActiveShareChange = useCallback(
    ({ state, userId }: any) => {
      if (!isStartedShare) {
        setActiveSharingId(userId);
        setIsReceiveSharing(state === 'Active');
      }
    },
    [isStartedShare]
  );
  const onSharedContentDimensionChange = useCallback(({ width, height }: any) => {
    setSharedContentDimension({ width, height });
  }, []);
  const onPeerShareChange = useCallback(() => {
    if (mediaStream) {
      setShareUserId(mediaStream.getShareUserList());
    }
  }, [mediaStream]);
  const onCurrentUserUpdate = useCallback(
    (payload: any) => {
      if (Array.isArray(payload) && payload.length > 0) {
        payload.forEach((item) => {
          if (item.userId === zmClient.getSessionInfo().userId && item.sharerOn !== undefined) {
            setIsStartedShare(item.sharerOn);
            if (item.sharerOn) {
              setIsReceiveSharing(false);
            }
            if (mediaStream) {
              setShareUserId(mediaStream.getShareUserList());
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

  const onActiveMediaFailed = useCallback((payload: ErrMessagePayload) => {
    const { code, message } = payload;
    const { MicrophoneMuted, AudioStreamMuted, AudioPlaybackInterrupted } = ActiveMediaFailedCode;
    if ([MicrophoneMuted, AudioStreamMuted, AudioPlaybackInterrupted].includes(code)) {
      toast.warning(message, 2);
    } else {
      Modal.error({
        title: `Active media failed - Code:${code}`,
        content: message,
        okText: 'Refresh',
        onOk: () => {
          window.location.reload();
        }
      });
    }
  }, []);
  useEffect(() => {
    zmClient.on('active-share-change', onActiveShareChange);
    zmClient.on('share-content-dimension-change', onSharedContentDimensionChange);
    zmClient.on('user-updated', onCurrentUserUpdate);
    zmClient.on('peer-share-state-change', onPeerShareChange);
    zmClient.on('share-content-change', onShareContentChange);
    zmClient.on('active-media-failed', onActiveMediaFailed);
    return () => {
      zmClient.off('active-share-change', onActiveShareChange);
      zmClient.off('share-content-dimension-change', onSharedContentDimensionChange);
      zmClient.off('user-updated', onCurrentUserUpdate);
      zmClient.off('peer-share-state-change', onPeerShareChange);
      zmClient.off('share-content-change', onShareContentChange);
      zmClient.off('active-media-failed', onActiveMediaFailed);
    };
  }, [
    zmClient,
    onActiveShareChange,
    onSharedContentDimensionChange,
    onCurrentUserUpdate,
    onPeerShareChange,
    onShareContentChange,
    onActiveMediaFailed
  ]);
  const previousIsRecieveSharing = usePrevious(isRecieveSharing);
  useEffect(() => {
    if (shareRef.current && previousIsRecieveSharing !== isRecieveSharing) {
      if (isRecieveSharing) {
        mediaStream?.startShareView(shareRef.current as HTMLCanvasElement, activeSharingId);
      } else if (previousIsRecieveSharing === true && isRecieveSharing === false) {
        mediaStream?.stopShareView();
      }
    }
  }, [mediaStream, shareRef, previousIsRecieveSharing, isRecieveSharing, activeSharingId]);
  useEffect(() => {
    if (mediaStream) {
      const activeSharedUserId = mediaStream.getActiveShareUserId();
      if (activeSharedUserId) {
        setIsReceiveSharing(true);
        setActiveSharingId(activeSharedUserId);
      }
    }
  }, [mediaStream]);
  useUnmount(() => {
    if (isRecieveSharing && zmClient.getSessionInfo().isInMeeting) {
      mediaStream?.stopShareView();
    }
  });
  return { isRecieveSharing, isStartedShare, sharedContentDimension, sharUserList, activeSharingId };
}
