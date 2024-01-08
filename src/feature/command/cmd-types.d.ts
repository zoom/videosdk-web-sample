export interface CommandReceiver {
  userId: number;
  displayName: string;
  isHost?: boolean;
  isCoHost?: boolean;
}

export interface CommandRecord {
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

export interface CommandChannelMsg {
  senderId: number;
  receiverId?: number; // send to all no recieverId
  text: string;
  timestamp: number;
}
