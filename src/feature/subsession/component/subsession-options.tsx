import React, { useState, useCallback } from 'react';
import { Checkbox, InputNumber, Menu } from 'antd';
import './subsession-options.scss';
const { Item: MenuItem } = Menu;
interface SubsessionOptionsProps {
  isAutoJoinSubsession?: boolean;
  isBackToMainSessionEnabled?: boolean;
  isTimerEnabled?: boolean;
  timerDuration?: number;
  isNotify?: boolean;
  isTimerAutoEnabled?: boolean;
  waitSeconds?: number;
  setIsAutoJoinSubsession: Function;
  setIsBackToMainSessionEnabled: Function;
  setIsTimerEnabled: Function;
  setTimerDuration: Function;
  setIsTimerAutoEnabled: Function;
  setWaitSeconds: Function;
}
const SubsessionOptions = (props: SubsessionOptionsProps) => {
  const {
    isAutoJoinSubsession,
    isBackToMainSessionEnabled,
    timerDuration,
    isTimerEnabled,
    isTimerAutoEnabled,
    waitSeconds,
    setIsAutoJoinSubsession,
    setIsBackToMainSessionEnabled,
    setIsTimerEnabled,
    setTimerDuration,
    setIsTimerAutoEnabled,
    setWaitSeconds
  } = props;
  const [isEnableCountdown, setIsEnableCountdown] = useState(waitSeconds !== 0);
  const onTimerDurationChange = useCallback(
    (value) => {
      if (isTimerEnabled) {
        setTimerDuration(Number(value) * 60);
      }
    },
    [isTimerEnabled, setTimerDuration]
  );
  return (
    <div className="room-options">
      <Menu selectable={false} expandIcon={null}>
        <MenuItem key="1">
          <Checkbox
            checked={isBackToMainSessionEnabled}
            onChange={(event) => setIsBackToMainSessionEnabled(event.target.checked)}
          >
            Allow participants to return the main session at any time
          </Checkbox>
        </MenuItem>
        <MenuItem key="2">
          <Checkbox checked={isAutoJoinSubsession} onChange={(event) => setIsAutoJoinSubsession(event.target.checked)}>
            Automatically move all assigned participants into subsessions
          </Checkbox>
        </MenuItem>
        <Menu.Divider />
        <MenuItem key="3">
          <Checkbox
            checked={isTimerEnabled}
            onChange={(event) => {
              setIsTimerEnabled(event.target.checked);
            }}
          >
            Subsessions close automatically after:{' '}
            <InputNumber
              value={(timerDuration || 0) / 60}
              min={1}
              disabled={!isTimerEnabled}
              onChange={onTimerDurationChange}
            />{' '}
            minutes
          </Checkbox>
        </MenuItem>
        <MenuItem key="4" className="indent">
          <Checkbox
            checked={!isTimerAutoEnabled}
            disabled={!isTimerEnabled}
            onChange={(event) => setIsTimerAutoEnabled(!event.target.checked)}
          >
            Notify me when the time is up
          </Checkbox>
        </MenuItem>
        <MenuItem key="5">
          <Checkbox
            checked={isEnableCountdown}
            onChange={(event) => {
              const isEnable = event.target.checked;
              setIsEnableCountdown(isEnable);
              if (!isEnable) {
                setWaitSeconds(0);
              }
            }}
          >
            Countdown after closing subsession
          </Checkbox>
        </MenuItem>
        <MenuItem key="6" className="indent">
          Set coudown timer:
          <InputNumber
            disabled={!isEnableCountdown}
            value={waitSeconds || 60}
            min={0}
            onChange={(value) => setWaitSeconds(value)}
          />{' '}
          seconds
        </MenuItem>
      </Menu>
    </div>
  );
};

export default SubsessionOptions;
