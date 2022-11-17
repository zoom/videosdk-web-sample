import React from 'react';
import { Button, Tooltip, Menu, Dropdown } from 'antd';
import classNames from 'classnames';
import { IconFont } from '../../../component/icon-font';
import { LockOutlined, UnlockOutlined, UpOutlined, CheckOutlined } from '@ant-design/icons';
import './screen-share.scss';
import { SharePrivilege } from '@zoom/videosdk';

const { Button: DropdownButton } = Dropdown;
interface ScreenShareButtonProps {
  isStartedScreenShare: boolean;
  sharePrivilege: SharePrivilege;
  isHostOrManager: boolean;
  onSharePrivilegeClick?: (privilege: SharePrivilege) => void;
  onScreenShareClick: () => void;
}

interface ScreenShareLockButtonProps {
  isLockedScreenShare: boolean;
  onScreenShareLockClick: () => void;
}

const ScreenShareButton = (props: ScreenShareButtonProps) => {
  const { isStartedScreenShare, sharePrivilege, isHostOrManager, onScreenShareClick, onSharePrivilegeClick } = props;
  const menu = [
    {
      label: 'Lock share',
      value: SharePrivilege.Locked,
      checked: sharePrivilege === SharePrivilege.Locked
    },
    {
      label: 'One participant can share at a time',
      value: SharePrivilege.Unlocked,
      checked: sharePrivilege === SharePrivilege.Unlocked
    },
    {
      label: 'Multiple participants can share simultaneously',
      value: SharePrivilege.MultipleShare,
      checked: sharePrivilege === SharePrivilege.MultipleShare
    }
  ];
  const onMenuItemClick = (payload: { key: any }) => {
    onSharePrivilegeClick?.(Number(payload.key));
  };
  const overlayMenu = (
    <Menu onClick={onMenuItemClick} theme="dark" className="microphone-menu">
      {menu.map((e) => (
        <Menu.Item key={`${e.value}`} icon={e.checked && <CheckOutlined />}>
          {e.label}
        </Menu.Item>
      ))}
    </Menu>
  );
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {isHostOrManager ? (
        <DropdownButton
          className="screen-share-dropdown-button"
          size="large"
          overlay={overlayMenu}
          onClick={onScreenShareClick}
          trigger={['click']}
          type="ghost"
          icon={<UpOutlined />}
          placement="topRight"
        >
          <IconFont type="icon-share" />
        </DropdownButton>
      ) : (
        <Button
          className={classNames('screen-share-button', {
            'started-share': isStartedScreenShare
          })}
          icon={<IconFont type="icon-share" />}
          ghost={true}
          shape="circle"
          size="large"
          onClick={onScreenShareClick}
        />
      )}
    </>
  );
};

const ScreenShareLockButton = (props: ScreenShareLockButtonProps) => {
  const { isLockedScreenShare, onScreenShareLockClick } = props;
  return (
    <Tooltip title={isLockedScreenShare ? 'unlock screen share' : ' lock screen share'}>
      <Button
        className="screen-share-button"
        icon={isLockedScreenShare ? <LockOutlined /> : <UnlockOutlined />}
        // eslint-disable-next-line react/jsx-boolean-value
        ghost={true}
        shape="circle"
        size="large"
        onClick={onScreenShareLockClick}
      />
    </Tooltip>
  );
};

export { ScreenShareButton, ScreenShareLockButton };
