import {
  VideoClient,
  Stream,
  Participant,
  ChatClient as SDKChatClient,
  SubsessionClient as SDKSubsessionClient,
  RecordingClient as SDKRecordingClient,
  LiveTranscriptionClient as SDKLiveTranscriptionClient,
  CommandChannel,
  LiveStreamClient as SDKLiveStreamClient
} from '@zoom/videosdk';

export type ZoomClient = typeof VideoClient;
export type MediaStream = typeof Stream;
export type Participant = Participant;
export type ChatClient = typeof SDKChatClient;
export type CommandChannelClient = typeof CommandChannel;
export type SubsessionClient = typeof SDKSubsessionClient;
export type RecordingClient = typeof SDKRecordingClient;
export type LiveTranscriptionClient = typeof SDKLiveTranscriptionClient;
export type LiveStreamClient = typeof SDKLiveStreamClient;
