import React, { useState } from 'react';
import { ZoomClient, MediaStream } from '../../../index-types';
export function useRemoteControl(
  zmClient: ZoomClient,
  mediaStream: MediaStream | null,
  selfShareView: HTMLCanvasElement | HTMLVideoElement | null,
  shareView: HTMLCanvasElement | null
) {
  const [isControllingUser, setIsControllingUser] = useState(false);
  const [controllingUser, setControllingUser] = useState<{ userId: number; displayName: string } | null>(null);
  setControllingUser({ userId: 0, displayName: '' });
  return { isControllingUser, controllingUser };
}
