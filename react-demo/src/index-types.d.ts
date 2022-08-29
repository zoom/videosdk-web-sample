import {
  VideoClient,
  Stream,
  Participant,
  ChatClient as SDKChatClient,
  SubsessionClient as SDKSubsessionClient,
  RecordingClient as SDKRecordingClient,
  CommandChannel
} from '@zoom/videosdk';

export type ZoomClient = typeof VideoClient;
export type MediaStream = typeof Stream;
export type Participant = Participant;
export type ChatClient = typeof SDKChatClient;
export type CommandChannelClient = typeof CommandChannel;
export type SubsessionClient = typeof SDKSubsessionClient;
export type RecordingClient = typeof SDKRecordingClient;
