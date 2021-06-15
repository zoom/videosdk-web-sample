# Screen Share

## Start Screen Share

While in a video meeting, you can share the desktop screen or a specific application.
Note:
  - The host can lock participants' ability to share their screen.
  - Call the `ZoomVideo.checkSystemRequirements()`, to ensure your browser is support screen share.
  - If you are using the Chrome which below version 72, you need to install the [Zoom Scheduler](https://chrome.google.com/webstore/detail/zoom-scheduler/kgjfgplpablkjnlkjmjdecgdpfankdle) extension before start screen share.

A stream instance accessed from client.getMediaStream method kept the methods to control the screen share.
```javascript
const stream = client.getMediaStream();
```

Start view sharing
```javascript
  stream.startShareView(canvas);
```

Stop view sharing
```javascript
  stream.stopShareView();
```

Start the screen share.
```javascript
  stream.startShareScreen(canvas);
```

Stop the screen share.
```javascript
  stream.stopShareScreen();
```

Pause your current shared screen.
```javascript
  stream.pauseShareScreen();
```

Resume the shared screen.
```javascript
  stream.resumeShareScreen();
```

Lock share
```javascript
  stream.lockShare(boolean);
```

Share is locked
```javascript
  stream.isShareLocked();
```


## View other participants' sharing

When someone in the meeting starts to share the screen, you will recieve the `active-share-change` event, call the `stream.startShareView()` method to render the shared content into a canvas.

```javascript
  client.on('active-share-change',payload=>{
    if(payload.state==='Active'){
      stream.startShareView(canvasElement,payload.activeUserId);
    }else if(payload.state==='Inactive'){
      stream.stopShareView();
    }
  })
```

### Canvas Element
In some cases(for example meeting failover), events binded on the canvas element will be lost. We recomended the following HTML structure:

```html
<div class="shared-content">
  <canvas id="canvas"></canvas>
</div>

```

```css
#canvas{
  width:100%;
  height:100%;
}
```

```javascript
document.querySelector('.shared-content').addEventListener('click',event=>{
  // event handler
})
```

### Shared content dimension
When the shared content changes, the dimension of viewport need to be changed accordingly.Listen the `share-content-dimension-change` event to get the detail.

```javascript
client.on('share-content-dimension-change',payload=>{
  viewportElement.style.width=`${payload.width}px`;
  viewportElement.style.height=`${payload.height}px`;
})
```

### Participants start or stop screen share
Listen the `peer-share-state-change` event when other participants start or stop screen share

```javascript
 client.on('peer-share-state-change',payload=>{
   if(payload.action==='Start'){
    console.log(`user:${payload.userId} starts share`);
   }else if(payload.action==='Stop'){
   console.log(`user:${payload.userId} stops share`);
   }
})
```
## Share privilege
One participant can share at a time, only the host can start sharing when someone else is sharing. Host can change this behavior by locking share. If a meeting is locked, only host can share.

```javascript
stream.lockShare(true);
```

> If the non-host is sharing the screen, once the host locked screen share, his/her sharing will be forcibly stopped. Listen the `passively-stop-share` event to get the detail.

```javascript
client.on('passively-stop-share',payload=>{
  if(payload.reason==='PrivilegeChange'){
     console.log('passively stop share because of privilege change');
  }
}
```