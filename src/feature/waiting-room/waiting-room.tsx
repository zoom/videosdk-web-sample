import { Button } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import './waiting-room.scss';

interface WaitingRoomProps {
  onLeave: () => void;
}

const WaitingRoom = (props: WaitingRoomProps) => {
  const { onLeave } = props;
  return (
    <div className="waiting-room">
      <ClockCircleOutlined className="waiting-room-icon" />
      <h2 className="waiting-room-title">Please wait</h2>
      <p className="waiting-room-desc">The host will let you into the session soon.</p>
      <Button type="primary" danger onClick={onLeave}>
        Leave session
      </Button>
    </div>
  );
};

export default WaitingRoom;
