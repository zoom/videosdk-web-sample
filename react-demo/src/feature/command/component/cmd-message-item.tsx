import React, { useCallback } from 'react';
import { UserOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import classNames from 'classnames';
import { CommandRecord } from '../cmd-types';
import './cmd-message-item.scss';
interface CmdMessageItemProps {
  record: CommandRecord;
  currentUserId: number;
  setCommandUser: (userId: number) => void;
}
const CmdMessageItem = (props: CmdMessageItemProps) => {
  const { record, currentUserId, setCommandUser } = props;
  const { message, sender, receiver, timestamp } = record;
  const { avatar } = sender;
  const isCurrentUser = currentUserId === sender.userId;
  const onAvatarClick = useCallback(() => {
    if (!isCurrentUser) {
      setCommandUser(sender.userId);
    }
  }, [isCurrentUser, sender, setCommandUser]);
  const chatMessage = Array.isArray(message) ? message : [message];
  return (
    <div className={classNames('chat-message-item', { myself: isCurrentUser })}>
      <Button className="chat-message-avatar" onClick={onAvatarClick} ghost shape="circle" size="large">
        {avatar ? <img src={avatar} className="chat-message-avatar-img" alt="" /> : <UserOutlined />}
      </Button>
      <div className="chat-message-content">
        <div className={classNames('chat-message-info', { myself: isCurrentUser })}>
          <p className="chat-message-receiver">
            {isCurrentUser ? '' : sender.name}
            <span>To</span>
            <a
              href="#"
              onClick={(event) => {
                event.preventDefault();
                setCommandUser(receiver.userId);
              }}
            >
              {receiver.userId === currentUserId ? 'me' : receiver.name}
            </a>
          </p>
          <p className="chat-message-time">{new Date(timestamp).toLocaleTimeString()}</p>
        </div>
        <ul className={classNames('chat-message-text-list', { myself: isCurrentUser })}>
          {chatMessage.map((text, index) => (
            <li className={classNames('chat-message-text')} key={index}>
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
export default CmdMessageItem;
