import {
  type ParticipantPropertiesPayload,
  SubsessionAllocationPattern,
  SubsessionUserStatus,
  SubsessionStatus
} from '@zoom/videosdk';
import produce from 'immer';
import { useState, useEffect, useCallback } from 'react';
import { useMount, usePrevious } from '../../../hooks';
import type { SubsessionClient, Participant, ZoomClient } from '../../../index-types';
import type { CurrentSubsession, Subsession } from '../subsession-types';
import { useParticipantsChange } from './useParticipantsChange';
import { useSubsessionOptions } from './useSubsessionOptions';
export function useSubsession(zmClient: ZoomClient, ssClient: SubsessionClient | null) {
  const [subsessions, setSubsessions] = useState<Subsession[]>([]);
  const [subsessionStatus, setSubsessionStatus] = useState<SubsessionStatus>(SubsessionStatus.NotStarted);
  const [userStatus, setUserStatus] = useState<SubsessionUserStatus>(SubsessionUserStatus.Initial);
  const [currentSubsession, setCurrentSubsession] = useState<CurrentSubsession>({
    subsessionName: '',
    subsessionId: '',
    userStatus: SubsessionUserStatus.Initial
  });
  const [unassignedUserList, setUnassignedUserList] = useState<Participant[]>([]);
  const [options, setOptions] = useSubsessionOptions();
  const previousSubsessions = usePrevious(subsessions);

  const onParticipantsChange = useCallback(
    (_participants: any, currentUpdates?: ParticipantPropertiesPayload[]) => {
      if (ssClient) {
        if (subsessionStatus !== SubsessionStatus.NotStarted) {
          const subsessionList = ssClient.getSubsessionList();
          if (subsessionList) {
            setSubsessions(subsessionList);
          }
        }
        if (currentUpdates && currentUpdates.length > 0) {
          setUserStatus(ssClient.getUserStatus());
          setCurrentSubsession(ssClient.getCurrentSubsession());
        }
      }
    },
    [ssClient, subsessionStatus]
  );
  const onSubsessionStateChange = useCallback(
    ({ status }: any) => {
      setSubsessionStatus(status);
      if (ssClient) {
        setUserStatus(ssClient.getUserStatus());
        setSubsessions(ssClient.getSubsessionList());
        setCurrentSubsession(ssClient.getCurrentSubsession());
        const options = ssClient.getSubsessionOptions();
        if (setOptions && options) {
          setOptions.setRoomOptions?.(options as any);
        }
      }
    },
    [ssClient, setOptions]
  );
  const onMainSessionUserChange = useCallback(() => {
    if (ssClient) {
      setSubsessions(ssClient.getSubsessionList());
    }
  }, [ssClient]);
  useParticipantsChange(zmClient, onParticipantsChange);
  const onSubsessionUserUpdate = useCallback((payload: any) => {
    const { userId, subsessionId, audio, muted, bVideoOn, sharerOn, bShareAudioOn, isTalking } = payload;
    setSubsessions(
      produce((rooms: Subsession[]) => {
        const room = rooms.find((r: Subsession) => r.subsessionId === subsessionId);
        if (room) {
          const user = room.userList.find((u) => u.userId === userId);
          if (user) {
            Object.assign(user, { audio, muted, bVideoOn, sharerOn, bShareAudioOn, isTalking });
          }
        }
      })
    );
  }, []);
  useEffect(() => {
    zmClient.on('subsession-state-change', onSubsessionStateChange);
    zmClient.on('main-session-user-updated', onMainSessionUserChange);
    zmClient.on('subsession-user-update', onSubsessionUserUpdate);
    return () => {
      zmClient.off('subsession-state-change', onSubsessionStateChange);
      zmClient.off('main-session-user-updated', onMainSessionUserChange);
      zmClient.off('subsession-user-update', onSubsessionUserUpdate);
    };
  }, [zmClient, onMainSessionUserChange, onSubsessionStateChange, onSubsessionUserUpdate]);
  useEffect(() => {
    if (ssClient && previousSubsessions && previousSubsessions !== subsessions) {
      const assignedUserList = subsessions.reduce((prev: any[], subsession: Subsession) => {
        const attendees = subsession.userList.map((u) => u.userId);
        prev.push(...attendees);
        return prev;
      }, []);
      let unassignedUserList = ssClient.getUnassignedUserList();
      if (subsessionStatus === SubsessionStatus.NotStarted || subsessionStatus === SubsessionStatus.Closed) {
        unassignedUserList = unassignedUserList.filter((u: any) => !assignedUserList.includes(u.userId));
      }
      setUnassignedUserList(unassignedUserList);
    }
  }, [ssClient, subsessions, previousSubsessions, subsessionStatus]);
  useMount(() => {
    if (ssClient) {
      const subsessionStatus = ssClient.getSubsessionStatus();
      setSubsessionStatus(subsessionStatus);
      setSubsessions(ssClient.getSubsessionList());
      setCurrentSubsession(ssClient.getCurrentSubsession());
      const options = ssClient.getSubsessionOptions();
      if (setOptions && options) {
        setOptions.setRoomOptions?.(options as any);
      }
    }
  });
  const createSubsessions = useCallback(
    async (subsessionNumber: number, pattern: SubsessionAllocationPattern) => {
      if (ssClient) {
        try {
          const subsessions = await ssClient.createSubsessions(subsessionNumber, pattern);
          setSubsessions(subsessions as unknown as Subsession[]);
        } catch (e) {
          console.warn(e);
        }
      }
    },
    [ssClient]
  );
  const addSubsession = useCallback(async () => {
    if (ssClient) {
      try {
        const newSubsessions = await ssClient.createSubsessions(1, SubsessionAllocationPattern.Manually);
        if (Array.isArray(newSubsessions)) {
          setSubsessions([...subsessions, ...(newSubsessions as unknown as Subsession[])]);
        }
      } catch (e) {
        console.warn(e);
      }
    }
  }, [ssClient, subsessions]);
  const openSubsessions = useCallback(() => {
    if (ssClient) {
      ssClient.openSubsessions(subsessions, options);
    }
  }, [ssClient, options, subsessions]);
  const assignUserToSubsession = useCallback(
    (userId: number, subsessionId: string, displayName: string, avatar?: string) => {
      if (subsessionStatus === SubsessionStatus.InProgress) {
        if (ssClient) {
          ssClient.assignUserToSubsession(userId, subsessionId);
        }
      }
      setSubsessions(
        produce((subsessions: Subsession[]) => {
          const subsession = subsessions.find((r: Subsession) => r.subsessionId === subsessionId);
          if (subsession) {
            subsession.userList.push({
              userId,
              displayName,
              avatar,
              isInSubsession: false
            });
          }
        })
      );
    },
    [ssClient, subsessionStatus]
  );
  const moveUserToSubsession = useCallback(
    (userId: number, targetSubsessionId: string, sourceSubsessionId: string, displayName: string, avatar?: string) => {
      if (subsessionStatus === SubsessionStatus.InProgress) {
        ssClient?.moveUserToSubsession(userId, targetSubsessionId);
      }
      setSubsessions(
        produce((rooms: Subsession[]) => {
          const room = rooms.find((r: Subsession) => r.subsessionId === targetSubsessionId);
          const sourceRoom = rooms.find((r: Subsession) => r.subsessionId === sourceSubsessionId);
          const index = sourceRoom?.userList.findIndex((u) => u.userId === userId);
          if (index !== undefined) {
            sourceRoom?.userList.splice(index, 1);
          }
          if (room) {
            room.userList.push({
              userId,
              displayName,
              avatar,
              isInSubsession: false
            });
          }
        })
      );
    },
    [subsessionStatus, ssClient]
  );
  const moveUserBackToMainSession = useCallback(
    (userId: number) => {
      if (subsessionStatus === SubsessionStatus.InProgress) {
        ssClient?.moveBackToMainSession(userId);
      }
    },
    [ssClient, subsessionStatus]
  );
  return {
    subsessions,
    subsessionStatus,
    subsessionOptions: options,
    userStatus,
    currentSubsession,
    unassignedUserList,
    createSubsessions,
    addSubsession,
    openSubsessions,
    assignUserToSubsession,
    moveUserToSubsession,
    moveUserBackToMainSession,
    setSubsessionOptions: setOptions
  };
}
