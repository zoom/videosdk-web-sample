import type React from 'react';
// eslint-disable-next-line no-duplicate-imports
import { useState, useCallback, useContext } from 'react';
import { Input, Button } from 'antd';
import './broadcast-panel.scss';
import ZoomContext from '../../../context/zoom-context';
const { TextArea } = Input;
interface BroadcastPanelProps {
  afterBroadcast?: () => void;
}
const BroadcastMessagePanel = (props: BroadcastPanelProps) => {
  const { afterBroadcast } = props;
  const [content, setContent] = useState<string>('');
  const zmClient = useContext(ZoomContext);
  const ssClient = zmClient.getSubsessionClient();
  const onTextChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
  }, []);
  const onBroadcastClick = useCallback(() => {
    if (ssClient && content) {
      ssClient.broadcast(content);
      setContent('');
      afterBroadcast?.();
    }
  }, [content, ssClient, afterBroadcast]);
  return (
    <div className="broadcast-panel">
      <div className="broadcast-panel-content">
        <TextArea placeholder="Message all rooms..." value={content} onChange={onTextChange} />
      </div>
      <div className="broadcast-panel-btn">
        <Button type="primary" onClick={onBroadcastClick}>
          Broadcast
        </Button>
      </div>
    </div>
  );
};
export default BroadcastMessagePanel;
