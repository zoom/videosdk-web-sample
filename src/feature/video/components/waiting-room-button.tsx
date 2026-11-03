import { useCallback, useContext, useEffect, useState } from 'react';
import { Badge, Button, List, Modal, message } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import type { Participant } from '@zoom/videosdk';
import ZoomContext from '../../../context/zoom-context';
import './waiting-room-button.scss';

interface WaitingRoomButtonProps {
  className?: string;
}

const WaitingRoomButton = (props: WaitingRoomButtonProps) => {
  const { className } = props;
  const zmClient = useContext(ZoomContext);
  const [visible, setVisible] = useState(false);
  const [onHoldUsers, setOnHoldUsers] = useState<Participant[]>([]);
  const [isHoldEnabled, setIsHoldEnabled] = useState(() => zmClient.isHoldEnabled());
  const [isHostOrManager, setIsHostOrManager] = useState(() => zmClient.isHost() || zmClient.isManager());

  const refreshWaitingRoomState = useCallback(() => {
    const hostOrManager = zmClient.isHost() || zmClient.isManager();
    const holdEnabled = zmClient.isHoldEnabled();
    setIsHostOrManager(hostOrManager);
    setIsHoldEnabled(holdEnabled);
    if (!hostOrManager || !holdEnabled) {
      setOnHoldUsers([]);
      return;
    }
    try {
      setOnHoldUsers(zmClient.getOnHoldUsers() ?? []);
    } catch {
      setOnHoldUsers([]);
    }
  }, [zmClient]);

  useEffect(() => {
    refreshWaitingRoomState();
    zmClient.on('user-added', refreshWaitingRoomState);
    zmClient.on('user-removed', refreshWaitingRoomState);
    zmClient.on('user-updated', refreshWaitingRoomState);
    return () => {
      zmClient.off('user-added', refreshWaitingRoomState);
      zmClient.off('user-removed', refreshWaitingRoomState);
      zmClient.off('user-updated', refreshWaitingRoomState);
    };
  }, [zmClient, refreshWaitingRoomState]);

  const onAdmit = useCallback(
    async (userId: number) => {
      try {
        await zmClient.admit(userId);
        message.success('Participant admitted');
        refreshWaitingRoomState();
      } catch (e: any) {
        message.error(e?.reason || 'Failed to admit participant');
      }
    },
    [zmClient, refreshWaitingRoomState]
  );

  const onRemove = useCallback(
    async (userId: number) => {
      try {
        await zmClient.removeUser(userId);
        message.success('Participant removed');
        refreshWaitingRoomState();
      } catch (e: any) {
        message.error(e?.reason || 'Failed to remove participant');
      }
    },
    [zmClient, refreshWaitingRoomState]
  );

  const onAdmitAll = useCallback(async () => {
    try {
      await zmClient.admitAll();
      message.success('All participants admitted');
      refreshWaitingRoomState();
    } catch (e: any) {
      message.error(e?.reason || 'Failed to admit all participants');
    }
  }, [zmClient, refreshWaitingRoomState]);

  if (!isHostOrManager || !isHoldEnabled) {
    return null;
  }

  return (
    <>
      <Badge count={onHoldUsers.length} size="small" offset={[-8, 8]}>
        <Button
          className={classNames('vc-button', className, { active: onHoldUsers.length > 0 })}
          icon={<TeamOutlined />}
          ghost={true}
          shape="circle"
          size="large"
          title="Waiting room"
          onClick={() => {
            refreshWaitingRoomState();
            setVisible(true);
          }}
        />
      </Badge>
      <Modal
        open={visible}
        title={`Waiting room (${onHoldUsers.length})`}
        onCancel={() => setVisible(false)}
        footer={
          onHoldUsers.length > 0
            ? [
                <Button key="admit-all" type="primary" onClick={onAdmitAll}>
                  Admit all
                </Button>
              ]
            : null
        }
        destroyOnClose
        className="waiting-room-modal"
      >
        {onHoldUsers.length === 0 ? (
          <p className="waiting-room-empty">No participants in the waiting room.</p>
        ) : (
          <List
            dataSource={onHoldUsers}
            renderItem={(user) => (
              <List.Item
                actions={[
                  <Button key="admit" type="link" onClick={() => onAdmit(user.userId)}>
                    Admit
                  </Button>,
                  ...(zmClient.isHost()
                    ? [
                        <Button key="remove" type="link" danger onClick={() => onRemove(user.userId)}>
                          Remove
                        </Button>
                      ]
                    : [])
                ]}
              >
                <List.Item.Meta title={user.displayName} />
              </List.Item>
            )}
          />
        )}
      </Modal>
    </>
  );
};

export default WaitingRoomButton;
