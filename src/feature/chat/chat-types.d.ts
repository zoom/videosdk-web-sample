export interface ChatReceiver {
  userId: number;
  displayName: string;
  isHost?: boolean;
  isCoHost?: boolean;
}
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  fileUrl?: string;
  uuid?: string;
  originalFileObjectUrl?: string;
  upload?: {
    cancelFunc: () => void;
    status: number;
    progress: number;
    retryToken?: string;
  };
  download?: {
    cancelFunc: () => void;
    status: number;
    progress: number;
  };
}
export interface ChatRecord {
  message?: string | string[];
  id?: string;
  file: ?FileInfo;
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
