import { useUnmount } from '../../../hooks/useUnmount';
import type { MediaStream, ZoomClient } from '../../../index-types';

export function useCleanUp(container: HTMLCanvasElement | null, zmClient: ZoomClient, mediaStream: MediaStream | null) {
  useUnmount(() => {
    /**
     * Final cleanup work to prevent inconsistent states caused by abnormal operations.
     */
    if (container) {
      zmClient.getAllUser().forEach((user) => {
        if (user.bVideoOn && user.userId !== zmClient.getSessionInfo().userId) {
          mediaStream?.stopRenderVideo(container, user.userId);
        }
      });
    }
  });
}
