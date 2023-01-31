import React from 'react';
import { Button, Tooltip, Dropdown, Menu } from 'antd';
import classNames from 'classnames';
import { UpOutlined } from '@ant-design/icons';
import { IconFont } from '../../../component/icon-font';
import { getAntdDropdownMenu, getAntdItem } from './video-footer-utils';
const { Button: DropdownButton } = Dropdown;
const { Item: MenuItem } = Menu;
interface LeaveButtonProps {
  onLeaveClick: () => void;
  onEndClick: () => void;
  isHost: boolean;
}

const LeaveButton = (props: LeaveButtonProps) => {
  const { onLeaveClick, onEndClick, isHost } = props;

  return isHost ? (
    <DropdownButton
      className="vc-dropdown-button"
      size="large"
      menu={getAntdDropdownMenu([getAntdItem('End session', 'end')], onEndClick)}
      trigger={['click']}
      type="ghost"
      onClick={onLeaveClick}
      icon={<UpOutlined />}
      placement="topRight"
    >
      <IconFont type="icon-leave" />
    </DropdownButton>
  ) : (
    <Button
      className={classNames('vc-button')}
      icon={<IconFont type="icon-leave" />}
      // eslint-disable-next-line react/jsx-boolean-value
      ghost={true}
      shape="circle"
      size="large"
      onClick={onLeaveClick}
      title="Leave session"
    />
  );
};

export { LeaveButton };
