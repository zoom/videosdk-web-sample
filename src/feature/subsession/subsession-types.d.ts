import { SubsessionUserStatus, Participant } from '@zoom/videosdk';
interface SubsessionParticipant {
  isInSubsession?: boolean;
  userId: number;
  displayName: string;
  avatar?: string;
  userGuid?: string;
}
export interface Subsession {
  subsessionName: string;
  subsessionId: string;
  userList: Array<SubsessionParticipant>;
}

export interface CurrentSubsession {
  subsessionName: string;
  subsessionId: string;
  userStatus: SubsessionUserStatus;
}
export interface SubsessionOptions {
  isAutoJoinSubsession: boolean;
  isBackToMainSessionEnabled: boolean;
  isTimerEnabled: boolean;
  timerDuration: number;
  isTimerAutoEnabled: boolean;
  waitSeconds: number;
}
