# Integrate the SDK

## Prerequisites

Before using the Video SDK, you need to:

- Get an SDK key & Secret for authentication. Login to the Zoom Marketplace and [Create a SDK App](https://marketplace.zoom.us/docs/guides/build/sdk-app) to get **SDK Keys** & **Secrets**
- Prepare a camera and a microphone
- A backend service to provide the Video SDK token. Refer to [Generate Signature](https://marketplace.zoom.us/docs/sdk/native-sdks/web/essential/signature) for additional details

## Integrate the SDK

Choose any of the following methods to integrate the Zoom Video SDK into your project. Please stay tuned for more options coming soon!

### NPM

1. Install the [Zoom Video SDK](https://www.npmjs.com/package/@zoom/videosdk) package

``` 
 npm install @zoom/videosdk --save
```
2. Import the module into your project

```javascript
import ZoomVideo from '@zoom/videosdk';
const client = ZoomVideo.createClient();
```
3. Initialize the client. The Video SDK relies on optimized web worker and web assembly modules to handle audio/video/screen streaming, so they need to be loaded before the SDK can be used. We provide these as assets in the included `lib` folder, which you need to deploy and provide through your own server/s. They'll be provided through the Zoom Cloud soon, so stay tuned!
<!-- - Use Zoom Global service.The dependent assets path will be `https://source.zoom.us/video/{version}/lib`
``` javascript
const client = ZoomVideo.createClient();
client.init('en-US', 'Global');
``` -->
<!-- - Use Zoom CDN service. The dependent assets path will be `https://dmogdx0jrul3u.cloudfront.net/video/{version}/lib`
```javascript
const client = ZoomVideo.createClient();
client.init('en-US', 'CDN');
``` -->
- To deploy these assets on your own server (for example, using webpack):
```javascript
// Example webpack config:
{
  ... other configuration
  plugins:[
    new CopyWebpackPlugin({
      patterns:[
        from:'node_modules/@zoom/videosdk/dist/lib',
        to:'dest/zoom-libs' // The destination folder, which you can rename as you wish
      ]
    })
  ]
}
// ...
// Inside your project's class:
const client = ZoomVideo.createClient();
client.init('en-US', 'path to the zoom-libs');
```
<!-- 
### CDN
The Zoom Video SDK can also be imported and used through CDN.
```html
<script src="https://source.zoom.us/video/zoom-video-1.0.0.min.js">
```  -->

### Marketplace

While the Video SDK is provided alongside a working demo app, you may prefer incorporating the SDK into your own project. To do so: 
1. Copy the SDK package at the following location from the demo app to your project: 
```
@zoom/videosdk
```
2. Import the module inside your project
```javascript
// Import from local path. For example, if located at the project root:
import ZoomVideo from '@zoom/videosdk';
const client = ZoomVideo.createClient();
```
3. Privately host the dependent assets and initialize the client with them
```javascript
// Example webpack config
{
  ... other configuration
  plugins:[
    new CopyWebpackPlugin({
      patterns:[
        from:'@zoom/videosdk/dist/lib',
        to:'dest/zoom-libs' // The dest folder
      ]
    })
  ]
}

// Inside your project's class:
const client = ZoomVideo.createClient();
client.init('en-US', 'path to zoom-libs');
```
## Starting/joining a session
Here's a sample snippet of how you may create and join a session from within your app:
```javascript
/* 
 * Example. Please note that the order of operations is very important
 * You can look up JavaScript Promises to learn more about how to do this
 */
import ZoomVideo from '@zoom/videosdk';
// ...
const client = ZoomVideo.createClient();
await client.init('en-US', 'path to zoom-libs');
await client.join(topic, signature, name, password);
// ...
```
