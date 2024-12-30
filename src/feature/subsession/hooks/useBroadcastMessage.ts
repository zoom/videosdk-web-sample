import { useCallback, useEffect } from 'react';
import { notification, message } from 'antd';
import type { ZoomClient } from '../../../index-types';
const broadcastNotificationKey = 'BoNotification';
export function useBroadcastMessage(zmClient: ZoomClient) {
  const onBroadcastMessage = useCallback(
    (payload: any) => {
      notification.open({
        key: broadcastNotificationKey,
        message: `${zmClient.getSessionHost()?.displayName} to Everyone`,
        description: payload.message,
        placement: 'topRight'
      });
    },
    [zmClient]
  );
  const onBroadcastVoice = useCallback(
    (payload: any) => {
      const { status } = payload;
      if (status) {
        message.info(`${zmClient.getSessionHost()?.displayName}(Host) is broadcasting`);
      }
    },
    [zmClient]
  );
  useEffect(() => {
    zmClient.on('subsession-broadcast-message', onBroadcastMessage);
    zmClient.on('subsession-broadcast-voice', onBroadcastVoice);
    return () => {
      zmClient.off('subsession-broadcast-message', onBroadcastMessage);
      zmClient.off('subsession-broadcast-voice', onBroadcastVoice);
    };
  }, [zmClient, onBroadcastMessage, onBroadcastVoice]);
}
