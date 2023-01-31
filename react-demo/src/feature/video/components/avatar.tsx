import React, { useContext, useRef, useState, useCallback } from 'react';
import { AudioMutedOutlined, CheckOutlined, MoreOutlined } from '@ant-design/icons';
import { Slider, Dropdown, Button } from 'antd';
import type { NetworkQuality } from '@zoom/videosdk';
import { IconFont } from '../../../component/icon-font';
import classNames from 'classnames';
import './avatar.scss';
import { Participant } from '../../../index-types';
import ZoomContext from '../../../context/zoom-context';
import { useHover } from '../../../hooks';
import type { AdvancedFeatureSwitch } from '../video-types';
import { getAntdDropdownMenu, getAntdItem } from './video-footer-utils';
interface AvatarProps {
  participant: Participant;
  style?: { [key: string]: string };
  isActive: boolean;
  className?: string;
  volume?: number;
  isUserCameraControlled?: boolean;
  advancedFeature?: AdvancedFeatureSwitch;
  networkQuality?: NetworkQuality;
  onAdvancedFeatureToggle?: (userId: number, key: string) => void;
  setLocalVolume?: (userId: number, volume: number) => void;
}
const networkQualityIcons = ['bad', 'bad', 'normal', 'good', 'good', 'good'];
const Avatar = (props: AvatarProps) => {
  const {
    participant,
    style,
    isActive,
    className,
    volume,
    advancedFeature,
    isUserCameraControlled,
    networkQuality,
    setLocalVolume,
    onAdvancedFeatureToggle
  } = props;
  const [isDropdownVisible, setIsDropdownVisbile] = useState(false);
  const { displayName, audio, muted, bVideoOn, userId } = participant;
  const avatarRef = useRef(null);
  const isHover = useHover(avatarRef);
  const zmClient = useContext(ZoomContext);
  const onSliderChange = (value: number) => {
    setLocalVolume?.(userId, value);
  };
  const menu = [];
  if (advancedFeature?.adjustVolumn.enabled) {
    menu.push(
      getAntdItem('Adjust volume locally', 'volume', advancedFeature?.adjustVolumn.toggled && <CheckOutlined />)
    );
  }
  if (advancedFeature?.farEndCameraControl.enabled) {
    menu.push(getAntdItem(isUserCameraControlled ? 'Give up camera control' : 'Control far end camera', 'farend'));
  }
  const onDropDownVisibleChange = useCallback((visible) => {
    setIsDropdownVisbile(visible);
  }, []);
  const onMenuItemClick = ({ key }: { key: string }) => {
    onAdvancedFeatureToggle?.(userId, key);
    setIsDropdownVisbile(false);
  };
  return (
    <div
      className={classNames('avatar', { 'avatar-active': isActive }, className)}
      style={{ ...style, background: bVideoOn ? 'transparent' : 'rgb(26,26,26)' }}
      ref={avatarRef}
    >
      {(bVideoOn || (audio === 'computer' && muted)) && (
        <div className="corner-name">
          {audio === 'computer' && muted && <AudioMutedOutlined style={{ color: '#f00' }} />}
          {bVideoOn && networkQuality !== undefined && (
            <IconFont
              type={`icon-network-${
                networkQualityIcons[
                  Math.min(networkQuality?.downlink ?? Number.MAX_VALUE, networkQuality?.uplink ?? Number.MAX_VALUE)
                ]
              }`}
            />
          )}
          {bVideoOn && <span>{displayName}</span>}
        </div>
      )}
      {!bVideoOn && <p className="center-name">{displayName}</p>}
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
      {isHover &&
        advancedFeature?.adjustVolumn.enabled &&
        advancedFeature.adjustVolumn.toggled &&
        zmClient.getSessionInfo().userId !== userId && (
          <div className={classNames('avatar-volume')}>
            <label>Volume:</label>
            <Slider marks={{ 0: '0', 100: '100' }} defaultValue={100} onChange={onSliderChange} value={volume} />
          </div>
        )}
    </div>
  );
};

export default Avatar;
