import { useState, useCallback, useEffect } from 'react';
import type { ZoomClient } from '../../../index-types';
interface SubsessionInvite {
  subsessionId: string;
  subsessionName: string;
  accepted?: boolean;
  backMainSession?: boolean;
  inviterName?: string;
}
export function useInviteJoinSubsession(zmClient: ZoomClient) {
  const [invitedToJoin, setInvitedToJoin] = useState<SubsessionInvite | undefined>();
  const [visible, setVisible] = useState(false);
  const onSubsessionInvited = useCallback((payload: any) => {
    setInvitedToJoin({
      subsessionId: payload.subsessionId,
      subsessionName: payload.subsessionName,
      backMainSession: false
    });
    setVisible(true);
  }, []);
  const onBackToMainSessionInvited = useCallback((payload: any) => {
    const { inviterId, inviterGuid, inviterName } = payload;
    setInvitedToJoin({
      backMainSession: true,
      inviterName,
      subsessionId: '',
      subsessionName: ''
    });
    setVisible(true);
  }, []);
  useEffect(() => {
    zmClient.on('subsession-invite-to-join', onSubsessionInvited);
    zmClient.on('subsession-invite-back-to-main-session', onBackToMainSessionInvited);
    return () => {
      zmClient.off('subsession-invite-to-join', onSubsessionInvited);
      zmClient.off('subsession-invite-back-to-main-session', onBackToMainSessionInvited);
    };
  }, [zmClient, onSubsessionInvited, onBackToMainSessionInvited]);
  return {
    invitedToJoin,
    inviteVisible: visible,
    setInviteVisible: setVisible,
    setInviteAccepted: (accepted: boolean) => {
      if (invitedToJoin) {
        setInvitedToJoin({ ...invitedToJoin, accepted });
      }
    }
  };
}
