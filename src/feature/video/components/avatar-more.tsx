import { useState, useCallback, useContext } from 'react';
import { Slider, Dropdown, Button } from 'antd';
import { CheckOutlined, MoreOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import AvatarActionContext from '../context/avatar-context';
import ZoomContext from '../../../context/zoom-context';
import MediaContext from '../../../context/media-context';
import { getAntdDropdownMenu, getAntdItem } from './video-footer-utils';
import { useSpotlightVideo } from '../hooks/useSpotlightVideo';
import { downloadFile } from '../../../utils/util';
interface AvatarMoreProps {
  className?: string;
  userId: number;
  isHover: boolean;
}
const isUseVideoPlayer = new URLSearchParams(location.search).get('useVideoPlayer') === '1';
const AvatarMore = (props: AvatarMoreProps) => {
  const { userId, isHover } = props;
  const { avatarActionState, dispatch } = useContext(AvatarActionContext);
  const { mediaStream } = useContext(MediaContext);
  const zmClient = useContext(ZoomContext);
  const [isDropdownVisible, setIsDropdownVisbile] = useState(false);
  const [isControllingRemoteCamera, setIsControllingRemoteCamera] = useState(false);
  useSpotlightVideo(zmClient, mediaStream, (participants) => {
    dispatch({ type: 'set-spotlighted-videos', payload: participants });
  });
  const actionItem = avatarActionState[`${userId}`];
  const { spotlightedUserList } = avatarActionState;
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
  if (actionItem?.videoResolutionAdjust.enabled) {
    menu.push(
      getAntdItem(
        'Subscribe other video resolution',
        'subscribeVideoQuality',
        actionItem?.videoResolutionAdjust.toggled && <CheckOutlined />
      )
    );
  }
  if (zmClient.getUser(userId)?.bVideoOn) {
    menu.push(getAntdItem('take screenshot', 'screenshot'));
  }
  if (isUseVideoPlayer) {
    const currentUserId = zmClient.getCurrentUserInfo()?.userId;
    const isHostOrManager = zmClient.isHost() || zmClient.isManager();
    if (
      currentUserId === userId &&
      spotlightedUserList?.find((user) => user.userId === currentUserId) &&
      spotlightedUserList.length === 1
    ) {
      menu.push(getAntdItem('Remove spotlight', 'removeSpotlight'));
    } else if (isHostOrManager) {
      if (spotlightedUserList && spotlightedUserList.findIndex((user) => user.userId === userId) > -1) {
        menu.push(getAntdItem('Remove spotlight', 'removeSpotlight'));
      } else {
        const user = zmClient.getUser(userId);
        if (user?.bVideoOn) {
          menu.push(getAntdItem('Add spotlight', 'addSpotlight'));
          menu.push(getAntdItem('Replace spotlight', 'replaceSpotlight'));
        }
      }
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
      } else if (key === 'subscribeVideoQuality') {
        dispatch({ type: 'toggle-video-resolution-adjust', payload: { userId } });
      } else if (key === 'removeSpotlight') {
        mediaStream?.removeSpotlightedVideo(userId);
      } else if (key === 'addSpotlight') {
        mediaStream?.spotlightVideo(userId, false);
      } else if (key === 'replaceSpotlight') {
        mediaStream?.spotlightVideo(userId, true);
      } else if (key === 'screenshot') {
        mediaStream?.screenshotVideo(userId).then((blob) => {
          if (blob) {
            downloadFile(blob as Blob, `screenshot-${userId}-${new Date().getTime()}.png`);
          }
        });
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
