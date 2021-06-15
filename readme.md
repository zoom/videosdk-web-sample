# Zoom Video Web SDK
Use of this SDK is subject to our [Terms of Use](https://zoom.us/docs/en-us/zoom_api_license_and_tou.html)

Please note on Jul 20, Chrome 92 will release. Start from chrome92, SharedArrayBuffer only work for cross-origin isolation. it make VideoSDK broken if you don't do any thing when user use Chrome 92.

Apply `SharedArrayBuffers` [origintrials](https://developer.chrome.com/origintrials/#/trials/active) for you domain, it works until Chrome 94 release.

## What is Zoom Video Web SDK?
  Zoom Video Web SDK is the app development kit provided to enable apps designed to connect people and to
share happiness. With Video Web SDK, you can build feature-rich apps with highly customized userinterfaces

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

## Purejs Demo
```
git clone https://github.com/zoom/sample-app-videosdk.git --branch master --depth 1
cd sample-app-videosdk/purejs-demo
npm install
npm run start

```
open browser http://localhost:3000

## Changelog
Please referto the CHANGELOG file for all changes


## Need help?

If you're looking for help, try [Developer Support](https://devsupport.zoom.us) or our [Developer Forum](https://devforum.zoom.us). Priority support is also available with [Premier Developer Support](https://zoom.us/docs/en-us/developer-support-plans.html) plans.
