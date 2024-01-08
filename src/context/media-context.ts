import React from 'react';
import { MediaStream } from '../index-types';
interface MediaContext {
  audio: {
    encode: boolean;
    decode: boolean;
  };
  video: {
    encode: boolean;
    decode: boolean;
  };
  share: {
    encode: boolean;
    decode: boolean;
  };
  mediaStream: MediaStream | null;
}
export default React.createContext<MediaContext>(null as any);
