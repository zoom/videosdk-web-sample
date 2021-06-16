import { switchSessionToEndingView } from "../simple-view-switcher";
import { toggleSelfVideo, toggleParticipantVideo } from "./video/video-toggler";

/**
 * Initializes the mic and webcam toggle buttons
 * 
 * @param {VideoClient} zoomClient
 * @param {Stream} mediaStream 
 */
const initButtonClickHandlers = async (zoomClient, mediaStream) => {
    const initMicClick = () => {
        const micButton = document.getElementById('js-mic-button');
        const micIcon = document.getElementById('js-mic-icon');

        let isMuted = true;
        let isButtonAlreadyClicked = false;

        const toggleMicButtonStyle = () => {
            micIcon.classList.toggle('fa-microphone');
            micIcon.classList.toggle('fa-microphone-slash');
            micButton.classList.toggle('meeting-control-button__off');
        }

        const toggleMuteUnmute = () => isMuted ? mediaStream.muteAudio() : mediaStream.unmuteAudio();

        const isMutedSanityCheck = () => {
            const mediaStreamIsMuted = mediaStream.isAudioMuted();
            console.log('Sanity check: is muted? ', mediaStreamIsMuted);
            console.log('Does this match button state? ', mediaStreamIsMuted === isMuted);
        }
    
        const onClick = async (event) => {
            event.preventDefault();
            if (!isButtonAlreadyClicked) {
                // Blocks logic from executing again if already in progress
                isButtonAlreadyClicked = true;

                try {
                    isMuted = !isMuted;
                    await toggleMuteUnmute();
                    toggleMicButtonStyle();
                    isMutedSanityCheck();
                } catch (e) {
                    console.error('Error toggling mute', e);
                }

                isButtonAlreadyClicked = false;
            } else {
                console.log('=== WARNING: already toggling mic ===');
            }
        }
    
        micButton.addEventListener("click", onClick);
    };

    // Once webcam is started, the client will receive an event notifying that a video has started
    // At that point, video should be rendered. The reverse is true for stopping video
    const initWebcamClick = () => {
        const webcamButton = document.getElementById('js-webcam-button');

        let isWebcamOn = false;
        let isButtonAlreadyClicked = false;

        const toggleWebcamButtonStyle = () => webcamButton.classList.toggle('meeting-control-button__off');

        const onClick = async (event) => {
            event.preventDefault();
            if (!isButtonAlreadyClicked) {
                // Blocks logic from executing again if already in progress
                isButtonAlreadyClicked = true;

                try {
                    isWebcamOn = !isWebcamOn;
                    await toggleSelfVideo(mediaStream, isWebcamOn);
                    toggleWebcamButtonStyle();
                } catch (e) {
                    isWebcamOn = !isWebcamOn;
                    console.error('Error toggling video', e);
                }

                isButtonAlreadyClicked = false;
            } else {
                console.log('=== WARNING: already toggling webcam ===');
            }
        }

        webcamButton.addEventListener("click", onClick);
    }

    const initLeaveSessionClick = () => {
        const leaveButton = document.getElementById('js-leave-button');

        const onClick = async (event) => {
            event.preventDefault();
            try {
                await Promise.all([
                    toggleSelfVideo(mediaStream, false), 
                    toggleParticipantVideo(mediaStream, false)
                ]);
                await zoomClient.leave();
                switchSessionToEndingView();
            } catch (e) {
                console.error('Error leaving session', e);
            }
        }

        leaveButton.addEventListener("click", onClick);
    }

    initMicClick();
    initWebcamClick();
    initLeaveSessionClick();
};

export default initButtonClickHandlers;