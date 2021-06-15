import { ExecutedResult } from './common';

/**
 * Interface of media device
 */
export interface MediaDevice {
  /**
   * Label of the device
   */
  label: string;
  /**
   * Identify of device
   */
  deviceId: string;
}
/**
 * Share privilege
 */
export enum SharePrivilege {
  /**
   * One participant can share at a time, only the host or manager can start sharing when someone else is sharing.
   */
  Unlocked = 0,
  /**
   * Only the host or manager can share
   */
  Locked = 1,
}

export interface CaptureVideoOption {
  /**
   * Id of the camera for capturing the video, if not specified, use system default
   */
  cameraId?: string;
  /**
   * Customized width of capture, 640 as default
   */
  captureWidth?: number;
  /**
   * Customized height of capture, 360 as
   */
  captureHeight?: number;
}

export enum VideoQuality {
  Video_90P = 0,
  Video_180P = 1,
  Video_360P = 2,
  Video_720P = 3,
}
export interface UnderlyingColor {
  R: number;
  G: number;
  B: number;
  A: number;
}

/**
 * The Stream interface provides methods that define the behaviors of a Stream object, such as the mute audio, capture video.
 *
 * The Stream object is created by the `getMediaStream` method..
 */
export declare namespace Stream {
  // ------------------------------------------------[audio]------------------------------------------------------------
  /**
   * Join audio by the microphone and speaker.
   * - It works only the audio flag is `true` in the media constraints.
   * - If the participant has joined audio by the phone, he/she cannot join the computer audio.
   *
   * ```javascript
   * await client.init();
   * await client.join(topic, signature, username, password);
   * const stream = client.getMediaStream();
   * await stream.startAudio();
   * ```
   * @returns executed promise. Following are the possible error reasons:
   * - type=`USER_FORBIDDEN_MICROPHONE`: The user has blocked accesses to the microphone from the sdk, try to grant the privilege and rejoin the meeting.
   */
  function startAudio(): ExecutedResult;

  /**
   * Leave the computer audio
   * - It works only the audio flag is `true` in the media constraints.
   */
  function stopAudio(): ExecutedResult;

  /**
   * Mute audio
   * - If userId is not specified, this will mute muself.
   * - Only the **host** or **manager** can mute others.
   * - If an attendee is allowed to talk, the host can also mute him/her.
   * @param userId Default `undefined`
   */
  function muteAudio(userId?: number): ExecutedResult;
  /**
   * Unmute audio
   * - If userId is not specified, this will unmute self.
   * - For privacy and security concerns, the host can not unmute the participant's audio directly, instead, the participant will receive an unmute audio consent.
   *
   * ```javascript
   * // unmute myself
   * if(stream.isAllowToUnmute()){
   *  await stream.unmuteAudio();
   * }
   * // host unmute others
   * await stream.unmuteAudio(userId);
   * // participant side
   * client.on('unmute-audio-consent',(payload)=>{
   *  console.log('Host ask me to unmute');
   * })
   * ```
   * @param userId Default `undefined`
   *
   */
  function unmuteAudio(userId?: number): ExecutedResult;

  /**
   * Whether the user is muted.
   * - If not specified the user id, get the muted of current user.
   * @param userId Default `undefined`
   * @return boolean
   */
  function isAudioMuted(userId?: number): boolean;

  /**
   * Get the available microphones.
   */
  function getMicList(): Array<MediaDevice>;
  /**
   * Get the available speakers.
   */
  function getSpeakerList(): Array<MediaDevice>;

  /**
   * Get the active device id of microphone.
   * @returns device id
   */
  function getActiveMicrophone(): string;
  /**
   * Get the active device of speaker.
   * @returns device id
   */
  function getActiveSpeaker(): string;

  /**
   * Switch the microphone
   *
   * ```javascript
   *  const microphones = stream.getMicList();
   *  const microphone = microphones.length>0 && microphones[0];
   *  await switchMicrophone(microphone);
   * ```
   * @param microphoneId the device id of microphone
   *
   */
  function switchMicrophone(microphoneId: string): ExecutedResult;
  /**
   * Switch the speaker
   *
   * @param speakerId the device id of speaker
   *
   */
  function switchSpeaker(speakerId: string): ExecutedResult;

  // -------------------------------------------------[video]-----------------------------------------------------------

  /**
   * Start capture video by a specified camera.
   *
   * **Note**
   * - It may take user some time to allow browser access camera device. Therefore there is no default timeout.
   *
   * **Example**
   * ```javascript
   * try {
   *   await stream.startVideo();
   * } catch (error) {
   *   console.log(error);
   * }
   * ```
   *
   * @param {CaptureVideoOption} [option] Optional options for starting video capture
   *
   * @returns
   * - `''`: Success
   * - `Error`: Failure. Errors besides {@link ErrorTypes} that may be returned are listed below.
   *   - `CAN_NOT_DETECT_CAMERA`: Cannot detect camera device.
   *   - `CAN_NOT_FIND_CAMERA`: The provided camera device id is not included in camera device list.
   *   - `VIDEO_USER_FORBIDDEN_CAPTURE`: The user has forbidden use camera, he/she can allow camera and rejoin the meeting.
   *   - `VIDEO_ESTABLISH_STREAM_ERROR`: Video websocket is broken.
   *   - `VIDEO_CAMERA_IS_TAKEN`: User's camera is taken by other programs.
   */
  function startVideo(option?: CaptureVideoOption): ExecutedResult;

  /**
   * Stop current video capturing.
   *
   *
   * **Example**
   * ```javascript
   * try{
   *   await stream.stopVideo();
   * } catch (error) {
   *   console.log(error);
   * }
   * ```
   *
   * @returns
   * - `''`: Success
   * - `Error`: Failure. Details in {@link ErrorTypes}.
   */
  function stopVideo(): ExecutedResult;

  /**
   *
   * Change camera device for capturing video.
   *
   * **Note**
   * - The camera device id is accessible only after the user allows the browser to access camera devices.
   *
   * **Example**
   * ```javascript
   * try{
   *   const newCameraDeviceId = stream.getCameraList()[0];
   *   await stream.switchCamera(newCameraDeviceId);
   * } catch (error) {
   *   console.log(error);
   * }
   * ```
   *
   * @param cameraDeviceId The id of camera device.
   *   - {@link Stream.getCameraList} can be used to get current accessible camera device.
   *
   */
  function switchCamera(cameraDeviceId: string): ExecutedResult;

  /**
   *
   * Start render video
   *
   * **Note**
   * - It works only when the video flag is `true` in media constraints.
   *
   * **Example**
   * ```javascript
   * try{
   *   const canvas = document.querySelector('#canvas-id');
   *   await stream.renderVideo(canvas,userId,300,200,0,0,1);
   * } catch (error)  {
   *   console.log(error);
   * }
   * ```
   *
   * @param canvas Required. The canvas to render the video.
   * @param userId Required. The user id which to render the video.
   * @param width Required. Width of the video.
   * @param height Required. Height of the video.
   *
   * ** Note **
   *
   * The origin of the coordinates is in the lower left corner of the canvas
   *
   * @param x Required. Coordinate x of video.
   * @param y Required. Coordinate y of video.
   * @param videoQuality Required. Quality of the video. 90P/180P/360P/720P. Currently supports up to 360P
   * @param additionalUserKey Optional. Used for render the same video on different coordinate of the canvas.
   *
   * @returns
   * - `''`: Success
   * - `Error`: Failure. Deatils in {@link ErrorTypes}.
   */
  function renderVideo(
    canvas: HTMLCanvasElement,
    userId: number,
    width: number,
    height: number,
    x: number,
    y: number,
    videoQuality: VideoQuality,
    additionalUserKey?: string,
  ): Promise<'' | Error>;

  /**
   * Stop render the video.
   *
   * **Note**
   * - It works only when the video flag is `true` in media constraints.
   *
   * **Example**
   * ```javascript
   * try{
   *   await stream.stopRenderVideo();
   * } catch (error)  {
   *   console.log(error);
   * }
   * ```
   * @param canvas Required. The canvas to render the video.
   * @param userId Required. The user id which to render the video.
   * @param additionalUserKey Optional. Must be paired with `renderVideo`.
   * @param underlyingColor Optional. Underlying color when video is stopped,default is transparent.
   * @param isKeepLastFrame Optional. Whether keep the last frame when stop the video.
   * @returns
   * - `''`: Success.
   * - `Error`: Failure. Details in {@link ErrorTypes}.
   */
  function stopRenderVideo(
    canvas: HTMLCanvasElement,
    userId: number,
    additionalUserKey?: string,
    underlyingColor?: UnderlyingColor,
    isKeepLastFrame?: boolean,
  ): ExecutedResult;

  /**
   * Update the dimension of the canvas
   *  Used to update the width/height when the styed width/height changed.
   *
   * @param canvas Required. The canvas to render the video.
   * @param width Required. New width of canvas
   * @param height Required. New height of canvas
   *
   * * @returns
   * - `''`: Success.
   * - `Error`: Failure. Details in {@link ErrorTypes}.
   */
  function updateVideoCanvasDimension(
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
  ): ExecutedResult;
  /**
   * Adjust the coordinates and dimension of rendered video.
   *
   * @param canvas Required. The canvas to render the video.
   * @param userId Required. The user id which to render the video.
   * @param width Required. Width of the video.
   * @param height Required. Height of the video.
   * @param x Required. Coordinate x of video.
   * @param y Required. Coordinate y of video.
   * @param additionalUserKey Optional. Must be paired with `renderVideo`.
   *
   *  * @returns
   * - `''`: Success.
   * - `Error`: Failure. Details in {@link ErrorTypes}.
   */
  function adjustRenderedVideoPosition(
    canvas: HTMLCanvasElement,
    userId: number,
    width: number,
    height: number,
    x: number,
    y: number,
    additionalUserKey?: string,
  ): ExecutedResult;
  /**
   * Clear all the canvas
   * @param canvas Required. The canvas to render the video.
   * @param underlyingColor Optional. Underlying color when video is stopped,default is transparent.
   */
  function clearVideoCanvas(
    canvas: HTMLCanvasElement,
    underlyingColor?: UnderlyingColor,
  ): ExecutedResult;

  /**
   *
   * Get the isCapturingVideo flag status.
   *
   * **Example**
   * ```javascript
   * try{
   *   const isCapturingVideo = stream.isCapturingVideo();
   *   console.log(isCapturingVideo);
   * } catch (error) {
   *   console.log(error);
   * }
   * ```
   *
   * @returns
   * - `true`: The stream object is capturing video.
   * - `false`: The stream object is not capturing video.
   */
  function isCapturingVideo(): boolean;

  /**
   *
   * Get the isCameraTaken flag status.
   *
   * **Example**
   * ```javascript
   * try{
   *   const isCameraTaken = stream.isCameraTaken();
   *   console.log(isCameraTaken);
   * } catch (error) {
   *   console.log(error);
   * }
   * ```
   *
   * @returns
   * - `true`: The camera is taken by other program.
   * - `false`: The camera is taken by other program.
   */
  function isCameraTaken(): boolean;

  /**
   * Get the isCaptureForbidden flag status.
   *
   * **Example**
   * ```javascript
   * try{
   *   const isCaptureForbidden = stream.isCaptureForbidden();
   *   console.log(isCaptureForbidden);
   * } catch (error) {
   *   console.log(error);
   * }
   * ```
   *
   * #### Parameters
   * None.
   *
   * @returns
   * - `true`: The capture is forbidden by user.
   * - `false`: The capture is not forbidden by user or the video flag is `false` in media constraints.
   */
  function isCaptureForbidden(): boolean;

  /**
   * Get the current camera devices list.
   *
   * **Note**
   * - This camera device list is collected from browser's navigator.mediaDevices object and maintained by the stream object.
   * - If the user does not allow permission to access the camera, this list will have a default CameraDevice object with all property set to empty string.
   *
   * **Example**
   * ```javascript
   * try{
   *   const currentCameraDevicesList = stream.getCameraList();
   *   console.log(currentCameraDevicesList);
   * } catch (error) {
   *   console.log(error);
   * }
   * ```
   *
   * @returns
   * - `[]`: The video flag is `false` in media constraints.
   * - `Array<CameraDevice>`: A CameraDevice interface has following property:
   *   - `label: string`: The label of camera device.
   *   - `deviceId: string`: The string of camera device.
   */
  function getCameraList(): Array<MediaDevice>;

  /**
   * Get the recently active camera devices id.
   *
   * **Example**
   * ```javascript
   * try{
   *   const activeCamera = stream.getActiveCamera();
   *   console.log(activeCamera);
   * } catch (error) {
   *   console.log(error);
   * }
   * ```
   *
   * @returns
   * - `''`: The video flag is `false` in media constraints.
   * - `'default'`: No camera device id is passed to `startVideo` and it will use system default camera.
   * - `string`: Recently active camera devices id.
   */
  function getActiveCamera(): string;

  /**
   * Get the recently active video id.
   *
   * **Example**
   * ```javascript
   * try{
   *   const activeVideoId = stream.getActiveVideoId();
   *   console.log(activeVideoId);
   * } catch (error) {
   *   console.log(error);
   * }
   * ```
   *
   * @returns
   * - `0`: No video is active or the video flag is `false` in media constraints.
   * - `number`: Id of current active video.
   */
  function getActiveVideoId(): number;
  /**
   *
   * Get the max quality of video.
   *
   */
  function getVideoMaxQuality(): number;

  /**
   * Get the dimension of received video.
   */
  function getReceivedVideoDimension(): { height: number; width: number };

  /**
   * Whether the browser is support render multiple videos simultaneously
   */
  function isSupportMultipleVideos(): boolean;
  /**
   * Render the received screen share content.
   * - It is usually called in the `active-share-change` callback.
   *
   * ```javascript
   * client.on('active-share-change',payload=>{
   *  if(payload.state==='Active'){
   *   stream.startShareView(payload.activeUserId,canvas);
   *  }else if(payload.state==='Inactive'){
   *   stream.stopShareView();
   *  }
   * })
   * ```
   *
   * @param canvas Required. the canvas to render the share content
   * @param activeUserId Required. active share user id
   *
   * @returns executed promise.
   */
  function startShareView(
    canvas: HTMLCanvasElement,
    activeUserId: number,
  ): ExecutedResult;
  /**
   * Stop render received screen share content.
   * @returns executed promise.
   */
  function stopShareView(): ExecutedResult;
  /**
   * Start screen share.
   * - Check the share privilege before start screen share.
   * - If you start screen share, you will stop reveived others shared content.
   * - Legacy Chrome browser need to install chrome extension before start screen share, check the promise return value.
   * @param canvas Required. The canvas which renders the screen share content.
   *
   * @returns executed promise.
   * - {type:'INVALID_OPERATION', reason:'required extension', extensionUrl:'url'} : Installed the extension before start share
   */
  function startShareScreen(canvas: HTMLCanvasElement): ExecutedResult;
  /**
   * Pause screen share
   *
   */
  function pauseShareScreen(): ExecutedResult;

  /**
   * Resume screen share
   *
   */
  function resumeShareScreen(): ExecutedResult;
  /**
   * Stop screen share
   *
   */
  function stopShareScreen(): ExecutedResult;
  /**
   * Lock the privilege of screen share, only the host(manager) can share.
   * - Only the **host** or **manager** has the permission.
   * - If the non-host is sharing the screen, once the host locked screen share, his/her sharing will be forcibly stopped.
   *
   * ```javascript
   * // host
   * stream.lockShare(true);
   * // sharing user
   * client.on('passively-stop-share',payload=>{
   *  if(payload.reason==='PrivilegeChange'){
   *  console.log('passively stop share because of privilege change')
   *  }
   * })
   * ```
   * @param isLocked set true to lock share, or false to unlock.
   *
   */
  function lockShare(isLocked: boolean): ExecutedResult;
  /**
   * Whether the host locked the share
   */
  function isShareLocked(): boolean;
  /**
   * Get the user id of received shared content
   */
  function getActiveShareUserId(): number;
}

export default Stream;
