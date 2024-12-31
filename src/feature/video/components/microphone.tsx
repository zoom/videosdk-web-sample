/* eslint-disable no-nested-ternary */
import { useState, useEffect, useMemo } from 'react';
import { Tooltip, Dropdown, Button } from 'antd';
import classNames from 'classnames';
import { CheckOutlined, UpOutlined } from '@ant-design/icons';
import { IconFont } from '../../../component/icon-font';
import type { MediaDevice } from '../video-types';
import CallOutModal from './call-out-modal';
import { getAntdDropdownMenu, getAntdItem } from './video-footer-utils';
import CRCCallOutModal from './crc-call-out-modal';
import { AudoiAnimationIcon } from '../../../component/audio-animation-icon';
import { useAudioLevel } from '../hooks/useAudioLevel';
const { Button: DropdownButton } = Dropdown;
interface MicrophoneButtonProps {
  isStartedAudio: boolean;
  isMuted: boolean;
  isSupportPhone?: boolean;
  isMicrophoneForbidden?: boolean;
  disabled?: boolean;
  audio?: string;
  phoneCountryList?: any[];
  onMicrophoneClick: () => void;
  onMicrophoneMenuClick: (key: string) => void;
  onPhoneCallClick?: (code: string, phoneNumber: string, name: string, option: any) => void;
  onPhoneCallCancel?: (code: string, phoneNumber: string, option: any) => Promise<any>;
  className?: string;
  microphoneList?: MediaDevice[];
  speakerList?: MediaDevice[];
  activeMicrophone?: string;
  activeSpeaker?: string;
  phoneCallStatus?: { text: string; type: string };
  isSecondaryAudioStarted?: boolean;
  isPreview?: boolean;
}
const MicrophoneButton = (props: MicrophoneButtonProps) => {
  const {
    isStartedAudio,
    isSupportPhone,
    isMuted,
    audio,
    className,
    microphoneList,
    speakerList,
    phoneCountryList,
    activeMicrophone,
    activeSpeaker,
    phoneCallStatus,
    disabled,
    isMicrophoneForbidden,
    isSecondaryAudioStarted,
    isPreview,
    onMicrophoneClick,
    onMicrophoneMenuClick,
    onPhoneCallClick,
    onPhoneCallCancel
  } = props;
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isCrcModalOpen, setIsCrcModalOpen] = useState(false);
  // const level = useCurrentAudioLevel();
  const level = useAudioLevel();
  const tooltipText = isStartedAudio ? (isMuted ? 'unmute' : 'mute') : 'start audio';
  const menuItems = [];
  if (microphoneList?.length && audio !== 'phone') {
    menuItems.push(
      getAntdItem(
        'Select a Microphone',
        'microphone',
        undefined,
        microphoneList.map((i) =>
          getAntdItem(i.label, `microphone|${i.deviceId}`, activeMicrophone === i.deviceId && <CheckOutlined />)
        ),
        'group'
      )
    );
    menuItems.push(getAntdItem('', 'd1', undefined, undefined, 'divider'));
  }
  if (speakerList?.length && audio !== 'phone') {
    menuItems.push(
      getAntdItem(
        'Select a speaker',
        'speaker',
        undefined,
        speakerList.map((i) =>
          getAntdItem(i.label, `speaker|${i.deviceId}`, activeSpeaker === i.deviceId && <CheckOutlined />)
        ),
        'group'
      )
    );
    menuItems.push(getAntdItem('', 'd2', undefined, undefined, 'divider'));
  }
  if (!isPreview) {
    menuItems.push(
      getAntdItem(isSecondaryAudioStarted ? 'Stop secondary audio' : 'Start secondary audio', 'secondary audio')
    );
  }

  menuItems.push(getAntdItem('', 'd3', undefined, undefined, 'divider'));
  if (!isPreview) {
    if (audio !== 'phone') {
      menuItems.push(getAntdItem('Audio Statistic', 'statistic'));
    }
  }

  menuItems.push(getAntdItem(audio === 'phone' ? 'Hang Up' : 'Leave Audio', 'leave audio'));

  const onMenuItemClick = (payload: { key: any }) => {
    onMicrophoneMenuClick(payload.key);
  };
  const onPhoneMenuClick = (payload: { key: any }) => {
    if (payload.key === 'phone') {
      setIsPhoneModalOpen(true);
    } else if (payload.key === 'crc') {
      setIsCrcModalOpen(true);
    }
  };

  const audioIcon = useMemo(() => {
    let iconType = '';
    if (isStartedAudio) {
      if (isMuted) {
        if (audio === 'phone') {
          iconType = 'icon-phone-off';
        } else {
          iconType = 'icon-audio-muted';
        }
      } else {
        if (audio === 'phone') {
          iconType = 'icon-phone';
        } else {
          if (level !== 0) {
            // iconType = 'icon-audio-animation';
            return <AudoiAnimationIcon level={level} />;
          } else {
            iconType = 'icon-audio-unmuted';
          }
        }
      }
    } else {
      if (isMicrophoneForbidden) {
        iconType = 'icon-audio-disallow';
      } else {
        iconType = 'icon-headset';
      }
    }
    if (iconType) {
      return <IconFont type={iconType} />;
    }
  }, [level, audio, isMuted, isMicrophoneForbidden, isStartedAudio]);
  useEffect(() => {
    if (isStartedAudio) {
      setIsPhoneModalOpen(false);
    }
  }, [isStartedAudio]);
  return (
    <div className={classNames('microphone-footer', className)}>
      {isStartedAudio ? (
        <DropdownButton
          className="vc-dropdown-button"
          size="large"
          menu={getAntdDropdownMenu(menuItems, onMenuItemClick)}
          onClick={onMicrophoneClick}
          trigger={['click']}
          type="ghost"
          icon={<UpOutlined />}
          placement="topRight"
          disabled={disabled}
        >
          {audioIcon}
        </DropdownButton>
      ) : (
        <Tooltip title={tooltipText}>
          <div>
            {isSupportPhone ? (
              <DropdownButton
                className="vc-dropdown-button"
                size="large"
                menu={getAntdDropdownMenu(
                  [getAntdItem('Invite by phone', 'phone'), getAntdItem('Invite H323/SIP Room', 'crc')],
                  onPhoneMenuClick
                )}
                onClick={onMicrophoneClick}
                trigger={['click']}
                type="ghost"
                icon={<UpOutlined />}
                placement="topRight"
              >
                {audioIcon}
              </DropdownButton>
            ) : (
              <Button
                className="vc-button"
                icon={audioIcon}
                size="large"
                ghost
                shape="circle"
                onClick={onMicrophoneClick}
              />
            )}
          </div>
        </Tooltip>
      )}
      <CallOutModal
        visible={isPhoneModalOpen}
        setVisible={(visible: boolean) => setIsPhoneModalOpen(visible)}
        phoneCallStatus={phoneCallStatus}
        phoneCountryList={phoneCountryList}
        onPhoneCallCancel={onPhoneCallCancel}
        onPhoneCallClick={onPhoneCallClick}
      />
      <CRCCallOutModal visible={isCrcModalOpen} setVisible={(visible: boolean) => setIsCrcModalOpen(visible)} />
    </div>
  );
};

export default MicrophoneButton;
