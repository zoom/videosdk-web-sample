import { Button } from 'antd';
import { useState, useRef, useCallback, useContext } from 'react';
import { IconFont } from '../../../component/icon-font';
import { useHover } from '../../../hooks/useHover';
import ZoomContext from '../../../context/zoom-context';
interface BroadcastPanelProps {
  afterBroadcast?: () => void;
}
const BroadcastVoicePanel = (_props: BroadcastPanelProps) => {
  const [isStarted, setIsStarted] = useState(false);
  const buttonRef = useRef<HTMLElement | null>(null);
  const isHover = useHover(buttonRef);
  const zmClient = useContext(ZoomContext);
  const ssClient = zmClient.getSubsessionClient();
  const onBroadcast = useCallback(async () => {
    if (isStarted) {
      await ssClient.stopBroadcastVoice();
      setIsStarted(false);
    } else {
      try {
        await ssClient.startBroadcastVoice();
        setIsStarted(true);
      } catch (e) {
        console.warn(e);
      }
    }
  }, [isStarted, ssClient]);
  return (
    <div className="broadcast-voice-panel">
      <h4 className="broadcast-voice-panel-title">Broadcast voice</h4>
      {zmClient.getCurrentUserInfo().audio !== 'computer' || zmClient.getCurrentUserInfo().muted ? (
        <p className="broadcast-voice-panel-warning">Join audio to broadcast your voice to all rooms</p>
      ) : (
        <p className="broadcast-voice-panel-tip">Broadcast your voice to all rooms</p>
      )}
      <div className="broadcast-voice-panel-action">
        <Button
          icon={<IconFont type={isStarted ? (isHover ? 'icon-stop' : 'icon-live') : 'icon-audio-on'} />}
          ref={buttonRef}
          onClick={onBroadcast}
          className={
            isStarted
              ? isHover
                ? 'broadcast-voice-panel-action-stop'
                : 'broadcast-voice-panel-action-live'
              : 'broadcast-voice-panel-action-start'
          }
          ghost
          size="large"
        />
      </div>
    </div>
  );
};
export default BroadcastVoicePanel;
