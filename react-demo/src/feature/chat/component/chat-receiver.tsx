import React, { useCallback, useContext } from 'react';
import { Menu, Dropdown, Button } from 'antd';
import { CheckOutlined, DownOutlined, DashOutlined } from '@ant-design/icons';
import {ChatPrivilege} from '@zoom/videosdk'
import classNames from 'classnames';
import { ChatReceiver } from '../chat-types';
import ChatContext from '../../../context/chat-context';
import './chat-receiver.scss';
const { Item: MenuItem, ItemGroup: MenuItemGroup } = Menu;
interface ChatReceiverProps {
  chatUsers: ChatReceiver[];
  selectedChatUser: ChatReceiver | null;
  isHostOrManager: boolean;
  setChatUser: (userId: number) => void;
  chatPrivilege: number;
}
const meetingChatPrivilegeList = [
  {
    name: 'No One',
    value: ChatPrivilege.NoOne,
  },
  {
    name: 'Everyone Publicly',
    value: ChatPrivilege.EveryonePublicly,
  },
  {
    name: 'Everyone Publicly and Directly',
    value: ChatPrivilege.All,
  },
];
const ChatReceiverContainer = (props: ChatReceiverProps) => {
  const {
    chatUsers,
    selectedChatUser,
    chatPrivilege,
    isHostOrManager,
    setChatUser,
  } = props;
  const chatClient = useContext(ChatContext);
  const menuItems = chatUsers.map((item) => (
    <MenuItem
      key={item.userId}
      className={classNames('chat-receiver-item', {
        selected: item.userId === selectedChatUser?.userId,
      })}
      icon={item.userId === selectedChatUser?.userId && <CheckOutlined />}
    >
      {item.displayName}
      {(item.isCoHost || item.isHost) && (
        <span className="chat-receiver-item-affix">
          ({item.isHost ? 'Host' : 'Co-host'})
        </span>
      )}
    </MenuItem>
  ));
  const onMenuItemClick = useCallback(
    ({ key }) => {
      const userId = Number(key);
      if (userId !== selectedChatUser?.userId) {
        setChatUser(userId);
      }
    },
    [selectedChatUser, setChatUser],
  );
  const onMenuItemPrivilegeClick = useCallback(
    ({ key }) => {
      const privilege = Number(key);
      if (chatPrivilege !== privilege) {
        chatClient?.setPrivilege(privilege);
      }
    },
    [chatPrivilege, chatClient],
  );
  const menu = (
    <Menu onClick={onMenuItemClick} className="chat-receiver-dropdown-menu">
      {menuItems}
    </Menu>
  );
  let privilegeMenu: any = null;
  if (isHostOrManager) {
    const privilegeItems = meetingChatPrivilegeList;
    const privilegeMenuItems = privilegeItems.map((item) => (
      <MenuItem
        key={item.value}
        className={classNames('chat-privilege-item', {
          selected: item.value === chatPrivilege,
        })}
        icon={item.value === chatPrivilege && <CheckOutlined />}
      >
        {item.name}
      </MenuItem>
    ));
    privilegeMenu = (
      <Menu
        onClick={onMenuItemPrivilegeClick}
        className="chat-receiver-dropdown-menu"
      >
        <MenuItemGroup key="privilege" title="Participant Can Chat With:">
          {privilegeMenuItems}
        </MenuItemGroup>
      </Menu>
    );
  }
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
      {isHostOrManager && (
        <Dropdown overlay={privilegeMenu} placement="topRight" trigger={['click']}>
          <Button className="chat-privilege-button">
            <DashOutlined />
          </Button>
        </Dropdown>
      )}
    </div>
  );
};
export default ChatReceiverContainer;
