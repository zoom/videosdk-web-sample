import React, { useState, useCallback, useContext } from 'react';
import { Input, Button } from 'antd';
import SubsessionContext from '../../../context/subsession-context';
import './broadcast-panel.scss';
const { TextArea } = Input;
interface BroadcastPanelProps {
  afterBroadcast?: () => void;
}
const BroadcastPanel = (props: BroadcastPanelProps) => {
  const { afterBroadcast } = props;
  const [content, setContent] = useState<string>('');
  const ssClient = useContext(SubsessionContext);
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
export default BroadcastPanel;
