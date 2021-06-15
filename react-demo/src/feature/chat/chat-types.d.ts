export interface ChatReceiver {
  userId: number;
  displayName: string;
  isHost?: boolean;
  isCoHost?: boolean;
}

export interface ChatRecord {
  message: string | string[];
  sender: {
    name: string;
    userId: number;
    avatar?: string;
  };
  receiver: {
    name: string;
    userId: number;
  };
  timestamp: number;
}
