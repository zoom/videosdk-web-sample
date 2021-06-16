import state from "../simple-state";
import {
    VIDEO_CANVAS,
    VIDEO_CANVAS_DIMS,
    VIDEO_QUALITY_360P,
} from "./video-render-props";

let prevIsSelfVideoOn = false;
let prevIsParticipantVideoOn = false;

/*
 * Dimensions and offset need to be carefully set to render multiple streams on a 
 * single canvas. There are several things to keep in mind: 
 *      1) Maintaining 16:9 aspect ratio (or whatever most participants have)
 *      2) Setting suitable height/width based on the render canvas dimensions
 *      3) Setting the correct offset
 * 
 * For this demo, we have a simple example with only two video streams:
 * |------------------------------------------------------------------|
 * |                                |                                 |
 * |                                |                                 |
 * |          Participant           |              Self               |
 * |                                |                                 |
 * |                                |                                 |
 * |                                |                                 |
 * |------------------------------------------------------------------|
 * 
 * To achieve the above, the participant stream is rendered with no offset and a
 * width equal to `canvas_width / 2`. For height, while we would typically need 
 * to handle aspect ratio and vertical centering ourselves, the V-SDK automatically 
 * handles it -- so just pass the canvas height 
 * 
 * We do the exact same for the self stream, but now have an x-offset of 
 * `cavas_width / 2`
 * 
 * This simple example can be extended to larger numbers (3, 4, etc.) and 
 * dynamically adjusted based on the active number of participants! 
 */

export const toggleSelfVideo = async (mediaStream, isVideoOn) => {
    if (typeof isVideoOn !== 'boolean' || prevIsSelfVideoOn === isVideoOn) {
        return;
    }
    if (isVideoOn) {
        await mediaStream.startVideo();
        await mediaStream.renderVideo(
            VIDEO_CANVAS,
            state.selfId,
            VIDEO_CANVAS_DIMS.Width / 2,
            VIDEO_CANVAS_DIMS.Height,
            VIDEO_CANVAS_DIMS.Width / 2,
            0,
            VIDEO_QUALITY_360P,
        );
    } else {
        await mediaStream.stopVideo();
        await mediaStream.stopRenderVideo(VIDEO_CANVAS, state.selfId);
        await mediaStream.clearVideoCanvas(VIDEO_CANVAS);
    }
    prevIsSelfVideoOn = isVideoOn;
}

export const toggleParticipantVideo = async (mediaStream, isVideoOn) => {
    if (typeof isVideoOn !== 'boolean' || prevIsParticipantVideoOn === isVideoOn) {
        return;
    }

    if (isVideoOn) {
        await mediaStream.renderVideo(
            VIDEO_CANVAS,
            state.participantId,
            VIDEO_CANVAS_DIMS.Width / 2,
            VIDEO_CANVAS_DIMS.Height,
            0,
            0,
            VIDEO_QUALITY_360P,
        );
    } else {
        await mediaStream.stopRenderVideo(VIDEO_CANVAS, state.participantId);
        await mediaStream.clearVideoCanvas(VIDEO_CANVAS);
    }
    prevIsParticipantVideoOn = isVideoOn;
}
