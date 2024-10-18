import React from 'react';
import { Participant } from '../../../index-types';

interface FeatureSwitch {
  toggled: boolean;
  enabled: boolean;
}
interface AvatarAction {
  localVolumeAdjust: FeatureSwitch & { volume: number };
  farEndCameraControl: FeatureSwitch;
  videoResolutionAdjust: FeatureSwitch;
}
interface AvatarSwitch {
  [key: string]: AvatarAction;
}
export type AvatarContext = {
  isControllingRemoteCamera?: boolean;
  spotlightedUserList?: Participant[];
} & AvatarSwitch;
export default React.createContext<{ avatarActionState: AvatarContext; dispatch: React.Dispatch<any> }>(null as any);
