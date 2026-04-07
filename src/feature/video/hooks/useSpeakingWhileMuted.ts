import React, { useEffect, useCallback, useContext, useRef } from 'react';
import { notification, Button } from 'antd';
import ZoomContext from '../../../context/zoom-context';
import MediaContext from '../../../context/media-context';
export function useSpeakingWhileMuted() {
  const zmClient = useContext(ZoomContext);
  const { mediaStream } = useContext(MediaContext);
  const notificationKey = useRef<string | null>(null);

  const handleUnmute = useCallback(async () => {
    try {
      if (mediaStream) {
        await mediaStream.unmuteAudio();
        if (notificationKey.current) {
          notification.close(notificationKey.current);
          notificationKey.current = null;
        }
      }
    } catch (error) {
      console.error('Failed to unmute audio:', error);
    }
  }, [mediaStream]);

  const onSpeakingWhileMuted = useCallback(() => {
    // Avoid duplicate notifications
    if (notificationKey.current) {
      return;
    }

    const key = `speaking-while-muted-${Date.now()}`;
    notificationKey.current = key;

    notification.warning({
      key,
      message: 'You are muted',
      description: React.createElement(
        'div',
        null,
        React.createElement('p', null, 'You are speaking while muted. Click the button below to unmute.'),
        React.createElement(
          Button,
          {
            type: 'primary',
            size: 'small',
            onClick: handleUnmute,
            style: { marginTop: 8 }
          },
          'Unmute'
        )
      ),
      duration: 10,
      placement: 'topRight',
      onClose: () => {
        notificationKey.current = null;
      }
    });
  }, [handleUnmute]);
  useEffect(() => {
    zmClient.on('speaking-while-muted', onSpeakingWhileMuted);
    return () => {
      zmClient.off('speaking-while-muted', onSpeakingWhileMuted);
    };
  }, [zmClient, onSpeakingWhileMuted]);
}
