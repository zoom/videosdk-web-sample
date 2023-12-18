import { useRef } from 'react';
import { AudioMutedOutlined } from '@ant-design/icons';
import type { NetworkQuality } from '@zoom/videosdk';
import { IconFont } from '../../../component/icon-font';
import classNames from 'classnames';
import './avatar.scss';
import { Participant } from '../../../index-types';
import { useHover } from '../../../hooks';
import AvatarMore from './avatar-more';
interface AvatarProps {
  participant: Participant;
  style?: { [key: string]: string };
  isActive: boolean;
  className?: string;
  networkQuality?: NetworkQuality;
}
const networkQualityIcons = ['bad', 'bad', 'normal', 'good', 'good', 'good'];
const Avatar = (props: AvatarProps) => {
  const { participant, style, isActive, className, networkQuality } = props;
  const { displayName, audio, muted, bVideoOn, userId, isInFailover } = participant;
  const avatarRef = useRef(null);
  const isHover = useHover(avatarRef);

  return (
    <div
      className={classNames('avatar', { 'avatar-active': isActive }, className)}
      style={{ ...style, background: bVideoOn ? 'transparent' : 'rgb(26,26,26)' }}
      ref={avatarRef}
    >
      {(bVideoOn || (audio === 'computer' && muted) || isInFailover) && (
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
          {isInFailover && (
            <IconFont type="icon-reconnect" style={{ color: '#FF9209', animation: 'loading 3s linear infinite' }} />
          )}
          {bVideoOn && <span>{displayName}</span>}
        </div>
      )}
      {!bVideoOn && <p className="center-name">{displayName}</p>}
      {!isInFailover && <AvatarMore userId={userId} isHover={isHover} />}
    </div>
  );
};

export default Avatar;
