import { useState, useCallback, useEffect } from 'react';
import { ZoomClient } from '../../../index-types';
interface SubsessionInvite {
  subsessionId: string;
  subsessionName: string;
  accepted?: boolean;
}
export function useInviteJoinSubsession(zmClient: ZoomClient) {
  const [invitedToJoin, setInvitedToJoin] = useState<SubsessionInvite | undefined>();
  const [visible, setVisible] = useState(false);
  const onSubsessionInvited = useCallback((payload: any) => {
    setInvitedToJoin({
      subsessionId: payload.subsessionId,
      subsessionName: payload.subsessionName
    });
    setVisible(true);
  }, []);
  useEffect(() => {
    zmClient.on('subsession-invite-to-join', onSubsessionInvited);
    return () => {
      zmClient.off('subsession-invite-to-join', onSubsessionInvited);
    };
  }, [zmClient, onSubsessionInvited]);
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
