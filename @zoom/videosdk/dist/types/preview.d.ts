/**
 * Interface for starting/stopping local video capture
 */
export interface LocalVideoTrack {
  /**
   * Starts local video capture and plays it back in a video DOM element
   *
   * @param videoDOMElement Video DOM element that will contain the video playback
   */
  start(videoDOMElement: HTMLVideoElement): Promise<void | Error>;
  /**
   * Stops local video capture
   */
  stop(): Promise<void | Error>;
}
/**
 * Interface for managing local audio capture
 */
export interface LocalAudioTrack {
  /**
   * Starts local audio capture with mic muted
   */
  start(): Promise<void | Error>;
  /**
   * Unmutes mic if audio was started, and mic is not already unmuted
   */
  unmute(): Promise<void | Error>;
  /**
   * Mutes mic if audio was started, and mic is not already muted
   */
  mute(): Promise<void | Error>;
  /**
   * Returns the current volume of the local input device
   */
  getCurrentVolume(): number;
  /**
   * Stops local audio capture
   */
  stop(): Promise<void | Error>;
}
