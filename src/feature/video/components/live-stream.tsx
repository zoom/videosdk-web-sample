import { Dropdown, Modal, Input, Form, Button } from 'antd';
import classNames from 'classnames';
import { UpOutlined } from '@ant-design/icons';
import { IconFont } from '../../../component/icon-font';
import { getAntdDropdownMenu, getAntdItem } from './video-footer-utils';
import { useCallback, useContext, useMemo, useEffect, useState } from 'react';
import ZoomContext from '../../../context/zoom-context';
import { BroadcastStreamingStatus, LiveStreamStatus } from '@zoom/videosdk';
const { Button: DropdownButton } = Dropdown;
interface LiveStreamButtonProps {
  isHost: boolean;
}
interface LiveStreamModalProps {
  visible: boolean;
  onStartLiveStream: (streamUrl: string, streamKey: string, broadcastUrl: string) => void;
  setVisible: (visible: boolean) => void;
}
const LiveStreamButton = (props: LiveStreamButtonProps) => {
  const { isHost } = props;

  const zmClient = useContext(ZoomContext);
  const [liveStreamClient, broadcastStreamingClient] = useMemo(() => {
    return [zmClient.getLiveStreamClient(), zmClient.getBroadcastStreamingClient()];
  }, [zmClient]);
  const [broadcastStreamingStatus, setBroadcastStreamingStatus] = useState(
    broadcastStreamingClient.getBroadcastStreamingStatus()?.status
  );
  const [isLiveStreamModalVisible, setIsLiveStreamModalVisible] = useState(false);
  const [liveStreamStatus, setLiveStreamStatus] = useState(liveStreamClient.getLiveStreamStatus());
  const [isLiveStreamEnabled, isBroadcastStreamingEnable] = useMemo(() => {
    return [liveStreamClient.isLiveStreamEnabled(), broadcastStreamingClient.isBroadcastStreamingEnable()];
  }, [liveStreamClient, broadcastStreamingClient]);
  const onButtonClick = useCallback(async () => {
    if (isBroadcastStreamingEnable) {
      if (broadcastStreamingStatus === BroadcastStreamingStatus.InProgress) {
        await broadcastStreamingClient.stopBroadcast();
      } else if ([BroadcastStreamingStatus.Closed, BroadcastStreamingStatus.Init].includes(broadcastStreamingStatus)) {
        await broadcastStreamingClient.startBroadcast();
      }
    }
  }, [isBroadcastStreamingEnable, broadcastStreamingStatus, broadcastStreamingClient]);
  const onLiveStreamClick = useCallback(async () => {
    if (isLiveStreamEnabled) {
      if (liveStreamStatus === LiveStreamStatus.InProgress) {
        await liveStreamClient.stopLiveStream();
      } else if (liveStreamStatus === LiveStreamStatus.Ended) {
        setIsLiveStreamModalVisible(true);
      }
    }
  }, [isLiveStreamEnabled, liveStreamStatus, liveStreamClient]);
  const onStartLiveStream = useCallback(
    async (streamUrl: string, streamKey: string, broadcastUrl: string) => {
      await liveStreamClient.startLiveStream(streamUrl, streamKey, broadcastUrl);
    },
    [liveStreamClient]
  );
  const menuItems = [getAntdItem('Live on 3rd platform', 'live')];
  const onMenuItemClick = useCallback(
    (payload: { key: string }) => {
      if (payload.key === 'live') {
        onLiveStreamClick();
      }
    },
    [onLiveStreamClick]
  );
  const onBroadcastStreamingStatusChange = useCallback((payload: any) => {
    setBroadcastStreamingStatus(payload.status);
  }, []);
  const onLiveStreamStatusChange = useCallback((payload: any) => {
    setLiveStreamStatus(payload);
  }, []);
  useEffect(() => {
    zmClient.on('live-stream-status', onLiveStreamStatusChange);
    zmClient.on('broadcast-streaming-status', onBroadcastStreamingStatusChange);
    return () => {
      zmClient.off('live-stream-status', onLiveStreamStatusChange);
      zmClient.off('broadcast-streaming-status', onBroadcastStreamingStatusChange);
    };
  }, [zmClient, onLiveStreamStatusChange, onBroadcastStreamingStatusChange]);
  return isHost ? (
    <>
      {isBroadcastStreamingEnable ? (
        <DropdownButton
          className={classNames('vc-dropdown-button', {
            active: broadcastStreamingStatus === BroadcastStreamingStatus.InProgress
          })}
          trigger={['click']}
          menu={getAntdDropdownMenu(menuItems, onMenuItemClick)}
          type="ghost"
          placement="topRight"
          size="large"
          icon={<UpOutlined />}
          onClick={onButtonClick}
        >
          <IconFont type="icon-live-stream" />
        </DropdownButton>
      ) : (
        <Button
          className={classNames('vc-button', {
            active: liveStreamStatus === LiveStreamStatus.InProgress
          })}
          icon={<IconFont type="icon-live-stream" />}
          ghost={true}
          shape="circle"
          size="large"
          onClick={onLiveStreamClick}
        />
      )}
      <LiveStreamModal
        visible={isLiveStreamModalVisible}
        setVisible={setIsLiveStreamModalVisible}
        onStartLiveStream={onStartLiveStream}
      />
      {(broadcastStreamingStatus === BroadcastStreamingStatus.InProgress ||
        liveStreamStatus === LiveStreamStatus.InProgress) && (
        <IconFont type="icon-live" style={{ position: 'fixed', top: '45px', left: '10px', color: '#f00' }} />
      )}
    </>
  ) : null;
};

const LiveStreamModal = (props: LiveStreamModalProps) => {
  const { visible, onStartLiveStream, setVisible } = props;
  const [form] = Form.useForm();
  return (
    <Modal
      open={visible}
      className="live-stream-setting-dialog"
      title="Live Stream Setting"
      okText="Start"
      onOk={async () => {
        try {
          const data = await form.validateFields();
          const { streamUrl, streamKey, broadcastUrl } = data;
          onStartLiveStream(streamUrl, streamKey, broadcastUrl);
          setVisible(false);
        } catch (e) {
          console.log(e);
        }
      }}
      onCancel={() => {
        setVisible(false);
      }}
      destroyOnClose
    >
      <Form form={form} name="live-stream-form">
        <Form.Item
          label="Stream URL"
          name="streamUrl"
          required
          rules={[{ required: true, message: 'Stream URL is required' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Stream Key"
          name="streamKey"
          required
          rules={[{ required: true, message: 'Stream Key is required' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Broadcast URL"
          name="broadcastUrl"
          required
          rules={[{ required: true, message: 'Broadcast URL is required' }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export { LiveStreamButton };
