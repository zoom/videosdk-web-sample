import type React from 'react';
// eslint-disable-next-line no-duplicate-imports
import { useCallback, useContext, useEffect, useState, useRef } from 'react';
import produce from 'immer';
import { Input } from 'antd';
import ZoomContext from '../../context/zoom-context';
import type { CommandReceiver, CommandRecord } from './cmd-types';
import { useParticipantsChange } from './hooks/useParticipantsChange';
import ChatMessageItem from './component/cmd-message-item';
import CommandReceiverContainer from './component/cmd-receiver';
import { useMount } from '../../hooks';
import './command.scss';
import type { CommandChannelMsg } from '@zoom/videosdk';
const { TextArea } = Input;

const oneToAllUser = {
  audio: '',
  avatar: '',
  bVideoOn: false,
  displayName: 'To All',
  isHost: false,
  isManager: false,
  muted: false,
  sharerOn: undefined,
  sharerPause: undefined,
  userId: 0
};

const CommandContainer = () => {
  const zmClient = useContext(ZoomContext);
  const cmdClient = zmClient.getCommandClient();
  const [commandRecords, setCommandRecords] = useState<CommandRecord[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number>(0);
  const [commandReceivers, setCommandReceivers] = useState<CommandReceiver[]>([]);

  const [command, setCommandUser] = useState<CommandReceiver | null>(null);
  const [commandDraft, setCommandDraft] = useState<string>('');
  const chatWrapRef = useRef<HTMLDivElement | null>(null);
  const onCommandMessage = useCallback(
    (payload: CommandChannelMsg) => {
      setCommandRecords(
        produce((records: CommandRecord[]) => {
          const { length } = records;
          const newPayload = {
            message: payload.text,
            sender: {
              name: payload?.senderName || '',
              userId: payload.senderId
            },
            receiver: payload?.receiverId
              ? {
                  name: '',
                  userId: payload?.receiverId
                }
              : { name: '', userId: 0 },
            timestamp: payload.timestamp
          };
          if (length > 0) {
            const lastRecord = records[length - 1];
            if (
              payload.senderId === lastRecord.sender.userId &&
              payload.receiverId === lastRecord.receiver.userId &&
              payload.timestamp - lastRecord.timestamp < 1000 * 60 * 5
            ) {
              if (Array.isArray(lastRecord.message)) {
                lastRecord.message.push(payload.text as string);
              } else {
                lastRecord.message = [lastRecord.message, payload.text as string];
              }
            } else {
              records.push(newPayload);
            }
          } else {
            records.push(newPayload);
          }
        })
      );
      if (chatWrapRef.current) {
        chatWrapRef.current.scrollTo(0, chatWrapRef.current.scrollHeight);
      }
    },
    [chatWrapRef]
  );

  const onChatInput = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommandDraft(event.target.value);
  }, []);
  useEffect(() => {
    zmClient.on('command-channel-message', onCommandMessage);
    return () => {
      zmClient.off('command-channel-message', onCommandMessage);
    };
  }, [zmClient, onCommandMessage]);

  useParticipantsChange(zmClient, () => {
    if (zmClient) {
      setCommandReceivers([oneToAllUser, ...zmClient.getAllUser().filter((item) => item.userId !== currentUserId)]);
    }
  });

  useEffect(() => {
    if (zmClient) {
      setCommandReceivers([oneToAllUser, ...zmClient.getAllUser().filter((item) => item.userId !== currentUserId)]);
    }
  }, [currentUserId, zmClient]);

  useEffect(() => {
    if (command) {
      const index = commandReceivers.findIndex((user) => user.userId === command.userId);
      if (index === -1) {
        setCommandUser(commandReceivers[0]);
      }
    } else {
      if (commandReceivers.length > 0) {
        setCommandUser(commandReceivers[0]);
      }
    }
  }, [commandReceivers, command]);
  const setCommandUserId = useCallback(
    (userId: number) => {
      const user = commandReceivers.find((u) => u.userId === userId);
      if (user) {
        setCommandUser(user);
      }
    },
    [commandReceivers]
  );
  const sendMessage = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      event.preventDefault();
      if (command && commandDraft) {
        if (command?.userId) cmdClient?.send(commandDraft, command?.userId);
        else {
          cmdClient?.send(commandDraft);
        }
        setCommandDraft('');
      }
    },
    [cmdClient, commandDraft, command]
  );
  useMount(() => {
    setCurrentUserId(zmClient.getSessionInfo().userId);
  });
  return (
    <div className="cmd-container">
      <div className="chat-wrap">
        <h2>Command Channel Chat</h2>
        <div className="chat-message-wrap" ref={chatWrapRef}>
          {commandRecords.map((record) => (
            <ChatMessageItem
              record={record}
              currentUserId={currentUserId}
              setCommandUser={setCommandUserId}
              key={record.timestamp}
            />
          ))}
        </div>
        <CommandReceiverContainer
          chatUsers={commandReceivers}
          selectedChatUser={command}
          setCommandUser={setCommandUserId}
          currentUserId={currentUserId}
        />
        <div className="chat-message-box">
          <TextArea
            onPressEnter={sendMessage}
            onChange={onChatInput}
            value={commandDraft}
            placeholder="Type message here ..."
          />
        </div>
      </div>
    </div>
  );
};

export default CommandContainer;
