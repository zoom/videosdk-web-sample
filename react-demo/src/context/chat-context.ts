import React from 'react';
import { ChatClient } from '../index-types';
export default React.createContext<ChatClient | null>(null);
