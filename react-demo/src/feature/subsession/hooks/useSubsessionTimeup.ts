import { useCallback, useEffect } from 'react';
import { Modal } from 'antd';
import { SubsessionClient, ZoomClient } from '../../../index-types';
const { confirm } = Modal;
export function useSubsessionTimeUp(
  zmClient: ZoomClient,
  ssClient: SubsessionClient | null,
  isHost: boolean,
  timerDuration?: number
) {
  const onSubsessionTimeUp = useCallback(() => {
    if (isHost && ssClient) {
      confirm({
        title: 'Close All Subsessions',
        content: `Time is up for the ${(timerDuration || 0) / 60} minutes 
        Subsession. Do you want to close all Subsessions now?`,
        okText: 'Close now',
        cancelText: 'Keep subsessions open',
        onCancel: () => {
          /** */
        },
        onOk: () => {
          ssClient.closeAllSubsessions();
        }
      });
    }
  }, [isHost, ssClient, timerDuration]);
  useEffect(() => {
    zmClient.on('subsession-time-up', onSubsessionTimeUp);
    return () => {
      zmClient.off('subsession-time-up', onSubsessionTimeUp);
    };
  }, [zmClient, onSubsessionTimeUp]);
}
