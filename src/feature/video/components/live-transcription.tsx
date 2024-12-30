import { Button, Dropdown } from 'antd';
import classNames from 'classnames';
import { IconFont } from '../../../component/icon-font';
import { UpOutlined } from '@ant-design/icons';
import { getAntdItem, getAntdDropdownMenu } from './video-footer-utils';
interface LiveTranscriptionButtonProps {
  isStartedLiveTranscription: boolean;
  isDisableCaptions: boolean;
  isHost: boolean;
  onLiveTranscriptionClick: () => void;
  onDisableCaptions: (disable: boolean) => void;
  className?: string;
}

interface LiveTranscriptionLockButtonProps {
  isLockedLiveTranscription: boolean;
  onLiveTranscriptionLockClick: () => void;
}

const LiveTranscriptionButton = (props: LiveTranscriptionButtonProps) => {
  const {
    isStartedLiveTranscription,
    onDisableCaptions,
    isDisableCaptions,
    isHost,
    onLiveTranscriptionClick,
    className
  } = props;
  const onMenuItemClick = (payload: { key: any }) => {
    if (payload.key === 'disable') {
      onDisableCaptions(true);
    } else if (payload.key === 'enable') {
      onDisableCaptions(false);
    }
  };
  const menuItems = [
    !isDisableCaptions ? getAntdItem('Disable Captions', 'disable') : getAntdItem('Enable Captions', 'enable')
  ];
  return (
    <div>
      {isHost ? (
        <Dropdown.Button
          icon={<UpOutlined />}
          size="large"
          type="ghost"
          menu={getAntdDropdownMenu(menuItems, onMenuItemClick)}
          onClick={onLiveTranscriptionClick}
          placement="topRight"
          trigger={['click']}
          className="vc-dropdown-button"
        >
          <IconFont type="icon-subtitle" />
        </Dropdown.Button>
      ) : (
        <Button
          className={classNames('vc-button', {
            active: isStartedLiveTranscription
          })}
          icon={<IconFont type="icon-subtitle" />}
          // eslint-disable-next-line react/jsx-boolean-value
          ghost={true}
          shape="circle"
          size="large"
          onClick={onLiveTranscriptionClick}
        />
      )}
    </div>
  );
};

export { LiveTranscriptionButton };
