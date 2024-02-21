import React, { useCallback, useContext, useRef } from 'react';
import { Menu, Dropdown, Button } from 'antd';
import { CheckOutlined, DownOutlined, DashOutlined, FileOutlined } from '@ant-design/icons';
import { ChatPrivilege } from '@zoom/videosdk';
import { ChatReceiver } from '../chat-types';
import './chat-receiver.scss';
import ZoomContext from '../../../context/zoom-context';
import { getAntdDropdownMenu, getAntdItem } from '../chat-utils';
interface ChatReceiverProps {
  chatUsers: ChatReceiver[];
  selectedChatUser: ChatReceiver | null;
  isHostOrManager: boolean;
  setChatUser: (userId: number) => void;
  sendFile: (file: File) => void;
  chatPrivilege: number;
}
const meetingChatPrivilegeList = [
  {
    name: 'No One',
    value: ChatPrivilege.NoOne
  },
  {
    name: 'Everyone Publicly',
    value: ChatPrivilege.EveryonePublicly
  },
  {
    name: 'Everyone Publicly and Directly',
    value: ChatPrivilege.All
  }
];
const ChatReceiverContainer = (props: ChatReceiverProps) => {
  const { chatUsers, selectedChatUser, chatPrivilege, isHostOrManager, setChatUser, sendFile } = props;
  const zmClient = useContext(ZoomContext);
  const chatClient = zmClient.getChatClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const menuItems = chatUsers.map((item) =>
    getAntdItem(
      <>
        {item.displayName}
        {(item.isCoHost || item.isHost) && (
          <span className="chat-receiver-item-affix">({item.isHost ? 'Host' : 'Co-host'})</span>
        )}
      </>,
      item.userId,
      selectedChatUser?.userId === item.userId && <CheckOutlined />
    )
  );
  const privilegeMenuItems = isHostOrManager
    ? [
        getAntdItem(
          'Participant Can Chat With:',
          'privilege',
          undefined,
          meetingChatPrivilegeList.map((item) =>
            getAntdItem(item.name, item.value, item.value === chatPrivilege && <CheckOutlined />)
          ),
          'group'
        )
      ]
    : null;

  const onMenuItemClick = useCallback(
    ({ key }: any) => {
      const userId = Number(key);
      if (userId !== selectedChatUser?.userId) {
        setChatUser(userId);
      }
    },
    [selectedChatUser, setChatUser]
  );
  const onMenuItemPrivilegeClick = useCallback(
    ({ key }: any) => {
      const privilege = Number(key);
      if (chatPrivilege !== privilege) {
        chatClient?.setPrivilege(privilege);
      }
    },
    [chatPrivilege, chatClient]
  );
  const onSendFileClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  const onFileChange = useCallback(
    (event: any) => {
      const target = event.target as HTMLInputElement;
      const { files } = target;
      if (files && files?.length > 0) {
        sendFile(files[0]);
      }
      target.value = '';
    },
    [sendFile]
  );
  return (
    <div className="chat-receiver">
      <div className="chat-receiver-wrap">
        <span className="chat-to">To:</span>
        <Dropdown
          menu={getAntdDropdownMenu(menuItems, onMenuItemClick, 'chat-receiver-dropdown-menu')}
          placement="topLeft"
          trigger={['click']}
        >
          <Button className="chat-receiver-button">
            {selectedChatUser?.displayName} <DownOutlined />
          </Button>
        </Dropdown>
      </div>
      {chatClient.isFileTransferEnabled() && (
        <div className="chat-send-file">
          <Button type="ghost" onClick={onSendFileClick}>
            <FileOutlined />
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="chat-send-file-input"
            onChange={onFileChange}
            accept={chatClient.getFileTransferSetting().typeLimit}
          />
        </div>
      )}
      {isHostOrManager && privilegeMenuItems && (
        <Dropdown
          menu={getAntdDropdownMenu(privilegeMenuItems, onMenuItemPrivilegeClick, 'chat-receiver-dropdown-menu')}
          placement="topRight"
          trigger={['click']}
        >
          <Button className="chat-privilege-button">
            <DashOutlined />
          </Button>
        </Dropdown>
      )}
    </div>
  );
};
export default ChatReceiverContainer;
