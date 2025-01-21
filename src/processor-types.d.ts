import type { VideoProcessor as SDKVideoProcessor, registerProcessor as SDKregisterProcessor } from '@zoom/videosdk';
declare global {
  const VideoProcessor: typeof SDKVideoProcessor;
  const registerProcessor: typeof SDKregisterProcessor;
}
