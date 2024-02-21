import { useState, useCallback, useContext } from 'react';
import { Slider, Dropdown, Button } from 'antd';
import { AudioMutedOutlined, CheckOutlined, MoreOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import AvatarActionContext from '../context/avatar-context';
import ZoomContext from '../../../context/zoom-context';
import MediaContext from '../../../context/media-context';
import { getAntdDropdownMenu, getAntdItem } from './video-footer-utils';
interface AvatarMoreProps {
  className?: string;
  userId: number;
  isHover: boolean;
}
const AvatarMore = (props: AvatarMoreProps) => {
  const { userId, isHover } = props;
  const { avatarActionState, dispatch } = useContext(AvatarActionContext);
  const { mediaStream } = useContext(MediaContext);
  const [isDropdownVisible, setIsDropdownVisbile] = useState(false);
  const [isControllingRemoteCamera, setIsControllingRemoteCamera] = useState(false);
  const actionItem = avatarActionState[`${userId}`];
  const menu = [];
  if (actionItem) {
    if (actionItem.localVolumeAdjust.enabled) {
      menu.push(
        getAntdItem('Adjust volume locally', 'volume', actionItem?.localVolumeAdjust.toggled && <CheckOutlined />)
      );
    }
    if (actionItem?.farEndCameraControl.enabled) {
      menu.push(getAntdItem(isControllingRemoteCamera ? 'Give up camera control' : 'Control far end camera', 'farend'));
    }
  }
  const onSliderChange = useCallback(
    (value: any) => {
      mediaStream?.adjustUserAudioVolumeLocally(userId, value);
      dispatch({ type: 'update-local-volume', payload: { userId, volume: value } });
    },
    [userId, mediaStream, dispatch]
  );
  const onDropDownVisibleChange = useCallback((visible: boolean) => {
    setIsDropdownVisbile(visible);
  }, []);
  const onMenuItemClick = useCallback(
    ({ key }: { key: string }) => {
      if (key === 'volume') {
        dispatch({ type: 'toggle-local-volume', payload: { userId } });
      } else if (key === 'farend') {
        dispatch({ type: 'toggle-far-end-camera-control', payload: { userId } });
        if (isControllingRemoteCamera) {
          mediaStream?.giveUpFarEndCameraControl(userId);
          dispatch({ type: 'set-is-controlling-remote-camera', payload: false });
        } else {
          mediaStream?.requestFarEndCameraControl(userId);
        }
        setIsControllingRemoteCamera(!isControllingRemoteCamera);
      }
      setIsDropdownVisbile(false);
    },
    [mediaStream, userId, isControllingRemoteCamera, dispatch]
  );
  return (
    <>
      {menu.length > 0 && (
        <Dropdown
          menu={getAntdDropdownMenu(menu, onMenuItemClick)}
          placement="bottomRight"
          trigger={['click']}
          onOpenChange={onDropDownVisibleChange}
        >
          <Button
            icon={<MoreOutlined />}
            className={classNames('more-button', {
              'more-button-active': isHover || isDropdownVisible
            })}
            type="primary"
            size="small"
          />
        </Dropdown>
      )}
      {isHover && actionItem?.localVolumeAdjust?.enabled && actionItem?.localVolumeAdjust?.toggled && (
        <div className={classNames('avatar-volume')}>
          <label>Volume:</label>
          <Slider
            marks={{ 0: '0', 100: '100' }}
            defaultValue={100}
            onChange={onSliderChange}
            value={actionItem.localVolumeAdjust.volume}
          />
        </div>
      )}
    </>
  );
};

export default AvatarMore;
