import { useCallback, useEffect } from 'react';
import { notification } from 'antd';
import { ZoomClient } from '../../../index-types';
const broadcastNotificationKey = 'BoNitification';
export function useBroadcastMessage(zmClient: ZoomClient) {
  const onBroadcastMessage = useCallback(
    (payload) => {
      notification.open({
        key: broadcastNotificationKey,
        message: `${zmClient.getSessionHost()?.displayName} to Everyone`,
        description: payload.message,
        placement: 'topRight'
      });
    },
    [zmClient]
  );
  useEffect(() => {
    zmClient.on('subsession-broadcast-message', onBroadcastMessage);
    return () => {
      zmClient.off('subsession-broadcast-message', onBroadcastMessage);
    };
  }, [zmClient, onBroadcastMessage]);
}
