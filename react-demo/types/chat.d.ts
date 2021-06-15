import { ExecutedResult } from './common';

export interface ChatMessage {
  message: string;
  sender: { name: string; userId: number; avatar?: string };
  receiver: {
    name: string;
    userId: number;
  };
  timestamp: number;
}

export interface ChatUserItem {
  userId: number;
  displayName: string;
  isHost: boolean;
  isManager: boolean;
}
export declare enum ChatPrivilege {
  All = 1,
  NoOne = 4,
  EveryonePublicly = 5,
}

export declare enum ChatMsgType {
  All = 0,
}
/**
 * The chat interface provides the methods define the chat behavior
 *
 * The chat object can be accessed by `getFeatureModule` method of a `ZoomMeeting` instance.
 *  ```js
 * const client = ZoomMeeting.createClient();
 * client.init(
 *  apiKey,
 *  makeSignature(),
 *  ...,
 *  ['chat'], // to enable chat interface
 * );
 * client.join(meetingNumber, 'test', '', 'test@test.com')
 * ```
 *
 * after joining meeting success, chat interface is available
 *
 * ```js
 * const chat = client.getFeatureModule('chat');
 * if (chat) {
 *  chat.getHistory(); // chat methods can be used now
 * }
 * // start to receive chat message
 * client.on('chat-on-message', (v) => {
 *  console.log(v);
 *  // do something
 * })
 * ```
 */
export declare namespace ChatClient {
  /**
   * send chat message to other
   * #### example
   * ```js
   *  chat.sendMessage('test', userId)
   *  .then(() => {
   *      // success
   *  })
   *     .catch(v => {
   *      // fail
   *      console.log(v)
   *  })
   * ```
   * @param text
   * @param userId
   *
   * @return
   * - `ChatMessage`: success
   * - `Error`: Failure. Following the details of Error:
   *     - `IMPROPER_MEETING_STATE`: It works only when user is in meeting
   *     - `INSUFFICIENT_PRIVILEGES`: chat privilege limited
   *     - `INVALID_PARAMETERS`: invalid parameter
   */
  function send(text: string, userId: number): Promise<ChatMessage | Error>;
  /**
   * Send message to everyone
   * @param text message
   * @returns ExecutedPromise
   */
  function sendToAll(text: string): Promise<ChatMessage | Error>;

  /**
   * host or co-Host use it to change chat privilege which defines what kind of role of user that attendee can talk to, there are the different privilege as following.
   *
   
   |         | privilege value                | describe                                            |
   |---------|--------------------------------|-----------------------------------------------------|
   | meeting | ChatPrivilege.All              | attendee can talk to everyone                      |
   |         | ChatPrivilege.NoOne            | attendee can talk to no one                         |
   |         | ChatPrivilege.EveryonePublicly | attendee can talk to host, manager and everyone    |
   *
   * #### example
   *
   * ```js
   * chat.setPrivilege(ChatPrivilege.All)
   * .then((v) => {
   *      const { chatPrivilege } = v;
   *      // success
   *  })
   * .catch(v => {
   *      // fail
   *      console.log(v)
   *  })
   * ```
   *
   * @param privilege
   *
   * @return executedPromise
   */
  function setPrivilege(privilege: number): ExecutedResult;

  /**
   * return the current privilege value
   * #### example
   * ```js
   * const privilege = chat.getPrivilege();
   * console.log(privilege);
   * ```
   * @return
   */
  function getPrivilege(): number;
  /**
   * get the history chat list
   * #### example
   * ```js
   * const historyChatList = chat.getHistory();
   * console.log(historyChatList);
   * ```
   * @return
   */
  function getHistory(): Array<ChatMessage>;
  /**
   * Get available chat receivers list
   */
  function getReceivers(): Array<ChatUserItem>;
}
/**
 * A series of events are exposed to indicate the status of Chat.
 */
export enum ExposedChatEvent {
  /**
   * receive instant messages sent from other
   * #### example
   * ```js
   *  client.on('chat-on-message', data => {
   *    console.log(data);
   *    // do something
   *  })
   * ```
   * the structure of data is the same as {@link ChatMessage}
   * @event 'chat-on-message'
   */
  chatReceiveMessage = 'chat-on-message',

  /**
   * receive the privilege value when it's changed
   * #### example
   * ```typescript
   *  client.on('chat-privilege-change', (data: { chatPrivilege: number }) => {
   *    console.log(data);
   *    // do something
   *  })
   * ```
   * @event 'chat-privilege-change'
   */
  chatPrivilegeChange = 'chat-privilege-change',
}
export default ChatClient;
