/* eslint-disable */

interface Document {
  readonly pictureInPictureEnabled: boolean;
  exitPictureInPicture(): Promise<void>;
}

interface DocumentOrShadowRoot {
  readonly pictureInPictureElement: HTMLVideoElement | null;
}

interface Window {
  documentPictureInPicture: {
    requestWindow({ width, height }: { width: number; height: number }): Promise<Window & typeof globalThis>;
    window: (Window & typeof globalThis) | null;
  };
}
