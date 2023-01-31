import React from 'react';
import { Button, Tooltip, Menu, Dropdown } from 'antd';
import classNames from 'classnames';
import { IconFont } from '../../../component/icon-font';
import { LockOutlined, UnlockOutlined, UpOutlined, CheckOutlined } from '@ant-design/icons';
import './screen-share.scss';
import { SharePrivilege } from '@zoom/videosdk';
import { getAntdDropdownMenu, getAntdItem } from './video-footer-utils';

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
    getAntdItem(
      'Lock share',
      `${SharePrivilege.Locked}`,
      sharePrivilege === SharePrivilege.Locked && <CheckOutlined />
    ),
    getAntdItem(
      'One participant can share at a time',
      `${SharePrivilege.Unlocked}`,
      sharePrivilege === SharePrivilege.Unlocked && <CheckOutlined />
    ),
    getAntdItem(
      'Multiple participants can share simultaneously',
      `${SharePrivilege.MultipleShare}`,
      sharePrivilege === SharePrivilege.MultipleShare && <CheckOutlined />
    )
  ];
  const onMenuItemClick = (payload: { key: any }) => {
    onSharePrivilegeClick?.(Number(payload.key));
  };
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {isHostOrManager ? (
        <DropdownButton
          className="vc-dropdown-button"
          size="large"
          menu={getAntdDropdownMenu(menu, onMenuItemClick)}
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
          className={classNames('screen-share-button', 'vc-button', {
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
