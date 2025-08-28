import { useCallback, useEffect } from 'react';
import { Modal, message as toast } from 'antd';
import { ActiveMediaFailedCode } from '@zoom/videosdk';
import type { ZoomClient } from '../../../index-types';

interface ErrMessagePayload {
  message: string;
  code: number;
  type: string;
}

export function useActiveMediaFailed(zmClient: ZoomClient) {
  const onActiveMediaFailed = useCallback((payload: ErrMessagePayload) => {
    const { code, message } = payload;
    const { MicrophoneMuted, AudioStreamMuted, AudioPlaybackInterrupted, VideoStreamMuted } = ActiveMediaFailedCode;
    if ([MicrophoneMuted, AudioStreamMuted, AudioPlaybackInterrupted, VideoStreamMuted].includes(code)) {
      toast.warning(message, 8);
    } else {
      Modal.error({
        title: `Active media failed - Code:${code}`,
        content: message,
        okText: 'Refresh',
        cancelText: 'Cancel',
        closable: true,
        onOk: () => {
          window.location.reload();
        },
        onCancel: () => {
          return true;
        }
      });
    }
  }, []);

  useEffect(() => {
    zmClient.on('active-media-failed', onActiveMediaFailed);
    return () => {
      zmClient.off('active-media-failed', onActiveMediaFailed);
    };
  }, [zmClient, onActiveMediaFailed]);

  return {
    onActiveMediaFailed
  };
}
