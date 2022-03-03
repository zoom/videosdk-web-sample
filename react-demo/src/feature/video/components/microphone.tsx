/* eslint-disable no-nested-ternary */
import React, { useState, useEffect } from "react";
import { Menu, Tooltip, Dropdown, Button, Modal, Select, Input } from "antd";
import classNames from "classnames";
import {
  AudioOutlined,
  AudioMutedOutlined,
  CheckOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { IconFont } from "../../../component/icon-font";
import "./microphone.scss";
import { MediaDevice } from "../video-types";
import CallOutModel from "./call-out-model";
const { Button: DropdownButton } = Dropdown;
interface MicrophoneButtonProps {
  isStartedAudio: boolean;
  isMuted: boolean;
  isSupportPhone?: boolean;
  audio?: string;
  phoneCountryList?: any[];
  onMicrophoneClick: () => void;
  onMicrophoneMenuClick: (key: string) => void;
  onPhoneCallClick?: (code: string, phoneNumber: string,name:string,option:any) => void;
  onPhoneCallCancel?: (code: string, phoneNumber: string,option:any) => Promise<any>;
  className?: string;
  microphoneList?: MediaDevice[];
  speakerList?: MediaDevice[];
  activeMicrophone?: string;
  activeSpeaker?: string;
  phoneCallStatus?: { text: string; type: string };
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
    onMicrophoneClick,
    onMicrophoneMenuClick,
    onPhoneCallClick,
    onPhoneCallCancel,
  } = props;
  const [isPhoneModelOpen, setIsPhoneModelOpen] = useState(false);
  const tooltipText = isStartedAudio
    ? isMuted
      ? "unmute"
      : "mute"
    : "start audio";
  const menu = [];
  if (microphoneList && microphoneList.length && audio !== "phone") {
    menu.push({
      group: "microphone",
      title: "Select a Microphone",
      items: microphoneList.map((i) => ({
        label: i.label,
        value: i.deviceId,
        checked: activeMicrophone === i.deviceId,
      })),
    });
  }
  if (speakerList && speakerList.length && audio !== "phone") {
    menu.push({
      group: "speaker",
      title: "Select a speaker",
      items: speakerList.map((i) => ({
        label: i.label,
        value: i.deviceId,
        checked: activeSpeaker === i.deviceId,
      })),
    });
  }
  menu.push({
    items: [
      {
        label: audio === "phone" ? "Hang Up" : "Leave Audio",
        value: "leave audio",
      },
    ],
  });
  const onMenuItemClick = (payload: { key: any }) => {
    onMicrophoneMenuClick(payload.key);
  };
  const onPhoneMenuClick = (payload: { key: any }) => {
    if (payload.key === "phone") {
      setIsPhoneModelOpen(true);
    }
  };
  useEffect(() => {
    if (isStartedAudio) {
      setIsPhoneModelOpen(false);
    }
  }, [isStartedAudio]);
  const overlayMenu = (
    <Menu onClick={onMenuItemClick} theme="dark" className="microphone-menu">
      {menu.map((e) => {
        if (e.group) {
          const mItem = e.items.map((m) => (
            <Menu.Item
              key={`${e.group}|${m.value}`}
              icon={m.checked && <CheckOutlined />}
            >
              {m.label}
            </Menu.Item>
          ));
          return (
            <React.Fragment key={e.group}>
              <Menu.ItemGroup title={e.title} key={e.group}>
                {mItem}
              </Menu.ItemGroup>
              <Menu.Divider key={`${e.group}-divider`} />
            </React.Fragment>
          );
        }
        return (e.items as Array<{ value: string; label: string }>).map(
          (m: any) => <Menu.Item key={m?.value}>{m?.label}</Menu.Item>
        );
      })}
    </Menu>
  );
  const phoneCallMenu = (
    <Menu onClick={onPhoneMenuClick} theme="dark" className="microphone-menu">
      <Menu.Item key="phone">Invite by phone</Menu.Item>
    </Menu>
  );
  return (
    <div className={classNames("microphone-footer", className)}>
      {isStartedAudio ? (
        <DropdownButton
          className={"microphone-dropdown-button"}
          size="large"
          overlay={overlayMenu}
          onClick={onMicrophoneClick}
          trigger={["click"]}
          type="ghost"
          icon={<UpOutlined />}
          placement="topRight"
        >
          {isMuted ? (
            audio === "phone" ? (
              <IconFont type="icon-phone-off" />
            ) : (
              <AudioMutedOutlined />
            )
          ) : audio === "phone" ? (
            <IconFont type="icon-phone" />
          ) : (
            <AudioOutlined />
          )}
        </DropdownButton>
      ) : (
        <Tooltip title={tooltipText}>
          {isSupportPhone ? (
            <DropdownButton
              className={"microphone-dropdown-button"}
              size="large"
              overlay={phoneCallMenu}
              onClick={onMicrophoneClick}
              trigger={["click"]}
              type="ghost"
              icon={<UpOutlined />}
              placement="topRight"
            >
              <IconFont type="icon-headset" />
            </DropdownButton>
          ) : (
            <Button
              className={"microphone-button"}
              icon={<IconFont type="icon-headset" />}
              size="large"
              ghost
              shape="circle"
              onClick={onMicrophoneClick}
            />
          )}
        </Tooltip>
      )}
      <CallOutModel
        visible={isPhoneModelOpen}
        setVisible={(visible: boolean) => setIsPhoneModelOpen(visible)}
        phoneCallStatus={phoneCallStatus}
        phoneCountryList={phoneCountryList}
        onPhoneCallCancel={onPhoneCallCancel}
        onPhoneCallClick={onPhoneCallClick}
      />
    </div>
  );
};

export default MicrophoneButton;
