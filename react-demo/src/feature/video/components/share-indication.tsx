import Draggable from 'react-draggable';
import { useState, useRef, useContext } from 'react';
import classNames from 'classnames';
import { Dropdown, Modal, Button } from 'antd';
import { CheckOutlined, DownOutlined } from '@ant-design/icons';
import ZoomMediaContext from '../../../context/media-context';
import type { Participant } from '../../../index-types';
import { getAntdDropdownMenu, getAntdItem } from './video-footer-utils';
import { IconFont } from '../../../component/icon-font';
import './share-indication.scss';
interface ShareIndicationBarProps {
  sharUserList: Array<Participant> | undefined;
  activeSharingId: number;
  isControllingUser?: boolean;
  viewType: string;
  setViewType: (viewtype: string) => void;
}
const ShareIndicationBar = (props: ShareIndicationBarProps) => {
  const { sharUserList, activeSharingId, isControllingUser, viewType, setViewType } = props;
  const draggableRef = useRef(null);
  const { mediaStream } = useContext(ZoomMediaContext);
  const [mutedShareAudioList, setMutedShareAudioList] = useState<number[]>([]);
  const activeUser = (sharUserList ?? []).find((user) => user.userId === activeSharingId);
  const menuItems = [
    getAntdItem(
      'View',
      'view',
      undefined,
      [
        getAntdItem('Fit to Window', 'view|fit', 'view|fit'.endsWith(viewType) && <CheckOutlined />),
        getAntdItem('Orignial Size', 'view|original', 'view|original'.endsWith(viewType) && <CheckOutlined />)
      ],
      'group'
    )
  ];
  if (mediaStream?.isRemoteControlEnabled() && mediaStream?.isTargetShareSupportRemoteControl(activeSharingId)) {
    menuItems.push(getAntdItem('', 'd1', undefined, undefined, 'divider'));
    menuItems.push(
      getAntdItem(isControllingUser ? 'Give up Remote Control' : 'Request Remote Control', 'remote control')
    );
  }
  if (activeUser?.bShareAudioOn) {
    menuItems.push(getAntdItem('', 'd2', undefined, undefined, 'divider'));
    menuItems.push(
      getAntdItem(
        `${mediaStream?.isOthersShareAudioMutedLocally(activeSharingId) ? 'Unmute' : 'Mute'} ${
          activeUser.displayName
        }'s Computer Audio`,
        'share audio'
      )
    );
  }
  if ((sharUserList ?? []).length > 1) {
    menuItems.push(getAntdItem('', 'd3', undefined, undefined, 'divider'));
    menuItems.push(
      getAntdItem(
        'Shared Screens',
        'share users',
        undefined,
        (sharUserList ?? []).map((user) =>
          getAntdItem(user.displayName, `share|${user.userId}`, activeSharingId === user.userId && <CheckOutlined />)
        ),
        'group'
      )
    );
  }
  const onMenuClick = (payload: { key: string }) => {
    const { key } = payload;
    if (key.startsWith('view|')) {
      const [, type] = key.split('|');
      setViewType(type);
    } else if (key.startsWith('share|')) {
      const [, shareUserId] = key.split('|');
      if (Number(shareUserId) !== activeSharingId) {
        mediaStream?.switchShareView(Number(shareUserId));
      }
    } else if (key === 'share audio') {
      if (mediaStream?.isOthersShareAudioMutedLocally(activeSharingId)) {
        mediaStream.unmuteShareAudio(activeSharingId);
        setMutedShareAudioList(mutedShareAudioList.filter((u) => u !== activeSharingId));
      } else {
        mediaStream?.muteShareAudio(activeSharingId);
        setMutedShareAudioList([...mutedShareAudioList, activeSharingId]);
      }
    } else if (key === 'remote control') {
      if (isControllingUser) {
        mediaStream?.giveUpRemoteControl();
      } else {
        Modal.confirm({
          title: 'Remote Control',
          content: `You are about to request remote control of ${activeUser?.displayName}'s shared content`,
          okText: 'Request Remote Control',
          cancelText: 'Cancel',
          onOk: () => {
            mediaStream?.requestRemoteControl();
          }
        });
      }
    }
  };
  return (
    <Draggable nodeRef={draggableRef} axis="x" bounds="parent">
      <div className="share-indication-bar" ref={draggableRef}>
        <p className={classNames('share-indication-tip', { 'share-indication-in-control': isControllingUser })}>
          {activeUser?.bShareAudioOn && (
            <IconFont type={mutedShareAudioList.includes(activeSharingId) ? 'icon-audio-off' : 'icon-audio-on'} />
          )}
          {`You are ${isControllingUser ? 'controlling' : 'viewing'} ${activeUser?.displayName}'s screen`}
        </p>
        <Dropdown
          menu={getAntdDropdownMenu(menuItems, onMenuClick, 'share-dropdown-menu')}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button size="small" className={classNames('share-bar-btn', 'share-bar-more')} type="ghost">
            View Options
            <DownOutlined />
          </Button>
        </Dropdown>
      </div>
    </Draggable>
  );
};

export default ShareIndicationBar;
