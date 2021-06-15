# Video
This tutorial present a glance and the common usage for the video stream APIs. Please check the API docs for more detail.

## Summary
This section introduce the video stream APIs provided by Zoom Video SDK. All the methods can be accessed by a stream instance as mentioned before.

A stream instance accessed from client.getMediaStream method kept the methods to control the screen share.
```javascript
const stream = client.getMediaStream();
```

## Render Video

When a user starts the video in the meeting, you can render his/her video on the canvas. You can listen the `peer-video-state-change` event to decide whether to render the video.
```javascript
  client.on('peer-video-state-change',async (payload)=>{
    const { action,userId } = payload;
    if(action==='Start'){
      /* 
        render video on canvas 

        we recommend the aspect = 16/9, and please note that the origin of the coordinates is the lower left corner of the canvas.

      */
      await stream.renderVideo(canvas,userId,width,height,x,y,quality);
    }else if(action==='Stop'){
      await stream.stopRenderVideo(canvas,userId);
    }
  })
```

If you need to display a list of users in pages, we recommend that you maintain a list of rendered videos by yourself. You can render or stop rendering videos when the users in the list change. Listen the `user-updated` and `user-removed` events to update the list of rendered videos.

```javascript
  let renderedList = [];
  let page = 0
  let pageSize = 5;
  const canvas = document.querySelector('.video-canvas');// canvas to render the video
  const handleParticipantsChange = (participants)=>{
    const pageParticipants = participants.filter((user,index)=>Math.floor(index/pageSize)===page);
    const videoParticipants = pageParticipants.filter(user=>user.bVideoOn);
    /** For performance reasons, the SDK can only render 9 videos at the same time， we recommand 
     * to stop rendering the old video and then render a new video
     * **/
    const removedVideoParticipants = renderedList.filter(user=>videoParticipants.findIndex(user2=>user2.userId===user.userId)===-1);
    if(removedVideoParticipants.length>0){
      removedVideoParticipants.forEach(async (user)=>{
        await stream.stopRenderVideo(canvas,user.userId);
      })
    }
    const addedVideoParticipants = videoParticipants.filter(user=>renderedList.findIndex(user2=>user2.userId===user.userId)===-1);
    if(addedVideoParticipants.length>0){
      addedVideoParticipants.forEach(async (user)=>{
        // render new video
      await stream.renderVideo(canvas,user.userId,width,height,x,y,quality);
      });
    }
    renderedList = videoParticipants;
  }
  client.on('user-updated',()=>{
    const participants = client.getParticipantsList();
    handleParticipantsChange(participants);
  })
  client.on('user-removed',()=>{
    const participants = client.getParticipantsList();
    handleParticipantsChange(participants);
  })
```

When the styled width and height of the canvas change, the SDK needs to be notified to adjust the dimension of the canvas.

```javascript
const resizeCallback = _.debounce((width,height)=>{
  /** 
   * If you directly modify canvas.width or canvas.height, it maybe throw errors.
   * Because the canvas maybe transfer control to offscreen.
   * **/
  try{
    canvas.width= width;
    canvas.height=height;
  }catch(e){
    stream.updateVideoCanvasDimension(canvas,width,height);
  }
  
},300);
const resizeOb = new ResizeObserver((entries)=>{
  entries.forEach(entry=>{
    const {width,height}=entry;
    resizeCallback(width,height);
  })
})
resizeOb.observe(canvas);
```

If you want to adjust the position of the rendered video on the canvas, use the `adjustRenderedVideoPosition` methods.

```javascript
stream.adjustRenderedVideoPosition(canvas,userId,newWidth,newHeight,newX,newY);
```

If you want to render videos of the same user in different places on the canvas, you need an additional key to distinguish these rendering, use the optional parameter `additionalUserKey` in methods `renderVideo`|`stopRenderVideo`|`adjustRenderedVideoPosition`. Please note if the parameter of `additionalUserKey` is passed, the `userId` and `additionalUserKey` will be combined to become the unique identifier of the video.


## Capture Video
Participants can start capture video if it is not muted. 

```javascript
const captureOptions = {
  cameraId:'cameraId',
  captureWidth:640,
  captureHeight:360
}
// start capture video use system default camera, you can pass `captureOptions` to specify the camera device and capture width and height.
stream.startCaptureVideo();
// stop capture video
stream.stopCaptureVideo();

```


Browser may ask for permission of access camera devices. Use `isCaptureForbidden` to check if user forbade it by accident.
```javascript
const stream = client.createMediaStream();
if (stream.isCaptureForbidden()) {
  alert('We cannot start video without the permission to access camera.');
}
```

## Switch devices
When call `stream.startCaptureVideo` method, you can specify the camera device via `captureOptions`. After capturing video, you can use `stream.switchCamera` to dynamically switch the camera devices.

```javascript
await stream.switchCamera(cameraId);
```

## Hot plugging of audio and video input devices
When you plug in or unplug a new audio and video device, listen to the'device-change' to catch this event, the SDK will not automatically switch to the new device, you can use `stream.switchMicrophone`, `stream.switchSpeaker` Or `stream.switchCamera` to switch to this device; when the device in use is unplugged, the SDK will automatically switch to the system default device.

```javascript
const activeCameraId = stream.getActiveCamera();
client.on('device-change',()=>{
  const cameras = stream.getCameras();
  if(cameras.length>0&&camaras[length-1].deviceId!==activeCameraId){
    stream.switchCamera(camaras[length-1.deviceId]);
  }
})
```
