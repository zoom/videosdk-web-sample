import React from 'react';

interface FearureSwitch {
  toggled: boolean;
  enabled: boolean;
}
interface AvatarAction {
  localVolumeAdjust: FearureSwitch & { volume: number };
  farEndCameraControl: FearureSwitch;
}
interface AvatarSwitch {
  [key: string]: AvatarAction;
}
export type AvatarContext = {
  isControllingRemoteCamera?: boolean;
} & AvatarSwitch;
export default React.createContext<{ avatarActionState: AvatarContext; dispatch: React.Dispatch<any> }>(null as any);
