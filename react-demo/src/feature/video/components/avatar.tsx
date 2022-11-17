import React, { useContext, useRef } from 'react';
import { AudioMutedOutlined } from '@ant-design/icons';
import { Slider } from 'antd';
import classNames from 'classnames';
import './avatar.scss';
import { Participant } from '../../../index-types';
import ZoomContext from '../../../context/zoom-context';
import { useHover } from '../../../hooks';
interface AvatarProps {
  participant: Participant;
  style?: { [key: string]: string };
  isActive: boolean;
  className?: string;
  volume?: number;
  setLocalVolume?: (userId: number, volume: number) => void;
}
const Avatar = (props: AvatarProps) => {
  const { participant, style, isActive, className, volume, setLocalVolume } = props;
  const { displayName, audio, muted, bVideoOn, userId } = participant;
  const avatarRef = useRef(null);
  const isHover = useHover(avatarRef);
  const zmClient = useContext(ZoomContext);
  const onSliderChange = (value: number) => {
    setLocalVolume?.(userId, value);
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
          {bVideoOn && <span>{displayName}</span>}
        </div>
      )}
      {!bVideoOn && <p className="center-name">{displayName}</p>}
      {isHover && audio === 'computer' && zmClient.getSessionInfo().userId !== userId && (
        <div className={classNames('avatar-volume')}>
          <label>Volume:</label>
          <Slider
            marks={{ 0: '0', 100: '100' }}
            tooltipVisible={true}
            defaultValue={100}
            onChange={onSliderChange}
            value={volume}
          />
        </div>
      )}
    </div>
  );
};

export default Avatar;
