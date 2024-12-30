import { useState, useCallback } from 'react';
import type { SubsessionOptions } from '../subsession-types';
export function useSubsessionOptions() {
  const [isAutoJoinSubsession, setIsAutoJoinSubsession] = useState<boolean>(false);
  const [isBackToMainSessionEnabled, setIsBackToMainSessionEnabled] = useState<boolean>(true);
  const [isTimerEnabled, setIsTimerEnabled] = useState<boolean>(false);
  const [timerDuration, setTimerDuration] = useState<number>(30 * 60);
  const [isTimerAutoEnabled, setIsTimerAutoEnabled] = useState<boolean>(false);
  const [waitSeconds, setWaitSeconds] = useState<number>(60);
  const [isAutoMoveBackToMainSession, setIsAutoMoveBackToMainSession] = useState(false);
  const [isSubsessionSelectionEnabled, setIsSubsessionSelectionEnabled] = useState(false);
  const setRoomOptions = useCallback((option: SubsessionOptions) => {
    setIsAutoJoinSubsession(option.isAutoJoinSubsession);
    setIsBackToMainSessionEnabled(option.isBackToMainSessionEnabled);
    setIsTimerEnabled(option.isTimerEnabled);
    setTimerDuration(option.timerDuration);
    setIsTimerAutoEnabled(option.isTimerAutoEnabled);
    setWaitSeconds(option.waitSeconds);
    setIsAutoMoveBackToMainSession(option.isAutoMoveBackToMainSession);
    setIsSubsessionSelectionEnabled(option.isSubsessionSelectionEnabled);
  }, []);
  return [
    {
      isAutoJoinSubsession,
      isBackToMainSessionEnabled,
      isTimerEnabled,
      timerDuration,
      isTimerAutoEnabled,
      waitSeconds,
      isAutoMoveBackToMainSession,
      isSubsessionSelectionEnabled
    },
    {
      setIsAutoJoinSubsession,
      setIsBackToMainSessionEnabled,
      setIsTimerEnabled,
      setTimerDuration,
      setIsTimerAutoEnabled,
      setWaitSeconds,
      setIsAutoMoveBackToMainSession,
      setIsSubsessionSelectionEnabled,
      setRoomOptions
    }
  ];
}
