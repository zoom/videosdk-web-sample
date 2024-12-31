import { Button, Modal, Input, Form } from 'antd';
import classNames from 'classnames';
import { IconFont } from '../../../component/icon-font';
interface LiveStreamButtonProps {
  onLiveStreamClick: () => void;
  isLiveStreamOn: boolean;
}
interface LiveStreamModalProps {
  visible: boolean;
  onStartLiveStream: (streamUrl: string, streamKey: string, broadcastUrl: string) => void;
  setVisible: (visible: boolean) => void;
}
const LiveStreamButton = (props: LiveStreamButtonProps) => {
  const { onLiveStreamClick, isLiveStreamOn } = props;
  return (
    <Button
      className={classNames('vc-button', {
        active: isLiveStreamOn
      })}
      icon={<IconFont type="icon-live-stream" />}
      ghost={true}
      shape="circle"
      size="large"
      onClick={onLiveStreamClick}
    />
  );
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

export { LiveStreamButton, LiveStreamModal };
