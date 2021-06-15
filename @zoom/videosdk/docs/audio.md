# Audio Advanced

## Start & Stop audio

Calling the method `startAudio` to join audio to talk to each other. SDK will automatically use the hardware of microphone and speaker for audio. if you want to leave the audio, you can invoke the method `stopAudio`.

```js
const steam = client.getMediaStream();
steam.startAudio().then(() => console.log('join audio'))
```

leave audio

```js
steam.stopAudio().then(() => console.log('leave audio'))
```

## Auto play
When we join computer audio, it may be restricted by the automatic playback of browser audio (hereinafter referred to as Autoplay restriction). Autoplay restriction means that if the user does not have any interactive actions (such as clicking, touching, etc.) on the page, the web page cannot automatically play audio.

For Zoom Video SDK, if `stream.startAudio` is called to play audio before the interaction occurs, the autoplay limitation of the browser may cause the user to not hear the sound. But as long as the user interacts with the page at any time, the SDK will detect this behavior and try to automatically resume playing the audio.

We recommend that you make sure that the user has interacted with the page before calling `stream.startAudio`. If the product design cannot guarantee this, you can listen the `auto-play-audio-failed` callback to prompt the user to interact with the page when the playback fails.

```javascript
client.on('auto-play-audio-failed',()=>{
  console.log('auto play failed, waiting user interaction');
})
```

## Mute & Unmute
The participant can mute or unmute own audio during the meeting, besides the host can mute or unmute the participants.

> For privacy and security concerns, the host can not unmute the participant's audio directly, instead, the participant will receive an unmute audio consent.

```javascript
// host side
await stream.unmuteAudio(userId);
// participant side
client.on('unmute-audio-consent',(payload)=>{
   console.log('Host ask me to unmute');
);
```

 ## Switch the microphone and speaker
 If you want to switch the microphone or speaker, you can call the following methods:
 ```javascript
 // switch microphone
 stream.switchMicrophone(microphoneId);
 // switch speaker
 stream.switchSpeaker(speakerId);
 ```

 If you interests with the pluging or unplugging the microphone/speaker, listen the `device-change` event.
 ```javascript
 client.on('device-change',()=>{
   // get the latest devices
   const microphones = stream.getMicList();
   const speakers = stream.getSpeakerList();
 });
 ```
