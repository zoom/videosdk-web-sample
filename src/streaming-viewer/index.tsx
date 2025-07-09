import React from 'react';
import { createRoot } from 'react-dom/client';
import ZoomStreaming from '@zoom/videosdk/broadcast-streaming';
import { devConfig } from '../config/dev';
import { generateVideoToken } from '../utils/util';
import StreamingContext from './context/streaming-context';
import StreamingApp from './StreamingApp';
const args: Record<string, any> = Object.fromEntries(new URLSearchParams(location.search));
const localConfig = devConfig;
if (!('signature' in args)) {
  Object.assign(args, {
    signature: generateVideoToken(
      localConfig.sdkKey,
      localConfig.sdkSecret,
      localConfig.topic,
      localConfig.sessionKey,
      localConfig.userIdentity,
      Number(localConfig.role ?? 1)
    )
  });
}
const streaming = ZoomStreaming.createClient({
  dependentAssets: `${window.location.origin}/lib`
});
const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <StreamingContext.Provider value={streaming}>
      <StreamingApp args={args as any} />
    </StreamingContext.Provider>
  </React.StrictMode>
);
