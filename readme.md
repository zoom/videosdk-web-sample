# Zoom Video Web SDK
Use of this sample app is subject to our [Terms of Use](https://zoom.us/docs/en-us/zoom_api_license_and_tou.html)

Please note that Chrome 92 is released on July 20, 2021, and that starting with its release, the SharedArrayBuffer object will only work on websites with proper cross-origin isolation. The Video SDK uses SharedArrayBuffer to optimize media streaming performance, and the SDK will not work properly if you do use it in an environment that is not properly cross-origin isolated.

As an alternative, you may temporarily apply for the `SharedArrayBuffers` [origintrials](https://developer.chrome.com/origintrials/#/trials/active) for your domain; this will exempt your domain from the cross-origin isolation requirements, and allow you and your users to use SharedArrayBuffer on your domain until the Chrome 94 release.

## What is Zoom Video Web SDK?
Zoom Video Web SDK is the app development kit provided to enable apps designed to connect people and to share happiness. With Video Web SDK, you can build feature-rich apps with highly customized user-interfaces

### Video Web SDK is designed to be:
* <strong>Easy to use</strong>: Video SDKs have simplified most function calls, allowing you to have a high-quality video session with simple calls and options.
* <strong>Lightweight</strong>: Video SDKs are lighterthan ever, with an enormous reduction in size compared to Client
SDKs with the same quality of the Zoomʼs video and audio solutions.

### The Video Web SDK provides the ability to experience the following functionality for your app:
* Launch a video communication session instantly
* Share screen directly from your device
* Send instant chat messages during the session

# Install 
## Prerequisites
* A browser [Please see the browser support info here](https://marketplace.zoom.us/docs/sdk/video/web)
* A Zoom account with Video SDK Account Type
* Zoom Video SDK developer credentials

## Installation
```
npm install @zoom/videosdk
```

## React Demo
```
git clone https://github.com/zoom/sample-app-videosdk.git --branch master --depth 1
cd sample-app-videosdk/react-demo
npm install
npm run start

```

Before you can use the demo app, you must update your config in ```react-demo/src/config/dev.ts```

## Purejs Demo
```
git clone https://github.com/zoom/sample-app-videosdk.git --branch master --depth 1
cd sample-app-videosdk/purejs-demo
npm install
npm run start

```

```npm run https``` and ```npm run corp``` can also be used as alternatives to ```npm run start```; ```corp``` provides proper cross-origin isolation that optimizes performance through enabling the use of SharedArrayBuffers

Before you can use the demo app, you must update your config in ```purejs-demo/src/js/config.js```

You can launch the app at http://localhost:3000 or https://localhost:3000 (if using ```npm run https```)

## Changelog
Please refer to the official release CHANGELOG for all changes


## Need help?

If you're looking for help, try [Developer Support](https://devsupport.zoom.us) or our [Developer Forum](https://devforum.zoom.us). Priority support is also available with [Premier Developer Support](https://zoom.us/docs/en-us/developer-support-plans.html) plans.
