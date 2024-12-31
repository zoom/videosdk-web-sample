import { useCallback, useEffect } from 'react';
import { Modal, message } from 'antd';
import type { SubsessionClient, ZoomClient } from '../../../index-types';
import { AskHostHelpResponse } from '@zoom/videosdk';
const { confirm } = Modal;
export function useAskForHelp(zmClient: ZoomClient, ssClient: SubsessionClient | null) {
  // Host reecived the ask for help request
  const onAskForHelp = useCallback(
    (payload: any) => {
      const { userId, displayName, subsessionName, subsessionId } = payload;
      confirm({
        title: 'Ask for Help',
        content: `${displayName} in ${subsessionName} asked for help.`,
        okText: 'Join subsession',
        cancelText: 'Not now',
        onOk: () => {
          ssClient?.joinSubsession(subsessionId);
        },
        onCancel: () => {
          ssClient?.postponeHelping(userId);
        }
      });
    },
    [ssClient]
  );
  // Attendee received the response of ask for help request
  const onAskForHelpResponse = useCallback((payload: any) => {
    const { result } = payload;
    if (result === AskHostHelpResponse.Received) {
      message.success('The host has been invited.');
    } else if (result === AskHostHelpResponse.Busy || result === AskHostHelpResponse.Ignore) {
      message.warning('The host is currently helping others.Please try again later.');
    } else if (result === AskHostHelpResponse.AlreadyInRoom) {
      message.success('The host is currently in this subsession.');
    }
  }, []);
  useEffect(() => {
    zmClient.on('subsession-ask-for-help', onAskForHelp);
    zmClient.on('subsession-ask-for-help-response', onAskForHelpResponse);
    return () => {
      zmClient.off('subsession-ask-for-help', onAskForHelp);
      zmClient.off('subsession-ask-for-help-response', onAskForHelpResponse);
    };
  }, [zmClient, onAskForHelp, onAskForHelpResponse]);
}
