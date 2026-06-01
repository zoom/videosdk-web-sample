import { Button, Tooltip, Dropdown } from 'antd';
import classNames from 'classnames';
import { IconFont } from '../../../component/icon-font';
import { LockOutlined, UnlockOutlined, UpOutlined, CheckOutlined } from '@ant-design/icons';
import { SharePrivilege } from '@zoom/videosdk';
import { getAntdDropdownMenu, getAntdItem, type MenuItem } from './video-footer-utils';

const { Button: DropdownButton } = Dropdown;
interface ScreenShareButtonProps {
  sharePrivilege: SharePrivilege;
  isHostOrManager: boolean;
  onSharePrivilegeClick?: (privilege: SharePrivilege) => void;
  onScreenShareClick: () => void;
  useSelfShareAttachView?: boolean;
  onSelfShareAttachViewToggle?: () => void;
}

interface ScreenShareLockButtonProps {
  isLockedScreenShare: boolean;
  onScreenShareLockClick: () => void;
}

const ScreenShareButton = (props: ScreenShareButtonProps) => {
  const {
    sharePrivilege,
    isHostOrManager,
    onScreenShareClick,
    onSharePrivilegeClick,
    useSelfShareAttachView,
    onSelfShareAttachViewToggle
  } = props;
  const menu = [
    isHostOrManager &&
      getAntdItem(
        'Lock share',
        `${SharePrivilege.Locked}`,
        sharePrivilege === SharePrivilege.Locked && <CheckOutlined />
      ),
    isHostOrManager &&
      getAntdItem(
        'One participant can share at a time',
        `${SharePrivilege.Unlocked}`,
        sharePrivilege === SharePrivilege.Unlocked && <CheckOutlined />
      ),
    isHostOrManager &&
      getAntdItem(
        'Multiple participants can share simultaneously',
        `${SharePrivilege.MultipleShare}`,
        sharePrivilege === SharePrivilege.MultipleShare && <CheckOutlined />
      ),
    getAntdItem(
      'Use attachShareView for self view',
      'self-share-attach-view',
      useSelfShareAttachView && <CheckOutlined />
    )
  ].filter(Boolean) as MenuItem[];
  const onMenuItemClick = (payload: { key: any }) => {
    if (payload.key === 'self-share-attach-view') {
      onSelfShareAttachViewToggle?.();
    } else {
      onSharePrivilegeClick?.(Number(payload.key));
    }
  };
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {menu.length > 0 ? (
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
          className={classNames('screen-share-button', 'vc-button')}
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
