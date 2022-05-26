# Zoom Video SDK Sample App - Web

Use of this sample app is subject to our [Terms of Use](https://zoom.us/docs/en-us/zoom_api_license_and_tou.html).

The [Zoom Video SDK](https://marketplace.zoom.us/docs/sdk/video/web) enables you to build custom video experiences with Zoom's core technology through a highly optimized WebAssembly module.

## Installation

To get started, clone the repo:

`$ git clone https://github.com/zoom/sample-app-videosdk.git`

## Setup

1. Once cloned, navigate to the `sample-app-videosdk/react-demo` directory for the React sample or `sample-app-videosdk/purejs-demo` for the Vanilla JavaScript sample:

   `$ cd sample-app-videosdk/react-demo` or `$ cd sample-app-videosdk/purejs-demo`

   <i>Primary differences are that the former is built in React and is a much more comprehensive overview of the Video SDK, while the latter showcases a very simple use-case for those uncomfortable with React</i>

1. Then install the dependencies:

   `$ npm install`

1. Open the directory in your code editor.

1. Open the `react-demo/src/config/dev.ts` or `purejs-demo/src/js/config.js` file respectively, and enter required session values for the variables:

   | Key                   | Value Description |
   | -----------------------|-------------|
   | `sdkKey`     | Your Video SDK Key. Required. |
   | `sdkSecret`  | Your Video SDK Secret. Required. |
   | `topic`      | Required, a session name of your choice or the name of the session you are joining. |
   | `name`       | Required, a name for the participant. |
   | `password`   | Required, a session passcode of your choice or the passcode of the session you are joining. |

   Example:

   ```js
   {
     sdkKey: 'YOUR_VIDEO_SDK_KEY',
     sdkSecret: 'YOUR_VIDEO_SDK_SECRET',
     topic: 'Cool Cars',
     name: 'user123',
     password: 'abc123'
   }
   ```

   > Reminder to not publish this sample app as is. Replace the frontend signature generator with a [backend signature generator](https://marketplace.zoom.us/docs/sdk/video/auth#generate-the-video-sdk-jwt) to keep your SDK Secret safe.

1. Save `config.js` or `dev.ts` respectively.

1. Run the app:

   `$ npm start`

## Usage

1. Navigate to http://localhost:3000. For the `purejs-demo` click "Join" or for the `react-demo` click one of the feature boxes.

> Learn more about [rendering multiple video streams](https://marketplace.zoom.us/docs/sdk/overview/websdk-gallery-view).

For the full list of features and event listeners, as well as additional guides, see our [Video SDK docs](https://marketplace.zoom.us/docs/sdk/video/web).

## Need help?

If you're looking for help, try [Developer Support](https://devsupport.zoom.us) or our [Developer Forum](https://devforum.zoom.us). Priority support is also available with [Premier Developer Support](https://zoom.us/docs/en-us/developer-support-plans.html) plans.
