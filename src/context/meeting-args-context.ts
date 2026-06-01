import React from 'react';

interface MeetingArgsContext {
  signature: string;
  webEndpoint: string;
}

export default React.createContext<MeetingArgsContext>({ signature: '', webEndpoint: 'zoom.us' });
