import { MediaCompatiblity, VideoClient } from './videoclient';
import { LocalVideoTrack, LocalAudioTrack } from './preview';

declare namespace ZoomVideo {
  /**
   * The version of the Zoom Video Web SDK.
   */
  const VERSION: string;
  /**
   * Creates a client for managing the meeting.
   * This method will return a same instance if called multi times.
   * This is usually the first step of using the Zoom Video Web SDK.
   * @category ZOOM Core
   */
  function createClient(): typeof VideoClient;

  /**
   * Checks the compatibility of the current browser.
   * Use this method before calling {@link init} to check if the SDK is compatible with the web browser.
   *
   * @returns A `MediaCompatiblity` object. The object has following properties:
   * - `audio`: boolean, whether the audio is compatible with the current web browser.
   * - `video`: boolean, whether the video is compatible with the current web browser.
   * - `screen`: boolean, whether the screen is compatible with the current web browser.
   */
  function checkSystemRequirements(): MediaCompatiblity;
  /**
   * Enumerates the media input and output devices available, such as microphones, cameras, and headsets.
   *
   * If this method call succeeds, the SDK returns a list of media devices in an array of [MediaDeviceInfo](https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo) objects.
   *
   * > Calling this method turns on the camera and microphone shortly for the device permission request. On browsers including Chrome 81 or later, Firefox, and Safari, the SDK cannot get accurate device information without permission for the media device.
   *
   * ```javascript
   * ZoomVideo.getDevices().then(devices => {
   *  console.log(devices);
   * }).catch(e => {
   *  console.log('get devices error!', e);
   * })
   *
   * // Using await...
   * try {
   *  const devices = await ZoomVideo.getDevices();
   *  console.log(devices);
   * } catch (e) {
   *  console.log('get devices error!', e);
   * }
   * ```
   * @param skipPermissionCheck Whether to skip the permission check. If you set this parameter as `true`, the SDK does not trigger the request for media device permission. In this case, the retrieved media device information may be inaccurate.
   * - `true`: Skip the permission check.
   * - `false`: (Default) Do not skip the permission check.
   *
   * @returns
   * - Array<MediaDeviceInfo>, an array of [MediaDeviceInfo](https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo) objects
   */
  function getDevices(
    skipPermissionCheck?: boolean,
  ): Promise<Array<MediaDeviceInfo>>;
  /**
   * Creates a new {@link LocalAudioTrack} to manage local audio capture
   * @param [deviceId] Optional device ID to use for local capture
   */
  function createLocalAudioTrack(deviceId?: string): LocalAudioTrack;
  /**
   * Creates a new {@link LocalVideoTrack} to start/stop local video capture and playback
   * @param [deviceId] Optional device ID to use for local capture
   */
  function createLocalVideoTrack(deviceId?: string): LocalVideoTrack;
  /**
   * Destroy the client
   */
  function destroyClient(): void;
}

export default ZoomVideo;
