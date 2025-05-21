import type {
  VideoProcessor as SDKVideoProcessor,
  AudioProcessor as SDKAudioProcessor,
  registerProcessor as SDKregisterProcessor
} from '@zoom/videosdk';
declare global {
  const VideoProcessor: typeof SDKVideoProcessor;
  const AudioProcessor: typeof SDKAudioProcessor;
  const registerProcessor: typeof SDKregisterProcessor;
}
