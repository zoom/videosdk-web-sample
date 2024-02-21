import React, { useCallback } from 'react';
import { Menu, Dropdown, Button } from 'antd';
import { CheckOutlined, DownOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { CommandReceiver } from '../cmd-types';
import './cmd-receiver.scss';
const { Item: MenuItem, ItemGroup: MenuItemGroup } = Menu;

interface CommandReceiverProps {
  chatUsers: CommandReceiver[];
  selectedChatUser: CommandReceiver | null;
  setCommandUser: (userId: number) => void;
  currentUserId: number;
}

const CommandReceiverContainer = (props: CommandReceiverProps) => {
  const { chatUsers, selectedChatUser, setCommandUser, currentUserId } = props;
  const menuItems = chatUsers.map((item) => (
    <MenuItem
      key={item.userId}
      className={classNames('chat-receiver-item', {
        selected: item.userId === selectedChatUser?.userId
      })}
      icon={item.userId === selectedChatUser?.userId && <CheckOutlined />}
    >
      {currentUserId === item.userId ? item.displayName + '(Me)' : item.displayName}
      {(item?.isCoHost || item?.isHost) && (
        <span className="chat-receiver-item-affix">({item?.isHost ? 'Host' : 'Co-host'})</span>
      )}
    </MenuItem>
  ));

  const onMenuItemClick = useCallback(
    ({ key }: any) => {
      const userId = Number(key);
      if (userId !== selectedChatUser?.userId) {
        setCommandUser(userId);
      }
    },
    [selectedChatUser, setCommandUser]
  );

  const menu = (
    <Menu onClick={onMenuItemClick} className="chat-receiver-dropdown-menu">
      {menuItems}
    </Menu>
  );
  return (
    <div className="chat-receiver">
      <div className="chat-receiver-wrap">
        <span className="chat-to">To:</span>
        <Dropdown overlay={menu} placement="topLeft" trigger={['click']}>
          <Button className="chat-receiver-button">
            {selectedChatUser?.displayName} <DownOutlined />
          </Button>
        </Dropdown>
      </div>
    </div>
  );
};
export default CommandReceiverContainer;
