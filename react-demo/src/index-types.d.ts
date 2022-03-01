import {
  VideoClient,
  Stream,
  Participant,
  ChatClient as SDKChatClient,
  RecordingClient as SDKRecordingClient,
  CommandChannel,
} from '@zoom/videosdk';

export type ZoomClient = typeof VideoClient;
export type MediaStream = typeof Stream;
export type Participant = Participant;
export type ChatClient = typeof SDKChatClient;
export type CommandChannelClient = typeof CommandChannel;
export type RecordingClient = typeof SDKRecordingClient;